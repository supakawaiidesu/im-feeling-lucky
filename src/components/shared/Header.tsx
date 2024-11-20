import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from 'next/image';
import { Button } from "../ui/button";
import DepositBox from "../features/trading/deposit";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Menu } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center px-4 h-14">
      <div className="flex items-center space-x-4">
        <Link href="/" className="hover:opacity-80">
          <Image
            src="/static/images/logo-large.png"
            alt="UniDex Logo"
            width={100}
            height={32}
            priority
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="items-center hidden space-x-4 md:flex">
          <Link href="/">
            <Button variant="ghost">Trade</Button>
          </Link>
          <Link href="/staking">
            <Button variant="ghost">Stake</Button>
          </Link>
          <Link href="/usdm">
            <Button variant="ghost">USD.m</Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/staking">Stake</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">Trade</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/usdm">USD.m</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center ml-auto space-x-2">
        <div className="hidden sm:block">
          <DepositBox />
        </div>

        <ConnectButton
          showBalance={false}
          chainStatus="none"
          accountStatus="address"
        />
      </div>
    </header>
  );
}
