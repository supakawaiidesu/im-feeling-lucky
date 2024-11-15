import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../ui/button";
import DepositBox from "../features/trading/deposit";
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
        <span className="font-bold">UniDex</span>
        
        {/* Desktop Navigation */}
        <nav className="items-center hidden space-x-4 md:flex">
          <Button variant="ghost">Portfolio</Button>
          <Button variant="ghost">Markets</Button>
          <Button variant="ghost">Trade</Button>
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
              <DropdownMenuItem>
                Portfolio
              </DropdownMenuItem>
              <DropdownMenuItem>
                Markets
              </DropdownMenuItem>
              <DropdownMenuItem>
                Trade
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
