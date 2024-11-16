"use client"

import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { mainnet } from "wagmi/chains"
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum"
import { Web3Modal } from "@web3modal/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"

const projectId = "YOUR_WALLET_CONNECT_PROJECT_ID"

const { chains, publicClient } = configureChains([mainnet], [w3mProvider({ projectId })])

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, chains }),
    publicClient,
})

const ethereumClient = new EthereumClient(wagmiConfig, chains)

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <WagmiConfig config={wagmiConfig}>
                {children}
                <Toaster />
            </WagmiConfig>
            <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
        </ThemeProvider>
    )
}
