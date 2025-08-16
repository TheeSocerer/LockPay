import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, History, Lock, Unlock, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { getUserTransactions } from '@/lib/mockContract';
import { User } from '@/types';

interface TransactionHistoryProps {
  user: User;
  onNavigate: (screen: 'dashboard' | 'lock' | 'redeem') => void;
}

export default function TransactionHistory({ user, onNavigate }: TransactionHistoryProps) {
  const transactions = getUserTransactions();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'lock':
        return <Lock className="h-4 w-4 text-orange-600" />;
      case 'redeem':
        return <Unlock className="h-4 w-4 text-blue-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-blue-100 mb-1">Current Balance</p>
                <p className="text-3xl font-bold">R{user.balance.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
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
                <div className="bg-gray-100 p-3 rounded-full">
                  <History className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Your Transactions</CardTitle>
              <CardDescription>
                View all your locked payments and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No transactions found</p>
                    <p className="text-sm">Lock your first payment to see it here</p>
                  </div>
                  <Button onClick={() => onNavigate('lock')} className="bg-green-600 hover:bg-green-700">
                    <Lock className="mr-2 h-4 w-4" />
                    Lock Funds
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction, index) => (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group hover:bg-gray-50"
                        >
                          <TableCell>
                            <div className="flex items-center">
                              {getTransactionIcon(transaction.type)}
                              <span className="ml-2 capitalize font-medium">
                                {transaction.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-gray-900 truncate">
                              {transaction.description}
                            </p>
                            {transaction.tokenId && (
                              <p className="text-xs text-gray-500 font-mono">
                                {transaction.tokenId}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {transaction.type === 'deposit' ? (
                                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                              )}
                              <span className={`font-semibold ${
                                transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'deposit' ? '+' : '-'}R{transaction.amount}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.status)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {transaction.timestamp.toLocaleDateString()}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => onNavigate('lock')} className="bg-orange-600 hover:bg-orange-700">
                      <Lock className="mr-2 h-4 w-4" />
                      Lock More Funds
                    </Button>
                    <Button onClick={() => onNavigate('redeem')} className="bg-blue-600 hover:bg-blue-700">
                      <Unlock className="mr-2 h-4 w-4" />
                      Redeem Funds
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}