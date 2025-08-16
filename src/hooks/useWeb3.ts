import { useAddress, useBalance, useChainId, useConnectionStatus } from '@thirdweb-dev/react';

export function useWeb3() {
  const address = useAddress();
  const balance = useBalance();
  const chainId = useChainId();
  const connectionStatus = useConnectionStatus();

  return {
    address,
    balance: balance.data,
    chainId,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isDisconnected: connectionStatus === 'disconnected',
  };
}

