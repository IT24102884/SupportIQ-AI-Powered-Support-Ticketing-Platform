import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TicketDetail as ITicketDetail,
  RAGSuggestion,
  TicketStatus,
} from '../types';
import {
  getTicketDetailApi,
  updateTicketApi,
  postMessageApi,
  getAiSuggestionApi,
} from '../api/tickets';
import { StatusBadge } from '../components/StatusBadge';
import { AiSuggestionBox } from '../components/AiSuggestionBox';
import {
  ArrowLeft,
  Send,
  Sparkles,
  AlertCircle,
  X,
  MessageSquare,
  Clock,
  Shield,
} from 'lucide-react';

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

const formatMessageTime = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today at ${time}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${time}`;
  } catch {
    return dateStr;
  }
};

export const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, onBack }) => {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';

  const [ticket, setTicket] = useState<ITicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Message composer
  const [replyText, setReplyText] = useState('');
  const [isAiSuggested, setIsAiSuggested] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // RAG Suggestion state
  const [suggestion, setSuggestion] = useState<RAGSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const data = await getTicketDetailApi(ticketId);
      setTicket(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    try {
      const updated = await updateTicketApi(ticket.id, { status: newStatus });
      setTicket((prev) => (prev ? { ...prev, status: updated.status } : null));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleClaimTicket = async () => {
    if (!ticket || !user) return;
    try {
      const updated = await updateTicketApi(ticket.id, { agent_id: user.id });
      setTicket((prev) => (prev ? { ...prev, agent_id: updated.agent_id, agent: user } : null));
    } catch (err) {
      console.error('Failed to assign ticket', err);
    }
  };

  const handleRequestSuggestion = async () => {
    if (!ticket) return;
    try {
      setLoadingSuggestion(true);
      const data = await getAiSuggestionApi(ticket.id);
      setSuggestion(data);
    } catch (err) {
      console.error('Failed to get AI suggestion', err);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  // Dynamically auto-expand the reply textarea so long messages/AI drafts are fully visible
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const minHeight = isAgent ? (replyText ? 240 : 130) : 90;
      const targetHeight = Math.max(minHeight, textareaRef.current.scrollHeight);
      textareaRef.current.style.height = `${targetHeight}px`;
    }
  }, [replyText, isAgent]);

  const handleApplySuggestion = (text: string) => {
    setReplyText(text);
    setIsAiSuggested(true);
    setTimeout(() => {
      const composer = document.getElementById('reply-composer');
      composer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollTop = 0;
      }
    }, 80);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticket) return;

    try {
      setSendingMessage(true);
      const newMsg = await postMessageApi(ticket.id, replyText.trim(), isAiSuggested);
      setTicket((prev) => (prev ? { ...prev, messages: [...prev.messages, newMsg] } : null));
      setReplyText('');
      setIsAiSuggested(false);
    } catch (err: any) {
      alert('Failed to send message: ' + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-56 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2.5" />
        <h3 className="text-sm font-semibold text-slate-900">Error Loading Ticket</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'Ticket not found.'}</p>
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-5 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to tickets</span>
      </button>

      {/* Ticket Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <StatusBadge type="priority" value={ticket.priority} />
              <StatusBadge type="category" value={ticket.category} />
              <StatusBadge type="status" value={ticket.status} />
              <span className="text-[10px] font-mono text-slate-400 ml-1">
                #{ticket.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">{ticket.title}</h1>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span className="text-slate-600 font-medium">{ticket.customer?.name}</span>
              <span>({ticket.customer?.email})</span>
              <span>•</span>
              <span>{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Quick status & assignment controls */}
          <div className="flex flex-wrap items-center gap-2">
            {isAgent ? (
              <>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-medium bg-white text-slate-700 focus:outline-none focus:border-slate-400"
                >
                  <option value="Open">Status: Open</option>
                  <option value="In Progress">Status: In Progress</option>
                  <option value="Resolved">Status: Resolved</option>
                </select>

                {!ticket.agent_id ? (
                  <button
                    onClick={handleClaimTicket}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition"
                  >
                    Claim Ticket
                  </button>
                ) : (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium">
                    Assigned: {ticket.agent?.name}
                  </span>
                )}
              </>
            ) : (
              ticket.status !== 'Resolved' && (
                <button
                  onClick={() => handleStatusChange('Resolved')}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium transition"
                >
                  Mark as Resolved
                </button>
              )
            )}
          </div>
        </div>

      </div>

      {/* Agent RAG Assistant Panel */}
      {isAgent && (
        <div className="mb-6">
          <AiSuggestionBox
            suggestion={suggestion}
            isLoading={loadingSuggestion}
            onApply={handleApplySuggestion}
            onRequestNew={handleRequestSuggestion}
          />
        </div>
      )}

      {/* Message Thread */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">Conversation Thread</h3>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
            {ticket.messages.length} {ticket.messages.length === 1 ? 'Message' : 'Messages'}
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5 bg-gradient-to-b from-slate-50/20 to-white">
          {ticket.messages.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No messages in this ticket yet.
            </div>
          ) : (
            ticket.messages.map((msg, index) => {
              const isFromCurrent = msg.sender_id === user?.id;
              const isAgentMsg = msg.sender?.role === 'agent';
              const isFirst = index === 0;

              return (
                <div key={msg.id || index} className="flex items-start space-x-3.5">
                  {/* Sender Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-2xs ${
                      isAgentMsg
                        ? 'bg-indigo-600 text-white shadow-indigo-100'
                        : 'bg-slate-800 text-white shadow-slate-100'
                    }`}
                  >
                    {isAgentMsg ? (
                      <Shield className="w-4 h-4 text-white" />
                    ) : (
                      (msg.sender?.name || 'User').slice(0, 2).toUpperCase()
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className="flex-1 min-w-0">
                    {/* Header: Name, Role Badge, AI Badge, Timestamp */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-semibold text-xs text-slate-900">
                        {msg.sender?.name || (isFromCurrent ? 'You' : 'User')}
                      </span>

                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          isAgentMsg
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                            : isFirst
                            ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isAgentMsg
                          ? 'Support Staff'
                          : isFirst
                          ? 'Customer • Original Inquiry'
                          : 'Customer'}
                      </span>

                      {msg.is_ai_suggested && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          <span>AI Copilot Draft</span>
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 ml-auto flex items-center space-x-1 font-normal">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>{formatMessageTime(msg.created_at)}</span>
                      </span>
                    </div>

                    {/* Bubble Card */}
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border transition-all ${
                        isAgentMsg
                          ? 'bg-indigo-50/50 border-indigo-100 text-slate-900 font-normal shadow-2xs'
                          : 'bg-white border-slate-200/90 text-slate-800 font-normal shadow-2xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reply Composer */}
      <div id="reply-composer" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
        <form onSubmit={handleSendMessage} className="space-y-3.5">
          {/* Composer Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-800">
                {isAgent ? 'Compose Agent Response' : 'Reply to Support'}
              </span>
              {isAiSuggested && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>AI Recommendation Inserted</span>
                </span>
              )}
            </div>
            {replyText && (
              <button
                type="button"
                onClick={() => {
                  setReplyText('');
                  setIsAiSuggested(false);
                }}
                className="inline-flex items-center space-x-1 text-[11px] text-slate-400 hover:text-rose-600 transition"
                title="Clear current text"
              >
                <X className="w-3 h-3" />
                <span>Clear text</span>
              </button>
            )}
          </div>

          {/* Spacious, Auto-Expanding Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={isAgent ? 8 : 4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                isAgent
                  ? "Write your response, or click 'Get AI Suggestion' above to generate an answer with Groq & ChromaDB..."
                  : "Type your message..."
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed resize-y bg-slate-50/50 focus:bg-white transition-all font-sans"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center space-x-3">
              {isAgent && (
                <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAiSuggested}
                    onChange={(e) => setIsAiSuggested(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] font-medium">Mark as AI-assisted</span>
                </label>
              )}
              <span className="text-[10px] text-slate-400">
                {replyText ? `${replyText.length} characters` : ''}
              </span>
            </div>

            <button
              type="submit"
              disabled={sendingMessage || !replyText.trim()}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-medium text-xs rounded-xl shadow-sm transition"
            >
              <Send className="w-3 h-3" />
              <span>{sendingMessage ? 'Sending...' : 'Send Reply'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
