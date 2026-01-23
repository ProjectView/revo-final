
import React, { useState, useEffect, useRef } from 'react';
import { X, User, Building2, Mail, Phone, MapPin, Save, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: any) => Promise<void>;
}

interface AddressSuggestion {
  label: string;
  score: number;
  id: string;
  name: string;
  postcode: string;
  city: string;
  geometry: {
    coordinates: [number, number];
  };
}

const COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 
  'bg-rose-500', 'bg-amber-500', 'bg-slate-500', 'bg-cyan-500'
];

const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onSave }) => {
  const { canAddClient } = useSubscription();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    coordinates: null as [number, number] | null,
    initials: '',
    color: COLORS[0],
    type: 'pro' as 'pro' | 'particulier'
  });

  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (formData.name) {
      const names = formData.name.trim().split(' ');
      let initials = names[0].charAt(0).toUpperCase();
      if (names.length > 1) {
        initials += names[names.length - 1].charAt(0).toUpperCase();
      }
      setFormData(prev => ({ ...prev, initials }));
    } else {
      setFormData(prev => ({ ...prev, initials: '?' }));
    }
  }, [formData.name]);

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
      coordinates: [s.geometry.coordinates[1], s.geometry.coordinates[0]]
    }));
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const limitCheck = canAddClient();
      if (!limitCheck.allowed) {
        setError(`Limite atteinte: ${limitCheck.current}/${limitCheck.max} clients utilisés.`);
        setIsSubmitting(false);
        return;
      }

      const clientData = {
        name: formData.name,
        company: formData.type === 'particulier' ? 'Particulier' : (formData.company || 'Société'),
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        coordinates: formData.coordinates,
        initials: formData.initials,
        color: formData.color
      };
      await onSave(clientData);
      setFormData({
        name: '', company: '', email: '', phone: '', address: '', coordinates: null,
        initials: '', color: COLORS[0], type: 'pro'
      });
      setAddressSearch('');
      onClose();
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[160] flex flex-col animate-slide-in">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nouveau Client</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Ajouter à votre base de contacts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 py-4">
            <div className={`w-24 h-24 rounded-[2.5rem] ${formData.color} flex items-center justify-center text-white text-3xl font-black shadow-2xl transition-all duration-500 transform hover:scale-105 ring-8 ring-slate-50`}>
              {formData.initials}
            </div>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button 
                  key={c} 
                  type="button"
                  onClick={() => setFormData({...formData, color: c})}
                  className={`w-6 h-6 rounded-lg ${c} border-2 transition-all ${formData.color === c ? 'border-emerald-900 scale-125 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                />
              ))}
            </div>
          </div>

          <form id="new-client-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'pro'})}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'pro' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-400'}`}
              >
                Professionnel
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'particulier'})}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'particulier' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-400'}`}
              >
                Particulier
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    required type="text" placeholder="ex: Sylvain Cuculiere"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all outline-none"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {formData.type === 'pro' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Société</label>
                  <div className="relative group">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      required type="text" placeholder="ex: SOA AGENCEMENT"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all outline-none"
                      value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2" ref={suggestionRef}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse</label>
                <div className="relative group">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" placeholder="Rechercher une adresse..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all outline-none"
                    value={addressSearch} onChange={e => handleAddressChange(e.target.value)}
                    autoComplete="off"
                  />
                  {isLoadingAddress && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" />}
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                      {suggestions.map((s, i) => (
                        <button
                          key={i} type="button" onClick={() => selectAddress(s)}
                          className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex flex-col gap-0.5 transition-colors border-b border-slate-50 last:border-0"
                        >
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      required type="email" placeholder="email@test.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all outline-none"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                  <div className="relative group">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      required type="tel" placeholder="06 00 00 00 00"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all outline-none"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-all active:scale-95"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            form="new-client-form" 
            disabled={isSubmitting}
            className="flex-[2] py-4 px-6 bg-[#1a4d44] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} />
                Ajouter le Client
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default NewClientModal;
