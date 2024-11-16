"use client"

import { Inter } from "next/font/google"
import "@rainbow-me/rainbowkit/styles.css"
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { mainnet } from "wagmi/chains"
import { http } from "viem"
import { createConfig } from "wagmi"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { useTheme } from "next-themes"

const inter = Inter({ subsets: ["latin"] })

const config = createConfig({
    chains: [mainnet],
    transports: {
        [mainnet.id]: http(),
    },
})

const queryClient = new QueryClient()

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <WagmiProvider config={config}>
                        <QueryClientProvider client={queryClient}>
                            <RainbowKitThemeProvider>
                                <div className="min-h-screen bg-background font-sans antialiased">
                                    <div className="relative flex min-h-screen flex-col">{children}</div>
                                </div>
                            </RainbowKitThemeProvider>
                        </QueryClientProvider>
                    </WagmiProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}

function RainbowKitThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme()

    return <RainbowKitProvider theme={theme === "dark" ? darkTheme() : lightTheme()}>{children}</RainbowKitProvider>
}
