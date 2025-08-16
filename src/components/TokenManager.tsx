import { useState } from 'react';
import { useContract, useContractWrite, useAddress, useBalance } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TEST_TOKEN_ABI, TEST_TOKEN_SOLIDITY, DEPLOYMENT_INSTRUCTIONS } from '@/lib/testToken';

export default function TokenManager() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('100');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState('');

  const address = useAddress();
  const { data: ethBalance } = useBalance();
  
  // Contract for the test token (if address is provided)
  const { contract: tokenContract } = useContract(tokenAddress, TEST_TOKEN_ABI);
  
  // Contract write functions
  const { mutateAsync: transferTokens, isLoading: transferLoading } = useContractWrite(tokenContract, "transfer");
  const { mutateAsync: mintTokens, isLoading: mintLoading } = useContractWrite(tokenContract, "mint");

  const handleTransfer = async () => {
    if (!tokenContract || !recipient || !amount) {
      setStatus('Please fill in all fields');
      return;
    }

    try {
      setStatus('Transferring tokens...');
      const amountInWei = ethers.utils.parseUnits(amount, 18);
      
      await transferTokens({
        args: [recipient, amountInWei]
      });
      
      setStatus('Transfer successful!');
      setAmount('');
      setRecipient('');
    } catch (error) {
      console.error('Transfer error:', error);
      setStatus(`Transfer failed: ${error.message}`);
    }
  };

  const handleMint = async () => {
    if (!tokenContract || !amount) {
      setStatus('Please enter amount to mint');
      return;
    }

    try {
      setStatus('Minting tokens...');
      const amountInWei = ethers.utils.parseUnits(amount, 18);
      
      await mintTokens({
        args: [address, amountInWei]
      });
      
      setStatus('Mint successful!');
      setAmount('');
    } catch (error) {
      console.error('Mint error:', error);
      setStatus(`Mint failed: ${error.message}`);
    }
  };

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Manager</CardTitle>
          <CardDescription>Connect your wallet to manage test tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please connect your wallet first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Token Manager</CardTitle>
          <CardDescription>
            Deploy and manage test ERC20 tokens for LockPay testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          {status && (
            <Alert className={status.includes('failed') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription className={status.includes('failed') ? 'text-red-800' : 'text-green-800'}>
                {status}
              </AlertDescription>
            </Alert>
          )}

          {/* Balance Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">ETH Balance:</p>
              <p className="text-lg font-bold">
                {ethBalance ? `${parseFloat(ethBalance.displayValue).toFixed(4)} ETH` : 'Loading...'}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Wallet Address:</p>
              <p className="text-xs font-mono">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
              </p>
            </div>
          </div>

          {/* Token Address Input */}
          <div>
            <Label htmlFor="token-address">Test Token Contract Address</Label>
            <Input
              id="token-address"
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the address of your deployed test token contract
            </p>
          </div>

          {/* Token Operations */}
          {tokenAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Token Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Transfer Tokens */}
                <div className="space-y-2">
                  <Label>Transfer Tokens</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Recipient address"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Button 
                      onClick={handleTransfer}
                      disabled={transferLoading || !recipient || !amount}
                    >
                      {transferLoading ? 'Transferring...' : 'Transfer'}
                    </Button>
                  </div>
                </div>

                {/* Mint Tokens (if contract supports it) */}
                <div className="space-y-2">
                  <Label>Mint Tokens (if supported)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Amount to mint"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Button 
                      onClick={handleMint}
                      disabled={mintLoading || !amount}
                    >
                      {mintLoading ? 'Minting...' : 'Mint'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deployment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Deploy Test Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <h4>Step 1: Get Sepolia ETH</h4>
                <ul>
                  <li>Visit <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sepolia Faucet</a></li>
                  <li>Connect your wallet</li>
                  <li>Request Sepolia ETH (needed for gas fees)</li>
                </ul>

                <h4>Step 2: Deploy Token Contract</h4>
                <ul>
                  <li>Go to <a href="https://remix.ethereum.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Remix IDE</a></li>
                  <li>Create new file: <code>TestToken.sol</code></li>
                  <li>Paste the Solidity code below</li>
                  <li>Compile the contract</li>
                  <li>Deploy with parameters:
                    <ul>
                      <li><strong>name:</strong> "Test Token"</li>
                      <li><strong>symbol:</strong> "TEST"</li>
                      <li><strong>initialSupply:</strong> 1000000 (1 million tokens)</li>
                    </ul>
                  </li>
                </ul>

                <h4>Step 3: Update Your App</h4>
                <ul>
                  <li>Copy the deployed token address</li>
                  <li>Paste it in the "Test Token Contract Address" field above</li>
                  <li>Update your LockPayVault contract to use this token address</li>
                </ul>
              </div>

              {/* Solidity Code */}
              <div className="mt-4">
                <Label>Solidity Contract Code:</Label>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                  <code>{TEST_TOKEN_SOLIDITY}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
