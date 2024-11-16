import { useState, useEffect } from "react"
import { formatEther, parseEther } from "viem"
import { usePublicClient } from "wagmi"

export function useGasPrice() {
    const [gasPrice, setGasPrice] = useState<bigint | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const publicClient = usePublicClient()

    useEffect(() => {
        async function fetchGasPrice() {
            try {
                setIsLoading(true)
                const price = await publicClient.getGasPrice()
                setGasPrice(price)
                setError(null)
            } catch (err) {
                setError("Failed to fetch gas price")
                console.error("Gas price fetch error:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchGasPrice()
        const interval = setInterval(fetchGasPrice, 10000) // Update every 10 seconds

        return () => clearInterval(interval)
    }, [publicClient])

    return { gasPrice, isLoading, error }
}
