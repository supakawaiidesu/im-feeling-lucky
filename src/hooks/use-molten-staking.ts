import { usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { arbitrum } from 'viem/chains'
import { useEffect, useState } from 'react'

const MOLTEN_TOKEN = '0x66E535e8D2ebf13F49F3D49e5c50395a97C137b1'
const MOLTEN_STAKING = '0x35AD17C9EE4aab967ECBD95b4ce7Eb9D8E761A2B'

const TOKEN_ABI = [
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
] as const

const STAKING_ABI = [
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }]
    },
    {
        name: 'earned',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'account', type: 'address' },
            { name: '_rewardsToken', type: 'address' }
        ],
        outputs: [{ type: 'uint256' }]
    }
] as const


const formatDisplayValue = (value: string): string => {
    const [whole, decimal] = value.split('.')
    if (!decimal) return whole
    return `${whole}.${decimal.slice(0, 2)}`
}


export interface MoltenStakingData {
    walletBalance: bigint
    stakedBalance: bigint
    earnedBalance: bigint
    formattedWalletBalance: string
    formattedStakedBalance: string
    formattedEarnedBalance: string
    displayWalletBalance: string
    displayStakedBalance: string
    displayEarnedBalance: string
}


export function useMoltenStaking() {
    const { address: eoaAddress } = useAccount()
    const publicClient = usePublicClient({ chainId: arbitrum.id })
    const [stakingData, setStakingData] = useState<MoltenStakingData | null>(null)
    const [isError, setIsError] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const fetchBalances = async () => {
        if (!eoaAddress || !publicClient) return
        setIsLoading(true)
        try {
            const [walletBalance, stakedBalance, earnedBalance] = await publicClient.multicall({
                contracts: [
                    {
                        address: MOLTEN_TOKEN,
                        abi: TOKEN_ABI,
                        functionName: 'balanceOf',
                        args: [eoaAddress]
                    },
                    {
                        address: MOLTEN_STAKING,
                        abi: STAKING_ABI,
                        functionName: 'balanceOf',
                        args: [eoaAddress]
                    },
                    {
                        address: MOLTEN_STAKING,
                        abi: STAKING_ABI,
                        functionName: 'earned',
                        args: [eoaAddress, MOLTEN_TOKEN]
                    }
                ]
            })
            const formattedWalletBalance = formatUnits(walletBalance.result || BigInt(0), 18)
            const formattedStakedBalance = formatUnits(stakedBalance.result || BigInt(0), 18)
            const formattedEarnedBalance = formatUnits(earnedBalance.result || BigInt(0), 18)

            setStakingData({
                walletBalance: walletBalance.result || BigInt(0),
                stakedBalance: stakedBalance.result || BigInt(0),
                earnedBalance: earnedBalance.result || BigInt(0),
                formattedWalletBalance,
                formattedStakedBalance,
                formattedEarnedBalance,
                displayWalletBalance: formatDisplayValue(formattedWalletBalance),
                displayStakedBalance: formatDisplayValue(formattedStakedBalance),
                displayEarnedBalance: formatDisplayValue(formattedEarnedBalance)
            })
            setIsError(false)
        } catch (error) {
            console.error('Error fetching balances:', error)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchBalances()
        const interval = setInterval(fetchBalances, 10000)
        return () => clearInterval(interval)
    }, [eoaAddress])

    return {
        stakingData,
        isError,
        isLoading,
        refetch: fetchBalances
    }
}
