import * as React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"

const StablebondCreator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {

    const enabled_fiat = [
        { value: 'us dollar', label: 'US Dollar' },
        { value: 'euro', label: 'Euro' },
        { value: 'british pound', label: 'British Pound' },
        { value: 'mexican peso', label: 'Mexican Peso' },
        { value: 'brazilian real', label: 'Brazilian Real' },
    ]
    const [open, setOpen] = useState(false)
    const [selectedFiat, setSelectedFiat] = useState("")

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
                                defaultValue="Stable USD"
                                className="col-span-2 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="bond-symbol">Symbol</Label>
                            <Input
                                id="bond-symbol"
                                defaultValue="StUSD"
                                className="col-span-2 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="bond-icon">Icon</Label>
                            <Input
                                id="bond-icon"
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
                                                            setSelectedFiat(curVal === selectedFiat ? "" : curVal)
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
                        {/* <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="bond-supply">Max. supply</Label>
                            <Input
                                id="bond-supply"
                                defaultValue="100000"
                                className="col-span-2 h-8"
                            />
                        </div> */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Button>Submit</Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
})
StablebondCreator.displayName = "StablebondCreator"

export { StablebondCreator }
