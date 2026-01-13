
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp, BasicAddForm } from '../App';
import { formatINR, AccountType, CATEGORIES, Transaction } from '../types';
import { TrendingUp, TrendingDown, Bell, CreditCard, Wallet, Smartphone, RefreshCcw, Sun, Moon, Banknote, Landmark, Pencil, Check, Trash2, X, Plus, ChevronRight, ArrowRightLeft, Coins } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { 
    transactions, 
    accounts, 
    isDarkMode, 
    toggleTheme, 
    userName, 
    updateUserName, 
    updateAccountName, 
    createAccount, 
    removeAccount, 
    notifications, 
    markNotificationsAsRead, 
    clearAllNotifications,
    deleteTransaction
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [tempAccountName, setTempAccountName] = useState('');
  
  // UI State for Overlays
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  
  // New Account Form State
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>(AccountType.BANK);
  const [newAccBalance, setNewAccBalance] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  // Handle outside click for notifications
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationRef]);

  // Calculations for Overview
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = useMemo(() => {
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'EXPENSE' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonth, currentYear]);

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' || t.type === 'REFUND')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Month-wise spending breakdown (Last 6 months)
  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthName = d.toLocaleString('default', { month: 'short' });
      
      const monthlyTotal = transactions
        .filter(t => {
          const td = new Date(t.date);
          return t.type === 'EXPENSE' && td.getMonth() === m && td.getFullYear() === y;
        })
        .reduce((sum, t) => sum + t.amount, 0);
        
      data.push({ name: monthName, expense: monthlyTotal });
    }
    return data;
  }, [transactions]);

  // Category Pie Chart Data
  const expensesByCategory = useMemo(() => {
    return transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  const pieData = useMemo(() => {
    return Object.keys(expensesByCategory).map(cat => ({
      name: cat,
      value: expensesByCategory[cat],
      color: CATEGORIES.find(c => c.name === cat)?.color || '#cbd5e1'
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [expensesByCategory]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUserName(tempName);
    }
    setIsEditingName(false);
  };

  const startEditingAccount = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAccountId(id);
    setTempAccountName(currentName);
  };

  const saveAccountName = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tempAccountName.trim()) {
      updateAccountName(id, tempAccountName);
    }
    setEditingAccountId(null);
  };

  const handleDeleteAccount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this account?')) {
      removeAccount(id);
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccName && newAccBalance) {
        createAccount({
            name: newAccName,
            type: newAccType,
            balance: parseFloat(newAccBalance)
        });
        setNewAccName('');
        setNewAccBalance('');
        setIsAddingAccount(false);
    }
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
        case AccountType.BANK: return <Landmark size={24} className="text-white" />;
        case AccountType.UPI: return <Smartphone size={24} className="text-white" />;
        case AccountType.WALLET: return <Wallet size={24} className="text-white" />;
        case AccountType.CASH: return <Banknote size={24} className="text-white" />;
        case AccountType.CREDIT_CARD: 
        case AccountType.DEBIT_CARD:
            return <CreditCard size={24} className="text-white" />;
        default: return <Wallet size={24} className="text-white" />;
    }
  };

  const timeAgo = (dateStr: string) => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins} mins ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} hours ago`;
      return 'Yesterday';
  }

  return (
    <div className="pb-24 pt-8 px-6 relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input 
                ref={nameInputRef}
                type="text" 
                value={tempName} 
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="text-2xl font-bold text-slate-800 dark:text-white bg-transparent border-b-2 border-indigo-500 outline-none w-48"
              />
              <button onClick={handleSaveName} className="text-indigo-600"><Check size={20}/></button>
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
              Hello, {userName} <Pencil size={14} className="opacity-0 group-hover:opacity-50 transition-opacity text-slate-400"/>
            </h1>
          )}
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Total Balance: <span className="font-bold text-slate-800 dark:text-slate-200">{formatINR(totalBalance)}</span></p>
        </div>
        <div className="flex gap-3">
            <button onClick={toggleTheme} className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
                    )}
                </button>
                {showNotifications && (
                    <div className="absolute right-0 top-14 w-80 bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-4 z-50 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h4>
                            {notifications.length > 0 && (
                                <button onClick={clearAllNotifications} className="text-[10px] text-slate-400 hover:text-red-500">Clear All</button>
                            )}
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                            {notifications.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">No new notifications</p>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} className={`flex gap-3 items-start p-2 rounded-lg transition-colors ${!notif.read ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}>
                                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.type === 'success' ? 'bg-emerald-500' : notif.type === 'warning' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{notif.title}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">{notif.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.date)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Main Expense Highlights */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-indigo-600 dark:bg-indigo-700 p-6 rounded-3xl shadow-glow text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl transition-transform group-hover:scale-110"></div>
           <div className="relative z-10 flex justify-between items-center">
              <div>
                 <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Expenses This Month</p>
                 <h2 className="text-3xl font-bold">{formatINR(thisMonthExpenses)}</h2>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                 <TrendingDown size={28} />
              </div>
           </div>
           <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-indigo-100">
              <span className="bg-white/20 px-2 py-0.5 rounded-full">Overall: {formatINR(totalExpense)}</span>
              <span>•</span>
              <span>Financial Insight Active</span>
           </div>
        </div>
      </div>

      {/* Income & Expense Breakdown Row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <TrendingUp size={20} />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Income & Refunds</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatINR(totalIncome)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/40 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
              <TrendingDown size={20} />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Expense</p>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{formatINR(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">My Accounts</h2>
          <button onClick={() => setShowAccountsModal(true)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">See All</button>
        </div>
        
        <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto no-scrollbar pb-2 cursor-grab active:cursor-grabbing"
            style={{ scrollBehavior: 'smooth' }}
        >
          {accounts.map(acc => (
            <div key={acc.id} className="min-w-[280px] h-40 bg-slate-800 dark:bg-slate-900 rounded-3xl p-6 relative overflow-hidden shrink-0 shadow-lg group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
               
               <div className="relative z-10 flex flex-col h-full justify-between text-white">
                  <div className="flex justify-between items-start">
                     <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        {getAccountIcon(acc.type)}
                     </div>
                     <div className="flex gap-1">
                        <button onClick={(e) => startEditingAccount(acc.id, acc.name, e)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                            <Pencil size={14} className="text-slate-300" />
                        </button>
                        <button onClick={(e) => handleDeleteAccount(acc.id, e)} className="p-1.5 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors">
                            <Trash2 size={14} className="text-slate-300 hover:text-red-300" />
                        </button>
                     </div>
                  </div>
                  
                  <div>
                    {editingAccountId === acc.id ? (
                        <div className="flex items-center gap-2 mb-1" onClick={e => e.stopPropagation()}>
                            <input 
                                type="text" 
                                value={tempAccountName}
                                onChange={e => setTempAccountName(e.target.value)}
                                className="bg-white/10 text-white px-2 py-1 rounded text-sm w-full outline-none border border-white/20"
                                autoFocus
                            />
                            <button onClick={(e) => saveAccountName(acc.id, e)} className="p-1 bg-green-500/80 rounded hover:bg-green-500"><Check size={12} /></button>
                        </div>
                    ) : (
                        <p className="text-slate-300 text-sm font-medium mb-1">{acc.name}</p>
                    )}
                    <h3 className="text-2xl font-bold tracking-tight">{formatINR(acc.balance)}</h3>
                  </div>
               </div>
            </div>
          ))}
          <div onClick={() => setShowAccountsModal(true)} className="min-w-[100px] h-40 flex items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            <Plus size={24} />
          </div>
        </div>
      </div>

      {/* Spending Breakdown Section */}
      <div className="space-y-6 mb-8">
        {/* Category Pie Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-slate-800 transition-colors">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Spending Breakdown</h2>
            <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-400 font-medium">Top Category</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{pieData[0]?.name || 'None'}</span>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
                {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{entry.name} ({Math.round(entry.value / totalExpense * 100 || 0)}%)</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Month-wise Spending Trend */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Monthly Trends</h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 6 Months</span>
            </div>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{ fill: 'rgba(248, 250, 252, 0.1)' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="expense" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Recent Transactions with Edit/Delete */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</h2>
            <NavLink to="/transactions" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">View History</NavLink>
        </div>
        <div className="space-y-3">
            {recentTransactions.map(t => (
                <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 flex justify-between items-center group relative overflow-hidden transition-colors">
                    <div className="flex items-center gap-4 z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            t.type === 'INCOME' || t.type === 'REFUND' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                            : t.type === 'TRANSFER' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                            {t.type === 'REFUND' && <RefreshCcw size={18}/>}
                            {t.type === 'TRANSFER' && <ArrowRightLeft size={18}/>}
                            {t.type !== 'REFUND' && t.type !== 'TRANSFER' && (
                                <>
                                    {CATEGORIES.find(c => c.name === t.category)?.icon === 'Utensils' && '🍽️'}
                                    {CATEGORIES.find(c => c.name === t.category)?.icon === 'ShoppingBasket' && '🛒'}
                                    {CATEGORIES.find(c => c.name === t.category)?.icon === 'Fuel' && '⛽'}
                                    {CATEGORIES.find(c => c.name === t.category)?.icon === 'Coins' && <Coins size={18}/>}
                                    {!['Utensils', 'ShoppingBasket', 'Fuel', 'Coins'].includes(CATEGORIES.find(c => c.name === t.category)?.icon || '') && '🧾'}
                                </>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.merchant || t.category}</h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(t.date).toLocaleDateString()} • {t.accountName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 z-10">
                        <div className="text-right mr-2">
                            <p className={`font-bold text-sm ${
                                t.type === 'INCOME' || t.type === 'REFUND' ? 'text-income' 
                                : t.type === 'TRANSFER' ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}>
                                {t.type === 'INCOME' || t.type === 'REFUND' ? '+' : t.type === 'TRANSFER' ? '' : '-'}{formatINR(t.amount)}
                            </p>
                        </div>
                        
                        {/* Inline Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingTx(t)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600">
                                <Pencil size={14} />
                            </button>
                            <button onClick={() => deleteTransaction(t.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Edit Modal for Dashboard Recent Transactions */}
      {editingTx && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-slate-50 dark:bg-slate-950 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 overflow-y-auto max-h-[90vh] no-scrollbar">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold dark:text-white">Edit Transaction</h2>
                      <button onClick={() => setEditingTx(null)} className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500">
                          <X size={20} />
                      </button>
                  </div>
                  <BasicAddForm initialData={editingTx} onComplete={() => setEditingTx(null)} />
              </div>
          </div>
      )}

      {/* All Accounts Modal */}
      {showAccountsModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">All Accounts</h2>
                    <button onClick={() => { setShowAccountsModal(false); setIsAddingAccount(false); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {!isAddingAccount ? (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                        {accounts.map(acc => (
                            <div key={acc.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        {getAccountIcon(acc.type)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">{acc.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{acc.type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-800 dark:text-white">{formatINR(acc.balance)}</p>
                                    <div className="flex gap-2 justify-end mt-1">
                                        <button onClick={(e) => startEditingAccount(acc.id, acc.name, e)} className="text-indigo-500 text-xs font-bold">Edit</button>
                                        <button onClick={(e) => handleDeleteAccount(acc.id, e)} className="text-red-500 text-xs font-bold">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={() => setIsAddingAccount(true)}
                            className="w-full py-4 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-indigo-500 font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
                        >
                            <Plus size={20} /> Add New Account
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleAddAccount} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Account Name</label>
                            <input 
                                type="text" 
                                value={newAccName} 
                                onChange={e => setNewAccName(e.target.value)} 
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                                placeholder="e.g. SBI Savings"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Account Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[AccountType.BANK, AccountType.UPI, AccountType.CASH, AccountType.WALLET, AccountType.CREDIT_CARD, AccountType.DEBIT_CARD].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setNewAccType(type)}
                                        className={`p-2 rounded-xl text-[10px] font-bold border transition-colors ${newAccType === type ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                    >
                                        {type.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Opening Balance</label>
                            <input 
                                type="number" 
                                value={newAccBalance} 
                                onChange={e => setNewAccBalance(e.target.value)} 
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setIsAddingAccount(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 rounded-xl">Cancel</button>
                            <button type="submit" className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl shadow-lg">Create Account</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
