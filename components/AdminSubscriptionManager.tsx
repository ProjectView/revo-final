import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '../constants';
import { ChevronDown, AlertTriangle, CheckCircle, Users, HardHat, Check, X, Mail } from 'lucide-react';

type PlanId = keyof typeof SUBSCRIPTION_PLANS;

interface AdminSubscriptionManagerProps {
  selectedPlanId?: string;
  onClose?: () => void;
}

export const AdminSubscriptionManager: React.FC<AdminSubscriptionManagerProps> = ({ selectedPlanId, onClose }) => {
  const { company, updateCompany, clients, sites, addNotification, users } = useData();
  const { planConfig, canDowngradeTo } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>((selectedPlanId as PlanId) || company?.subscription?.plan || 'artisan_solo');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    company?.subscription?.billingPeriod || 'monthly'
  );
  const [notes, setNotes] = useState(company?.subscription?.notes || '');
  const [clientsToKeep, setClientsToKeep] = useState<Set<string>>(new Set());
  const [sitesToKeep, setSitesToKeep] = useState<Set<string>>(new Set());
  const [isChanging, setIsChanging] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get current user email from localStorage
  const currentUserEmail = localStorage.getItem('revo_auth') || '';
  const currentUser = users.find(u => u.email.toLowerCase() === currentUserEmail.toLowerCase());

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

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (billingPeriod === 'yearly' ? 365 : 30));

      // Send webhook notification with all company info
      const webhookPayload = {
        timestamp: new Date().toISOString(),
        // User Info
        userName: currentUser?.name || 'Inconnu',
        userEmail: currentUserEmail,
        // Company Info
        companyName: company.name,
        companySiret: company.siret || '',
        companyWebsite: company.website || '',
        // Address Info
        address: company.address || '',
        postalCode: company.postalCode || '',
        city: company.city || '',
        country: company.country || 'France',
        // Billing Info
        billingFirstName: company.billingFirstName || '',
        billingLastName: company.billingLastName || '',
        billingEmail: company.billingEmail || '',
        billingPhone: company.billingPhone || '',
        taxId: company.taxId || '',
        // Plan Info
        currentPlan: currentPlan.name,
        newPlan: targetPlan.name,
        planId: selectedPlan,
        billingPeriod: billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel',
        isUpgrade,
        isDowngrade,
        notes: notes || 'Aucun commentaire',
        // Statistics
        clientsCount: clients.length,
        sitesCount: sites.length,
        usersCount: users.length,
        // Downgrade Info
        clientsToMove: isDowngrade ? Array.from(clientsToKeep) : [],
        sitesToMove: isDowngrade ? Array.from(sitesToKeep) : [],
        // Dates
        futureDate: futureDate.toLocaleDateString('fr-FR'),
        currentPeriodEnd: company.subscription?.currentPeriodEnd || '',
      };

      try {
        await fetch('https://n8n.srv800894.hstgr.cloud/webhook/6e4a8cdc-c895-4457-af44-a1632422f66c', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });
      } catch (webhookError) {
        console.error('Erreur envoi webhook:', webhookError);
        // Ne pas bloquer le processus si le webhook échoue
      }

      // Show confirmation modal instead of closing
      setShowConfirmation(true);
    } catch (error) {
      addNotification('Erreur lors de la mise à jour du plan', 'error');
      console.error(error);
    } finally {
      setIsChanging(false);
    }
  };

  // Confirmation Modal
  if (showConfirmation) {
    return (
      <>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] animate-fade-in" />
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-emerald-600" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-black text-slate-900">Demande en attente</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Votre demande de changement vers <span className="font-bold">{targetPlan.name}</span> a été enregistrée. Notre équipe examinera votre demande et vous contactera pour confirmer l'activation du nouveau plan.
              </p>
              <p className="text-xs text-slate-500 italic">
                Jusqu'à confirmation, votre plan actuel reste <span className="font-bold">{currentPlan.name}</span>
              </p>
            </div>

            {/* Details */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Plan sélectionné</span>
                <span className="text-sm font-black text-slate-900">{targetPlan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Facturation</span>
                <span className="text-sm font-black text-slate-900">{billingPeriod === 'monthly' ? 'Mensuelle' : 'Annuelle'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Entreprise</span>
                <span className="text-sm font-black text-slate-900">{company.name}</span>
              </div>
            </div>

            {/* Contact Info */}
            {currentUser && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Mail size={18} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">Nous vous contacterons à</p>
                  <p className="text-sm font-black text-blue-600">{currentUserEmail}</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => {
                setShowConfirmation(false);
                if (onClose) onClose();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-tight text-xs rounded-xl transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </>
    );
  }

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
                  {plan.isFree ? 'Gratuit' : `€${plan.pricing[billingPeriod]} HT/mois`}
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
