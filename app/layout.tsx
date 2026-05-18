import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import "./globals.css"
import { Geist } from "next/font/google"

const geist = Geist({
  subsets: ["latin"],
})


export const metadata: Metadata = {
  title: "CMLabs CRM",
  description: "Customer Relationship Management System",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Script ini inject theme ke <html> SEBELUM render — no flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('crm-theme');
              if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.setAttribute('data-theme', t);
              document.documentElement.style.colorScheme = t;
            } catch(e) {}
          })();
        ` }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}