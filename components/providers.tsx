"use client"

import * as React from "react"
import { RainbowKitProvider, getDefaultWallets, darkTheme } from "@rainbow-me/rainbowkit"
import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, polygon, optimism, arbitrum],
    [publicProvider()],
)

const { connectors } = getDefaultWallets({
    appName: "Your App Name",
    projectId: "YOUR_PROJECT_ID", // Get this from WalletConnect Cloud
    chains,
})

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
})

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])

    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains} theme={darkTheme()}>
                {mounted && children}
            </RainbowKitProvider>
        </WagmiConfig>
    )
}
