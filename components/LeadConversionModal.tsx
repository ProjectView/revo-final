
import React, { useState } from 'react';
import { X, HardHat, Wrench, ArrowRight, Loader2, CheckCircle, Search, UserPlus } from 'lucide-react';
import { Lead, Site, Prestation, Client } from '../types';
import { useData } from '../context/DataContext';

interface LeadConversionModalProps {
  lead: Lead | null;
  onClose: () => void;
}

const LeadConversionModal: React.FC<LeadConversionModalProps> = ({ lead, onClose }) => {
  const { clients, addSite, addPrestation, deleteLead, addClient } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'type' | 'client'>('type');
  const [selectedType, setSelectedType] = useState<'site' | 'prestation' | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);

  if (!lead) return null;

  const handleConvert = async () => {
    if (!selectedType || !selectedClientId) return;
    setIsSubmitting(true);
    
    const commonData = {
      name: lead.project,
      address: lead.address,
      clientId: selectedClientId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '17:30',
      budget: lead.budget,
      status: 'NOUVEAU' as any,
      pipelineStage: 'Nouveau' as any,
      color: selectedType === 'site' ? 'bg-emerald-700' : 'bg-blue-600',
      coordinates: (lead as any).coordinates || [45.75, 4.85] // Transmission des coordonnées
    };

    try {
      if (selectedType === 'site') {
        await addSite(commonData as any);
      } else {
        await addPrestation(commonData as any);
      }
      await deleteLead(lead.id);
      onClose();
    } catch (error) {
      console.error("Erreur de conversion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClientAndSelect = async () => {
    setIsSubmitting(true);
    try {
      const names = lead.leadName.split(' ');
      const initials = names.map(n => n[0]).join('').toUpperCase().substring(0, 2);
      
      const newClient = {
        name: lead.leadName,
        company: lead.company || 'Particulier',
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        coordinates: (lead as any).coordinates || null,
        initials,
        color: 'bg-indigo-500'
      };
      
      await addClient(newClient);
      setIsCreatingNewClient(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[110] flex flex-col animate-slide-in">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white">
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dossier Gagné !</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Conversion du prospect en opération</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {step === 'type' ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800">Choisissez le type d'opération</h3>
                <p className="text-sm text-slate-500">Comment souhaitez-vous gérer le projet "{lead.project}" ?</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { setSelectedType('site'); setStep('client'); }}
                  className="group flex items-center gap-6 p-6 border-2 border-slate-100 rounded-[2rem] hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <HardHat size={32} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800 uppercase tracking-tight">Nouveau Chantier</h4>
                    <p className="text-xs text-slate-500 mt-1">Projet complexe, suivi par étapes, planning détaillé.</p>
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-600 transition-all" />
                </button>

                <button 
                  onClick={() => { setSelectedType('prestation'); setStep('client'); }}
                  className="group flex items-center gap-6 p-6 border-2 border-slate-100 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left"
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <Wrench size={32} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800 uppercase tracking-tight">Nouvelle Prestation</h4>
                    <p className="text-xs text-slate-500 mt-1">Intervention rapide, forfait de service, maintenance.</p>
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="flex items-center gap-4 mb-2">
                  <button onClick={() => setStep('type')} className="text-slate-400 hover:text-slate-600">
                    <X size={20} className="rotate-45" />
                  </button>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">Assigner un Client</h3>
                    <p className="text-sm text-slate-500">Associez l'opération à un client de votre base.</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="relative group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500" />
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 appearance-none"
                      value={selectedClientId}
                      onChange={e => setSelectedClientId(e.target.value)}
                    >
                      <option value="">Sélectionner un client existant...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.company} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative flex items-center gap-4 py-4">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ou</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                  </div>

                  <button 
                    onClick={handleCreateClientAndSelect}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-4 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-700 text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />}
                    Créer automatiquement le client "{lead.leadName}"
                  </button>
               </div>

               <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Récapitulatif de conversion</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">Projet</span>
                    <span className="text-sm font-black text-slate-900">{lead.project}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">Budget</span>
                    <span className="text-sm font-black text-emerald-700">{lead.budget.toLocaleString()} €</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">Type</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${selectedType === 'site' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {selectedType === 'site' ? 'Chantier' : 'Prestation'}
                    </span>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white transition-all">Annuler</button>
          {step === 'client' && (
            <button 
              onClick={handleConvert}
              disabled={!selectedClientId || isSubmitting}
              className="flex-[2] py-4 px-6 bg-emerald-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:bg-emerald-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
              Confirmer la conversion
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default LeadConversionModal;
