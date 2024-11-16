"use client"

import { formatDistanceToNow } from "date-fns"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

type TransactionStatus = "success" | "pending" | "failed"

type Transaction = {
    id: string
    wethAmount: string
    tokenAmount: string
    tokenSymbol: string
    recipient: string
    status: TransactionStatus
    timestamp: Date
}

const mockTransactions: Transaction[] = [
    {
        id: "0x1234...5678",
        wethAmount: "1.5",
        tokenAmount: "2500",
        tokenSymbol: "DAI",
        recipient: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        status: "success",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
        id: "0x8765...4321",
        wethAmount: "0.5",
        tokenAmount: "750",
        tokenSymbol: "USDC",
        recipient: "0x1234567890123456789012345678901234567890",
        status: "pending",
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    {
        id: "0xabcd...efgh",
        wethAmount: "2.0",
        tokenAmount: "3200",
        tokenSymbol: "USDT",
        recipient: "0x9876543210987654321098765432109876543210",
        status: "failed",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
]

const StatusIcon = ({ status }: { status: TransactionStatus }) => {
    switch (status) {
        case "success":
            return <CheckCircle2 className="h-4 w-4 text-green-500" />
        case "pending":
            return <Clock className="h-4 w-4 text-yellow-500" />
        case "failed":
            return <XCircle className="h-4 w-4 text-red-500" />
    }
}

export function TransactionHistory() {
    return (
        <div className="rounded-lg border p-4 space-y-4">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <div className="space-y-3">
                {mockTransactions.map((tx) => (
                    <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <StatusIcon status={tx.status} />
                                <span className="font-medium">
                                    {tx.wethAmount} WETH → {tx.tokenAmount} {tx.tokenSymbol}
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                To: {tx.recipient.slice(0, 6)}...{tx.recipient.slice(-4)}
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 