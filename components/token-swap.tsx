"use client"

import { useState, useEffect } from "react"
import { parseEther, formatEther, isAddress } from "viem"
import {
    useAccount,
    useBalance,
    useWriteContract,
    useReadContract,
    useWaitForTransactionReceipt,
    useSimulateContract,
} from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UNISWAP_V2_ROUTER_ABI, UNISWAP_V2_ROUTER_ADDRESS, WETH_ADDRESS } from "@/constants/contracts"

export function TokenSwap() {
    const [amount, setAmount] = useState("")
    const [tokenAddress, setTokenAddress] = useState("")
    const { address } = useAccount()

    // Get WETH balance
    const { data: wethBalance } = useBalance({
        address,
        token: WETH_ADDRESS,
    })

    // Get output token balance
    const { data: tokenBalance } = useBalance({
        address,
        token: isAddress(tokenAddress) ? (tokenAddress as `0x${string}`) : undefined,
    })

    // Get amount out
    const { data: amountOut } = useReadContract({
        address: UNISWAP_V2_ROUTER_ADDRESS,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: "getAmountsOut",
        args: [
            parseEther(amount || "0"),
            [WETH_ADDRESS, isAddress(tokenAddress) ? (tokenAddress as `0x${string}`) : WETH_ADDRESS],
        ],
    })

    // Simulate contract for gas estimation
    const { data: simulation } = useSimulateContract({
        address: UNISWAP_V2_ROUTER_ADDRESS,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args:
            address && tokenAddress && isAddress(tokenAddress)
                ? [
                      parseEther(amount || "0"),
                      BigInt(0),
                      [WETH_ADDRESS, tokenAddress as `0x${string}`],
                      address,
                      BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
                  ]
                : undefined,
        account: address,
    })

    // Handle max amount calculation
    const handleMaxAmount = () => {
        // Generate random number between 1 and 5 with 6 decimal places
        const randomValue = (Math.random() * 4 + 1).toFixed(6)
        setAmount(randomValue)
    }

    // Log when balance changes
    useEffect(() => {
        if (wethBalance) {
            console.log("WETH Balance updated:", formatEther(wethBalance.value))
        }
    }, [wethBalance])

    // Swap tokens
    const { writeContract, data: hash } = useWriteContract()

    // Wait for transaction
    const { isLoading: isSwapping, isSuccess: isSwapped } = useWaitForTransactionReceipt({
        hash,
    })

    const handleSwap = async () => {
        if (!address || !tokenAddress || !isAddress(tokenAddress)) return
        try {
            writeContract({
                address: UNISWAP_V2_ROUTER_ADDRESS,
                abi: UNISWAP_V2_ROUTER_ABI,
                functionName: "swapExactTokensForTokens",
                args: [
                    parseEther(amount),
                    BigInt(0),
                    [WETH_ADDRESS, tokenAddress as `0x${string}`],
                    address,
                    BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
                ],
            })
        } catch (error) {
            console.error("Error swapping tokens:", error)
        }
    }

    return (
        <div className="rounded-lg border p-4 space-y-4">
            <div className="space-y-2">
                <h2 className="text-xl font-bold">Swap WETH to Token</h2>
                <div className="flex items-center justify-between text-sm">
                    <span>WETH Balance: {wethBalance?.formatted || "0"} WETH</span>
                    {tokenBalance && <span>Token Balance: {tokenBalance.formatted}</span>}
                </div>
            </div>

            <div className="space-y-2">
                <Input
                    placeholder="Token Address (e.g., DAI)"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    disabled={isSwapping}
                />
                <div className="relative">
                    <Input
                        type="number"
                        placeholder="Amount to swap"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isSwapping}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-[4.5rem]"
                        min="0"
                        step="0.000001"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center mr-2" style={{ pointerEvents: "auto" }}>
                        <button
                            type="button"
                            onClick={handleMaxAmount}
                            disabled={isSwapping}
                            className="px-2 py-1 text-xs font-semibold rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:opacity-50 transition-colors"
                        >
                            MAX
                        </button>
                    </div>
                </div>
            </div>

            {simulation?.request?.gas && (
                <div className="text-sm text-muted-foreground">
                    Estimated Gas: {formatEther(simulation.request.gas * BigInt(2))} ETH
                </div>
            )}

            {amountOut && (
                <div className="text-sm text-muted-foreground">You will receive: {formatEther(amountOut[1])} Tokens</div>
            )}

            <Button
                onClick={handleSwap}
                disabled={!amount || !tokenAddress || !isAddress(tokenAddress) || isSwapping}
                className="w-full"
            >
                {isSwapping ? "Swapping..." : "Swap WETH to Token"}
            </Button>

            {isSwapped && <div className="text-sm text-green-500">Successfully swapped {amount} WETH!</div>}
        </div>
    )
}
