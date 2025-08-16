import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Unlock, Shield, Plus, History, LogOut, Wallet } from 'lucide-react';
import { User } from '@/types';

interface DashboardProps {
  user: User;
  onNavigate: (screen: 'deposit' | 'lock' | 'redeem' | 'history') => void;
  onLogout: () => void;
}

export default function Dashboard({ user, onNavigate, onLogout }: DashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Header with User Info */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Welcome back,</h2>
            <p className="text-gray-600">{user.name}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-blue-100">Wallet Balance</CardDescription>
                <Wallet className="h-5 w-5 text-blue-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                R{user.balance.toFixed(2)}
              </div>
              <p className="text-blue-100 text-sm">Available for locking</p>
            </CardContent>
          </Card>
        </motion.div>
        {/* Logo and Title */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LockPay</h1>
          <p className="text-gray-600">What would you like to do?</p>
        </motion.div>

        {/* Main Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('deposit')}>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-lg text-gray-900">Deposit</CardTitle>
              <CardDescription>
                Add money to wallet
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('lock')}>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Lock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <CardTitle className="text-lg text-gray-900">Lock Funds</CardTitle>
              <CardDescription>
                Lock payment with PIN
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Secondary Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="space-y-3"
        >
          <Button
            onClick={() => onNavigate('redeem')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Unlock className="mr-2 h-4 w-4" />
            Redeem Funds
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => onNavigate('history')}
            className="w-full text-gray-600 hover:text-gray-900"
          >
            <History className="mr-2 h-4 w-4" />
            Transaction History
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}