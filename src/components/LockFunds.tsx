import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '@/types';
import { useLockPayBackend } from '@/lib/backend';

interface LockFundsProps {
  user: any;
  onNavigate: (screen: string) => void;
  onBalanceUpdate: (newBalance: number) => void;
}

export default function LockFunds({ user, onNavigate, onBalanceUpdate }: LockFundsProps) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState((user as any).phone || '');
  const [pin, setPin] = useState('');
  const [lockDuration, setLockDuration] = useState('86400'); // 24 hours in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const { 
    backend, 
    isConnected, 
    lpusdBalance, 
    transactionStatus,
    loadingStates 
  } = useLockPayBackend();

  const handleLockFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setStatus('error');
      setMessage('Please connect your wallet first');
      return;
    }

    if (!amount || !phone || !pin) {
      setStatus('error');
      setMessage('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setStatus('error');
      setMessage('Please enter a valid amount');
      return;
    }

    if (amountNum > parseFloat(lpusdBalance)) {
      setStatus('error');
      setMessage('Insufficient LPUSD balance');
      return;
    }

    setIsLoading(true);
    setStatus('loading');
    setMessage('Processing lock transaction...');

    try {
      const result = await backend.depositFunds(
        amountNum,
        phone,
        pin,
        parseInt(lockDuration)
      );

      if (result.success) {
        setStatus('success');
        setMessage('Funds locked successfully!');
        
        // Clear form
        setAmount('');
        setPin('');
        
        // Update balance (approximate)
        const currentBalance = parseFloat(lpusdBalance);
        const newBalance = currentBalance - amountNum;
        onBalanceUpdate(Math.max(0, newBalance));
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to lock funds');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lock Funds</h1>
            <p className="text-gray-600">Secure your LPUSD tokens with a PIN</p>
          </div>
          <Button
            onClick={() => onNavigate('dashboard')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Wallet Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">
                Please connect your wallet to lock funds
              </p>
            </div>
          </motion.div>
        )}

        {/* Balance Display */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Available Balance</p>
                  <p className="text-3xl font-bold">{formatBalance(lpusdBalance)} LPUSD</p>
                </div>
                <Lock className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lock Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5 text-blue-600" />
                Lock Funds
              </CardTitle>
              <CardDescription>
                Enter the amount and create a secure PIN to lock your funds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLockFunds} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (LPUSD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={lpusdBalance}
                      placeholder="10.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      disabled={isLoading || !isConnected}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Lock Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="8760" // 1 year
                      placeholder="24"
                      value={parseInt(lockDuration) / 3600}
                      onChange={(e) => setLockDuration((parseInt(e.target.value) * 3600).toString())}
                      required
                      disabled={isLoading || !isConnected}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={isLoading || !isConnected}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pin">PIN (4-6 digits)</Label>
                    <Input
                      id="pin"
                      type="password"
                      placeholder="1234"
                      minLength={4}
                      maxLength={6}
                      pattern="[0-9]+"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      required
                      disabled={isLoading || !isConnected}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !isConnected || loadingStates.lockLoading || loadingStates.approveLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading || loadingStates.lockLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {loadingStates.approveLoading ? 'Approving...' : 'Locking Funds...'}
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Lock Funds
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Messages */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800">{message}</p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{message}</p>
            </div>
          </motion.div>
        )}

        {/* Transaction Status from Backend */}
        {transactionStatus.loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
              <span className="text-blue-800">Transaction in progress...</span>
            </div>
          </motion.div>
        )}

        {transactionStatus.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">Transaction Error: {transactionStatus.error}</p>
            </div>
          </motion.div>
        )}

        {transactionStatus.success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800">Transaction completed successfully!</p>
            </div>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enter the amount of LPUSD you want to lock</li>
                <li>• Create a secure PIN (4-6 digits)</li>
                <li>• Funds will be locked for the specified duration</li>
                <li>• Use the same phone + PIN to redeem later</li>
                <li>• First transaction requires token approval</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}