import React, { useState } from 'react';
import { useApp } from '../App';
import { User, Moon, Sun, Trash2, Info, ChevronRight, Github, MessageCircle, Mail, Instagram, Send } from 'lucide-react';

export default function Settings() {
  const { userName, updateUserName, isDarkMode, toggleTheme } = useApp();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    if (tempName.trim()) {
        updateUserName(tempName);
        setIsEditingName(false);
    }
  };

  const handleResetData = () => {
      if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
          localStorage.clear();
          window.location.reload();
      }
  };

  return (
    <div className="pb-24 pt-8 px-6 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Profile</h2>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Display Name</p>
                        {isEditingName ? (
                            <div className="flex items-center gap-2 mt-1">
                                <input 
                                    type="text" 
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="border-b border-indigo-500 bg-transparent outline-none text-slate-800 dark:text-white font-bold w-32"
                                    autoFocus
                                />
                                <button onClick={handleSaveName} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Save</button>
                            </div>
                        ) : (
                            <p className="text-lg font-bold text-slate-800 dark:text-white cursor-pointer hover:text-indigo-600" onClick={() => setIsEditingName(true)}>
                                {userName}
                            </p>
                        )}
                    </div>
                </div>
                {!isEditingName && (
                    <button onClick={() => setIsEditingName(true)} className="text-slate-400 hover:text-indigo-600">
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </section>

        {/* Appearance */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white">Dark Mode</span>
                </div>
                <button 
                    onClick={toggleTheme}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>
        </section>

        {/* Contact & Support */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Contact & Support</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
                <a href="https://wa.me/917873709837" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group">
                    <MessageCircle className="text-green-600 mb-1 group-hover:scale-110 transition-transform" size={24} />
                    <span className="text-xs font-bold text-green-700 dark:text-green-400">WhatsApp</span>
                </a>
                <a href="mailto:kiranbehera2001@gmail.com" className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group">
                    <Mail className="text-blue-600 mb-1 group-hover:scale-110 transition-transform" size={24} />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Email</span>
                </a>
                <a href="https://instagram.com/kiran___kumar_" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors group">
                    <Instagram className="text-pink-600 mb-1 group-hover:scale-110 transition-transform" size={24} />
                    <span className="text-xs font-bold text-pink-700 dark:text-pink-400">Instagram</span>
                </a>
                <a href="https://github.com/kiran-devhub" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
                    <Github className="text-slate-700 dark:text-slate-300 mb-1 group-hover:scale-110 transition-transform" size={24} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">GitHub</span>
                </a>
            </div>

            {/* Report Form (Mailto fallback) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase">Report Issue / Feedback</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const msg = (e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement).value;
                    window.location.href = `mailto:kiranbehera2001@gmail.com?subject=Rupya App Feedback&body=${encodeURIComponent(msg)}`;
                }}>
                    <textarea 
                        name="message"
                        className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 resize-none mb-2"
                        rows={3}
                        placeholder="Describe your issue or suggestion..."
                        required
                    ></textarea>
                    <button type="submit" className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform">
                        <Send size={14} /> Send Message
                    </button>
                </form>
            </div>
        </section>

        {/* Account Actions */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Data Management</h2>
            
            <button onClick={handleResetData} className="w-full flex items-center justify-between group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500">
                        <Trash2 size={20} />
                    </div>
                    <div className="text-left">
                        <span className="font-medium text-red-600 dark:text-red-400 block">Reset All Data</span>
                    </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-red-500 transition-colors" />
            </button>
        </section>

        {/* About */}
        <section className="p-4 text-center">
            <h3 className="font-bold text-slate-800 dark:text-white">Rupya Manager</h3>
            <p className="text-xs text-slate-500 mb-4">v1.1.0 • Local Edition</p>
            <div className="flex justify-center items-center gap-2">
                 <span className="text-[10px] text-slate-400">Developed with ❤️ by Kiran Kumar Behera</span>
            </div>
        </section>
      </div>
    </div>
  );
}
