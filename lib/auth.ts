import NextAuth, { CredentialsSignin } from "next-auth"
import type { DefaultSession } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string
      role: string
    }
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string
    role?: string
  }
}

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
})

class AccountInactiveError extends CredentialsSignin {
  code = "account_inactive"
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Saat Login Pertama Kali: Simpan id & role ke token
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      // Return token yang sudah membawa 'id' dan 'role' (tidak akan hilang saat refresh)
      return token
    },
    async session({ session, token }) {
      // Salin 'id' dan 'role' dari JWT token ke Objek Session
      if (session.user) {
        if (token.id) session.user.id = token.id as string
        if (token.role) session.user.role = token.role as string
      }
      return session
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user) return null
        if (!user.isActive) throw new AccountInactiveError()

        const match = await bcrypt.compare(
          parsed.data.password,
          user.password
        )
        if (!match) return null

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role, // Memastikan role dikembalikan di sini
        }
      },
    }),
  ],
})