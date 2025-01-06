import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navbar, NavbarLinks, NavbarTitle, NavbarWallet } from '@/components/ui/navbar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { StablebondCreator } from '@/components/ui/stablebond-creator'
import { StablebondTable } from '@/components/ui/stablebond-table'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { useState } from 'react'

function App() {
  document.body.classList.add('dark')
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <WalletModalProvider>
          <header className="border-grid sticky top-0 z-50 w-full">
            <Navbar className='p-1 border-b bg-transparent border-zinc-800'>
              <NavbarTitle>Stable.fun</NavbarTitle>
              <NavbarWallet className="scale-75" />
            </Navbar>
          </header>
          <div className='flex justify-center bg-transparent p-4'>
            <b className='text-3xl'>Dashboard</b>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 justify-center gap-1 p-4'>
            <Card className="text-center sm:text-left">
              <CardHeader>
                <CardTitle>Portfolio Valuation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>$ 1234</p>
              </CardContent>
              <CardFooter className="">
                <p className="">+ 1234% in the last month</p>
              </CardFooter>
            </Card>
            <Card className="text-center sm:text-left">
              <CardHeader>
                <CardTitle>Diversification</CardTitle>
              </CardHeader>
              <CardContent>
                <p>$ 1234</p>
              </CardContent>
              <CardFooter>
                <p>+ 1234% in the last month</p>
              </CardFooter>
            </Card>
            <Card className="text-center sm:text-left">
              <CardHeader>
                <CardTitle>Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <p>$ 1234</p>
              </CardContent>
              <CardFooter>
                <p>+ 1234% in the last month</p>
              </CardFooter>
            </Card>
            <Card className="text-center sm:text-left">
              <CardHeader>
                <CardTitle>Create Stablebonds</CardTitle>
              </CardHeader>
              <CardContent>
                <StablebondCreator />
              </CardContent>
            </Card>
          </div>
          <div className='w-full justify-center p-4'>
            <Card>
              <StablebondTable />
            </Card>
          </div>
        </WalletModalProvider>
      </div>
    </>
  )
}

export default App
