import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Sepolia } from '@thirdweb-dev/chains';
import App from './App.tsx';
import './index.css';

// Performance optimization: Preload critical resources
const preloadCriticalResources = () => {
  // Preload the Thirdweb provider
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = 'https://cdn.thirdweb.com/js/thirdweb.js';
  document.head.appendChild(link);
};

// Initialize performance optimizations
preloadCriticalResources();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThirdwebProvider 
      activeChain={Sepolia}
      clientId="870fec5a9df74e096e69b754bc4931c5"
    >
      <App />
    </ThirdwebProvider>
  </StrictMode>
);
