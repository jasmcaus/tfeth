"use client"

import { useBalance } from "wagmi"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const MOCK_TOKEN_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F" // DAI as example

export function WalletBalance({ address }: { address?: string }) {
    const { data: ethBalance, isLoading: isLoadingEth } = useBalance({
        address,
    })

    const { data: wethBalance, isLoading: isLoadingWeth } = useBalance({
        address,
        token: WETH_ADDRESS,
    })

    const { data: tokenBalance, isLoading: isLoadingToken } = useBalance({
        address,
        token: MOCK_TOKEN_ADDRESS,
    })

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Balances</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span>ETH Balance</span>
                    {isLoadingEth ? <Skeleton className="h-4 w-20" /> : <span>{ethBalance?.formatted} ETH</span>}
                </div>

                <div className="flex justify-between items-center">
                    <span>WETH Balance</span>
                    {isLoadingWeth ? <Skeleton className="h-4 w-20" /> : <span>{wethBalance?.formatted} WETH</span>}
                </div>

                <div className="flex justify-between items-center">
                    <span>DAI Balance</span>
                    {isLoadingToken ? <Skeleton className="h-4 w-20" /> : <span>{tokenBalance?.formatted} DAI</span>}
                </div>
            </div>
        </Card>
    )
}
