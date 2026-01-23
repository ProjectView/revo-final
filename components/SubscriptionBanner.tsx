import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export const SubscriptionBanner: React.FC = () => {
  const { planConfig, getUsagePercentage, isUnlimited } = useSubscription();

  // Check if we're close to limits (>80%)
  const clientUsage = getUsagePercentage('clients');
  const siteUsage = getUsagePercentage('sites');
  const userUsage = getUsagePercentage('users');

  const closeToLimit = clientUsage > 80 || siteUsage > 80 || userUsage > 80;
  const atLimit = clientUsage === 100 || siteUsage === 100 || userUsage === 100;

  if (!closeToLimit && !atLimit) return null;

  const getMessage = () => {
    if (atLimit) {
      const limits = [];
      if (clientUsage === 100) limits.push('clients');
      if (siteUsage === 100) limits.push('chantiers');
      if (userUsage === 100) limits.push('utilisateurs');
      return `Limite atteinte pour: ${limits.join(', ')}. Upgradez pour continuer.`;
    }
    const close = [];
    if (clientUsage > 80) close.push('clients');
    if (siteUsage > 80) close.push('chantiers');
    if (userUsage > 80) close.push('utilisateurs');
    return `Vous approchez de la limite pour: ${close.join(', ')}.`;
  };

  return (
    <div className={`px-4 py-3 rounded-xl border flex items-start gap-3 ${
      atLimit
        ? 'bg-rose-50 border-rose-300 text-rose-900'
        : 'bg-amber-50 border-amber-300 text-amber-900'
    }`}>
      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-tight mb-1">
          {atLimit ? 'Limite atteinte' : 'Attention'}
        </p>
        <p className="text-xs font-medium leading-relaxed">{getMessage()}</p>
      </div>
      <button className="shrink-0 px-3 py-1.5 text-xs font-bold uppercase tracking-tight rounded-lg bg-white/50 hover:bg-white/100 transition-colors">
        Upgrader
      </button>
    </div>
  );
};
