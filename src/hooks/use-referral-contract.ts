
import { usePublicClient } from 'wagmi';
import { Address, encodePacked } from 'viem';

const REFERRAL_CONTRACT = '0xe3ca135782e4a17aFb31a63ee3b15351C891A1A2';

const REFERRAL_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'userReferrals',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'referralCodes',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function useReferralContract() {
  const publicClient = usePublicClient();

  const stringToBytes32 = (str: string) => {
    // Pad the string to 32 bytes
    const paddedStr = str.padEnd(32, '\0');
    return encodePacked(['string'], [paddedStr]);
  };

  const getReferralAddress = async (code: string): Promise<Address> => {
    if (!code) return '0x0000000000000000000000000000000000000000';

    try {
      const bytes32Code = stringToBytes32(code);
      if (!publicClient) {
        throw new Error('Public client is not defined');
      }
      const data = await publicClient.readContract({
        address: REFERRAL_CONTRACT,
        abi: REFERRAL_ABI,
        functionName: 'referralCodes',
        args: [bytes32Code],
      });

      return data as Address;
    } catch (error) {
      console.error('Error getting referral address:', error);
      return '0x0000000000000000000000000000000000000000';
    }
  };

  return {
    getReferralAddress,
    stringToBytes32,
  };
}