"use client"

import { useState } from "react"
import { parseEther, formatEther } from "viem"
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WETH_ABI, WETH_ADDRESS } from "@/constants/contracts"
import { useGasPrice } from "@/hooks/use-gas-price"
import { Loader2 } from "lucide-react"
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

export function TokenWrapper() {
    const [amount, setAmount] = useState("")
    const [error, setError] = useState<string | null>(null)
    const { address } = useAccount()
    
    const { gasPrice, isLoading: isLoadingGas } = useGasPrice()
    
    // Get ETH balance
    const { data: ethBalance, isLoading: isLoadingBalance } = useBalance({
        address,
    })

    // Get WETH balance
    const { data: wethBalance } = useBalance({
        address,
        token: WETH_ADDRESS,
    })

    // Simulate contract for gas estimation
    const { data: simulation } = useSimulateContract({
        address: WETH_ADDRESS,
        abi: WETH_ABI,
        functionName: 'deposit',
        value: amount ? parseEther(amount) : undefined,
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
        if (!ethBalance?.value || !gasPrice || !simulation?.request?.gas) {
            setError("Unable to calculate max amount. Please try again.")
            return
        }

        try {
            // Calculate gas cost with current gas price
            const gasCost = gasPrice * simulation.request.gas * BigInt(2) // 2x safety margin
            
            // Subtract gas cost from balance
            const maxAmount = ethBalance.value - gasCost

            if (maxAmount <= BigInt(0)) {
                setError("Insufficient balance for gas fees")
                return
            }

            // Format to 6 decimal places
            const formattedAmount = Number(formatEther(maxAmount)).toFixed(6)
            setAmount(formattedAmount)
            setError(null)
        } catch (err) {
            setError("Error calculating maximum amount")
            console.error(err)
        }
    }

    // Handle wrapping
    const handleWrap = async () => {
        try {
            if (!amount) return
            setError(null)
            const value = parseEther(amount)
            writeContract({
                address: WETH_ADDRESS,
                abi: WETH_ABI,
                functionName: 'deposit',
                value,
            })
        } catch (err) {
            setError("Failed to wrap ETH. Please try again.")
            console.error(err)
        }
    }

    const isLoading = isLoadingGas || isLoadingBalance || isWrapping

    return (
        <ToastProvider>
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
                            disabled={isLoading}
                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-[4.5rem]"
                            min="0"
                            step="0.000001"
                        />
                        <div 
                            className="absolute inset-y-0 right-0 flex items-center mr-2"
                            style={{ pointerEvents: 'auto' }}
                        >
                            <button
                                type="button"
                                onClick={handleMaxAmount}
                                disabled={isLoading}
                                className="px-2 py-1 text-xs font-semibold rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:opacity-50 transition-colors"
                            >
                                MAX
                            </button>
                        </div>
                    </div>
                    <Button 
                        onClick={handleWrap}
                        disabled={!amount || isLoading}
                    >
                        {isWrapping ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Wrapping...
                            </>
                        ) : (
                            "Wrap ETH"
                        )}
                    </Button>
                </div>

                {simulation?.request?.gas && gasPrice && (
                    <div className="text-sm text-muted-foreground">
                        Estimated Gas: {formatEther(simulation.request.gas * gasPrice)} ETH
                    </div>
                )}

                {isWrapped && (
                    <div className="text-sm text-green-500">
                        Successfully wrapped {amount} ETH to WETH!
                    </div>
                )}
            </div>

            {error && (
                <Toast variant="destructive">
                    <ToastTitle>Error</ToastTitle>
                    <ToastDescription>{error}</ToastDescription>
                </Toast>
            )}
            <ToastViewport />
        </ToastProvider>
    )
}
