import { useContract, useContractRead, useContractWrite, useSigner, useAddress, useBalance } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { useState } from "react";

// Contract addresses - Replace with your deployed contract addresses on Sepolia
const VAULT_ADDRESS = "0x90c33d16AE064d69FD92a5Aa2e5201345793A032"; // Your deployed LockPay vault contract
const LPUSD_TOKEN_ADDRESS = "0xE523456EECC68A6bCc8f3BEB66951014fB4B41c9"; // Your LPUSD token address

// ERC20 Token ABI for balance checking
const ERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract ABIs (simplified for common functions)
const VAULT_ABI = [
	{
		"inputs": [
			{
				"internalType": "contract IERC20",
				"name": "_stableToken",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "lockId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "locker",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Locked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "recipientHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lockDuration",
				"type": "uint256"
			}
		],
		"name": "lockFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "lockId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "redeemer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Redeemed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "phone",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "pin",
				"type": "string"
			}
		],
		"name": "redeemFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "lockId",
				"type": "uint256"
			}
		],
		"name": "refundExpired",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "locks",
		"outputs": [
			{
				"internalType": "address",
				"name": "locker",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "recipientHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "redeemed",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "expiration",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextLockId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "stableToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// TypeScript interfaces
export interface LockFundsParams {
  amount: number; // Amount in ETH
  phone: string;
  pin: string;
  lockDuration?: number; // in seconds, default 24 hours
}

export interface RedeemFundsParams {
  phone: string;
  pin: string;
}

export interface LockedFundsInfo {
  amount: string;
  expiry: number;
  isLocked: boolean;
}

export interface TransactionStatus {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Main hook for LockPay contract interactions
export function useLockPayContracts() {
  const address = useAddress();
  const signer = useSigner();
  
  // Contract instances
  const { contract: vaultContract } = useContract(VAULT_ADDRESS, VAULT_ABI);
  
  // Use the specific LPUSD token contract
  const { contract: stableTokenContract } = useContract(LPUSD_TOKEN_ADDRESS, ERC20_ABI);
  
  // Contract write functions
  const { mutateAsync: lockFundsWrite, isLoading: lockLoading } = useContractWrite(vaultContract, "lockFunds");
  const { mutateAsync: redeemFundsWrite, isLoading: redeemLoading } = useContractWrite(vaultContract, "redeemFunds");
  const { mutateAsync: approveWrite, isLoading: approveLoading } = useContractWrite(stableTokenContract, "approve");
  
  // State for transaction status
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    loading: false,
    error: null,
    success: false
  });

  // Lock funds function with ERC20 approval
  const lockFunds = async ({ amount, phone, pin, lockDuration = 86400 }: LockFundsParams) => {
    console.log("Debug - Address:", address);
    console.log("Debug - Vault Contract:", vaultContract);
    console.log("Debug - Stable Token Contract:", stableTokenContract);
    console.log("Debug - Signer:", signer);
    
    if (!address) {
      throw new Error("Wallet not connected - please connect your wallet first");
    }
    
    if (!vaultContract) {
      throw new Error("Vault contract not available - please check if the contract is deployed on Sepolia");
    }
    
    if (!stableTokenContract) {
      throw new Error("Stable token contract not available - please check if the token is properly configured");
    }
    
    if (!signer) {
      throw new Error("Signer not available - please check your wallet connection");
    }

    try {
      setTransactionStatus({ loading: true, error: null, success: false });
      
      // Create recipient hash
      const recipientHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(phone + pin));
      
      // Convert amount to wei (assuming 18 decimals for ERC20)
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
      
      // Check current allowance
      const currentAllowance = await stableTokenContract.call("allowance", [address, VAULT_ADDRESS]);
      console.log("Current allowance:", ethers.utils.formatUnits(currentAllowance, 18));
      
      // If allowance is insufficient, approve the vault contract
      if (currentAllowance.lt(amountInWei)) {
        console.log("Approving token spending...");
        await approveWrite({
          args: [VAULT_ADDRESS, amountInWei]
        });
        console.log("Token approval successful");
      }
      
      console.log("Locking funds...");
      await lockFundsWrite({
        args: [recipientHash, amountInWei, lockDuration]
      });
      
      setTransactionStatus({ loading: false, error: null, success: true });
      
      return { success: true, recipientHash };
    } catch (error) {
      console.error("Error locking funds:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setTransactionStatus({ loading: false, error: errorMessage, success: false });
      throw error;
    }
  };

  // Redeem funds function
  const redeemFunds = async ({ phone, pin }: RedeemFundsParams) => {
    if (!address || !vaultContract || !signer) {
      throw new Error("Wallet not connected or contract not available");
    }

    try {
      setTransactionStatus({ loading: true, error: null, success: false });
      
      console.log("Redeeming funds...");
      await redeemFundsWrite({
        args: [phone, pin]
      });
      
      setTransactionStatus({ loading: false, error: null, success: true });
      
      return { success: true };
    } catch (error) {
      console.error("Error redeeming funds:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setTransactionStatus({ loading: false, error: errorMessage, success: false });
      throw error;
    }
  };

  // Check locked funds
  const getLockedFunds = async (phone: string, pin: string): Promise<LockedFundsInfo | null> => {
    if (!vaultContract) return null;

    try {
      const recipientHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(phone + pin));
      
      // Try to get the lock information from the contract
      // Note: The exact function names may vary based on your contract implementation
      try {
        const lockInfo = await vaultContract.call("getLockInfo", [recipientHash]);
        return {
          amount: ethers.utils.formatUnits(lockInfo.amount, 18), // Assuming 18 decimals
          expiry: Number(lockInfo.expiry),
          isLocked: Boolean(lockInfo.isLocked)
        };
      } catch (lockError) {
        // Fallback: try to get basic lock status
        console.log("Trying fallback method for lock info...");
        const isLocked = await vaultContract.call("isLocked", [recipientHash]);
        
        if (isLocked) {
          return {
            amount: "Unknown", // Amount not available through this method
            expiry: 0,
            isLocked: true
          };
        } else {
          return null; // No lock found
        }
      }
    } catch (error) {
      console.error("Error getting locked funds:", error);
      return null;
    }
  };

  // Get ETH balance
  const getETHBalance = async (): Promise<string> => {
    if (!address || !signer) return "0";

    try {
      const balance = await signer.provider?.getBalance(address);
      return ethers.utils.formatEther(balance || 0);
    } catch (error) {
      console.error("Error getting ETH balance:", error);
      return "0";
    }
  };

  // Get LPUSD token balance
  const getLPUSDBalance = async (): Promise<string> => {
    if (!stableTokenContract || !address) return "0";

    try {
      const balance = await stableTokenContract.call("balanceOf", [address]);
      const decimals = await stableTokenContract.call("decimals");
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Error getting LPUSD balance:", error);
      return "0";
    }
  };

  // Get stable token address from vault contract
  const getStableTokenAddress = async (): Promise<string> => {
    return LPUSD_TOKEN_ADDRESS; // Return the known token address
  };

  // Get contract fees
  const getFees = async (): Promise<string> => {
    if (!vaultContract) return "0";

    try {
      const fees = await vaultContract.call("getFees");
      return ethers.utils.formatEther(fees); // Fees in ETH
    } catch (error) {
      console.error("Error getting fees:", error);
      return "0";
    }
  };

  return {
    // Functions
    lockFunds,
    redeemFunds,
    getLockedFunds,
    getETHBalance,
    getLPUSDBalance,
    getFees,
    getStableTokenAddress,
    
    // Contract instances
    vaultContract,
    stableTokenContract,
    
    // Loading states
    lockLoading,
    redeemLoading,
    approveLoading,
    transactionStatus,
    
    // Address
    address
  };
}

// Hook for reading contract data
export function useLockPayData() {
  const { contract: vaultContract } = useContract(VAULT_ADDRESS, VAULT_ABI);
  const { contract: lpusdContract } = useContract(LPUSD_TOKEN_ADDRESS, ERC20_ABI);
  const address = useAddress();
  
  // Read fees
  const { data: fees, isLoading: feesLoading } = useContractRead(vaultContract, "getFees");
  
  // Read ETH balance using useBalance hook
  const { data: ethBalance, isLoading: balanceLoading } = useBalance();
  
  // Read LPUSD balance
  const { data: lpusdBalance, isLoading: lpusdBalanceLoading } = useContractRead(lpusdContract, "balanceOf", [address]);

  return {
    fees: fees ? ethers.utils.formatEther(fees) : "0",
    ethBalance: ethBalance ? ethBalance.displayValue : "0",
    lpusdBalance: lpusdBalance ? ethers.utils.formatUnits(lpusdBalance, 18) : "0", // Assuming 18 decimals
    feesLoading,
    balanceLoading,
    lpusdBalanceLoading
  };
}

// Utility functions
export const formatETH = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toFixed(6)} ETH`;
};

// Contract addresses for external use
export const CONTRACT_ADDRESSES = {
  VAULT: VAULT_ADDRESS
} as const;
