# LockPay - Web3 Fund Locking Platform

A decentralized application for securely locking and redeeming funds using smart contracts on the Ethereum blockchain.

## 🚀 Features

- **Smart Contract Integration**: Direct interaction with LockPay vault contracts
- **ERC20 Token Support**: Lock and redeem LPUSD tokens
- **Real-time Balance Tracking**: Monitor ETH and LPUSD balances
- **Transaction History**: Track all locking and redemption activities
- **Web3 Wallet Integration**: Connect with MetaMask, WalletConnect, and more
- **Responsive UI**: Modern, mobile-friendly interface built with React and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Radix UI
- **Web3**: Thirdweb SDK + Ethers.js
- **Blockchain**: Ethereum Sepolia Testnet
- **Styling**: Framer Motion for animations

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd LockPay

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
VITE_VAULT_CONTRACT_ADDRESS=0x90c33d16AE064d69FD92a5Aa2e5201345793A032
VITE_LPUSD_TOKEN_ADDRESS=your_lpusd_token_address
```

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   # Using Vercel CLI
   vercel

   # Or connect your GitHub repository to Vercel dashboard
   ```

3. **Environment Variables**: Add the environment variables in your Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add the same variables from your `.env` file

4. **Build Settings**: Vercel will automatically detect the Vite configuration and build settings.

### Manual Deployment

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

## 🔗 Smart Contracts

- **LockPay Vault**: `0x90c33d16AE064d69FD92a5Aa2e5201345793A032`
- **Network**: Sepolia Testnet
- **Token**: LPUSD (ERC20)

## 📱 Usage

1. **Connect Wallet**: Use the "Connect Wallet" button to connect your Web3 wallet
2. **Lock Funds**: Enter amount, phone number, and PIN to lock LPUSD tokens
3. **Redeem Funds**: Use phone number and PIN to redeem locked funds
4. **View History**: Check transaction history and balances

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ using React, TypeScript, and Web3 technologies**
