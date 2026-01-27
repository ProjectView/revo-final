
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, User, Building2, Mail, Phone, DollarSign, MapPin, Search, MessageSquare, ChevronDown, Loader2, Layout } from 'lucide-react';
import { PipelineStage } from '../types';
import { useData } from '../context/DataContext';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead?: (lead: any) => void;
}

interface AddressSuggestion {
  label: string;
  id: string;
  name: string;
  postcode: string;
  city: string;
  geometry: {
    coordinates: [number, number];
  };
}

const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose }) => {
  const { company, addLead, clients } = useData();
  const stages = useMemo(() => company?.pipelineStages || ['Nouveau', 'Qualifié', 'Devis envoyé', 'Négociation', 'Gagné'], [company]);

  const [formData, setFormData] = useState({
    leadName: '',
    company: '',
    email: '',
    phone: '',
    project: '',
    budget: '',
    address: '',
    coordinates: null as [number, number] | null,
    source: 'Bouche à oreille',
    comment: '',
    stage: '',
    priority: 'Moyenne' as 'Haute' | 'Moyenne' | 'Basse',
    clientId: undefined as string | undefined
  });

  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stages.length > 0 && !formData.stage) {
      setFormData(prev => ({ ...prev, stage: stages[0] }));
    }
  }, [stages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setShowContactSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddressChange = async (val: string) => {
    setAddressSearch(val);
    setFormData(prev => ({ ...prev, address: val }));
    
    if (val.length > 3) {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=5`);
        const data = await response.json();
        setSuggestions(data.features.map((f: any) => ({ ...f.properties, geometry: f.geometry })));
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erreur recherche adresse:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectAddress = (s: AddressSuggestion) => {
    setAddressSearch(s.label);
    setFormData(prev => ({
      ...prev,
      address: s.label,
      coordinates: [s.geometry.coordinates[1], s.geometry.coordinates[0]] // [lat, lng]
    }));
    setShowSuggestions(false);
  };

  const getContactSuggestions = () => {
    const search = formData.leadName.toLowerCase().trim();
    if (!search || search.length < 1) return [];
    return clients.filter(client =>
      client.name.toLowerCase().includes(search)
    ).slice(0, 5);
  };

  const selectContact = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    setFormData(prev => ({
      ...prev,
      leadName: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      address: client.address || '',
      coordinates: client.coordinates || null,
      clientId: clientId
    }));
    setAddressSearch(client.address || '');
    setShowContactSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addLead({
        ...formData,
        budget: Number(formData.budget) || 0
      });
      onClose();
      // Reset
      setFormData({
        leadName: '', company: '', email: '', phone: '', project: '',
        budget: '', address: '', coordinates: null, source: 'Bouche à oreille', comment: '',
        stage: stages[0], priority: 'Moyenne', clientId: undefined
      });
      setAddressSearch('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[90] flex flex-col animate-slide-in">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nouvelle Opportunité</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Contact & Projet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {isSubmitting && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          )}
          <form id="new-lead-form" onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Informations Contact</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group col-span-2" ref={contactRef}>
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder="Nom du contact"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-800"
                    value={formData.leadName}
                    onChange={e => {
                      setFormData({...formData, leadName: e.target.value});
                      setShowContactSuggestions(true);
                    }}
                    onFocus={() => formData.leadName.length > 0 && setShowContactSuggestions(true)}
                  />
                  {getContactSuggestions().length > 0 && showContactSuggestions && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2">
                      {getContactSuggestions().map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => selectContact(client.id)}
                          className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-0 transition-colors"
                        >
                          <span className="text-sm font-bold text-slate-800">{client.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{client.company}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative group col-span-2">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input type="text" placeholder="Société (Facultatif)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-800"
                    value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input required type="email" placeholder="Email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-800"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="relative group">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input required type="tel" placeholder="Téléphone" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-800"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Détails du Projet</label>
              </div>
              <div className="relative group">
                <Layout size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input required type="text" placeholder="Type de travaux (ex: Rénovation salle de bain)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-800"
                  value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 transition-colors" />
                  <input required type="number" placeholder="Budget estimé (€)" className="w-full bg-emerald-50/30 border border-emerald-100/50 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-black text-emerald-900 placeholder:text-emerald-700/30"
                    value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                </div>
                <div className="relative group" ref={suggestionRef}>
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input required type="text" placeholder="Adresse" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all text-slate-600 font-medium"
                    value={addressSearch} onChange={e => handleAddressChange(e.target.value)} autoComplete="off" />
                  {isLoadingAddress && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={16} className="animate-spin text-emerald-500" /></div>}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2">
                      {suggestions.map((s, idx) => (
                        <button key={idx} type="button" onClick={() => selectAddress(s)} className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-0">
                          <span className="text-xs font-bold text-slate-800">{s.name}</span>
                          <span className="text-[9px] text-slate-400 font-medium uppercase">{s.postcode} {s.city}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Suivi & Étape</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-6 pr-10 py-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-700"
                    value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={18} /></div>
                </div>
                <div className="relative group">
                   <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-6 pr-10 py-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-700"
                    value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                    <option value="Basse">Priorité Basse</option>
                    <option value="Moyenne">Priorité Moyenne</option>
                    <option value="Haute">Priorité Haute</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={18} /></div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white transition-all">Annuler</button>
          <button type="submit" form="new-lead-form" className="flex-[2] py-4 px-6 bg-[#1a4d44] text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]">
            Créer le lead
          </button>
        </div>
      </div>
    </>
  );
};

export default NewLeadModal;
