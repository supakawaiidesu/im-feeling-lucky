import { usePublicClient, useWalletClient } from 'wagmi'

export function useReferralSubmit() {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const submitCodeToContract = async (contractAddress: string, calldata: string) => {
    if (!walletClient) throw new Error('Wallet not connected')
    if (!publicClient) throw new Error('Public client not available')

    try {
      const hash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        data: calldata as `0x${string}`,
        value: BigInt(0)
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return receipt
    } catch (error) {
      console.error('Error submitting code to contract:', error)
      throw error
    }
  }

  return {
    submitCodeToContract
  }
}
