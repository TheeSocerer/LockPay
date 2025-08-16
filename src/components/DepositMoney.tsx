import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Loader2, CheckCircle, CreditCard } from 'lucide-react';
import { depositMoney } from '@/lib/mockContract';
import { PaymentResponse, User } from '@/types';

interface DepositMoneyProps {
  user: User;
  onNavigate: (screen: 'dashboard' | 'lock' | 'redeem' | 'history') => void;
  onBalanceUpdate: (newBalance: number) => void;
}

export default function DepositMoney({ user, onNavigate, onBalanceUpdate }: DepositMoneyProps) {
  const [amount, setAmount] = useState('50');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PaymentResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      const result = await depositMoney({ amount: parseFloat(amount) });
      setResponse(result);
      
      if (result.success) {
        // Update balance in parent component
        onBalanceUpdate(user.balance + parseFloat(amount));
        setAmount('50'); // Reset to default
      }
    } catch (error) {
      setResponse({
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Deposit Money</h1>
        </motion.div>

        {/* Balance Display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">R{user.balance.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-green-100 p-3 rounded-full">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Add Money to Wallet</CardTitle>
              <CardDescription>
                Deposit funds to start locking payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ZAR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    max="10000"
                    step="0.01"
                    required
                    className="text-lg text-center"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="space-y-2">
                  <Label>Quick amounts</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        type="button"
                        variant={amount === quickAmount.toString() ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAmount(quickAmount.toString())}
                        className="text-sm"
                      >
                        R{quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Payment Method Info */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center text-blue-800">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Instant Bank Transfer</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Secure payment via your bank account
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  disabled={!amount || isLoading || parseFloat(amount) <= 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Deposit...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Deposit R{amount || '0'}
                    </>
                  )}
                </Button>
              </form>

              {/* Response Message */}
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-lg ${
                    response.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start">
                    {response.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-red-500 mr-2 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        response.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {response.success ? 'Success!' : 'Error'}
                      </p>
                      <p className={`text-sm ${
                        response.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {response.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}