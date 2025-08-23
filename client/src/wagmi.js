import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, mainnet } from 'viem/chains';
import { http } from 'viem';

// Create the config directly
const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your-project-id';

export const wagmiConfig = getDefaultConfig({
  appName: 'ChainMelody',
  projectId: walletConnectProjectId,
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
