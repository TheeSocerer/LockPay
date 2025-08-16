import { 
  User, 
  Transaction, 
  LockedPayment, 
  DepositRequest, 
  LockPaymentRequest, 
  RedeemPaymentRequest, 
  PaymentResponse 
} from '@/types';

// Mock user data
let currentUser: User | null = null;
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0821234567',
    balance: 150.00
  }
];

// Mock storage
const transactions: Transaction[] = [];
const lockedPayments: LockedPayment[] = [];

// Generate random IDs
const generateId = (): string => Math.random().toString(36).substr(2, 9).toUpperCase();
const generateTokenId = (): string => 'LPT-' + Math.random().toString(36).substr(2, 8).toUpperCase();

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication functions
export const loginWithGoogle = async (): Promise<{ success: boolean; user?: User }> => {
  await delay(1500);
  currentUser = mockUsers[0];
  return { success: true, user: currentUser };
};

export const loginWithPhone = async (phone: string): Promise<{ success: boolean; user?: User }> => {
  await delay(1500);
  
  // Find or create user
  let user = mockUsers.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: generateId(),
      name: 'User',
      email: `${phone}@phone.com`,
      phone,
      balance: 0
    };
    mockUsers.push(user);
  }
  
  currentUser = user;
  return { success: true, user: currentUser };
};

export const getCurrentUser = (): User | null => currentUser;

export const logout = (): void => {
  currentUser = null;
};

// Deposit money function
export const depositMoney = async (request: DepositRequest): Promise<PaymentResponse> => {
  try {
    await delay(2000);

    if (!currentUser) {
      return { success: false, message: 'User not authenticated' };
    }

    if (!request.amount || request.amount <= 0) {
      return { success: false, message: 'Invalid amount. Amount must be greater than R0.' };
    }

    if (request.amount > 10000) {
      return { success: false, message: 'Maximum deposit amount is R10,000.' };
    }

    // Update user balance
    currentUser.balance += request.amount;
    
    // Create transaction record
    const transaction: Transaction = {
      id: generateId(),
      type: 'deposit',
      amount: request.amount,
      phone: currentUser.phone,
      status: 'success',
      timestamp: new Date(),
      description: `Deposited R${request.amount} to wallet`
    };
    
    transactions.push(transaction);

    return {
      success: true,
      message: `R${request.amount} deposited successfully!`,
      amount: request.amount,
      transaction
    };
  } catch (error) {
    return { success: false, message: 'Failed to deposit money. Please try again.' };
  }
};

// Lock payment function
export const lockPayment = async (request: LockPaymentRequest): Promise<PaymentResponse> => {
  try {
    await delay(2500);

    if (!currentUser) {
      return { success: false, message: 'User not authenticated' };
    }

    // Validate inputs
    if (!request.amount || request.amount <= 0) {
      return { success: false, message: 'Invalid amount. Amount must be greater than R0.' };
    }

    if (!request.recipientPhone || request.recipientPhone.length < 10) {
      return { success: false, message: 'Invalid phone number. Please enter a valid 10-digit phone number.' };
    }

    if (!request.pin || request.pin.length < 4) {
      return { success: false, message: 'Invalid PIN. PIN must be at least 4 digits.' };
    }

    // Check if user has sufficient balance
    if (currentUser.balance < request.amount) {
      return { 
        success: false, 
        message: `Insufficient balance. You have R${currentUser.balance.toFixed(2)} available.` 
      };
    }

    // Check if recipient phone already has locked funds with same PIN
    const existingLock = lockedPayments.find(
      lp => lp.recipientPhone === request.recipientPhone && lp.pin === request.pin && !lp.claimed
    );
    
    if (existingLock) {
      return { 
        success: false, 
        message: 'This phone number already has locked funds with this PIN. Use a different PIN.' 
      };
    }

    // Deduct from balance
    currentUser.balance -= request.amount;

    // Generate token and create locked payment
    const tokenId = generateTokenId();
    const lockedPayment: LockedPayment = {
      id: generateId(),
      amount: request.amount,
      senderPhone: currentUser.phone,
      recipientPhone: request.recipientPhone,
      pin: request.pin,
      tokenId,
      timestamp: new Date(),
      claimed: false
    };

    lockedPayments.push(lockedPayment);

    // Create transaction record
    const transaction: Transaction = {
      id: generateId(),
      type: 'lock',
      amount: request.amount,
      phone: currentUser.phone,
      recipientPhone: request.recipientPhone,
      status: 'success',
      tokenId,
      timestamp: new Date(),
      description: `Locked R${request.amount} for ${request.recipientPhone}`
    };

    transactions.push(transaction);

    return {
      success: true,
      message: `Successfully locked R${request.amount}. Token ID: ${tokenId}`,
      tokenId,
      amount: request.amount,
      transaction
    };
  } catch (error) {
    return { success: false, message: 'Failed to lock payment. Please try again.' };
  }
};

// Redeem payment function
export const redeemPayment = async (request: RedeemPaymentRequest): Promise<PaymentResponse> => {
  try {
    await delay(2000);

    // Validate inputs
    if (!request.phone || request.phone.length < 10) {
      return { success: false, message: 'Invalid phone number. Please enter a valid 10-digit phone number.' };
    }

    if (!request.pin || request.pin.length < 4) {
      return { success: false, message: 'Invalid PIN. PIN must be at least 4 digits.' };
    }

    // Find locked payment
    const lockedPayment = lockedPayments.find(
      lp => lp.recipientPhone === request.phone && lp.pin === request.pin && !lp.claimed
    );

    if (!lockedPayment) {
      return { 
        success: false, 
        message: 'No locked funds found for this phone number and PIN combination.' 
      };
    }

    // Mark as claimed
    lockedPayment.claimed = true;

    // Create transaction record
    const transaction: Transaction = {
      id: generateId(),
      type: 'redeem',
      amount: lockedPayment.amount,
      phone: request.phone,
      status: 'success',
      tokenId: lockedPayment.tokenId,
      timestamp: new Date(),
      description: `Redeemed R${lockedPayment.amount} - sent to bank account`
    };

    transactions.push(transaction);

    return {
      success: true,
      message: `Successfully redeemed R${lockedPayment.amount}! Funds sent to your bank account.`,
      amount: lockedPayment.amount,
      transaction
    };
  } catch (error) {
    return { success: false, message: 'Failed to redeem payment. Please try again.' };
  }
};

// Get user transactions
export const getUserTransactions = (): Transaction[] => {
  if (!currentUser) return [];
  return transactions
    .filter(t => t.phone === currentUser?.phone || t.recipientPhone === currentUser?.phone)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Get all transactions (for demo purposes)
export const getAllTransactions = (): Transaction[] => {
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Get locked payments for current user
export const getUserLockedPayments = (): LockedPayment[] => {
  if (!currentUser) return [];
  return lockedPayments.filter(lp => lp.senderPhone === currentUser?.phone);
};