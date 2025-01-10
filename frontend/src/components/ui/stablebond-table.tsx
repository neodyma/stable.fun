import * as React from "react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { WalletContextState, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"

import fetchStablebondTokens from "@/scripts/fetchStablebondTokens"
import { depositFiat } from "@/scripts/depositFiat"
import { redeemToken } from "@/scripts/redeemToken"

interface StablebondToken {
    pubkey: string;
    mint: string;
    owner: string;
    decimals: number;
    amount: number;
    name: string;
    symbol: string;
    uri: string;
}

interface StablebondTableProps {
    refreshTrigger: number; // Increment to trigger refresh
}

// fetch and display stablebonds in a table
const StablebondTable = React.forwardRef<
    HTMLDivElement,
    StablebondTableProps & React.HTMLAttributes<HTMLDivElement>
>(({ className, refreshTrigger, ...props }, ref) => {
    const [stablebonds, setStablebonds] = useState<StablebondToken[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [amount, setAmount] = useState<string>("1")

    const wallet = useWallet()

    const handleBuy = async (token: StablebondToken, amount: number) => {
        try {
            const sig = await depositFiat(
                wallet,
                amount,
                new PublicKey(token.mint)
            );
        } catch (error: any) {
            console.error("Deposit failed:", error);
        }
    };

    const handleSell = async (token: StablebondToken, amount: number) => {
        try {
            const sig = await redeemToken(
                wallet,
                amount,
                new PublicKey(token.mint)
            );
        } catch (error: any) {
            console.error("Redeem failed:", error);
        }
    }

    useEffect(() => {
        const getStablebonds = async () => {
            const json = await fetchStablebondTokens()
            try {
                const data = JSON.parse(json)
                console.log("data", data)
                if (data.error) {
                    setError(data.error)
                } else {
                    setStablebonds(data.tokens)
                }
            } catch (parseError) {
                setError("failed to parse token json.")
            } finally {
                setLoading(false)
            }
        };

        getStablebonds();
    }, [refreshTrigger]);

    if (loading) {
        return (
            <Table>
                <TableCaption className="p-4">Loading tokens...</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-4 w-7/12">Stablebond</TableHead>
                        <TableHead>Supply</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
            </Table>
        );
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">Error loading tokens.</div>;
    }

    return (
        <Table>
            <TableCaption className="p-4">Investment at own risk. DYOR.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableCell className="pl-4 w-7/12">Stablebond</TableCell>
                    <TableCell className="w-3/12">Amount</TableCell>
                    {/* <TableCell className="w-2/12">Owned</TableCell> */}
                    <TableCell className="w-1/12 pr-4"></TableCell>
                    <TableCell className="w-1/12 pr-4"></TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stablebonds.map((token, index) => (
                    <TableRow key={index}>
                        <TableCell className="pl-4">
                            <div className="flex items-center space-x-2">
                                <img
                                    src={token.uri}
                                    alt={token.name}
                                    className="w-6 h-6 rounded-full"
                                />
                                <div>
                                    <div>{token.name}</div>
                                    <div className="text-xs text-muted-foreground">{token.symbol}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                defaultValue={1}
                                >
                            </Input>
                        </TableCell>
                        {/* <TableCell>{token.amount / 1e9}</TableCell> */}
                        <TableCell>
                            <Button onClick={() => handleBuy(token, parseInt(amount))} disabled={!wallet.connected}>Buy</Button>
                        </TableCell>
                        <TableCell>
                            <Button onClick={() => handleSell(token, parseInt(amount))} disabled={!wallet.connected}>Sell</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
})
StablebondTable.displayName = "StablebondTable"

export { StablebondTable }
