import { useState, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import DepositMoney from '@/components/DepositMoney';
import LockFunds from '@/components/LockFunds';
import RedeemFunds from '@/components/RedeemFunds';
import TransactionHistory from '@/components/TransactionHistory';
import TokenManager from '@/components/TokenManager';
import LPUSDFaucet from '@/components/LPUSDFaucet';
import { User } from '@/types';
import { logout } from '@/lib/mockContract';

// Lazy load the heavy ContractDemo component
const ContractDemo = lazy(() => import('@/components/ContractDemo'));

type Screen = 'auth' | 'dashboard' | 'deposit' | 'lock' | 'redeem' | 'history' | 'contract-demo' | 'token-manager' | 'faucet';

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
          <Auth key="auth" onLogin={handleLogin} onNavigate={handleNavigate} />
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
        {currentScreen === 'contract-demo' && (
          <div className="min-h-screen bg-background">
            <div className="container mx-auto py-4">
              <button 
                onClick={() => setCurrentScreen('auth')}
                className="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                ← Back to App
              </button>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading Web3 Demo...</span>
                </div>
              }>
                <ContractDemo />
              </Suspense>
            </div>
          </div>
        )}
        {currentScreen === 'token-manager' && (
          <div className="min-h-screen bg-background">
            <div className="container mx-auto py-4">
              <button 
                onClick={() => setCurrentScreen('auth')}
                className="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                ← Back to App
              </button>
              <TokenManager />
            </div>
          </div>
        )}
        {currentScreen === 'faucet' && (
          <div className="min-h-screen bg-background">
            <div className="container mx-auto py-4">
              <button 
                onClick={() => setCurrentScreen('auth')}
                className="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                ← Back to App
              </button>
              <div className="flex justify-center">
                <LPUSDFaucet />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;