import React from 'react';
import { RAGSuggestion } from '../types';
import { Sparkles, Check, Copy, BookOpen, CornerDownLeft, RefreshCw } from 'lucide-react';

interface AiSuggestionBoxProps {
  suggestion: RAGSuggestion | null;
  isLoading: boolean;
  onApply: (text: string) => void;
  onRequestNew: () => void;
}

export const AiSuggestionBox: React.FC<AiSuggestionBoxProps> = ({
  suggestion,
  isLoading,
  onApply,
  onRequestNew,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (suggestion?.suggested_reply) {
      navigator.clipboard.writeText(suggestion.suggested_reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-800 font-medium text-xs mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
          <span>Searching ChromaDB vector store & generating Groq response...</span>
        </div>
        <div className="space-y-2 animate-pulse">
          <div className="h-3.5 bg-slate-200 rounded w-4/5"></div>
          <div className="h-3.5 bg-slate-200 rounded w-full"></div>
          <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900">AI Support Copilot</h4>
            <p className="text-[11px] text-slate-500">
              Retrieve relevant documentation from ChromaDB and draft an answer with Groq.
            </p>
          </div>
        </div>
        <button
          onClick={onRequestNew}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-sm transition self-end sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Get AI Suggestion</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Copilot Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-900">AI Suggested Draft</span>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-200/60">
            {suggestion.model_used}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopy}
            title="Copy draft to clipboard"
            className="inline-flex items-center space-x-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-medium rounded border border-slate-200 transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={onRequestNew}
            title="Regenerate suggestion"
            className="inline-flex items-center space-x-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-medium rounded border border-slate-200 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Suggested Reply Content */}
      <div className="p-4 bg-slate-50/40">
        <div className="whitespace-pre-wrap text-xs text-slate-800 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200 font-sans shadow-2xs">
          {suggestion.suggested_reply}
        </div>

        {/* Action Button: Apply to Composer */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onApply(suggestion.suggested_reply)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-sm transition"
          >
            <CornerDownLeft className="w-3.5 h-3.5 text-sky-400" />
            <span>Use this draft in reply</span>
          </button>
        </div>
      </div>

      {/* Retrieved sources */}
      {suggestion.sources && suggestion.sources.length > 0 && (
        <div className="px-4 py-2.5 bg-white border-t border-slate-200">
          <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-500 mb-2">
            <BookOpen className="w-3 h-3 text-slate-400" />
            <span>Retrieved Knowledge Base sources ({suggestion.sources.length} matching):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {suggestion.sources.map((src, idx) => (
              <div
                key={idx}
                className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200/80 flex items-start justify-between gap-1.5"
              >
                <div className="truncate">
                  <div className="font-medium text-slate-800 truncate" title={src.title}>{src.title}</div>
                  <div className="text-[10px] text-slate-400">{src.category}</div>
                </div>
                {src.similarity_score !== undefined && (
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200/60 flex-shrink-0">
                    {Math.round(src.similarity_score * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
