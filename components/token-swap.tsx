"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ArrowDownUp } from "lucide-react"

const formSchema = z.object({
    amount: z.string().min(1, "Amount is required"),
})

export function TokenSwap({ address }: { address?: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            // Mock transaction for now
            await new Promise((resolve) => setTimeout(resolve, 2000))
            toast({
                title: "Success!",
                description: `Swapped ${values.amount} ETH to WETH`,
            })
            form.reset()
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Swap Tokens</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount (ETH)</FormLabel>
                                <FormControl>
                                    <Input placeholder="0.0" type="number" step="0.000000000000000001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-center">
                        <ArrowDownUp className="text-muted-foreground" />
                    </div>

                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>You receive (WETH)</FormLabel>
                                <FormControl>
                                    <Input placeholder="0.0" disabled value={field.value} onChange={() => {}} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Processing..." : "Wrap ETH"}
                    </Button>
                </form>
            </Form>
        </Card>
    )
}
