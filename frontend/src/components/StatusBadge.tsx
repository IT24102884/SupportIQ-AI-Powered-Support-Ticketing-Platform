import React from 'react';
import { TicketCategory, TicketPriority, TicketStatus } from '../types';

interface StatusBadgeProps {
  type: 'status' | 'priority' | 'category';
  value: TicketStatus | TicketPriority | TicketCategory | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  if (type === 'status') {
    switch (value) {
      case 'Open':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
            Open
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200/80">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
            Resolved
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">{value}</span>;
    }
  }

  if (type === 'priority') {
    switch (value) {
      case 'High':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500"></span>
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50/70 text-amber-700 border border-amber-200/60">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Low
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">{value}</span>;
    }
  }

  // Category
  switch (value) {
    case 'Billing':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/80">
          <span className="mr-1">💳</span> Billing
        </span>
      );
    case 'Technical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-cyan-50 text-cyan-800 border border-cyan-200/80">
          <span className="mr-1">⚙️</span> Technical
        </span>
      );
    case 'General':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80">
          <span className="mr-1">💬</span> General
        </span>
      );
  }
};
