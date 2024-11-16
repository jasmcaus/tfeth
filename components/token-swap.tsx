"use client"

import { useState, useEffect } from "react"
import { parseEther, formatEther } from "viem"
import { useAccount, useSignMessage, usePublicClient, useFeeData, useSimulateContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { Token, CurrencyAmount, TradeType } from "@uniswap/sdk-core"
import { Pair, Route, Trade } from "@uniswap/v2-sdk"
import { mainnet } from "wagmi/chains"

// Contract addresses and pair address
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const UNISWAP_V2_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const WETH_DAI_PAIR_ADDRESS = "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11"

// Token Definitions
const WETH_TOKEN = new Token(mainnet.id, WETH_ADDRESS, 18, "WETH", "Wrapped Ether")

const DAI_TOKEN = new Token(mainnet.id, DAI_ADDRESS, 18, "DAI", "Dai Stablecoin")

// Router ABI (only the functions we need)
const ROUTER_ABI = [
    {
        inputs: [
            { name: "amountIn", type: "uint256" },
            { name: "amountOutMin", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "to", type: "address" },
            { name: "deadline", type: "uint256" },
        ],
        name: "swapExactTokensForTokens",
        outputs: [{ name: "amounts", type: "uint256[]" }],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const

const MOCK_BALANCES = {
    WETH: {
        formatted: "2.5",
        value: BigInt("2500000000000000000"), // 2.5 WETH
    },
    DAI: {
        formatted: "5000",
        value: BigInt("5000000000000000000000"), // 5000 DAI
    },
    ETH: {
        formatted: "3.0",
        value: BigInt("3000000000000000000"), // 3.0 ETH for gas
    },
}

export function TokenSwap() {
    const [wethAmount, setWethAmount] = useState("")
    const [daiAmount, setDaiAmount] = useState("")
    const [activeInput, setActiveInput] = useState<"WETH" | "DAI" | null>(null)
    const [isSwapped, setIsSwapped] = useState(false)
    const [isSwapSigning, setIsSwapSigning] = useState(false)
    const [estimatedGasFee, setEstimatedGasFee] = useState<string | null>(null)
    const [hasEnoughEthForGas, setHasEnoughEthForGas] = useState(true)
    const [isLoadingPrice, setIsLoadingPrice] = useState(false)
    const [exchangeRate, setExchangeRate] = useState<string | null>(null)
    const [estimatedGas, setEstimatedGas] = useState<bigint | null>(null)
    const [gasPrice, setGasPrice] = useState<bigint | null>(null)

    const { address } = useAccount()
    const publicClient = usePublicClient()

    const debouncedWethAmount = useDebounce(wethAmount, 500)

    // Fetch gas price
    useEffect(() => {
        const fetchGasPrice = async () => {
            try {
                const price = await publicClient?.getGasPrice()
                console.log("GAS PRICE", price)
                setGasPrice(price!)
            } catch (error) {
                console.error("Error fetching gas price:", error)
                setGasPrice(null)
            }
        }

        fetchGasPrice()
        // Refresh gas price every 10 seconds
        const interval = setInterval(fetchGasPrice, 10000)
        return () => clearInterval(interval)
    }, [publicClient])

    // Estimate gas using public client
    useEffect(() => {
        const estimateGas = async () => {
            if (!wethAmount || !Number(wethAmount) || !address) {
                setEstimatedGas(null)
                return
            }

            try {
                const gasEstimate = await publicClient?.estimateContractGas({
                    address: WETH_ADDRESS,
                    abi: [
                        {
                            constant: false,
                            inputs: [
                                { name: "spender", type: "address" },
                                { name: "value", type: "uint256" },
                            ],
                            name: "approve",
                            outputs: [{ name: "", type: "bool" }],
                            payable: false,
                            stateMutability: "nonpayable",
                            type: "function",
                        },
                    ] as const,
                    functionName: "approve",
                    args: [UNISWAP_V2_ROUTER_ADDRESS, parseEther(wethAmount)],
                    account: address,
                })

                setEstimatedGas(gasEstimate!)
            } catch (error) {
                console.error("Error estimating gas:", error)
                setEstimatedGas(null)
            }
        }

        estimateGas()
    }, [wethAmount, address, publicClient])

    // Calculate gas fee whenever estimate or gas price changes
    useEffect(() => {
        console.log("ESTIMATED GAS", estimatedGas)
        console.log("GAS PRICE", gasPrice)
        if (!estimatedGas || !gasPrice) {
            setEstimatedGasFee(null)
            return
        }

        try {
            // Add extra gas for the actual swap (approximately 200,000 more)
            const totalGas = estimatedGas + BigInt(200000)
            const gasFee = totalGas * gasPrice
            const gasFeeInEth = formatEther(gasFee)
            console.error("GAS FEE IN ETH", gasFeeInEth)
            setEstimatedGasFee(gasFeeInEth)

            // Check if user has enough ETH for gas
            const hasEnough = Number(MOCK_BALANCES.ETH.formatted) >= Number(gasFeeInEth)
            setHasEnoughEthForGas(hasEnough)
        } catch (error) {
            console.error("Error calculating gas fee:", error)
            setEstimatedGasFee(null)
        }
    }, [estimatedGas, gasPrice])

    const debouncedDaiAmount = useDebounce(daiAmount, 500)

    // Fetch price using Uniswap SDK
    useEffect(() => {
        const fetchPrice = async () => {
            if (!debouncedWethAmount && !debouncedDaiAmount) return

            try {
                setIsLoadingPrice(true)

                // Get reserves from the pair contract
                const [reserve0, reserve1] = (await publicClient?.readContract({
                    address: WETH_DAI_PAIR_ADDRESS,
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
                    CurrencyAmount.fromRawAmount(DAI_TOKEN, reserve0.toString()),
                    CurrencyAmount.fromRawAmount(WETH_TOKEN, reserve1.toString()),
                )

                if (activeInput === "WETH" && debouncedWethAmount) {
                    // Create route
                    const route = new Route([pair], WETH_TOKEN, DAI_TOKEN)

                    // Create trade
                    const trade = new Trade(
                        route,
                        CurrencyAmount.fromRawAmount(WETH_TOKEN, parseEther(debouncedWethAmount).toString()),
                        TradeType.EXACT_INPUT,
                    )

                    setDaiAmount(trade.outputAmount.toSignificant(6))
                    setExchangeRate(`1 WETH = ${route.midPrice.toSignificant(6)} DAI`)
                } else if (activeInput === "DAI" && debouncedDaiAmount) {
                    // Create route
                    const route = new Route([pair], DAI_TOKEN, WETH_TOKEN)

                    // Create trade
                    const trade = new Trade(
                        route,
                        CurrencyAmount.fromRawAmount(DAI_TOKEN, parseEther(debouncedDaiAmount).toString()),
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

        const wethExceeded = Number(wethAmount) > Number(MOCK_BALANCES.WETH.formatted)
        const ethForGasExceeded = !hasEnoughEthForGas

        return wethExceeded || ethForGasExceeded
    }

    const getErrorMessage = () => {
        if (!wethAmount || !daiAmount) return null

        if (Number(wethAmount) > Number(MOCK_BALANCES.WETH.formatted)) {
            return "Insufficient WETH balance"
        }
        if (!hasEnoughEthForGas) {
            return `Insufficient ETH for gas (${estimatedGasFee} ETH needed)`
        }
        return null
    }

    const handleSwap = async () => {
        if (!address || !wethAmount || !daiAmount) return
        if (!hasEnoughEthForGas) {
            console.error("Insufficient ETH for gas")
            return
        }

        setIsSwapSigning(true)
        try {
            await signMessageAsync({
                message: `I want to swap ${wethAmount} WETH for ${daiAmount} DAI (Gas fee: ${estimatedGasFee} ETH) at ${new Date().toISOString()}`,
            })
            setIsSwapped(true)
            setTimeout(() => setIsSwapped(false), 3000)
        } catch (error) {
            console.error("Error signing swap message:", error)
        } finally {
            setIsSwapSigning(false)
        }
    }

    const isSwapping = isSwapSigning

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

            {/* Gas Fee Display - Only show when we have a value */}
            {estimatedGasFee && wethAmount && Number(wethAmount) > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                    Estimated Gas Fee: {Number(estimatedGasFee).toFixed(6)} ETH
                </div>
            )}

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
                    getErrorMessage() || "Insufficient Balance"
                ) : (
                    "Swap"
                )}
            </Button>

            {isSwapped && (
                <div className="text-sm text-green-500 text-center bg-green-500/10 px-3 py-2 rounded-lg">
                    Successfully signed swap message!
                    <div className="text-xs mt-1">Gas fee: {estimatedGasFee} ETH</div>
                </div>
            )}
        </div>
    )
}
