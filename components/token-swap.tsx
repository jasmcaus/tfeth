"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownUp } from "lucide-react"

interface TokenSwapProps {
    address?: string
}

export function TokenSwap({ address }: TokenSwapProps) {
    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <div className="flex gap-2">
                    <Select defaultValue="eth">
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Token" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="eth">ETH</SelectItem>
                            <SelectItem value="usdc">USDC</SelectItem>
                            <SelectItem value="usdt">USDT</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="number" placeholder="0.0" className="flex-1" />
                </div>
            </div>

            <div className="flex justify-center">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowDownUp className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-2">
                <div className="flex gap-2">
                    <Select defaultValue="usdc">
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Token" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="eth">ETH</SelectItem>
                            <SelectItem value="usdc">USDC</SelectItem>
                            <SelectItem value="usdt">USDT</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="number" placeholder="0.0" className="flex-1" />
                </div>
            </div>

            <Button className="w-full">Swap Tokens</Button>
        </div>
    )
}
