"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ThemeToggle } from "@/components/theme-toggle"

export function WalletHeader() {
    return (
        <div className="flex items-center justify-between p-4">
            <ThemeToggle />
            <ConnectButton />
        </div>
    )
}
