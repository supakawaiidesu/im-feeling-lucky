import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from "../ui/button"

export function Header() {
  return (
    <header className="flex items-center px-4 border-b h-14">
      <div className="flex items-center space-x-4">
        <span className="font-bold">UniDex</span>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost">Portfolio</Button>
          <Button variant="ghost">Markets</Button>
          <Button variant="ghost">Trade</Button>
        </nav>
      </div>
      <div className="ml-auto">
        <ConnectButton showBalance={false} />
      </div>
    </header>
  )
}
