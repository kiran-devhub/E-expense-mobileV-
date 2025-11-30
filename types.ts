
export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'REFUND';

export enum AccountType {
  UPI = 'UPI',
  BANK = 'Bank',
  DEBIT_CARD = 'Debit Card',
  CREDIT_CARD = 'Credit Card',
  CASH = 'Cash',
  WALLET = 'Wallet'
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string; // Reference to Account ID (Source)
  accountName: string; // Snapshot of account name for display
  toAccountId?: string; // Reference to Destination Account ID (For Transfers)
  toAccountName?: string; // Snapshot of destination account name
  date: string; // ISO string
  note?: string;
  merchant?: string;
  receiptImage?: string; // base64
  cashback?: number; // Cashback received
}

export interface Budget {
  category: string;
  amount: number;
  spent: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  date: string;
  read: boolean;
}

export const CATEGORIES = [
  { name: 'Food & Dining', color: '#f59e0b', icon: 'Utensils' },
  { name: 'Groceries', color: '#10b981', icon: 'ShoppingBasket' },
  { name: 'Travel', color: '#3b82f6', icon: 'Plane' },
  { name: 'Bills & EMI', color: '#ef4444', icon: 'Receipt' },
  { name: 'Shopping', color: '#8b5cf6', icon: 'ShoppingBag' },
  { name: 'Electronics', color: '#0ea5e9', icon: 'Monitor' },
  { name: 'Fuel', color: '#6366f1', icon: 'Fuel' },
  { name: 'Salary', color: '#059669', icon: 'Briefcase' },
  { name: 'Investment', color: '#d97706', icon: 'TrendingUp' },
  { name: 'Others', color: '#64748b', icon: 'MoreHorizontal' },
  { name: 'Refunds', color: '#0ea5e9', icon: 'RefreshCcw' },
  { name: 'Cashback', color: '#8b5cf6', icon: 'Coins' },
  { name: 'Transfer', color: '#6366f1', icon: 'ArrowRightLeft' }, // Added for UI helper
];

export const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
