import React, { useEffect, useState } from 'react';
import { Ticket } from '../types';
import { getTicketsApi } from '../api/tickets';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Search, ArrowRight, MessageSquare } from 'lucide-react';

interface CustomerDashboardProps {
  onSelectTicket: (ticketId: string) => void;
  onGoToSubmit: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onSelectTicket,
  onGoToSubmit,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getTicketsApi({
        status: statusFilter || undefined,
      });
      setTickets(data);
    } catch (err) {
      console.error('Failed to load customer tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const filteredTickets = tickets.filter(
    (t) =>
      (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Support Tickets</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track status updates and chat directly with support agents.
          </p>
        </div>
        <button
          onClick={onGoToSubmit}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center space-x-1.5">
          {['', 'Open', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {st === '' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="mt-5">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-slate-200/80 animate-pulse" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 p-10 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-slate-800">No support tickets found</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
              {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'You have not submitted any tickets yet.'}
            </p>
            <button
              onClick={onGoToSubmit}
              className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition"
            >
              Create a Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-slate-300 hover:shadow-xs transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge type="status" value={ticket.status} />
                    <StatusBadge type="category" value={ticket.category} />
                    <StatusBadge type="priority" value={ticket.priority} />
                    <span className="text-[10px] text-slate-400 font-mono ml-1">
                      #{ticket.id.slice(0, 6)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                    {ticket.description}
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400 self-end md:self-center">
                  <span className="text-[11px]">{new Date(ticket.updated_at).toLocaleDateString()}</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-slate-100 text-slate-400 group-hover:text-slate-700 flex items-center justify-center transition">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

