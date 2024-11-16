"use client"

import { useState } from "react"
import { parseEther, formatEther } from "viem"
import { useAccount, useSignMessage } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock initial balance
const MOCK_ETH_BALANCE = {
    formatted: "25",
    value: BigInt("25000000000000000000"), // 25 ETH
}

export function TokenWrapper() {
    const [amount, setAmount] = useState("")
    const [simulatedWethBalance, setSimulatedWethBalance] = useState("0")
    const [isSuccess, setIsSuccess] = useState(false)
    const { address } = useAccount()
    const { signMessageAsync, status } = useSignMessage()

    const handleMaxAmount = () => {
        setAmount(MOCK_ETH_BALANCE.formatted)
    }

    const handleWrap = async () => {
        if (!address || !amount) return
        try {
            await signMessageAsync({
                message: `I want to wrap ${amount} ETH to WETH at ${new Date().toISOString()}`,
            })
            // Update simulated WETH balance after successful signing
            const newBalance = (Number(simulatedWethBalance) + Number(amount)).toFixed(4)
            setSimulatedWethBalance(newBalance)
            setIsSuccess(true)
            setTimeout(() => setIsSuccess(false), 3000)
        } catch (error) {
            console.error("Error signing wrap message:", error)
        }
    }

    const isWrapping = status === "pending"

    return (
        <div className="rounded-lg border p-4 space-y-4">
            <div className="space-y-2">
                <h2 className="text-xl font-bold">Wrap ETH to WETH</h2>
                <div className="flex items-center justify-between text-sm">
                    <span>ETH Balance: {MOCK_ETH_BALANCE.formatted} ETH</span>
                    <span>WETH Balance: {simulatedWethBalance} WETH</span>
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
                    {isWrapping ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing...
                        </>
                    ) : (
                        "Wrap ETH"
                    )}
                </Button>
            </div>

            {isSuccess && <div className="text-sm text-green-500">Successfully wrapped {amount} ETH to WETH!</div>}
        </div>
    )
}
