import React from 'react';
import { useApp } from '../App';
import { formatINR } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Reports() {
  const { transactions } = useApp();

  // Prepare Data for Last 7 Days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const barData = last7Days.map(dateStr => {
    const dayTransactions = transactions.filter(t => t.date.startsWith(dateStr));
    const income = dayTransactions.filter(t => t.type === 'INCOME' || t.type === 'REFUND').reduce((s, t) => s + t.amount, 0);
    const expense = dayTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    
    const dateObj = new Date(dateStr);
    return {
      day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      income,
      expense
    };
  });

  return (
    <div className="pb-24 pt-8 px-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Reports</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Financial overview of this week</p>

      {/* Bar Chart Container */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-slate-800 mb-8 transition-colors">
         <h3 className="font-bold text-slate-800 dark:text-white mb-6">Income vs Expense</h3>
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={barData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(248, 250, 252, 0.1)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={10} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={10} />
               </BarChart>
            </ResponsiveContainer>
         </div>
         <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
               <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Income
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
               <span className="w-3 h-3 rounded-full bg-rose-500"></span> Expense
            </div>
         </div>
      </div>

      <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-6 rounded-3xl shadow-glow">
         <h3 className="font-bold mb-2">Monthly Insight</h3>
         <p className="text-indigo-100 text-sm opacity-90 leading-relaxed">
            Your spending on <span className="text-white font-bold">Food & Dining</span> is 15% lower than last week. Good job keeping the budget!
         </p>
      </div>
    </div>
  );
}