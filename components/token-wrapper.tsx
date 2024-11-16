"use client"

import { useState } from "react"
import { parseEther, formatEther } from "viem"
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
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

    // Contract write hook for wrapping ETH
    const { writeContract, data: hash } = useWriteContract()

    // Wait for transaction hook
    const { isLoading: isWrapping, isSuccess: isWrapped } = useWaitForTransactionReceipt({
        hash,
    })

    // Handle wrapping
    const handleWrap = async () => {
        try {
            if (!amount) return
            const value = parseEther(amount)
            writeContract({
                address: WETH_ADDRESS,
                abi: WETH_ABI,
                functionName: 'deposit',
                value,
            })
        } catch (error) {
            console.error('Error wrapping ETH:', error)
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
                <Input
                    type="number"
                    placeholder="Amount to wrap"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isWrapping}
                />
                <Button 
                    onClick={handleWrap}
                    disabled={!amount || isWrapping}
                >
                    {isWrapping ? "Wrapping..." : "Wrap ETH"}
                </Button>
            </div>

            {isWrapped && (
                <div className="text-sm text-green-500">
                    Successfully wrapped {amount} ETH to WETH!
                </div>
            )}
        </div>
    )
} 