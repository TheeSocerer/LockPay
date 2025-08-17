import React, { useState, useEffect } from 'react';
import { useContract, useContractRead, useContractWrite, useAddress } from '@thirdweb-dev/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Coins, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Faucet contract address (you'll need to deploy this and update the address)
const FAUCET_CONTRACT_ADDRESS = "0xcB80ba5Fc355Ef515256BD4FA5b7C9a3FD9579d3";

export default function LPUSDFaucet() {
  const address = useAddress();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  // Contract instances
  const { contract: faucetContract } = useContract(FAUCET_CONTRACT_ADDRESS);

  // Read contract data
  const { data: faucetInfo, isLoading: infoLoading } = useContractRead(
    faucetContract,
    "getFaucetInfo"
  );

  const { data: canRequestData, isLoading: canRequestLoading } = useContractRead(
    faucetContract,
    "canRequestTokens",
    [address]
  );

  const { data: lastRequestTime } = useContractRead(
    faucetContract,
    "getLastRequestTime",
    [address]
  );

  // Write contract functions
  const { mutateAsync: requestTokens, isLoading: requestLoading } = useContractWrite(
    faucetContract,
    "requestTokens"
  );

  // Parse faucet info
  const availableTokens = faucetInfo ? Number(faucetInfo[0]) / 1e18 : 0;
  const faucetAmount = faucetInfo ? Number(faucetInfo[1]) / 1e18 : 100;
  const cooldownPeriod = faucetInfo ? Number(faucetInfo[2]) : 3600; // 1 hour in seconds

  // Parse can request data
  const canRequest = canRequestData ? canRequestData[0] : false;
  const timeRemaining = canRequestData ? Number(canRequestData[1]) : 0;

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    if (seconds === 0) return 'Ready now';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  // Handle token request
  const handleRequestTokens = async () => {
    if (!address) {
      setMessage('Please connect your wallet first');
      setMessageType('error');
      return;
    }

    if (!canRequest) {
      setMessage('You cannot request tokens at this time');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('Requesting tokens...');
    setMessageType('info');

    try {
      await requestTokens();
      setMessage(`Successfully received ${faucetAmount} LPUSD tokens!`);
      setMessageType('success');
    } catch (error) {
      console.error('Error requesting tokens:', error);
      setMessage('Failed to request tokens. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!address) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            LPUSD Faucet
          </CardTitle>
          <CardDescription>
            Connect your wallet to request test LPUSD tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to use the faucet
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          LPUSD Faucet
        </CardTitle>
        <CardDescription>
          Request test LPUSD tokens for testing the LockPay application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Faucet Status */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Available Tokens:</span>
            <Badge variant="secondary">
              {infoLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                `${availableTokens.toLocaleString()} LPUSD`
              )}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount per Request:</span>
            <Badge variant="outline">
              {faucetAmount} LPUSD
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Cooldown Period:</span>
            <Badge variant="outline">
              {Math.floor(cooldownPeriod / 3600)} hour
            </Badge>
          </div>
        </div>

        {/* Request Status */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your Status:</span>
            {canRequestLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : canRequest ? (
              <Badge variant="success" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready to Request
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimeRemaining(timeRemaining)}
              </Badge>
            )}
          </div>
        </div>

        {/* Request Button */}
        <Button
          onClick={handleRequestTokens}
          disabled={!canRequest || isLoading || requestLoading}
          className="w-full"
        >
          {isLoading || requestLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Requesting...
            </>
          ) : (
            <>
              <Coins className="h-4 w-4 mr-2" />
              Request {faucetAmount} LPUSD
            </>
          )}
        </Button>

        {/* Message Display */}
        {message && (
          <Alert className={messageType === 'error' ? 'border-red-200 bg-red-50' : 
                           messageType === 'success' ? 'border-green-200 bg-green-50' : 
                           'border-blue-200 bg-blue-50'}>
            {messageType === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : messageType === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            )}
            <AlertDescription className={
              messageType === 'error' ? 'text-red-800' : 
              messageType === 'success' ? 'text-green-800' : 
              'text-blue-800'
            }>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• You can request tokens once per hour</p>
          <p>• Each request gives you {faucetAmount} LPUSD</p>
          <p>• Use these tokens to test the LockPay application</p>
        </div>
      </CardContent>
    </Card>
  );
}
