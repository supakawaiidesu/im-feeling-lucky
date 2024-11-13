import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../ui/button";
import DepositBox from "../features/trading/deposit";

export function Header() {
  return (
    <header className="flex items-center px-4 h-14">
      <div className="flex items-center space-x-4">
        <span className="font-bold">UniDex</span>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost">Portfolio</Button>
          <Button variant="ghost">Markets</Button>
          <Button variant="ghost">Trade</Button>
        </nav>
      </div>
      <div className="flex items-center ml-auto space-x-2">
        <DepositBox />

        <ConnectButton
          showBalance={false}
          chainStatus="none"
          accountStatus="address"
        />
      </div>
    </header>
  );
}
