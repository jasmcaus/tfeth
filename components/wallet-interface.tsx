"use client"

import { useAccount, useBalance, useChainId } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Card } from "@/components/ui/card"
import { WalletBalance } from "@/components/wallet-balance"
import { TokenSwap } from "@/components/token-swap"
import { Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains"

type ChainMap = {
    [key: number]: string
}

export function WalletInterface() {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const { data: ethBalance } = useBalance({
        address,
    })

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
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Wallet className="w-8 h-8" />
                    Web3 Wallet
                </h1>
                <ConnectButton />
            </div>

            {isConnected && (
                <>
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Wallet Info</h2>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Connected to: {getChainName(chainId)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Address: {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                        </div>
                    </Card>

                    <WalletBalance address={address} />
                    <TokenSwap address={address} />
                </>
            )}

            {!isConnected && (
                <Card className="p-6 text-center">
                    <p className="text-lg text-muted-foreground">
                        Connect your wallet to get started
                    </p>
                </Card>
            )}
        </div>
    )
}
