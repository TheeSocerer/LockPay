import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, Loader2, CheckCircle } from 'lucide-react';
import { lockPayment } from '@/lib/mockContract';
import { PaymentResponse, User } from '@/types';

interface LockFundsProps {
  user: User;
  onNavigate: (screen: 'dashboard' | 'redeem' | 'history') => void;
  onBalanceUpdate: (newBalance: number) => void;
}

export default function LockFunds({ user, onNavigate, onBalanceUpdate }: LockFundsProps) {
  const [formData, setFormData] = useState({
    amount: '',
    recipientPhone: '',
    pin: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PaymentResponse | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setResponse(null); // Clear previous response
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      const result = await lockPayment({
        amount: parseFloat(formData.amount),
        recipientPhone: formData.recipientPhone,
        pin: formData.pin,
      });
      setResponse(result);
      
      if (result.success) {
        // Update balance and clear form on success
        onBalanceUpdate(user.balance - parseFloat(formData.amount));
        setFormData({ amount: '', recipientPhone: '', pin: '' });
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

  const isFormValid = formData.amount && formData.recipientPhone && formData.pin;

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
          <h1 className="text-2xl font-bold text-gray-900">Lock Funds</h1>
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
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
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
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Secure Your Payment</CardTitle>
              <CardDescription>
                Lock your funds with a secure PIN for later redemption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ZAR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    min="1"
                    step="0.01"
                    required
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Recipient Phone Number</Label>
                  <Input
                    id="recipientPhone"
                    type="tel"
                    placeholder="e.g., 0821234567"
                    value={formData.recipientPhone}
                    onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                    required
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin">Temporary PIN (4-6 digits)</Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="Enter secure PIN"
                    value={formData.pin}
                    onChange={(e) => handleInputChange('pin', e.target.value)}
                    minLength={4}
                    maxLength={6}
                    pattern="[0-9]*"
                    required
                    className="text-lg tracking-widest"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Locking Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Lock Payment
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
                      {response.tokenId && (
                        <p className="text-xs text-green-600 mt-1 font-mono">
                          Token: {response.tokenId}
                        </p>
                      )}
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