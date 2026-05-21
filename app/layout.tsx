import type { Metadata } from "next"
import "./globals.css"
import { UATProvider } from "@/lib/uat/uatContext"
import UATBubble      from "@/components/uat/UATBubble"

export const metadata: Metadata = {
  title:       "CMLabs CRM",
  description: "Customer Relationship Management System",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Inject theme sebelum render untuk menghindari flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{
              var t=localStorage.getItem('crm-theme');
              if(!t) t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
              document.documentElement.setAttribute('data-theme',t);
              document.documentElement.style.colorScheme=t;
            }catch(e){}
          })();
        `}} />
      </head>
      <body>
        <UATProvider>
          {children}
          {/* Bubble persist di semua halaman */}
          <UATBubble />
        </UATProvider>
      </body>
    </html>
  )
}