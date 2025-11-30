import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { formatINR, CATEGORIES } from '../types';
import { Search, Filter, Trash2, RefreshCcw, Coins, ArrowRightLeft } from 'lucide-react';

export default function Transactions() {
  const { transactions, deleteTransaction } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'REFUND' | 'TRANSFER'>('ALL');

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
         const hay = ((t.merchant || t.category) || '').toLowerCase();
         const matchesSearch = hay.includes(searchTerm.toLowerCase());
         const matchesType = filterType === 'ALL' || t.type === filterType;
         return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.preventDefault(); 
      e.stopPropagation(); 
      console.log('[Transactions] handleDelete clicked. id=', id);

      if (!deleteTransaction) {
        console.error('[Transactions] deleteTransaction not provided by context');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this transaction permanently?')) {
        return;
      }

      try {
        const result = deleteTransaction(id);
        console.log('[Transactions] deleteTransaction result:', result);
        if (!result) {
          console.warn('[Transactions] No transaction deleted (maybe id invalid).');
        }
      } catch (err) {
        console.error('[Transactions] Error deleting transaction:', err);
        alert('Failed to delete transaction. Check console.');
      }
  }

  return (
    <div className="pb-24 pt-8 px-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">History</h1>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center px-4 transition-colors">
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full py-3 outline-none text-slate-700 dark:text-slate-200 bg-transparent placeholder-slate-300 dark:placeholder-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
           <Filter size={20} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {['ALL', 'EXPENSE', 'INCOME', 'REFUND', 'TRANSFER'].map((type) => (
            <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                    filterType === type 
                    ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
            >
                {type}
            </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
         {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                <p>No transactions found.</p>
            </div>
         ) : filtered.map(t => (
             <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 flex justify-between items-center group relative overflow-hidden transition-colors">
                <div className="flex items-center gap-4 z-10">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                        t.type === 'INCOME' || t.type === 'REFUND' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                        : t.type === 'TRANSFER' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                     }`}>
                        {t.type === 'REFUND' && <RefreshCcw size={20}/>}
                        {t.type === 'TRANSFER' && <ArrowRightLeft size={20}/>}
                        {t.type !== 'REFUND' && t.type !== 'TRANSFER' && (
                            <>
                                {CATEGORIES.find(c => c.name === t.category)?.icon === 'Utensils' && '🍽️'}
                                {CATEGORIES.find(c => c.name === t.category)?.icon === 'ShoppingBasket' && '🛒'}
                                {CATEGORIES.find(c => c.name === t.category)?.icon === 'Fuel' && '⛽'}
                                {CATEGORIES.find(c => c.name === t.category)?.icon === 'Coins' && <Coins size={20}/>}
                                {!['Utensils', 'ShoppingBasket', 'Fuel', 'Coins'].includes(CATEGORIES.find(c => c.name === t.category)?.icon || '') && '🧾'}
                            </>
                        )}
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                            {t.type === 'TRANSFER' ? (
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                    {t.accountName} <span className="text-slate-400">➔</span> {t.toAccountName}
                                </h4>
                            ) : (
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{t.merchant || t.category}</h4>
                            )}
                            
                            {t.type === 'REFUND' && <span className="text-[10px] bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-1.5 rounded font-bold">REFUND</span>}
                            {t.category === 'Cashback' && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 rounded font-bold">CASHBACK</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-1">
                            <span>{new Date(t.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-medium text-slate-500 dark:text-slate-400">{t.type === 'TRANSFER' ? 'Self Transfer' : t.accountName}</span>
                        </div>
                     </div>
                </div>
                <div className="flex items-center gap-3 z-10 relative">
                    <div className="text-right">
                        <p className={`font-bold ${
                            t.type === 'INCOME' || t.type === 'REFUND' ? 'text-income' 
                            : t.type === 'TRANSFER' ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}>
                            {t.type === 'INCOME' || t.type === 'REFUND' ? '+' : t.type === 'TRANSFER' ? '' : '-'}{formatINR(t.amount)}
                        </p>
                        {t.type === 'EXPENSE' && (
                             <span className="text-[10px] bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 px-2 py-0.5 rounded font-medium">{t.category}</span>
                        )}
                    </div>
                    {/* Delete Button */}
                    <button 
                        onClick={(e) => handleDelete(t.id, e)}
                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all cursor-pointer relative z-20"
                        title="Delete Transaction"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
             </div>
         ))}
      </div>
    </div>
  );
}