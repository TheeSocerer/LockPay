import { useState, useEffect } from 'react';
import { useContract, useContractWrite, useAddress } from '@thirdweb-dev/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Coins, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Faucet contract address (you'll need to deploy this and update the address)
const FAUCET_CONTRACT_ADDRESS = "0xf7bcAace56E6169bCb10De721E168eEa9EC1cFc1"; // Leave empty until contract is deployed

export default function LPUSDFaucet() {
  const address = useAddress();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [canRequest, setCanRequest] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Contract instances
  const { contract: faucetContract } = useContract(FAUCET_CONTRACT_ADDRESS);

  // Write contract functions
  const { mutateAsync: requestTokens, isLoading: requestLoading } = useContractWrite(
    faucetContract,
    "requestTokens"
  );

  // Check if contract is available
  const isContractAvailable = !!faucetContract && FAUCET_CONTRACT_ADDRESS;

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

    if (!isContractAvailable) {
      setMessage('Faucet contract not deployed yet. Please check back later.');
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
      await requestTokens({});
      setMessage('Successfully received 100 LPUSD tokens!');
      setMessageType('success');
      
      // Set cooldown
      setCanRequest(false);
      setTimeRemaining(3600); // 1 hour
      
      // Start countdown
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setCanRequest(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
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
              ~100,000 LPUSD
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount per Request:</span>
            <Badge variant="outline">
              100 LPUSD
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Cooldown Period:</span>
            <Badge variant="outline">
              1 hour
            </Badge>
          </div>
        </div>

        {/* Request Status */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your Status:</span>
            {canRequest ? (
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
          disabled={!canRequest || !isContractAvailable || isLoading || requestLoading}
          className="w-full"
        >
          {isLoading || requestLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Requesting...
            </>
          ) : !isContractAvailable ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Contract Not Deployed
            </>
          ) : (
            <>
              <Coins className="h-4 w-4 mr-2" />
              Request 100 LPUSD
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
          <p>• Each request gives you 100 LPUSD</p>
          <p>• Use these tokens to test the LockPay application</p>
          <p>• Make sure you have enough ETH for gas fees</p>
          {!isContractAvailable && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">⚠️ Faucet Contract Not Deployed</p>
              <p className="text-yellow-700 text-xs mt-1">
                The LPUSD faucet contract needs to be deployed before users can request tokens. 
                Please deploy the contract and update the address in the component.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
