import React, { useState } from 'react';
import { createTicketApi } from '../api/tickets';
import { TicketDetail } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Bot, Sparkles, Send, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface SubmitTicketProps {
  onBack: () => void;
  onTicketCreated: (ticketId: string) => void;
}

export const SubmitTicket: React.FC<SubmitTicketProps> = ({ onBack, onTicketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<TicketDetail | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const ticket = await createTicketApi({
        title: title.trim(),
        description: description.trim(),
      });
      setCreatedTicket(ticket);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-5 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to my tickets</span>
      </button>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6">
        {!createdTicket ? (
          <>
            <div className="mb-5 pb-4 border-b border-slate-100">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Submit a Support Ticket</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Describe what you are experiencing. Our AI triage system will automatically classify and prioritize your ticket.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cannot download invoice for October"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Please describe your issue in detail. Include relevant URLs, error messages, or transaction IDs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 leading-relaxed"
                />
              </div>

              {/* AI Triage Banner */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex items-start space-x-2.5">
                <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Automated Triage: </span>
                  Groq LLM will classify Category (<span className="font-medium text-purple-700">Billing</span>, <span className="font-medium text-cyan-800">Technical</span>, or <span className="font-medium text-indigo-700">General</span>) and calculate Priority immediately upon submission.
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !description.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium text-xs rounded-lg shadow-sm transition"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      <span>Submitting & Triaging...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200/80">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Ticket Submitted</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your inquiry has been received and prioritized by our AI classifier.
            </p>

            <div className="my-5 max-w-sm mx-auto bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-left space-y-2">
              <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Classification Result</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Category:</span>
                <StatusBadge type="category" value={createdTicket.category} />
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Priority:</span>
                <StatusBadge type="priority" value={createdTicket.priority} />
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2.5">
              <button
                onClick={() => onTicketCreated(createdTicket.id)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-sm transition"
              >
                View Ticket
              </button>
              <button
                onClick={() => {
                  setCreatedTicket(null);
                  setTitle('');
                  setDescription('');
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
              >
                Submit Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
