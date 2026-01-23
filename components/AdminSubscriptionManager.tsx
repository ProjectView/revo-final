import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '../constants';
import { ChevronDown, AlertTriangle, CheckCircle, Users, HardHat, Check } from 'lucide-react';

type PlanId = keyof typeof SUBSCRIPTION_PLANS;

interface AdminSubscriptionManagerProps {
  selectedPlanId?: string;
  onClose?: () => void;
}

export const AdminSubscriptionManager: React.FC<AdminSubscriptionManagerProps> = ({ selectedPlanId, onClose }) => {
  const { company, updateCompany, clients, sites, addNotification } = useData();
  const { planConfig, canDowngradeTo } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>((selectedPlanId as PlanId) || company?.subscription?.plan || 'artisan_solo');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    company?.subscription?.billingPeriod || 'monthly'
  );
  const [notes, setNotes] = useState(company?.subscription?.notes || '');
  const [clientsToKeep, setClientsToKeep] = useState<Set<string>>(new Set());
  const [sitesToKeep, setSitesToKeep] = useState<Set<string>>(new Set());
  const [isChanging, setIsChanging] = useState(false);

  if (!company || !selectedPlan) return null;

  const targetPlan = SUBSCRIPTION_PLANS[selectedPlan];
  const currentPlan = SUBSCRIPTION_PLANS[company.subscription?.plan || 'artisan_solo'];
  const downgradeInfo = canDowngradeTo(selectedPlan);

  // Déterminer si c'est un upgrade ou downgrade
  const isUpgrade =
    targetPlan.limits.maxClients > currentPlan.limits.maxClients ||
    targetPlan.limits.maxSites > currentPlan.limits.maxSites ||
    targetPlan.limits.maxUsers > currentPlan.limits.maxUsers;

  const isDowngrade = targetPlan.limits.maxClients < currentPlan.limits.maxClients;

  const handlePlanChange = async () => {
    try {
      setIsChanging(true);

      // En cas d'upgrade, débloquer tous les clients/chantiers
      // En cas de downgrade, utiliser la sélection de l'utilisateur
      const clientsReadOnly = isUpgrade
        ? []
        : clients.filter(c => !clientsToKeep.has(c.id)).map(c => c.id);

      const sitesReadOnly = isUpgrade
        ? []
        : sites.filter(s => !sitesToKeep.has(s.id)).map(s => s.id);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (billingPeriod === 'yearly' ? 365 : 30));

      await updateCompany({
        subscription: {
          plan: selectedPlan,
          status: 'active',
          billingPeriod,
          currentPeriodEnd: futureDate.toISOString(),
          maxClients: targetPlan.limits.maxClients,
          maxSites: targetPlan.limits.maxSites,
          maxUsers: targetPlan.limits.maxUsers,
          paymentMethod: 'manual',
          notes,
        },
        limits: {
          clientsReadOnly,
          sitesReadOnly,
        },
      });

      const message = isUpgrade
        ? `Upgrade réussi vers ${targetPlan.name}. Tous vos clients et chantiers sont à nouveau accessibles.`
        : `Plan mis à jour: ${targetPlan.name}`;

      addNotification(message, 'success');
      if (onClose) onClose();
    } catch (error) {
      addNotification('Erreur lors de la mise à jour du plan', 'error');
      console.error(error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Selection */}
      <div>
        <label className="block text-xs font-black uppercase tracking-tight text-slate-900 mb-3">
          Sélectionner un plan
        </label>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => (
            <button
              key={id}
              onClick={() => setSelectedPlan(id as PlanId)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedPlan === id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">{plan.name}</h4>
                  <p className="text-xs text-slate-600">{plan.tagline}</p>
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {plan.isFree ? 'Gratuit' : `€${plan.pricing[billingPeriod]}/mois`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Billing Period */}
      <div>
        <label className="block text-xs font-black uppercase tracking-tight text-slate-900 mb-3">
          Période de facturation
        </label>
        <div className="flex gap-3">
          {['monthly', 'yearly'].map((period) => (
            <button
              key={period}
              onClick={() => setBillingPeriod(period as 'monthly' | 'yearly')}
              className={`flex-1 px-4 py-2 rounded-lg border-2 font-bold text-xs uppercase tracking-tight transition-all ${
                billingPeriod === period
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {period === 'monthly' ? 'Mensuel' : 'Annuel'}
            </button>
          ))}
        </div>
      </div>

      {/* Upgrade Info */}
      {isUpgrade && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300">
          <div className="flex gap-3">
            <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-900 mb-1">
                Upgrade vers un plan supérieur
              </p>
              <p className="text-xs text-emerald-700">
                Tous vos clients et chantiers en lecture seule seront automatiquement débloqués.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Warning */}
      {isDowngrade && !downgradeInfo.canDowngrade && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300">
          <div className="flex gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-900 mb-2">
                Ce plan ne peut pas accueillir vos données actuelles
              </p>
              <p className="text-xs text-rose-800 mb-3">
                Veuillez sélectionner les clients et chantiers à garder actifs. Les autres passeront en lecture seule.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Clients & Sites Selection for Downgrade - Two Columns */}
      {isDowngrade && (downgradeInfo.clientsToMove > 0 || downgradeInfo.sitesToMove > 0) && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Sélectionnez les éléments à garder actifs
          </p>
          <div className="grid grid-cols-2 gap-6">
            {/* Clients Column */}
            {downgradeInfo.clientsToMove > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-blue-600" />
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    Clients ({clientsToKeep.size}/{targetPlan.limits.maxClients})
                  </p>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {clients.map((client) => {
                    const isSelected = clientsToKeep.has(client.id);
                    const canSelect = isSelected || clientsToKeep.size < targetPlan.limits.maxClients;

                    return (
                      <button
                        key={client.id}
                        onClick={() => {
                          if (!canSelect) return;
                          const newSet = new Set(clientsToKeep);
                          if (isSelected) {
                            newSet.delete(client.id);
                          } else {
                            newSet.add(client.id);
                          }
                          setClientsToKeep(newSet);
                        }}
                        disabled={!canSelect}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : canSelect
                            ? 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                            : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-slate-300'
                        }`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{client.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{client.company}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sites Column */}
            {downgradeInfo.sitesToMove > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <HardHat size={16} className="text-amber-600" />
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    Chantiers ({sitesToKeep.size}/{targetPlan.limits.maxSites})
                  </p>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {sites.map((site) => {
                    const isSelected = sitesToKeep.has(site.id);
                    const canSelect = isSelected || sitesToKeep.size < targetPlan.limits.maxSites;

                    return (
                      <button
                        key={site.id}
                        onClick={() => {
                          if (!canSelect) return;
                          const newSet = new Set(sitesToKeep);
                          if (isSelected) {
                            newSet.delete(site.id);
                          } else {
                            newSet.add(site.id);
                          }
                          setSitesToKeep(newSet);
                        }}
                        disabled={!canSelect}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50'
                            : canSelect
                            ? 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                            : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-slate-300'
                        }`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{site.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{site.address}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Notes */}
      <div>
        <label className="block text-xs font-black uppercase tracking-tight text-slate-900 mb-3">
          Notes de paiement
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Facturé le 15 de chaque mois..."
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handlePlanChange}
        disabled={isChanging}
        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold uppercase tracking-tight text-xs rounded-xl transition-colors"
      >
        {isChanging ? 'Mise à jour...' : 'Confirmer la modification'}
      </button>
    </div>
  );
};
