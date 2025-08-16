import { useState, useEffect } from 'react';
import { useLockPayContracts, useLockPayData } from '@/lib/thirdweb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { lazy, Suspense } from 'react';

// Lazy load the heavy ConnectWallet component
const ConnectWallet = lazy(() => import('@thirdweb-dev/react').then(module => ({ default: module.ConnectWallet })));

export default function ContractDemo() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [lockDuration, setLockDuration] = useState('86400'); // 24 hours in seconds
  const [isConnectWalletLoaded, setIsConnectWalletLoaded] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    lockFunds, 
    redeemFunds, 
    getLockedFunds, 
    
    getStableTokenAddress,
    lockLoading, 
    redeemLoading,
    approveLoading,
    transactionStatus,
    vaultContract,
    address 
  } = useLockPayContracts();

  const { fees, ethBalance, lpusdBalance, balanceLoading, lpusdBalanceLoading } = useLockPayData();

  // Debug information
  console.log("Debug - Connected Address:", address);
  console.log("Debug - ETH Balance:", ethBalance);
  console.log("Debug - LPUSD Balance:", lpusdBalance);
  console.log("Debug - Fees:", fees);

  // Load ConnectWallet component when needed
  useEffect(() => {
    if (!address && !isConnectWalletLoaded) {
      setIsConnectWalletLoaded(true);
    }
  }, [address, isConnectWalletLoaded]);

  const handleRefreshBalances = async () => {
    setRefreshing(true);
    try {
      // Force a refresh by triggering a re-render
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastAction('Balances refreshed!');
    } catch (error) {
      setLastAction('Error refreshing balances');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLockFunds = async () => {
    if (!amount || !phone || !pin) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLastAction('Locking funds...');
      await lockFunds({
        amount: parseFloat(amount),
        phone,
        pin,
        lockDuration: parseInt(lockDuration)
      });
      
      setLastAction('Funds locked successfully!');
      
      // Clear form after successful lock
      setAmount('');
      setPhone('');
      setPin('');
    } catch (error) {
      console.error('Error locking funds:', error);
      setLastAction(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRedeemFunds = async () => {
    if (!phone || !pin) {
      alert('Please enter phone and PIN');
      return;
    }

    try {
      setLastAction('Redeeming funds...');
      await redeemFunds({ phone, pin });
      
      setLastAction('Funds redeemed successfully!');
      
      // Clear form after successful redeem
      setPhone('');
      setPin('');
    } catch (error) {
      console.error('Error redeeming funds:', error);
      setLastAction(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCheckFunds = async () => {
    if (!phone || !pin) {
      alert('Please enter phone and PIN');
      return;
    }

    try {
      setLastAction('Checking funds...');
      const lockedFunds = await getLockedFunds(phone, pin);
      if (lockedFunds) {
        setLastAction(`Found locked funds: ${lockedFunds.amount} ETH, Expires: ${new Date(lockedFunds.expiry * 1000).toLocaleString()}`);
      } else {
        setLastAction('No locked funds found for this phone/PIN combination');
      }
    } catch (error) {
      console.error('Error checking funds:', error);
      setLastAction(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTestContract = async () => {
    try {
      if (vaultContract) {
        console.log("Contract is available:", vaultContract);
        
        // Try to call a simple view function to verify the contract
        try {
          const tokenAddress = await getStableTokenAddress();
          console.log("Stable token address:", tokenAddress);
          setLastAction(`Contract is available and connected!\nStable Token: ${tokenAddress}`);
        } catch (callError) {
          console.log("Contract exists but function call failed:", callError);
          setLastAction('Contract is deployed but function call failed. Check if ABI matches your contract.');
        }
      } else {
        console.log("Contract is not available");
        setLastAction('Contract is not available. Please check:\n1. Contract address is correct\n2. Contract is deployed on Sepolia\n3. You are connected to Sepolia network');
      }
    } catch (error) {
      console.error('Error testing contract:', error);
      setLastAction('Error testing contract: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const enableTestMode = () => {
    setTestMode(true);
    setPhone('+123456789');
    setPin('1234');
    setAmount('10'); // 10 LPUSD tokens
    setLastAction('Test mode enabled with sample data (10 LPUSD)');
  };

  if (!address) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Connect your wallet to interact with LockPay contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnectWalletLoaded && (
            <Suspense fallback={
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Loading wallet...</span>
              </div>
            }>
              <ConnectWallet 
                theme="dark"
                btnTitle="Connect Wallet"
                modalSize="wide"
              />
            </Suspense>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LockPay Contract Demo</CardTitle>
          <CardDescription>
            Test the LockPay smart contract functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Connection Status:</p>
            <p className="text-xs text-blue-600">
              Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </p>
            <p className="text-xs text-blue-600">
              Network: Sepolia Testnet
            </p>
          </div>

          {/* Test Mode */}
          {!testMode && (
            <Alert>
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Quick test mode available</span>
                  <Button onClick={enableTestMode} size="sm" variant="outline">
                    Enable Test Mode
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Last Action Status */}
          {lastAction && (
            <Alert className={lastAction.includes('Error') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription className={lastAction.includes('Error') ? 'text-red-800' : 'text-green-800'}>
                {lastAction}
              </AlertDescription>
            </Alert>
          )}

          {/* Balance Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Wallet Balances</h3>
              <Button 
                onClick={handleRefreshBalances}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                {refreshing ? 'Refreshing...' : '🔄 Refresh'}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">ETH Balance:</p>
                <p className="text-lg font-bold">
                  {balanceLoading ? 'Loading...' : `${parseFloat(ethBalance).toFixed(4)} ETH`}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">LPUSD Balance:</p>
                <p className="text-lg font-bold">
                  {lpusdBalanceLoading ? 'Loading...' : `${parseFloat(lpusdBalance).toFixed(2)} LPUSD`}
                </p>
              </div>
            </div>
          </div>

          {/* Lock Funds Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lock Funds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (LPUSD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Lock Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="86400"
                    value={lockDuration}
                    onChange={(e) => setLockDuration(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="+123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleLockFunds}
                disabled={lockLoading || approveLoading || !amount || !phone || !pin}
                className="w-full"
              >
                {approveLoading ? 'Approving Tokens...' : lockLoading ? 'Locking Funds...' : 'Lock Funds'}
              </Button>
            </CardContent>
          </Card>

          {/* Redeem Funds Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Redeem Funds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="redeem-phone">Phone Number</Label>
                  <Input
                    id="redeem-phone"
                    type="text"
                    placeholder="+123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="redeem-pin">PIN</Label>
                  <Input
                    id="redeem-pin"
                    type="password"
                    placeholder="1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleRedeemFunds}
                  disabled={redeemLoading || !phone || !pin}
                  className="flex-1"
                >
                  {redeemLoading ? 'Redeeming...' : 'Redeem Funds'}
                </Button>
                <Button 
                  onClick={handleCheckFunds}
                  variant="outline"
                  disabled={!phone || !pin}
                >
                  Check Funds
                </Button>
              </div>
              
              <Button 
                onClick={handleTestContract}
                variant="outline"
                className="w-full"
              >
                Test Contract Connection
              </Button>
            </CardContent>
          </Card>

          {/* Transaction Status */}
          {transactionStatus.loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Transaction in progress...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {transactionStatus.error && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-red-600">
                  <strong>Error:</strong> {transactionStatus.error}
                </div>
              </CardContent>
            </Card>
          )}

          {transactionStatus.success && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-green-600">
                  <strong>Success!</strong> Transaction completed successfully.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Testing Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Testing Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Step 1:</strong> Click "Enable Test Mode" to pre-fill test data</p>
              <p><strong>Step 2:</strong> Click "Lock Funds" to create a lock</p>
              <p><strong>Step 3:</strong> Approve token spending (first time only)</p>
              <p><strong>Step 4:</strong> Wait for lock transaction confirmation</p>
              <p><strong>Step 5:</strong> Click "Check Funds" to verify the lock</p>
              <p><strong>Step 6:</strong> Click "Redeem Funds" to unlock the funds</p>
              <p className="text-xs text-muted-foreground">
                Note: You need both Sepolia ETH for gas fees AND LPUSD tokens to lock
              </p>
              <p className="text-xs text-muted-foreground">
                The first lock will require two transactions: approval + lock
              </p>
              <p className="text-xs text-muted-foreground">
                Token: LPUSD (0xE523456EECC68A6bCc8f3BEB66951014fB4B41c9)
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
