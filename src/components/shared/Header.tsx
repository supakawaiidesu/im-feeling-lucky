import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from 'next/image';
import { Button } from "../ui/button";
import DepositBox from "../features/trading/deposit";
import Link from "next/link";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Menu, MoreHorizontal } from "lucide-react";

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
          <Dropdown>
            <DropdownTrigger>
              <Button variant="ghost" className="gap-1">
                More <MoreHorizontal size={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="More actions"
              className="w-[240px]"
              itemClasses={{
                base: "gap-4",
                title: "text-sm",
                description: "text-xs text-default-400"
              }}
            >
              <DropdownItem
                key="help"
                description="Get help and support"
                onClick={() => window.open("https://samplelink.com/help", "_blank")}
              >
                Help & Support
              </DropdownItem>
              <DropdownItem
                key="documentation"
                description="Read the documentation"
                onClick={() => window.open("https://samplelink.com/documentation", "_blank")}
              >
                Documentation
              </DropdownItem>
              <DropdownItem
                key="feedback"
                description="Provide your feedback"
                onClick={() => window.open("https://samplelink.com/feedback", "_blank")}
              >
                Give Feedback
              </DropdownItem>
              <DropdownItem
                key="bug-bounty"
                description="Participate in our bug bounty program"
                onClick={() => window.open("https://samplelink.com/bug-bounty", "_blank")}
              >
                Bug Bounty
              </DropdownItem>
              <DropdownItem
                key="stats"
                description="View the latest stats"
                onClick={() => window.open("https://samplelink.com/stats", "_blank")}
              >
                Stats
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Link href="/referral">
            <Button variant="ghost">Referrals</Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="ghost" size="icon">
                <Menu size={20} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Mobile navigation"
              className="w-[240px]"
              itemClasses={{
                base: "gap-4",
                title: "text-sm",
                description: "text-xs text-default-400"
              }}
            >
              <DropdownItem onClick={() => window.location.href = "/staking"}>
                Stake
              </DropdownItem>
              <DropdownItem onClick={() => window.location.href = "/"}>
                Trade
              </DropdownItem>
              <DropdownItem onClick={() => window.location.href = "/usdm"}>
                USD.m
              </DropdownItem>
              <DropdownItem
                key="help"
                description="Get help and support"
                onClick={() => window.open("https://samplelink.com/help", "_blank")}
              >
                Help & Support
              </DropdownItem>
              <DropdownItem
                key="documentation"
                description="Read the documentation"
                onClick={() => window.open("https://samplelink.com/documentation", "_blank")}
              >
                Documentation
              </DropdownItem>
              <DropdownItem
                key="feedback"
                description="Provide your feedback"
                onClick={() => window.open("https://samplelink.com/feedback", "_blank")}
              >
                Give Feedback
              </DropdownItem>
              <DropdownItem
                key="bug-bounty"
                description="Participate in our bug bounty program"
                onClick={() => window.open("https://samplelink.com/bug-bounty", "_blank")}
              >
                Bug Bounty
              </DropdownItem>
              <DropdownItem
                key="stats"
                description="View the latest stats"
                onClick={() => window.open("https://samplelink.com/stats", "_blank")}
              >
                Stats
              </DropdownItem>
              <DropdownItem onClick={() => window.location.href = "/referral"}>
                Referrals
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
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
