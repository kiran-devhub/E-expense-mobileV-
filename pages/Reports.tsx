
import React, { useMemo } from 'react';
import { useApp } from '../App';
import { formatINR, CATEGORIES } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';

export default function Reports() {
  const { transactions } = useApp();

  // --- 1. Weekly Breakdown Data (Last 7 Days) ---
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => t.date.startsWith(dateStr));
      const income = dayTransactions
        .filter(t => t.type === 'INCOME' || t.type === 'REFUND')
        .reduce((s, t) => s + t.amount, 0);
      const expense = dayTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((s, t) => s + t.amount, 0);
      
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        income,
        expense
      };
    });
  }, [transactions]);

  // --- 2. Monthly Spending Trends (Last 6 Months) ---
  const monthlyTrendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthName = d.toLocaleString('default', { month: 'short' });

      const expense = transactions
        .filter(t => {
          const td = new Date(t.date);
          return t.type === 'EXPENSE' && td.getMonth() === month && td.getFullYear() === year;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const income = transactions
        .filter(t => {
          const td = new Date(t.date);
          return (t.type === 'INCOME' || t.type === 'REFUND') && td.getMonth() === month && td.getFullYear() === year;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({ name: monthName, expense, income });
    }
    return data;
  }, [transactions]);

  // --- 3. Category Breakdown (Current Month) ---
  const categoryData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'EXPENSE' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const breakdown = currentMonthExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(breakdown)
      .map(cat => ({
        name: cat,
        value: breakdown[cat],
        color: CATEGORIES.find(c => c.name === cat)?.color || '#cbd5e1'
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // --- 4. Overall Statistics ---
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'INCOME' || t.type === 'REFUND')
      .reduce((s, t) => s + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((s, t) => s + t.amount, 0);
    const savings = income - expense;

    return { income, expense, savings };
  }, [transactions]);

  return (
    <div className="pb-24 pt-8 px-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Reports</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Financial overview of your activity</p>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <TrendingUp size={16} className="text-emerald-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Income</p>
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{formatINR(stats.income)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <TrendingDown size={16} className="text-rose-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Expenses</p>
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{formatINR(stats.expense)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Wallet size={16} className="text-indigo-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Savings</p>
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate">{formatINR(stats.savings)}</p>
        </div>
      </div>

      {/* Weekly Income vs Expense - Matches Screenshot */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-slate-800 mb-8 transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-white mb-6">Income vs Expense</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(248, 250, 252, 0.1)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => formatINR(value)}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
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

      {/* Monthly Trends - Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-slate-800 mb-8 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 dark:text-white">Monthly Spending</h3>
          <Calendar size={18} className="text-slate-400" />
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(248, 250, 252, 0.1)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                formatter={(value: number) => formatINR(value)}
              />
              <Bar dataKey="expense" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-4 uppercase font-bold tracking-widest">Expense Trends: Last 6 Months</p>
      </div>

      {/* Category Breakdown - Pie Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-slate-800 mb-8 transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-white mb-6">Category Distribution</h3>
        {categoryData.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                    formatter={(value: number) => formatINR(value)}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">
            No spending data for this month.
          </div>
        )}
      </div>

      {/* Monthly Insight - Matches Screenshot */}
      <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-6 rounded-3xl shadow-glow">
        <h3 className="font-bold mb-2">Monthly Insight</h3>
        <p className="text-indigo-100 text-sm opacity-90 leading-relaxed">
          Your spending on <span className="text-white font-bold">Food & Dining</span> is 15% lower than last week. Good job keeping the budget!
        </p>
      </div>
    </div>
  );
}
