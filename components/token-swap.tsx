"use client"

import { useState, useEffect } from "react"
import { parseEther, formatEther } from "viem"
import { useAccount, useSignMessage, usePublicClient } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { Token, CurrencyAmount, TradeType } from "@uniswap/sdk-core"
import { Pair, Route, Trade } from "@uniswap/v2-sdk"
import { mainnet } from "wagmi/chains"

const MOCK_BALANCES = {
    WETH: {
        formatted: "2.5",
        value: BigInt("2500000000000000000"), // 2.5 WETH
    },
    DAI: {
        formatted: "5000",
        value: BigInt("5000000000000000000000"), // 5000 DAI
    },
}

// Token Definitions
const WETH = new Token(mainnet.id, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18, "WETH", "Wrapped Ether")

const DAI = new Token(mainnet.id, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18, "DAI", "Dai Stablecoin")

// WETH-DAI pair address on Uniswap V2
const PAIR_ADDRESS = "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11"

export function TokenSwap() {
    const [wethAmount, setWethAmount] = useState("")
    const [daiAmount, setDaiAmount] = useState("")
    const [activeInput, setActiveInput] = useState<"WETH" | "DAI" | null>(null)
    const [isSwapped, setIsSwapped] = useState(false)
    const [isLoadingPrice, setIsLoadingPrice] = useState(false)
    const [exchangeRate, setExchangeRate] = useState<string | null>(null)

    const { address } = useAccount()
    const publicClient = usePublicClient()

    const debouncedWethAmount = useDebounce(wethAmount, 500)
    const debouncedDaiAmount = useDebounce(daiAmount, 500)

    // Fetch price using Uniswap SDK
    useEffect(() => {
        const fetchPrice = async () => {
            if (!debouncedWethAmount && !debouncedDaiAmount) return

            try {
                setIsLoadingPrice(true)

                // Get reserves from the pair contract
                const [reserve0, reserve1] = (await publicClient?.readContract({
                    address: PAIR_ADDRESS,
                    abi: [
                        {
                            constant: true,
                            inputs: [],
                            name: "getReserves",
                            outputs: [
                                { name: "_reserve0", type: "uint112" },
                                { name: "_reserve1", type: "uint112" },
                                { name: "_blockTimestampLast", type: "uint32" },
                            ],
                            type: "function",
                        },
                    ],
                    functionName: "getReserves",
                })) as [bigint, bigint, number]

                // Create pair instance
                const pair = new Pair(
                    CurrencyAmount.fromRawAmount(DAI, reserve0.toString()),
                    CurrencyAmount.fromRawAmount(WETH, reserve1.toString()),
                )

                if (activeInput === "WETH" && debouncedWethAmount) {
                    // Create route
                    const route = new Route([pair], WETH, DAI)

                    // Create trade
                    const trade = new Trade(
                        route,
                        CurrencyAmount.fromRawAmount(WETH, parseEther(debouncedWethAmount).toString()),
                        TradeType.EXACT_INPUT,
                    )

                    setDaiAmount(trade.outputAmount.toSignificant(6))
                    setExchangeRate(`1 WETH = ${route.midPrice.toSignificant(6)} DAI`)
                } else if (activeInput === "DAI" && debouncedDaiAmount) {
                    // Create route
                    const route = new Route([pair], DAI, WETH)

                    // Create trade
                    const trade = new Trade(
                        route,
                        CurrencyAmount.fromRawAmount(DAI, parseEther(debouncedDaiAmount).toString()),
                        TradeType.EXACT_INPUT,
                    )

                    setWethAmount(trade.outputAmount.toSignificant(6))
                    setExchangeRate(`1 DAI = ${route.midPrice.toSignificant(6)} WETH`)
                }
            } catch (error) {
                console.error("Error fetching price:", error)
            } finally {
                setIsLoadingPrice(false)
            }
        }

        fetchPrice()
    }, [debouncedWethAmount, debouncedDaiAmount, activeInput, publicClient])

    const { signMessageAsync, status } = useSignMessage()

    const handleMaxAmount = () => {
        setWethAmount(MOCK_BALANCES.WETH.formatted)
        setActiveInput("WETH")
    }

    const isExceedingBalance = () => {
        if (!wethAmount || !daiAmount) return false
        return Number(wethAmount) > Number(MOCK_BALANCES.WETH.formatted)
    }

    const getBalanceErrorMessage = () => {
        if (!wethAmount || !daiAmount) return null
        if (Number(wethAmount) > Number(MOCK_BALANCES.WETH.formatted)) {
            return "Insufficient WETH balance"
        }
        return null
    }

    const handleSwap = async () => {
        if (!address || !wethAmount || !daiAmount) return
        try {
            await signMessageAsync({
                message: `I want to swap ${wethAmount} WETH for ${daiAmount} DAI at ${new Date().toISOString()}`,
            })
            setIsSwapped(true)
            setTimeout(() => setIsSwapped(false), 3000)
        } catch (error) {
            console.error("Error signing message:", error)
        }
    }

    const isSwapping = status === "pending"

    return (
        <div className="rounded-xl border bg-gradient-to-b from-muted/50 to-muted p-6 shadow-xl space-y-4">
            <div className="space-y-2">
                {/* WETH Input */}
                <div className="group p-4 bg-gradient-to-b from-background to-background/50 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-500/10 rounded-full">
                                <img
                                    src="/weth-logo.png"
                                    alt="WETH"
                                    className="w-7 h-7 rounded-full shadow-sm group-hover:scale-105 transition-transform duration-200"
                                />
                            </div>
                            <span className="font-semibold text-base">WETH</span>
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                            Balance: {MOCK_BALANCES.WETH.formatted}
                        </div>
                    </div>
                    <div className="relative">
                        <Input
                            type="number"
                            value={wethAmount}
                            onChange={(e) => {
                                setWethAmount(e.target.value)
                                setActiveInput("WETH")
                            }}
                            disabled={isSwapping}
                            className={cn(
                                "pr-16 text-lg font-medium border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20",
                            )}
                            placeholder="0.0"
                        />
                        <button
                            type="button"
                            onClick={handleMaxAmount}
                            disabled={isSwapping}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-50 transition-colors"
                        >
                            MAX
                        </button>
                    </div>
                </div>

                {/* Swap Arrow */}
                <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-background rounded-full p-2 border shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:border-primary/20">
                        <ArrowDownIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                </div>

                {/* DAI Input */}
                <div className="group p-4 bg-gradient-to-b from-background to-background/50 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-yellow-500/10 rounded-full">
                                <img
                                    src="/dai-logo.png"
                                    alt="DAI"
                                    className="w-7 h-7 rounded-full shadow-sm group-hover:scale-105 transition-transform duration-200"
                                />
                            </div>
                            <span className="font-semibold text-base">DAI</span>
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                            Balance: {MOCK_BALANCES.DAI.formatted}
                        </div>
                    </div>
                    <Input
                        type="number"
                        value={daiAmount}
                        onChange={(e) => {
                            setDaiAmount(e.target.value)
                            setActiveInput("DAI")
                        }}
                        disabled={isSwapping}
                        className={cn(
                            "text-lg font-medium border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20",
                        )}
                        placeholder="0.0"
                    />
                </div>
            </div>

            {/* Exchange Rate with Loading States */}
            <div className="h-5 text-sm text-center">
                {isLoadingPrice ? (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Fetching price...
                    </div>
                ) : (
                    exchangeRate && <div className="px-3 py-1 bg-muted/50 rounded-full inline-block">{exchangeRate}</div>
                )}
            </div>

            <Button
                onClick={handleSwap}
                disabled={!wethAmount || isSwapping || isExceedingBalance()}
                className={cn(
                    "w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-lg h-12 rounded-xl shadow-lg",
                    isExceedingBalance() && "opacity-50 cursor-not-allowed",
                )}
            >
                {isSwapping ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing...
                    </>
                ) : isExceedingBalance() ? (
                    "Insufficient Balance"
                ) : (
                    "Swap"
                )}
            </Button>

            {isSwapped && (
                <div className="text-sm text-green-500 text-center bg-green-500/10 px-3 py-2 rounded-lg">
                    Successfully signed swap message!
                </div>
            )}
        </div>
    )
}
