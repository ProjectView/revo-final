import React from 'react';
import { Lock } from 'lucide-react';

export const ReadOnlyBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg border border-rose-300">
      <Lock size={14} className="shrink-0" />
      <span className="text-xs font-bold uppercase tracking-tight">Mode lecture seule</span>
    </div>
  );
};
