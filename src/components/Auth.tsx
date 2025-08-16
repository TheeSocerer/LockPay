import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Loader2 } from 'lucide-react';
import { User } from '@/types';
import { useLockPayBackend } from '@/lib/backend';

interface AuthProps {
  onLogin: (user: User) => void;
  onNavigate?: (screen: 'auth' | 'dashboard' | 'deposit' | 'lock' | 'redeem' | 'history' | 'contract-demo' | 'token-manager') => void;
}

export default function Auth({ onLogin, onNavigate }: AuthProps) {
  const [loginMethod, setLoginMethod] = useState<'google' | 'phone' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { backend, isConnected, address } = useLockPayBackend();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate Google login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: `user_${Date.now()}`,
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '+1234567890',
        balance: 0
      };

      onLogin(user);
    } catch (error) {
      setError('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use the real backend for authentication
      const result = await backend.authenticateUser(phoneNumber);
      
      if (result.success && result.user) {
        const user: User = {
          id: result.user.id,
          name: `User ${phoneNumber}`,
          email: '',
          phone: phoneNumber,
          balance: result.user.balance
        };

        onLogin(user);
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Phone login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome to LockPay
              </CardTitle>
              <CardDescription className="text-gray-600">
                Secure payment locking system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!loginMethod ? (
                <>
                  <Button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Continue with Google
                  </Button> 


                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setLoginMethod('phone')}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Continue with Phone Number
                  </Button>
                </>
              ) : (
                <form onSubmit={handlePhoneLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., 0821234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="text-lg"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !phoneNumber}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setLoginMethod(null)}
                    className="w-full"
                  >
                    Back to options
                  </Button>
                </form>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-6 text-center space-y-4"
        >
          <p className="text-sm text-gray-500">
            Demo Mode - Use any phone number to create an account
          </p>
          
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => onNavigate?.('contract-demo')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🚀 Test Web3 Contracts
            </Button>
            <Button
              onClick={() => onNavigate?.('token-manager')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🪙 Token Manager
            </Button>
          </div>

          {/* Wallet Connection Status */}
          {isConnected && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}