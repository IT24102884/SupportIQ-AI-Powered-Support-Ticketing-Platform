import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { LogOut, Plus, LayoutDashboard, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => onSelectTab(user?.role === 'agent' ? 'agent-dashboard' : 'customer-tickets')}
        >
          <Logo size="md" subtitle="AI-Powered Support Platform" />
          <span className="hidden md:inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-200">
            Groq + RAG
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          {user?.role === 'customer' ? (
            <>
              <button
                onClick={() => onSelectTab('customer-tickets')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentTab === 'customer-tickets'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>My Tickets</span>
              </button>
              <button
                onClick={() => onSelectTab('submit-ticket')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'submit-ticket'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/80'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSelectTab('agent-dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentTab === 'agent-dashboard'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Agent Queue</span>
              </button>
              <button
                onClick={() => onSelectTab('kb-articles')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentTab === 'kb-articles'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Knowledge Base</span>
              </button>
            </>
          )}
        </nav>

        {/* User Profile & Role (No role switching) */}
        <div className="flex items-center space-x-3">
          {/* Informational Role Badge */}
          <span
            className={`hidden sm:inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
              user?.role === 'agent'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}
          >
            {user?.role === 'agent' ? 'Admin / Agent' : 'Customer'}
          </span>

          {/* User profile pill */}
          <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
              {(user?.name || 'User').slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-medium text-slate-900 leading-tight">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role || 'Guest'}</div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
