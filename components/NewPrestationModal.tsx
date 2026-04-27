
import React, { useState } from 'react';
import { X, Wrench, MapPin, Users, DollarSign, Layout, Clock, Loader2, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Status, PipelineStage } from '../types';
import { useAddressSearch } from '../hooks/useAddressSearch';

interface NewPrestationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Palette de couleurs (sans rouge pour éviter "invalidé")
const COLOR_PALETTE = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-teal-600',
  'bg-orange-600',
  'bg-pink-600',
  'bg-lime-600',
  'bg-sky-600',
  'bg-slate-700'
];

const getRandomColor = (): string => {
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
};

const NewPrestationModal: React.FC<NewPrestationModalProps> = ({ isOpen, onClose }) => {
  const { clients, addPrestation, company } = useData();
  const DEFAULT_STATUSES: Status[] = ['NOUVEAU', 'EN RÉVISION', 'EN COURS', 'TERMINÉ'];
  const firstStatus = (company?.prestationStatuses && company.prestationStatuses.length > 0
    ? company.prestationStatuses[0]
    : DEFAULT_STATUSES[0]) as Status;
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    clientId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '17:30',
    budget: '',
    status: firstStatus,
    pipelineStage: 'Nouveau' as PipelineStage,
    coordinates: null as [number, number] | null,
    color: getRandomColor()
  });

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setFormData(prev => ({ ...prev, clientId }));
    if (selectedClient?.address) {
      setAddressSearch(selectedClient.address);
      setFormData(prev => ({
        ...prev,
        clientId,
        address: selectedClient.address || '',
        coordinates: selectedClient.coordinates || null
      }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    addressSearch,
    setAddressSearch,
    suggestions,
    isLoadingAddress,
    showSuggestions,
    suggestionRef,
    handleAddressChange,
    selectAddress,
  } = useAddressSearch({
    onChange: (val) => setFormData(prev => ({ ...prev, address: val })),
    onSelect: (s) => setFormData(prev => ({
      ...prev,
      address: s.label,
      coordinates: [s.geometry.coordinates[1], s.geometry.coordinates[0]],
    })),
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addPrestation({
        ...formData,
        budget: parseInt(formData.budget) || 0,
        coordinates: formData.coordinates || [45.75, 4.85]
      });
      onClose();
      setFormData({
        name: '', address: '', clientId: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0],
        startTime: '08:00', endTime: '17:30', budget: '', status: firstStatus,
        pipelineStage: 'Nouveau', coordinates: null, color: getRandomColor()
      });
      setAddressSearch('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[90] flex flex-col animate-slide-in">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white">
              <Wrench size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nouvelle Prestation</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Service ou intervention rapide</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {isSubmitting && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          )}
          <form id="new-prestation-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Client</label>
              <select required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10"
                value={formData.clientId} onChange={e => handleClientChange(e.target.value)}>
                <option value="">Choisir un client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company} - {c.name}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Détails</label>
              <input required type="text" placeholder="Nom de l'intervention" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <div className="relative group" ref={suggestionRef}>
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required 
                  type="text" 
                  placeholder="Adresse d'intervention" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-sm font-medium"
                  value={addressSearch} 
                  onChange={e => handleAddressChange(e.target.value)}
                  autoComplete="off" 
                />
                {isLoadingAddress && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={16} className="animate-spin text-emerald-500" /></div>}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                    {suggestions.map((s) => (
                      <button key={s.id} type="button" onClick={() => selectAddress(s)} className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-0 transition-colors">
                        <span className="text-sm font-bold text-slate-800">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">{s.postcode} {s.city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                <input required type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold"
                  value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget (€)</label>
                <input required type="number" placeholder="Budget" className="w-full bg-emerald-50/30 border border-emerald-100/50 rounded-2xl px-4 py-3 text-xs font-black text-emerald-900"
                  value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600">Annuler</button>
          <button type="submit" form="new-prestation-form" className="flex-[2] py-4 bg-[#1a4d44] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg">Créer la prestation</button>
        </div>
      </div>
    </>
  );
};

export default NewPrestationModal;
