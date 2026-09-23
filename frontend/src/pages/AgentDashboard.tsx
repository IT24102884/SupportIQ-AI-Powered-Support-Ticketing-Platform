import React, { useEffect, useState } from 'react';
import { Ticket } from '../types';
import { getTicketsApi } from '../api/tickets';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  AlertCircle,
  Inbox,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface AgentDashboardProps {
  onSelectTicket: (ticketId: string) => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ onSelectTicket }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getTicketsApi({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setTickets(data);
    } catch (err) {
      console.error('Failed to load agent tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter]);

  const totalCount = tickets.length;
  const highPriorityCount = tickets.filter((t) => t.priority === 'High' && t.status !== 'Resolved').length;
  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const filteredTickets = tickets.filter(
    (t) =>
      (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Support Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming tickets automatically prioritized by AI and resolve with RAG suggestions.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Queue updated in real-time</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">All Tickets</span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">High Priority</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">{highPriorityCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Open / Unassigned</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{openCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Resolved</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{resolvedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, customers, emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Category filters */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="">All Categories</option>
            <option value="Billing">Billing</option>
            <option value="Technical">Technical</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Ticket Queue List */}
      <div className="mt-5">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-slate-200/80 animate-pulse" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-500">
            No tickets match your filters.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTickets.map((ticket) => {
              const isHigh = ticket.priority === 'High' && ticket.status !== 'Resolved';
              return (
                <div
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket.id)}
                  className={`bg-white rounded-xl border transition cursor-pointer p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group ${
                    isHigh
                      ? 'border-rose-200/80 hover:border-rose-300 hover:shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge type="priority" value={ticket.priority} />
                      <StatusBadge type="category" value={ticket.category} />
                      <StatusBadge type="status" value={ticket.status} />
                      <span className="text-[10px] text-slate-400 font-mono ml-1">
                        #{ticket.id.slice(0, 6)}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                      {ticket.title}
                    </h3>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span className="text-slate-600 font-medium">{ticket.customer?.name}</span>
                      <span>•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      {ticket.agent ? (
                        <>
                          <span>•</span>
                          <span className="text-slate-500">Assigned: {ticket.agent.name}</span>
                        </>
                      ) : (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 font-medium">Unassigned</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-center">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-slate-100 text-slate-400 group-hover:text-slate-700 flex items-center justify-center transition">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
