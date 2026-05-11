import { DefaultSession, DefaultJWT } from "next-auth"
import { RoleType } from "@/lib/permissions"

declare module "next-auth" {
  interface Session {
    user: {
      id:    string
      role:  RoleType
      name:  string
      email: string
    } & DefaultSession["user"]
  }

  interface User {
    id:    string
    role:  RoleType
    name:  string
    email: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id:    string
    role:  RoleType
    name:  string
    email: string
  }
}