import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import DepositMoney from '@/components/DepositMoney';
import LockFunds from '@/components/LockFunds';
import RedeemFunds from '@/components/RedeemFunds';
import TransactionHistory from '@/components/TransactionHistory';
import { User } from '@/types';
import { logout } from '@/lib/mockContract';

type Screen = 'auth' | 'dashboard' | 'deposit' | 'lock' | 'redeem' | 'history';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [user, setUser] = useState<User | null>(null);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCurrentScreen('auth');
  };

  const handleBalanceUpdate = (newBalance: number) => {
    if (user) {
      setUser({ ...user, balance: newBalance });
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentScreen === 'auth' && (
          <Auth key="auth" onLogin={handleLogin} />
        )}
        {currentScreen === 'dashboard' && (
          <Dashboard 
            key="dashboard" 
            user={user!} 
            onNavigate={handleNavigate} 
            onLogout={handleLogout}
          />
        )}
        {currentScreen === 'deposit' && (
          <DepositMoney 
            key="deposit" 
            user={user!} 
            onNavigate={handleNavigate}
            onBalanceUpdate={handleBalanceUpdate}
          />
        )}
        {currentScreen === 'lock' && (
          <LockFunds 
            key="lock" 
            user={user!} 
            onNavigate={handleNavigate}
            onBalanceUpdate={handleBalanceUpdate}
          />
        )}
        {currentScreen === 'redeem' && (
          <RedeemFunds key="redeem" onNavigate={handleNavigate} />
        )}
        {currentScreen === 'history' && (
          <TransactionHistory 
            key="history" 
            user={user!} 
            onNavigate={handleNavigate} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;