import * as React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Check, ChevronsUpDown } from "lucide-react"
import createStablebondToken from "@/scripts/createStablebondToken"
import { sendAndConfirmRawTransaction } from "@solana/web3.js"

interface StablebondCreatorProps extends React.HTMLAttributes<HTMLDivElement> {
    onStablebondCreated: () => void;
}

const StablebondCreator = React.forwardRef<
    HTMLDivElement,
    StablebondCreatorProps
>(({ className, onStablebondCreated, ...props }, ref) => {

    const enabled_fiat = [
        { value: 'ustry', label: 'US Dollar' },
        { value: 'eurob', label: 'Euro' },
        { value: 'gilts', label: 'British Pound' },
        { value: 'cetes', label: 'Mexican Peso' },
        { value: 'tesouro', label: 'Brazilian Real' },
    ]

    const bondToFiat = {
        "ustry": "USD",
        "eurob": "EUR",
        "gilts": "GBP",
        "cetes": "MXN",
        "tesouro": "BRL",
    }

    const [open, setOpen] = useState(false)
    const [name, setName] = useState<string>("Stable USD");
    const [symbol, setSymbol] = useState<string>("StUSD");
    const [iconUrl, setIconUrl] = useState<string>("https://example.com/icon.png");
    const [selectedFiat, setSelectedFiat] = useState<keyof typeof bondToFiat>("ustry");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    // const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    // const [submitError, setSubmitError] = useState<string | null>(null);

    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()

    console.log("creator connection", connection.rpcEndpoint)
    console.log("wallet publicKey", publicKey?.toBase58())

    const handleSubmit = async () => {
        // Reset feedback messages
        // setSubmitSuccess(null);
        // setSubmitError(null);

        // Validate inputs
        if (!name || !symbol || !iconUrl || !selectedFiat) {
            // setSubmitError("Please fill in all the fields.");
            return;
        }

        if (!publicKey) {
            // setSubmitError("Wallet not connected.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Call the createStablebondToken function
            const { transaction, mint } = await createStablebondToken(
                publicKey,
                connection,
                name,
                symbol,
                iconUrl,
                selectedFiat
            );

            const blockhash = connection.getLatestBlockhash()

            // Send the transaction, including the mint as a signer
            const signature = await sendTransaction(transaction, connection, {
                signers: [mint],
            });

            // Wait for confirmation
            await connection.confirmTransaction(signature, "confirmed");

            // Provide success feedback
            // setSubmitSuccess(`Stablebond created successfully! Mint Address: ${mint.publicKey.toBase58()}`);

            // Reset form fields
            setName("Stable USD");
            setSymbol("StUSD");
            setIconUrl("https://example.com/icon.png");
            setSelectedFiat(selectedFiat);

            // Trigger the callback to refresh the table
            onStablebondCreated();
        } catch (error: any) {
            console.error("Transaction failed:", error);
            // setSubmitError(`Transaction failed: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="block mx-auto">Create Stablebond</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Parameters</h4>
                        <p className="text-sm text-muted-foreground">
                            Set the parameters for the stablebond.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="bond-name">Name</Label>
                            <Input
                                id="bond-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                defaultValue="Stable USD"
                                className="col-span-2 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="bond-symbol">Symbol</Label>
                            <Input
                                id="bond-symbol"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                defaultValue="StUSD"
                                className="col-span-2 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="bond-icon">Icon</Label>
                            <Input
                                id="bond-icon"
                                value={iconUrl}
                                onChange={(e) => setIconUrl(e.target.value)}
                                defaultValue="https://example.com/icon.png"
                                className="col-span-2 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="fiat">Target Fiat Currency</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={open} className="col-span-2 justify-between">
                                        {selectedFiat
                                            ? enabled_fiat.find((enabled_fiat) => enabled_fiat.value === selectedFiat)?.label
                                            : "Select.."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-fit">
                                    <Command className="">
                                        <CommandInput placeholder="Search Currency.." />
                                        <CommandList>
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            <CommandGroup>
                                                {enabled_fiat.map((fiat) => (
                                                    <CommandItem
                                                        key={fiat.value}
                                                        value={fiat.value}
                                                        onSelect={(curVal) => {
                                                            setSelectedFiat(curVal as keyof typeof bondToFiat)
                                                            setOpen(false)
                                                        }}>
                                                        {fiat.label}
                                                        <Check
                                                            className={cn("mr-2 h-4 w-4",
                                                                selectedFiat === fiat.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Button onClick={handleSubmit} disabled={isSubmitting || !publicKey || !selectedFiat}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
})
StablebondCreator.displayName = "StablebondCreator"

export { StablebondCreator }
