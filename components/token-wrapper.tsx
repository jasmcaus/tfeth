"use client"

import { useState, useEffect } from "react"
import { parseEther, formatEther } from "viem"
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WETH_ABI, WETH_ADDRESS } from "@/constants/contracts"

export function TokenWrapper() {
    const [amount, setAmount] = useState("")
    const { address } = useAccount()

    // Get ETH balance
    const { data: ethBalance } = useBalance({
        address,
    })

    // Get WETH balance
    const { data: wethBalance } = useBalance({
        address,
        token: WETH_ADDRESS,
    })

    // Simulate with a small amount first to get gas estimate
    const { data: simulation } = useSimulateContract({
        address: WETH_ADDRESS,
        abi: WETH_ABI,
        functionName: "deposit",
        value: parseEther("0.1"), // Use a small amount for initial gas estimate
        account: address,
    })

    // Contract write hook for wrapping ETH
    const { writeContract, data: hash } = useWriteContract()

    // Wait for transaction hook
    const { isLoading: isWrapping, isSuccess: isWrapped } = useWaitForTransactionReceipt({
        hash,
    })

    // Calculate max amount considering gas fees
    const handleMaxAmount = () => {
        // Generate random number between 1 and 5 with 6 decimal places
        const randomValue = (Math.random() * 4 + 1).toFixed(6)
        setAmount(randomValue)
    }

    // Handle wrapping
    const handleWrap = async () => {
        try {
            if (!amount) return
            const value = parseEther(amount)
            writeContract({
                address: WETH_ADDRESS,
                abi: WETH_ABI,
                functionName: "deposit",
                value,
            })
        } catch (error) {
            console.error("Error wrapping ETH:", error)
        }
    }

    return (
        <div className="rounded-lg border p-4 space-y-4">
            <div className="space-y-2">
                <h2 className="text-xl font-bold">Wrap ETH to WETH</h2>
                <div className="flex items-center justify-between text-sm">
                    <span>ETH Balance: {ethBalance?.formatted || "0"} ETH</span>
                    <span>WETH Balance: {wethBalance?.formatted || "0"} WETH</span>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        type="number"
                        placeholder="Amount to wrap"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isWrapping}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-[4.5rem]"
                        min="0"
                        step="0.000001"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center mr-2" style={{ pointerEvents: "auto" }}>
                        <button
                            type="button"
                            onClick={handleMaxAmount}
                            disabled={isWrapping}
                            className="px-2 py-1 text-xs font-semibold rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:opacity-50 transition-colors"
                        >
                            MAX
                        </button>
                    </div>
                </div>
                <Button onClick={handleWrap} disabled={!amount || isWrapping}>
                    {isWrapping ? "Wrapping..." : "Wrap ETH"}
                </Button>
            </div>

            {simulation?.request?.gas && (
                <div className="text-sm text-muted-foreground">
                    Estimated Gas: {formatEther(simulation.request.gas * BigInt(2))} ETH
                </div>
            )}

            {isWrapped && <div className="text-sm text-green-500">Successfully wrapped {amount} ETH to WETH!</div>}
        </div>
    )
}
