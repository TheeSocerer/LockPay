import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Unlock, Loader2, CheckCircle } from 'lucide-react';
import { redeemPayment } from '@/lib/mockContract';
import { PaymentResponse } from '@/types';

interface RedeemFundsProps {
  onNavigate: (screen: 'dashboard' | 'lock' | 'history') => void;
}

export default function RedeemFunds({ onNavigate }: RedeemFundsProps) {
  const [formData, setFormData] = useState({
    phone: '',
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
      const result = await redeemPayment({
        phone: formData.phone,
        pin: formData.pin,
      });
      setResponse(result);
      
      if (result.success) {
        // Clear form on success
        setFormData({ phone: '', pin: '' });
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

  const isFormValid = formData.phone && formData.pin;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
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
          <h1 className="text-2xl font-bold text-gray-900">Redeem Funds</h1>
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
                <div className="bg-blue-100 p-3 rounded-full">
                  <Unlock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Unlock Your Payment</CardTitle>
              <CardDescription>
                Enter your details to retrieve locked funds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., 0821234567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="Enter your PIN"
                    value={formData.pin}
                    onChange={(e) => handleInputChange('pin', e.target.value)}
                    required
                    className="text-lg tracking-widest"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redeeming Payment...
                    </>
                  ) : (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Redeem Payment
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
                      {response.success && response.amount && (
                        <p className="text-lg font-bold text-green-800 mt-2">
                          Amount: R{response.amount}
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