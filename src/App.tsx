import React, { Component, useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, PlusCircle, PieChart, Settings as SettingsIcon, AlertTriangle, ArrowRightLeft, MoreHorizontal, Landmark, Smartphone, CreditCard, Banknote, Camera } from 'lucide-react';
import { Transaction, Account, AccountType, TransactionType, CATEGORIES, AppNotification } from './types';
import * as Storage from './services/storageService';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SmartTools from './pages/SmartTools';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Crash:", error, errorInfo);
  }

  handleReset = () => {
    if (window.confirm("This will clear all local data to fix the crash. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-6 max-w-xs">The app encountered an unexpected error. Please try reloading.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              Reload App
            </button>
            <button 
              onClick={this.handleReset}
              className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold shadow-sm active:scale-95 transition-transform"
            >
              Reset Data
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Context ---
export interface AppContextType {
  transactions: Transaction[];
  accounts: Account[];
  notifications: AppNotification[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => Transaction | null;
  refreshData: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  userName: string;
  updateUserName: (name: string) => void;
  updateAccountName: (id: string, name: string) => void;
  createAccount: (account: Omit<Account, 'id'>) => void;
  removeAccount: (id: string) => void;
  markNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Main App Component ---
export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(Storage.getTheme() === 'dark');
  const [userName, setUserName] = useState<string>(Storage.getUserName());

  const refreshData = () => {
    const tx = Storage.getTransactions();
    const acc = Storage.getAccounts();
    const notifs = Storage.getNotifications();
    setTransactions([...tx]);
    setAccounts([...acc]);
    setNotifications([...notifs]);
  };

  useEffect(() => {
    refreshData();
    // Apply theme
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    
    if (isDarkMode) {
      root.classList.add('dark');
      if (metaTheme) metaTheme.setAttribute('content', '#0f172a');
    } else {
      root.classList.remove('dark');
      if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    Storage.saveTheme(newTheme ? 'dark' : 'light');
    // Effect will handle class toggle
  };

  // Helper to trigger notification
  const notify = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const newNotif: AppNotification = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    Storage.addNotification(newNotif);
    refreshData();
  };

  const markNotificationsAsRead = () => {
    Storage.markNotificationsRead();
    refreshData();
  };

  const clearAllNotifications = () => {
    Storage.clearNotifications();
    refreshData();
  };

  const updateUserName = (name: string) => {
    setUserName(name);
    Storage.saveUserName(name);
  };

  const updateAccountName = (id: string, name: string) => {
    Storage.updateAccountName(id, name);
    refreshData();
  };

  const createAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = { ...account, id: crypto.randomUUID() };
    Storage.saveAccount(newAccount);
    notify('Account Created', `${account.name} added successfully.`, 'success');
    refreshData();
  };

  const removeAccount = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    Storage.deleteAccount(id);
    notify('Account Deleted', `${acc?.name || 'Account'} has been removed.`, 'warning');
    refreshData();
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...t, id: crypto.randomUUID() };
    Storage.saveTransaction(newTransaction);
    
    // Update account balances
    if (t.type === 'TRANSFER' && t.toAccountId) {
      // Deduct from Source
      Storage.updateAccountBalance(t.accountId, -t.amount);
      // Add to Destination
      Storage.updateAccountBalance(t.toAccountId, t.amount);
    } else {
      let balanceChange = 0;
      if (t.type === 'INCOME' || t.type === 'REFUND') balanceChange = t.amount;
      else if (t.type === 'EXPENSE') balanceChange = -t.amount;
      Storage.updateAccountBalance(t.accountId, balanceChange);
    }

    // Notify user
    const amountFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(t.amount);
    if (t.type === 'EXPENSE') {
        notify('Expense Added', `Spent ${amountFormatted} at ${t.merchant || t.category}`, 'info');
    } else if (t.type === 'INCOME') {
        notify('Income Received', `Received ${amountFormatted} from ${t.merchant || t.category}`, 'success');
    } else if (t.type === 'REFUND') {
        notify('Refund Processed', `Refund of ${amountFormatted} added to ${t.accountName}`, 'success');
    } else if (t.type === 'TRANSFER') {
        notify('Transfer Successful', `Transferred ${amountFormatted} to ${t.toAccountName}`, 'success');
    }

    // Handle Cashback: Create a secondary INCOME transaction
    if (t.cashback && t.cashback > 0 && t.type === 'EXPENSE') {
      const cashbackTx: Transaction = {
        id: crypto.randomUUID(),
        amount: t.cashback,
        type: 'INCOME',
        category: 'Cashback',
        accountId: t.accountId,
        accountName: t.accountName,
        date: t.date,
        note: `Cashback for ${t.merchant || t.category}`,
        merchant: t.merchant
      };
      Storage.saveTransaction(cashbackTx);
      Storage.updateAccountBalance(t.accountId, t.cashback);
      
      const cbFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(t.cashback);
      notify('Cashback Earned!', `You earned ${cbFormatted} cashback on this transaction!`, 'success');
    }
    
    refreshData();
  };

  // Optimistic deleteTransaction - updates UI first, then storage
  const deleteTransaction = (id: string): Transaction | null => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return null;
    
    // Optimistic UI update: remove from React state first
    setTransactions(prev => prev.filter(p => p.id !== id));

    // Call storage layer and reverse balances
    const deletedTx = Storage.deleteTransaction(id);
    if (deletedTx) {
      if (deletedTx.type === 'TRANSFER' && deletedTx.toAccountId) {
        // Reverse Transfer: Add back to Source, Deduct from Destination
        Storage.updateAccountBalance(deletedTx.accountId, deletedTx.amount);
        Storage.updateAccountBalance(deletedTx.toAccountId, -deletedTx.amount);
      } else {
        let balanceChange = 0;
        if (deletedTx.type === 'INCOME' || deletedTx.type === 'REFUND') balanceChange = -deletedTx.amount;
        else if (deletedTx.type === 'EXPENSE') balanceChange = deletedTx.amount;
        Storage.updateAccountBalance(deletedTx.accountId, balanceChange);
      }

      // Notification
      const amountFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(deletedTx.amount);
      notify('Transaction Deleted', `${deletedTx.type === 'TRANSFER' ? 'Transfer' : deletedTx.type === 'EXPENSE' ? 'Expense' : 'Income'} of ${amountFormatted} removed.`, 'warning');
    } 
    
    // Always refresh to ensure sync
    refreshData();
    return deletedTx;
  };

  return (
    <GlobalErrorBoundary>
      <AppContext.Provider value={{ 
        transactions, 
        accounts, 
        notifications,
        addTransaction, 
        deleteTransaction, 
        refreshData, 
        isDarkMode, 
        toggleTheme,
        userName,
        updateUserName,
        updateAccountName,
        createAccount,
        removeAccount,
        markNotificationsAsRead,
        clearAllNotifications
      }}>
        <HashRouter>
          <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/add" element={<AddTransactionPage />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/tools" element={<SmartTools />} />
              </Routes>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 safe-area-bottom z-50">
              <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
                <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-16 space-y-1 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <LayoutDashboard size={22} strokeWidth={2} />
                  <span className="text-[10px] font-medium">Home</span>
                </NavLink>
                
                <NavLink to="/transactions" className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-16 space-y-1 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <Wallet size={22} strokeWidth={2} />
                  <span className="text-[10px] font-medium">History</span>
                </NavLink>

                {/* Floating Add Button */}
                <div className="-mt-8">
                  <NavLink to="/add" className="flex items-center justify-center w-14 h-14 bg-indigo-600 dark:bg-indigo-500 rounded-full shadow-glow text-white shadow-lg transform active:scale-95 transition-all hover:bg-indigo-700 dark:hover:bg-indigo-400">
                    <PlusCircle size={28} />
                  </NavLink>
                </div>

                <NavLink to="/reports" className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-16 space-y-1 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <PieChart size={22} strokeWidth={2} />
                  <span className="text-[10px] font-medium">Analytics</span>
                </NavLink>

                <NavLink to="/tools" className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-16 space-y-1 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <Camera size={22} strokeWidth={2} />
                  <span className="text-[10px] font-medium">AI Tools</span>
                </NavLink>
              </div>
            </nav>
          </div>
        </HashRouter>
      </AppContext.Provider>
    </GlobalErrorBoundary>
  );
}

// Simple internal Add Transaction Page Wrapper
const AddTransactionPage = () => {
  return (
    <div className="p-4 pt-8 max-w-lg mx-auto">
       <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Add Transaction</h1>
       <BasicAddForm />
    </div>
  )
}

const BasicAddForm = () => {
    const { addTransaction, accounts } = useApp();
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<TransactionType>('EXPENSE');
    const [category, setCategory] = useState(CATEGORIES[0].name);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [toAccountId, setToAccountId] = useState('');
    const [cashback, setCashback] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const accountScrollRef = useRef<HTMLDivElement>(null);
    const toAccountScrollRef = useRef<HTMLDivElement>(null);

    // Set default account on load
    useEffect(() => {
      if (accounts.length > 0) {
          if (!selectedAccountId) setSelectedAccountId(accounts[0].id);
          // Default destination different from source if possible
          if (!toAccountId && accounts.length > 1) {
              const dest = accounts.find(a => a.id !== accounts[0].id);
              if (dest) setToAccountId(dest.id);
          }
      }
    }, [accounts, selectedAccountId, toAccountId]);

    // Handle horizontal scroll with mouse wheel (From Account)
    useEffect(() => {
        const el = accountScrollRef.current;
        if (el) {
          const onWheel = (e: WheelEvent) => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY;
          };
          el.addEventListener('wheel', onWheel, { passive: false });
          return () => el.removeEventListener('wheel', onWheel);
        }
    }, []);

    // Handle horizontal scroll with mouse wheel (To Account)
    useEffect(() => {
        if (type === 'TRANSFER') {
            const el = toAccountScrollRef.current;
            if (el) {
              const onWheel = (e: WheelEvent) => {
                if (e.deltaY === 0) return;
                e.preventDefault();
                el.scrollLeft += e.deltaY;
              };
              el.addEventListener('wheel', onWheel, { passive: false });
              return () => el.removeEventListener('wheel', onWheel);
            }
        }
    }, [type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const acc = accounts.find(a => a.id === selectedAccountId);
        if (!acc) return;

        if (type === 'TRANSFER' && (!toAccountId || toAccountId === selectedAccountId)) {
            alert("Please select a valid destination account.");
            return;
        }

        const toAcc = type === 'TRANSFER' ? accounts.find(a => a.id === toAccountId) : undefined;

        setIsSubmitting(true);
        setTimeout(() => {
            addTransaction({
                amount: parseFloat(amount),
                type,
                category: type === 'REFUND' ? 'Refunds' : type === 'TRANSFER' ? 'Transfer' : category,
                accountId: acc.id,
                accountName: acc.name,
                toAccountId: toAcc?.id,
                toAccountName: toAcc?.name,
                date: new Date(date).toISOString(),
                note: type === 'TRANSFER' ? 'Self Transfer' : note,
                merchant: type === 'TRANSFER' ? 'Self' : note,
                cashback: cashback ? parseFloat(cashback) : undefined
            });
            setAmount('');
            setNote('');
            setCashback('');
            // Keep date as is or reset to today? Usually keep.
            setSuccess(true);
            setIsSubmitting(false);
            setTimeout(() => setSuccess(false), 2000);
        }, 500);
    }

    const getAccountIcon = (type: AccountType) => {
        switch (type) {
            case AccountType.BANK: return <Landmark size={20} />;
            case AccountType.UPI: return <Smartphone size={20} />;
            case AccountType.WALLET: return <Wallet size={20} />;
            case AccountType.CASH: return <Banknote size={20} />;
            case AccountType.CREDIT_CARD:
            case AccountType.DEBIT_CARD:
                return <CreditCard size={20} />;
            default: return <Wallet size={20} />;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-slate-800 space-y-6">
            
            {/* Amount Input */}
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Amount</label>
               <div className="relative">
                  <span className="absolute left-4 top-4 text-slate-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                    required
                  />
               </div>
            </div>

            {/* Date Input */}
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Date</label>
               <input 
                 type="date" 
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                 className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-slate-800 dark:text-white font-medium"
                 required
               />
            </div>

            {/* Type Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
               {['EXPENSE', 'INCOME', 'TRANSFER', 'REFUND'].map((t) => (
                  <button
                     key={t}
                     type="button"
                     onClick={() => setType(t as TransactionType)}
                     className={`flex-1 min-w-[80px] py-2 text-[10px] font-bold rounded-lg transition-all ${
                        type === t 
                        ? (t === 'INCOME' || t === 'REFUND' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
                           : t === 'TRANSFER' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                           : 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm') 
                        : 'text-slate-400'
                     }`}
                  >
                     {t}
                  </button>
               ))}
            </div>

            {/* Account Select (Source) - MODERNIZED */}
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                   {type === 'TRANSFER' ? 'From Account' : 'Payment Method / Account'}
               </label>
               <div 
                   ref={accountScrollRef}
                   className="flex gap-3 overflow-x-auto no-scrollbar pb-2 cursor-grab active:cursor-grabbing"
               >
                   {accounts.map(acc => (
                       <button
                           key={acc.id}
                           type="button"
                           onClick={() => setSelectedAccountId(acc.id)}
                           className={`relative min-w-[140px] p-4 rounded-2xl border text-left transition-all shrink-0 ${
                               selectedAccountId === acc.id 
                               ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                               : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
                           }`}
                       >
                           <div className={`mb-3 w-8 h-8 rounded-full flex items-center justify-center ${selectedAccountId === acc.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                               {getAccountIcon(acc.type)}
                           </div>
                           <p className={`text-xs font-bold mb-1 truncate ${selectedAccountId === acc.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{acc.name}</p>
                           <p className={`text-[10px] font-medium ${selectedAccountId === acc.id ? 'text-indigo-100' : 'text-slate-400'}`}>₹{acc.balance}</p>
                           
                           {selectedAccountId === acc.id && (
                               <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                           )}
                       </button>
                   ))}
               </div>
            </div>

            {/* Account Select (Destination - Only for Transfer) */}
            {type === 'TRANSFER' && (
                <div className="animate-in slide-in-from-top-2">
                   <div className="flex justify-center -my-3 z-10 relative">
                       <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full border-4 border-white dark:border-slate-900">
                           <ArrowRightLeft size={16} className="text-slate-400" />
                       </div>
                   </div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">To Account</label>
                   <div 
                       ref={toAccountScrollRef}
                       className="flex gap-3 overflow-x-auto no-scrollbar pb-2 cursor-grab active:cursor-grabbing"
                   >
                       {accounts
                            .filter(a => a.id !== selectedAccountId) // Exclude source account
                            .map(acc => (
                           <button
                               key={acc.id}
                               type="button"
                               onClick={() => setToAccountId(acc.id)}
                               className={`relative min-w-[140px] p-4 rounded-2xl border text-left transition-all shrink-0 ${
                                   toAccountId === acc.id 
                                   ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                                   : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
                               }`}
                           >
                               <div className={`mb-3 w-8 h-8 rounded-full flex items-center justify-center ${toAccountId === acc.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                   {getAccountIcon(acc.type)}
                               </div>
                               <p className={`text-xs font-bold mb-1 truncate ${toAccountId === acc.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{acc.name}</p>
                               <p className={`text-[10px] font-medium ${toAccountId === acc.id ? 'text-indigo-100' : 'text-slate-400'}`}>₹{acc.balance}</p>
                               
                               {toAccountId === acc.id && (
                                   <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                               )}
                           </button>
                       ))}
                   </div>
                </div>
            )}

            {/* Category Select (Hidden for Refund and Transfer) */}
            {type !== 'REFUND' && type !== 'TRANSFER' && (
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                   <div className="grid grid-cols-4 gap-2">
                      {CATEGORIES.filter(c => c.name !== 'Transfer').map(cat => (
                         <button
                            key={cat.name}
                            type="button"
                            onClick={() => setCategory(cat.name)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${category === cat.name ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                         >
                            <span className="text-xl mb-1 flex items-center justify-center h-7">
                                {cat.icon === 'Utensils' && '🍽️'}
                                {cat.icon === 'ShoppingBasket' && '🛒'}
                                {cat.icon === 'Plane' && '✈️'}
                                {cat.icon === 'Receipt' && '🧾'}
                                {cat.icon === 'ShoppingBag' && '🛍️'}
                                {cat.icon === 'Fuel' && '⛽'}
                                {cat.icon === 'Briefcase' && '💼'}
                                {cat.icon === 'TrendingUp' && '📈'}
                                {cat.icon === 'Monitor' && '📱'}
                                {cat.icon === 'RefreshCcw' && '🔄'}
                                {cat.icon === 'Coins' && '🪙'}
                                {cat.icon === 'MoreHorizontal' && <MoreHorizontal size={20} />}
                            </span>
                            <span className="text-[9px] font-bold text-center leading-tight">{cat.name}</span>
                         </button>
                      ))}
                   </div>
                </div>
            )}

            {/* Merchant / Note (Hidden for Transfer) */}
            {type !== 'TRANSFER' && (
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description / Merchant</label>
                   <input 
                     type="text" 
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-slate-800 dark:text-white font-medium"
                     placeholder="e.g. Starbucks, Uber, Salary..."
                     required
                   />
                </div>
            )}

            {/* Cashback (Only for Expense) */}
            {type === 'EXPENSE' && (
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cashback Received (Optional)</label>
                   <div className="relative">
                      <span className="absolute left-4 top-4 text-slate-400 font-bold">₹</span>
                      <input 
                        type="number" 
                        value={cashback}
                        onChange={(e) => setCashback(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 outline-none font-bold text-purple-700 dark:text-purple-300 focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                      />
                   </div>
                </div>
            )}

            <div className="text-center pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-glow transition-all active:scale-95 ${success ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isSubmitting ? 'Saving...' : success ? 'Saved Successfully!' : 'Save Transaction'}
              </button>
            </div>
        </form>
    )
}