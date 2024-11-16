"use client"

import { useAccount, useChainId } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Card } from "@/components/ui/card"
import { TokenSwap } from "@/components/token-swap"
import { Wallet } from "lucide-react"
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains"

type ChainMap = {
    [key: number]: string
}

export function WalletInterface() {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()

    const getChainName = (chainId: number) => {
        const chains: ChainMap = {
            [mainnet.id]: "Ethereum",
            [polygon.id]: "Polygon",
            [optimism.id]: "Optimism",
            [arbitrum.id]: "Arbitrum",
        }
        return chains[chainId] || "Unknown Chain"
    }

    return (
        <div className="max-w-md mx-auto space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    Swap Tokens
                </h1>
                <ConnectButton />
            </div>

            {isConnected ? (
                <Card className="p-4 bg-card border-border shadow-lg">
                    <div className="mb-4">
                        <p className="text-xs text-muted-foreground">
                            {getChainName(chainId)} · {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                    </div>
                    <TokenSwap address={address} />
                </Card>
            ) : (
                <Card className="p-6 text-center bg-card/50 border-border/50">
                    <p className="text-sm text-muted-foreground">Connect your wallet to start swapping</p>
                </Card>
            )}
        </div>
    )
}
