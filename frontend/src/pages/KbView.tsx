import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KBArticle } from '../types';
import {
  getKbArticlesApi,
  createKbArticleApi,
  deleteKbArticleApi,
  syncKbVectorsApi,
} from '../api/kb';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  Layers,
  Database,
  Plus,
  Trash2,
  X,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const KbView: React.FC = () => {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';

  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await getKbArticlesApi(categoryFilter || undefined);
      setArticles(data);
    } catch (err) {
      console.error('Failed to load KB articles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter]);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      setModalError(null);
      const newArticle = await createKbArticleApi({
        title: title.trim(),
        category,
        content: content.trim(),
      });
      setArticles((prev) => [newArticle, ...prev]);
      setIsAddModalOpen(false);
      setTitle('');
      setContent('');
      setCategory('General');
      setSyncNotification(`Successfully embedded "${newArticle.title}" into ChromaDB.`);
      setTimeout(() => setSyncNotification(null), 4000);
    } catch (err: any) {
      setModalError(
        err.response?.data?.detail || 'Failed to create and embed article. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${articleTitle}"?\n\nThis will remove it from both PostgreSQL and the ChromaDB vector index.`
      )
    ) {
      return;
    }

    try {
      await deleteKbArticleApi(articleId);
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
      setSyncNotification(`Deleted "${articleTitle}" from vector index.`);
      setTimeout(() => setSyncNotification(null), 3000);
    } catch (err: any) {
      alert('Failed to delete article: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleSyncVectors = async () => {
    try {
      setSyncing(true);
      const res = await syncKbVectorsApi();
      setSyncNotification(res.message);
      setTimeout(() => setSyncNotification(null), 4000);
    } catch (err: any) {
      alert('Vector sync failed: ' + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Knowledge Base & Vector Store
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/80 flex items-center space-x-1">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>ChromaDB Synchronized</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Reference documents embedded as dense vectors. When support agents generate AI suggestions, the RAG engine performs semantic similarity search across these articles to synthesize accurate answers.
          </p>
        </div>

        {/* Action Buttons for Agents */}
        {isAgent && (
          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <button
              onClick={handleSyncVectors}
              disabled={syncing}
              title="Re-index and verify all articles in ChromaDB"
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 shadow-2xs transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Vectors'}</span>
            </button>

            <button
              onClick={() => {
                setModalError(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Knowledge Article</span>
            </button>
          </div>
        )}
      </div>

      {/* Sync Alert Banner */}
      {syncNotification && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{syncNotification}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['', 'Billing', 'Technical', 'General', 'Account'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat === '' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Count & Metrics */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filtered.length} of {articles.length} indexed articles
        </span>
      </div>

      {/* Articles Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            No knowledge base articles match your search or filter criteria.
          </div>
        ) : (
          filtered.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl border border-slate-200/85 p-5 shadow-2xs hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <StatusBadge type="category" value={art.category} />
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{art.id.slice(0, 6)}
                    </span>
                    {isAgent && (
                      <button
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        title="Delete article and remove vector embedding"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-slate-900 mb-2 leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed font-normal">
                  {art.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-slate-600 font-medium">ChromaDB Vector</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  kb_{art.id.slice(0, 8)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Article Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 sm:p-7 relative my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Add Knowledge Base Article
                  </h3>
                  <p className="text-xs text-slate-500">
                    Automatically indexed and embedded for RAG Copilot suggestions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner */}
            {modalError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateArticle} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Enterprise Billing & Wire Transfer Instructions"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                >
                  <option value="Billing">Billing</option>
                  <option value="Technical">Technical</option>
                  <option value="General">General</option>
                  <option value="Account">Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Article Content / Guidelines
                </label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide complete documentation, troubleshooting steps, or business policy. The AI Copilot uses this exact text to answer customer tickets."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed transition"
                />
              </div>

              {/* Embedding Info Badge */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start space-x-2 text-indigo-900 text-xs">
                <Layers className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="font-semibold text-indigo-950">Real-Time Vector Embedding:</strong> Upon saving, this article is instantaneously embedded into ChromaDB with dense cosine vectors and linked to the Groq RAG suggestion engine.
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !content.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-xl shadow-sm transition"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Indexing Article...' : 'Save & Embed Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
