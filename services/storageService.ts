import { Transaction, Account, AccountType, AppNotification } from '../types';

const KEYS = {
  TRANSACTIONS: 'rupya_transactions',
  ACCOUNTS: 'rupya_accounts',
  THEME: 'rupya_theme',
  USER_PROFILE: 'rupya_user_profile',
  NOTIFICATIONS: 'rupya_notifications'
};

// --- Transactions ---

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction: Transaction) => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const deleteTransaction = (id: string): Transaction | null => {
  const transactions = getTransactions();
  const txToDelete = transactions.find(t => t.id === id);
  if (!txToDelete) return null;

  const updated = transactions.filter(t => t.id !== id);
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updated));
  return txToDelete;
};

// --- Accounts ---

export const getAccounts = (): Account[] => {
  const data = localStorage.getItem(KEYS.ACCOUNTS);
  if (data) {
    return JSON.parse(data);
  } else {
    // Seed Data if empty
    const seedAccounts: Account[] = [
      { id: '1', name: 'HDFC Bank', type: AccountType.BANK, balance: 25000 },
      { id: '2', name: 'GPay/PhonePe', type: AccountType.UPI, balance: 5000 },
      { id: '3', name: 'Cash', type: AccountType.CASH, balance: 1500 },
      { id: '4', name: 'HDFC Debit', type: AccountType.DEBIT_CARD, balance: 10000 },
      { id: '5', name: 'SBI Credit', type: AccountType.CREDIT_CARD, balance: -15000 }, // Debt
    ];
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(seedAccounts));
    return seedAccounts;
  }
};

export const saveAccount = (account: Account) => {
    // Generate ID for local storage if not present
    const newAccount = { ...account, id: account.id || crypto.randomUUID() };
    const accounts = getAccounts();
    accounts.push(newAccount);
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
};

export const updateAccountBalance = (accountId: string, amountToAdd: number) => {
  const accounts = getAccounts();
  const index = accounts.findIndex(a => a.id === accountId);
  if (index !== -1) {
    accounts[index].balance += amountToAdd;
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  }
};

export const updateAccountName = (accountId: string, newName: string) => {
  const accounts = getAccounts();
  const index = accounts.findIndex(a => a.id === accountId);
  if (index !== -1) {
    accounts[index].name = newName;
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  }
};

export const deleteAccount = (accountId: string) => {
  const accounts = getAccounts();
  const updated = accounts.filter(a => a.id !== accountId);
  localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(updated));
};

// --- User Profile ---

export const getUserName = (): string => {
  return localStorage.getItem(KEYS.USER_PROFILE) || 'Rupya User';
};

export const saveUserName = (name: string) => {
  localStorage.setItem(KEYS.USER_PROFILE, name);
};

// --- Theme ---

export const getTheme = (): string => {
  return localStorage.getItem(KEYS.THEME) || 'light';
};

export const saveTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem(KEYS.THEME, theme);
};

// --- Notifications ---

export const getNotifications = (): AppNotification[] => {
  const data = localStorage.getItem(KEYS.NOTIFICATIONS);
  return data ? JSON.parse(data) : [];
};

export const addNotification = (notification: AppNotification) => {
  const list = getNotifications();
  list.unshift(notification); // Add to start
  // Keep limit
  if (list.length > 50) list.pop();
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
};

export const clearNotifications = () => {
    localStorage.removeItem(KEYS.NOTIFICATIONS);
};

export const markNotificationsRead = () => {
    const list = getNotifications();
    const updated = list.map(n => ({...n, read: true}));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
};