import { ConnectWallet, useAddress, useDisconnect } from '@thirdweb-dev/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Web3Connect() {
  const address = useAddress();
  const disconnect = useDisconnect();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Web3 Connection</CardTitle>
        <CardDescription>
          Connect your wallet to interact with the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!address ? (
          <ConnectWallet 
            theme="dark"
            btnTitle="Connect Wallet"
            modalSize="wide"
          />
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Connected Address:</p>
              <p className="text-xs text-muted-foreground break-all">
                {address}
              </p>
            </div>
            <Button 
              onClick={disconnect}
              variant="outline"
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

