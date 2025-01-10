import * as React from "react"

import { cn } from "@/lib/utils"

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <nav
        ref={ref}
        className={cn(
            "flex w-screen justify-between items-center bg-default text-default border-b-slate-50",
            className
        )}
        {...props}
    />
))
Navbar.displayName = "Navbar"

const NavbarTitle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-xl font-bold pl-4", className)}
        {...props}
    />
))
NavbarTitle.displayName = "NavbarTitle"

const NavbarLinks = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("space-x-4", className)}
        {...props}
    />
))
NavbarLinks.displayName = "NavbarLinks"

const NavbarWallet = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("space-x-4", className)}
        {...props}
    >
        <WalletMultiButton />
    </div>
))
NavbarWallet.displayName = "NavbarWallet"

export { Navbar, NavbarTitle, NavbarLinks, NavbarWallet }
