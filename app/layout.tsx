import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import "@rainbow-me/rainbowkit/styles.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Web3 Wallet Interface",
    description: "Connect your wallet and interact with Web3",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
