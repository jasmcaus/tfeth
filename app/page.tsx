"use client"

import { WalletHeader } from "@/components/wallet-header"
import { TokenWrapper } from "@/components/token-wrapper"
import { TokenSwap } from "@/components/token-swap"
import { TransactionHistory } from "@/components/transaction-history"

export default function Home() {
    return (
        <>
            <WalletHeader />
            <main className="container mx-auto p-4 max-w-2xl space-y-8">
                <TokenWrapper />
                <TokenSwap />
                <TransactionHistory />
            </main>
        </>
    )
}
