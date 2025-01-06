import * as React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import fetchStablebondTokens from "@/scripts/fetchStablebondTokens"

// fetch and display stablebonds in a table
const StablebondTable = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <Table>
            <TableCaption className="p-4">Available Stablebonds. Investment at own risk. DYOR.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableCell className="pl-4 w-7/12">Stablebond</TableCell>
                    <TableCell>Supply</TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableHeader>
        </Table>
    )
})
StablebondTable.displayName = "StablebondTable"

export { StablebondTable }
