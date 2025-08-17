# Quick Faucet Deployment Guide

## Step 1: Deploy the Contract

Make sure you have Hardhat configured with your private key and RPC URL. Then run:

```bash
npx hardhat run scripts/deploy-faucet.js --network sepolia
```

You should see output like:
```
Deploying LPUSD Faucet contract...
LPUSD Faucet deployed to: 0x1234567890abcdef...
Contract owner: 0xYourAddress...
Faucet Info:
- Available tokens: 100000.0 LPUSD
- Amount per request: 100.0 LPUSD
- Cooldown period: 1 hours
```

## Step 2: Update the Contract Address

Copy the deployed contract address and update it in the React component:

```typescript
// In src/components/LPUSDFaucet.tsx
const FAUCET_CONTRACT_ADDRESS = "0x1234567890abcdef..."; // Your deployed address
```

## Step 3: Deploy the App

```bash
git add .
git commit -m "Update faucet contract address"
git push origin main
vercel --prod
```

## Step 4: Test the Faucet

1. Go to your deployed app
2. Click "LPUSD Faucet" 
3. Connect your wallet
4. Click "Request 100 LPUSD"
5. Confirm the transaction

## Troubleshooting

If you get errors:
- Make sure you're on Sepolia testnet
- Ensure you have enough ETH for gas fees
- Check that the contract address is correct
- Verify the contract was deployed successfully

## Hardhat Configuration

Make sure your `hardhat.config.js` has Sepolia configured:

```javascript
module.exports = {
  networks: {
    sepolia: {
      url: "YOUR_RPC_URL",
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  }
};
```
