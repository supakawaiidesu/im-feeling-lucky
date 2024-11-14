import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSmartAccount } from "@/hooks/use-smart-account";
import { useToast } from "@/components/ui/use-toast";
import { useBalances } from "@/hooks/use-balances";
import { useTokenTransferActions } from "@/hooks/use-token-transfer-actions";
import { useAccount, useSwitchChain } from "wagmi";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseUnits, encodeFunctionData } from "viem";
import { AmountInput } from "./AmountInput";
import { BalanceDisplay } from "./BalanceDisplay";
import { ActionButtons } from "./ActionButtons";
import { CrossChainDepositCall } from "./CrossChainDepositCall";
import { Label } from "@/components/ui/label";
import { arbitrum, optimism } from "wagmi/chains";

const TRADING_CONTRACT = "0x5f19704F393F983d5932b4453C6C87E85D22095E";
const USDC_TOKEN = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";

const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default function DepositBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [smartAccountAmount, setSmartAccountAmount] = useState("");
  const [tradingAmount, setTradingAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<
    "arbitrum" | "optimism"
  >("arbitrum");

  const depositBoxRef = useRef<HTMLDivElement>(null);

  const {
    smartAccount,
    kernelClient,
    setupSessionKey,
    isSigningSessionKey,
    isInitialized,
  } = useSmartAccount();
  const { address: eoaAddress, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();
  const {
    balances,
    isLoading: isLoadingBalances,
    refetchBalances,
  } = useBalances(selectedNetwork);
  const { transferToSmartAccount, isTransferring } = useTokenTransferActions();

    // Add click outside handler
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          depositBoxRef.current && 
          !depositBoxRef.current.contains(event.target as Node) &&
          isOpen
        ) {
          // Check if the click target is part of the Select dropdown
          const selectContent = document.querySelector('[role="listbox"]');
          if (!selectContent?.contains(event.target as Node)) {
            setIsOpen(false);
          }
        }
      }
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

  useEffect(() => {
    if (smartAccount?.address) {
      refetchBalances();
    }
  }, [smartAccount?.address, refetchBalances]);

  const isOnCorrectChain = () => {
    if (selectedNetwork === "arbitrum") {
      return chain?.id === arbitrum.id;
    } else {
      return chain?.id === optimism.id;
    }
  };

  const handleSwitchNetwork = () => {
    if (selectedNetwork === "arbitrum") {
      switchChain?.({ chainId: arbitrum.id });
    } else {
      switchChain?.({ chainId: optimism.id });
    }
  };

  const handleSetupSmartAccount = async () => {
    try {
      await setupSessionKey();
      toast({
        title: "Success",
        description: "1CT Account successfully created",
      });
      refetchBalances();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to setup 1CT account",
        variant: "destructive",
      });
    }
  };

  const handleMaxClick = (type: "smart-account" | "trading") => {
    if (!balances) return;

    if (type === "smart-account") {
      setSmartAccountAmount(balances.formattedEoaUsdcBalance);
    } else {
      setTradingAmount(balances.formattedUsdcBalance);
    }
  };

  const handleApproveAndDeposit = async () => {
    if (!smartAccount || !kernelClient) return;

    try {
      setIsApproving(true);
      toast({
        title: "Processing",
        description: "Approving USDC for trading contract...",
      });

      const approveCalldata = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [TRADING_CONTRACT, parseUnits(tradingAmount, 6)],
      });

      const tx = await kernelClient.sendTransaction({
        to: USDC_TOKEN,
        data: approveCalldata,
      });

      await kernelClient.waitForTransactionReceipt({ hash: tx });

      await handleTradingOperation("deposit");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve and deposit USDC",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleSmartAccountOperation = async (type: "deposit" | "withdraw") => {
    if (!eoaAddress || !smartAccount) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!isOnCorrectChain()) {
      handleSwitchNetwork();
      return;
    }

    if (type === "withdraw") {
      toast({
        title: "Coming Soon",
        description: "Withdrawal to EOA functionality coming soon",
      });
      return;
    }

    if (
      type === "deposit" &&
      balances &&
      parseFloat(smartAccountAmount) >
        parseFloat(balances.formattedEoaUsdcBalance)
    ) {
      toast({
        title: "Error",
        description: "Insufficient USDC balance in your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      if (type === "deposit") {
        if (selectedNetwork === "optimism") {
          // Do nothing here as the CrossChainDepositCall component will handle it
          return;
        }
        await transferToSmartAccount(smartAccountAmount, eoaAddress);
      }

      setSmartAccountAmount("");
      refetchBalances();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${type}`,
        variant: "destructive",
      });
    }
  };

  const handleTradingOperation = async (type: "deposit" | "withdraw") => {
    if (!smartAccount || !kernelClient) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (
      type === "deposit" &&
      balances &&
      parseFloat(tradingAmount) > parseFloat(balances.formattedUsdcBalance)
    ) {
      toast({
        title: "Error",
        description: "Insufficient USDC balance in 1CT Wallet",
        variant: "destructive",
      });
      return;
    }

    if (
      type === "withdraw" &&
      balances &&
      parseFloat(tradingAmount) > parseFloat(balances.formattedMusdBalance)
    ) {
      toast({
        title: "Error",
        description: "Insufficient deposited balance in Trading Contract",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://unidexv4-api-production.up.railway.app/api/wallet",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            tokenAddress: USDC_TOKEN,
            amount: tradingAmount,
            smartAccountAddress: smartAccount.address,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to process wallet operation");

      const tx = await kernelClient.sendTransaction({
        to: data.vaultAddress,
        data: data.calldata,
      });

      await kernelClient.waitForTransactionReceipt({ hash: tx });

      toast({
        title: "Success",
        description: `Successfully ${type}ed ${tradingAmount} USDC`,
      });

      setTradingAmount("");
      refetchBalances();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const needsApproval = balances
    ? parseFloat(tradingAmount || "0") >
      parseFloat(balances.formattedUsdcAllowance)
    : false;

  const handleCrossChainSuccess = () => {
    setSmartAccountAmount("");
    refetchBalances();
  };

  const getActionButtonText = (
    type: "deposit" | "withdraw",
    mode: "smart-account" | "trading"
  ) => {
    if (mode === "smart-account" && type === "deposit" && !isOnCorrectChain()) {
      return `Switch to ${
        selectedNetwork === "arbitrum" ? "Arbitrum" : "Optimism"
      }`;
    }

    if (mode === "trading" && type === "deposit" && needsApproval) {
      return "Approve & Deposit";
    }

    return type === "deposit" ? "Deposit" : "Withdraw";
  };

  const getSmartAccountButtons = () => {
    const onCorrectChain = isOnCorrectChain();
    const commonProps = {
      type: "smart-account" as const,
      onDeposit: () => handleSmartAccountOperation("deposit"),
      onWithdraw: () => handleSmartAccountOperation("withdraw"),
      isLoading: isTransferring,
      depositDisabled:
        !smartAccountAmount ||
        !eoaAddress ||
        !balances ||
        parseFloat(smartAccountAmount) >
          parseFloat(balances.formattedEoaUsdcBalance),
      withdrawDisabled:
        !smartAccountAmount ||
        !smartAccount ||
        !balances ||
        parseFloat(smartAccountAmount) >
          parseFloat(balances.formattedUsdcBalance),
      depositText: getActionButtonText("deposit", "smart-account"),
      withdrawText: getActionButtonText("withdraw", "smart-account"),
    };

    if (selectedNetwork === "optimism") {
      if (onCorrectChain) {
        // Changed from !onCorrectChain
        return (
          <CrossChainDepositCall
            amount={smartAccountAmount}
            onSuccess={handleCrossChainSuccess}
            chain={chain?.id}
          />
        );
      }
      return <ActionButtons {...commonProps} />;
    }

    return <ActionButtons {...commonProps} />;
  };

  return (
    <div className="relative" ref={depositBoxRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[hsl(var(--component-background))]"
      >
        Deposit / Withdraw
      </Button>

      {isOpen && (
        <Card className="absolute z-50 p-6 space-y-6 top-14 right-4 w-[480px] bg-[hsl(var(--component-background))]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Balance Management</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              ×
            </Button>
          </div>

          {!smartAccount && eoaAddress ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription className="space-y-4">
                  <p className="text-sm">
                    To get started with trading, you'll need to setup your 1CT
                    wallet first.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleSetupSmartAccount}
                    disabled={isSigningSessionKey}
                  >
                    {isSigningSessionKey ? "Setting up..." : "Setup 1CT Wallet"}
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              <BalanceDisplay
                eoaAddress={eoaAddress}
                smartAccountAddress={smartAccount?.address}
                eoaBalance={
                  balances
                    ? parseFloat(balances.formattedEoaUsdcBalance).toFixed(2)
                    : "0.00"
                }
                smartAccountBalance={
                  balances
                    ? parseFloat(balances.formattedUsdcBalance).toFixed(2)
                    : "0.00"
                }
                marginBalance={
                  balances
                    ? parseFloat(balances.formattedMusdBalance).toFixed(2)
                    : "0.00"
                }
                isLoading={isLoadingBalances}
                isEffectivelyInitialized={
                  isInitialized || !!smartAccount?.address
                }
                selectedNetwork={selectedNetwork}
              />

              <Tabs defaultValue="smart-account" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="smart-account" className="flex-1">
                    1CT Wallet
                  </TabsTrigger>
                  <TabsTrigger value="trading" className="flex-1">
                    Margin Balance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="smart-account" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount (USDC)</Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedNetwork}
                        onValueChange={(value: "arbitrum" | "optimism") =>
                          setSelectedNetwork(value)
                        }
                      >
                        <SelectTrigger className="w-[180px] mt-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor:
                                  selectedNetwork === "arbitrum"
                                    ? "#28A0F0"
                                    : "#FF0420",
                              }}
                            />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arbitrum">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-[#28A0F0]" />
                              <span>Arbitrum</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="optimism">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-[#FF0420]" />
                              <span>Optimism</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex-1">
                        <AmountInput
                          amount={smartAccountAmount}
                          onAmountChange={setSmartAccountAmount}
                          onMaxClick={() => handleMaxClick("smart-account")}
                          disabled={!smartAccount || isLoadingBalances}
                          isLoading={isLoadingBalances}
                          label="" // Empty label since we have it above
                        />
                      </div>
                    </div>
                  </div>

                  {getSmartAccountButtons()}
                </TabsContent>

                <TabsContent value="trading" className="space-y-4">
                  <AmountInput
                    amount={tradingAmount}
                    onAmountChange={setTradingAmount}
                    onMaxClick={() => handleMaxClick("trading")}
                    disabled={!smartAccount || isLoadingBalances}
                    isLoading={isLoadingBalances}
                  />
                  <ActionButtons
                    type="trading"
                    onDeposit={
                      needsApproval
                        ? handleApproveAndDeposit
                        : () => handleTradingOperation("deposit")
                    }
                    onWithdraw={() => handleTradingOperation("withdraw")}
                    isLoading={isLoading}
                    isApproving={isApproving}
                    needsApproval={needsApproval}
                    depositDisabled={
                      !tradingAmount ||
                      !balances ||
                      parseFloat(tradingAmount) >
                        parseFloat(balances.formattedUsdcBalance) ||
                      !smartAccount ||
                      isLoadingBalances
                    }
                    withdrawDisabled={
                      !tradingAmount ||
                      !balances ||
                      parseFloat(tradingAmount) >
                        parseFloat(balances.formattedMusdBalance) ||
                      !smartAccount ||
                      isLoadingBalances
                    }
                    depositText={getActionButtonText("deposit", "trading")}
                    withdrawText={getActionButtonText("withdraw", "trading")}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
