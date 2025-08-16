import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, Unlock, History, Wallet, LogOut, RefreshCw } from 'lucide-react';
import { useLockPayBackend } from '@/lib/backend';

interface DashboardProps {
  user: any;
  onNavigate: (screen: 'auth' | 'dashboard' | 'deposit' | 'lock' | 'redeem' | 'history' | 'contract-demo' | 'token-manager') => void;
  onLogout: () => void;
}

export default function Dashboard({ user, onNavigate, onLogout }: DashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const { 
 
    isConnected, 
    address, 
    ethBalance, 
    lpusdBalance, 
    transactionStatus,
    loadingStates 
  } = useLockPayBackend();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force a refresh of balances
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return isNaN(num) ? '0.00' : num.toFixed(4);
  };



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Wallet Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <p className="text-yellow-800">
              ⚠️ Please connect your wallet to access LockPay features
            </p>
          </motion.div>
        )}

        {/* Balance Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* ETH Balance */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Wallet className="mr-2 h-5 w-5 text-blue-600" />
                ETH Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatBalance(ethBalance)} ETH
              </div>
              <p className="text-sm text-gray-600 mt-1">
                For gas fees and transactions
              </p>
            </CardContent>
          </Card>

          {/* LPUSD Balance */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Lock className="mr-2 h-5 w-5 text-green-600" />
                LPUSD Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatBalance(lpusdBalance)} LPUSD
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Available for locking
              </p>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <User className="mr-2 h-5 w-5 text-purple-600" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{user.phoneNumber}</span>
                </div>
                {address && (
                  <div className="text-sm">
                    <span className="text-gray-600">Wallet:</span>
                    <span className="ml-2 font-mono text-xs">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-gray-600">Member since:</span>
                  <span className="ml-2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Button
            onClick={() => onNavigate('deposit')}
            disabled={!isConnected || loadingStates.lockLoading}
            className="h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700"
          >
            <Lock className="h-6 w-6 mb-2" />
            <span>Lock Funds</span>
          </Button>

          <Button
            onClick={() => onNavigate('redeem')}
            disabled={!isConnected || loadingStates.redeemLoading}
            className="h-20 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700"
          >
            <Unlock className="h-6 w-6 mb-2" />
            <span>Redeem Funds</span>
          </Button>

          <Button
            onClick={() => onNavigate('history')}
            className="h-20 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700"
          >
            <History className="h-6 w-6 mb-2" />
            <span>Transaction History</span>
          </Button>

          <Button
            onClick={() => onNavigate('contract-demo')}
            className="h-20 flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700"
          >
            <Wallet className="h-6 w-6 mb-2" />
            <span>Web3 Demo</span>
          </Button>
        </motion.div>

        {/* Transaction Status */}
        {transactionStatus.loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">Transaction in progress...</span>
            </div>
          </motion.div>
        )}

        {transactionStatus.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800">❌ Error: {transactionStatus.error}</p>
          </motion.div>
        )}

        {transactionStatus.success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-green-800">✅ Transaction completed successfully!</p>
          </motion.div>
        )}

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-500"
        >
          Last updated: {lastUpdated.toLocaleTimeString()}
        </motion.div>
      </div>
    </motion.div>
  );
}