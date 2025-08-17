# LPUSD Faucet Setup Guide

This guide will help you deploy and set up the LPUSD faucet for testing the LockPay application.

## Overview

The LPUSD Faucet is a smart contract that allows users to request test LPUSD tokens for testing the LockPay application. It includes:

- **100 LPUSD per request**: Each user can request 100 LPUSD tokens
- **1-hour cooldown**: Users can only request tokens once per hour
- **100,000 LPUSD initial supply**: The faucet starts with 100,000 LPUSD for distribution
- **Owner controls**: Only the contract owner can refill the faucet

## Deployment Steps

### 1. Deploy the Faucet Contract

```bash
# Make sure you're in the project root
cd /path/to/LockPay

# Deploy the faucet contract (make sure you have Hardhat configured)
npx hardhat run scripts/deploy-faucet.js --network sepolia
```

### 2. Update the Contract Address

After deployment, you'll get a contract address. Update it in the React component:

```typescript
// In src/components/LPUSDFaucet.tsx
const FAUCET_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 3. Verify the Contract (Optional)

You can verify the contract on Etherscan for transparency:

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## Using the Faucet

### For Users

1. **Connect Wallet**: Users need to connect their wallet to the application
2. **Navigate to Faucet**: Click on "LPUSD Faucet" from the main menu
3. **Request Tokens**: Click "Request 100 LPUSD" button
4. **Wait for Confirmation**: The transaction will be processed on the blockchain
5. **Use Tokens**: The received LPUSD can be used to test the LockPay application

### For Developers/Admins

#### Refill the Faucet

If the faucet runs low on tokens, the owner can refill it:

```javascript
// Using ethers.js
const faucet = new ethers.Contract(faucetAddress, faucetABI, signer);
await faucet.refillFaucet(ethers.parseEther("10000")); // Add 10,000 LPUSD
```

#### Emergency Withdraw

In case of emergency, the owner can withdraw all tokens:

```javascript
await faucet.emergencyWithdraw(ownerAddress);
```

## Contract Functions

### Public Functions

- `requestTokens()` - Request 100 LPUSD tokens (once per hour)
- `canRequestTokens(address user)` - Check if a user can request tokens
- `getFaucetInfo()` - Get faucet information (available tokens, amount per request, cooldown)
- `getLastRequestTime(address user)` - Get user's last request timestamp

### Owner Functions

- `refillFaucet(uint256 amount)` - Add more tokens to the faucet
- `emergencyWithdraw(address recipient)` - Withdraw all tokens from faucet

## Security Features

- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Cooldown Period**: Prevents spam requests
- **Owner Controls**: Only owner can refill or withdraw
- **Input Validation**: All inputs are validated

## Testing the Faucet

### Local Testing

```bash
# Run tests
npx hardhat test

# Run with coverage
npx hardhat coverage
```

### Manual Testing

1. Deploy the contract
2. Connect a wallet
3. Request tokens
4. Wait for the cooldown period
5. Try to request again (should fail)
6. Wait for cooldown to expire
7. Request again (should succeed)

## Integration with LockPay

The faucet is integrated into the main LockPay application:

1. **Navigation**: Added to the main menu in the Auth component
2. **UI Component**: `LPUSDFaucet.tsx` provides a user-friendly interface
3. **Web3 Integration**: Uses ThirdWeb for blockchain interactions
4. **Real-time Updates**: Shows faucet status and user eligibility

## Troubleshooting

### Common Issues

1. **"Insufficient tokens available"**
   - The faucet needs to be refilled by the owner

2. **"Cooldown period not elapsed"**
   - User needs to wait 1 hour between requests

3. **"Contract not found"**
   - Check if the contract address is correct
   - Ensure the contract is deployed on the correct network

4. **"Transaction failed"**
   - Check if user has enough ETH for gas fees
   - Ensure wallet is connected to the correct network (Sepolia)

### Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify the contract address is correct
3. Ensure you're on the Sepolia testnet
4. Check if the faucet has available tokens

## Cost Estimation

- **Deployment**: ~0.01-0.02 ETH (gas fees)
- **Token Requests**: ~0.001-0.002 ETH per request (gas fees)
- **Refill Operations**: ~0.005-0.01 ETH per refill (gas fees)

## Next Steps

After setting up the faucet:

1. Test the complete LockPay workflow with real LPUSD tokens
2. Monitor faucet usage and refill as needed
3. Consider implementing additional features like:
   - Different token amounts for different user types
   - Referral bonuses
   - Integration with other test networks
