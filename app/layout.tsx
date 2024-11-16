import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import "@rainbow-me/rainbowkit/styles.css"
import { ThemeProvider } from "next-themes"

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
        <html lang="en" suppressHydrationWarning className="dark">
            <body className={`${inter.className} bg-background text-foreground`}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                    <Providers>{children}</Providers>
                </ThemeProvider>
            </body>
        </html>
    )
}
