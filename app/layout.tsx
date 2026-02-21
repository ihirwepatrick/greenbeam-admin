import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Providers } from "@/components/Providers"

export const metadata: Metadata = {
  title: "Greenbeam Admin",
  description: "Greenbeam Admin Dashboard",
  icons: { icon: "/logo.jpg" },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
