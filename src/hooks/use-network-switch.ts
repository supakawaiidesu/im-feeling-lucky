import { Chain, getAddress } from 'viem';
import { arbitrum } from 'viem/chains';

export async function ensureArbitrumNetwork(
    currentChainId?: number,
    walletClient?: any
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if already on Arbitrum
        if (currentChainId === arbitrum.id) {
            return { success: true };
        }

        if (!walletClient) {
            throw new Error('Wallet client not available');
        }

        // Use viem's native switchChain method
        await walletClient.switchChain({
            id: arbitrum.id
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to switch network:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to switch to Arbitrum network'
        };
    }
}
