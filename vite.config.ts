import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'ethers',
      '@thirdweb-dev/react',
      '@thirdweb-dev/sdk',
      '@thirdweb-dev/chains',
      'framer-motion',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'class-variance-authority'
    ],
    exclude: [],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'thirdweb-vendor': ['@thirdweb-dev/react', '@thirdweb-dev/sdk', '@thirdweb-dev/chains'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-button', '@radix-ui/react-card'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'ethers-vendor': ['ethers']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: false
    }
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
});
