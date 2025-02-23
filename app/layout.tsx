import "./globals.css"
import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import Navbar from "@/components/navbar"
import MouseMoveEffect from "@/components/mouse-move-effect"

export const metadata: Metadata = {
  title: "co3pe - AI Competition Platform",
  description: "A decentralized platform for AI competitions and development.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <Navbar />
          <MouseMoveEffect />
          {children}
        </Providers>
      </body>
    </html>
  )
}

