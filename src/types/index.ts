export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'lock' | 'redeem';
  amount: number;
  phone?: string;
  recipientPhone?: string;
  status: 'success' | 'pending' | 'failed';
  tokenId?: string;
  timestamp: Date;
  description: string;
}

export interface LockedPayment {
  id: string;
  amount: number;
  senderPhone: string;
  recipientPhone: string;
  pin: string;
  tokenId: string;
  timestamp: Date;
  claimed: boolean;
}

export interface DepositRequest {
  amount: number;
}

export interface LockPaymentRequest {
  amount: number;
  recipientPhone: string;
  pin: string;
}

export interface RedeemPaymentRequest {
  phone: string;
  pin: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  tokenId?: string;
  amount?: number;
  transaction?: Transaction;
}