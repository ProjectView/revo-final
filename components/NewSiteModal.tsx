
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, HardHat, MapPin, Users, Calendar as CalendarIcon, DollarSign, Layout, Clock, Loader2, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSubscription } from '../hooks/useSubscription';
import { useAddressSearch } from '../hooks/useAddressSearch';
import { Status, PipelineStage } from '../types';

interface NewSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Custom Range Date Picker Component ---
const CustomRangeDatePicker: React.FC<{
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}> = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { startOffset, totalDays };
  }, [currentMonth]);

  const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = clickedDate.toISOString().split('T')[0];

    if (!startDate || (startDate && endDate)) {
      onChange(dateStr, '');
    } else {
      const start = new Date(startDate);
      if (clickedDate < start) {
        onChange(dateStr, '');
      } else {
        onChange(startDate, dateStr);
        setIsOpen(false);
      }
    }
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date > new Date(startDate) && date < new Date(endDate);
  };

  const isStart = (day: number) => {
    if (!startDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toISOString().split('T')[0] === startDate;
  };

  const isEnd = (day: number) => {
    if (!endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toISOString().split('T')[0] === endDate;
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const formattedRange = useMemo(() => {
    if (!startDate) return "Sélectionner les dates";
    const start = new Date(startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    if (!endDate) return `Du ${start} au...`;
    const end = new Date(endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    return `Du ${start} au ${end}`;
  }, [startDate, endDate]);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Période du chantier</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 hover:bg-white hover:border-emerald-200 transition-all shadow-sm group"
      >
        <CalendarIcon size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
        <span className={!startDate ? 'text-slate-400' : ''}>{formattedRange}</span>
        <ChevronDown size={14} className="ml-auto text-slate-300" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[100] p-6 w-[320px] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1 font-black text-slate-800 capitalize">
              <span>{monthNames[currentMonth.getMonth()]}</span>
              <span className="text-slate-300 font-bold ml-1">{currentMonth.getFullYear()}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => changeMonth(-1)} type="button" className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft size={16}/></button>
              <button onClick={() => changeMonth(1)} type="button" className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={16}/></button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center mb-2">
            {weekDays.map(d => (
              <span key={d} className="text-[10px] font-black text-slate-300 uppercase">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: daysInMonth.startOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth.totalDays }).map((_, i) => {
              const day = i + 1;
              const start = isStart(day);
              const end = isEnd(day);
              const range = isInRange(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`
                    h-9 w-full relative flex items-center justify-center text-xs font-bold transition-all
                    ${start || end ? 'bg-emerald-600 text-white rounded-xl shadow-lg z-10' : ''}
                    ${range ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50 rounded-xl'}
                    ${range && i === 0 ? 'rounded-l-xl' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-2">
            <button 
              type="button" 
              onClick={() => { onChange('', ''); setIsOpen(false); }}
              className="flex-1 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
            >
              Effacer
            </button>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Custom Time Picker Component ---
const CustomTimePicker: React.FC<{ 
  value: string; 
  onChange: (val: string) => void; 
  label: string;
}> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [h, m] = value.split(':');
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white hover:border-emerald-200 transition-all shadow-sm"
      >
        <Clock size={18} className="text-slate-300" />
        {value}
        <ChevronDown size={14} className="ml-auto text-slate-300" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-[100] p-2 flex gap-1 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex-1 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
            {hours.map(hour => (
              <button
                key={hour}
                type="button"
                onClick={() => onChange(`${hour}:${m}`)}
                className={`w-full text-center py-1.5 rounded-lg text-xs font-bold transition-colors ${h === hour ? 'bg-emerald-900 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {hour}
              </button>
            ))}
          </div>
          <div className="w-px bg-slate-50 my-1" />
          <div className="flex-1">
            {minutes.map(min => (
              <button
                key={min}
                type="button"
                onClick={() => onChange(`${h}:${min}`)}
                className={`w-full text-center py-1.5 rounded-lg text-xs font-bold transition-colors ${m === min ? 'bg-emerald-500 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {min}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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

const NewSiteModal: React.FC<NewSiteModalProps> = ({ isOpen, onClose }) => {
  const { clients, addSite, checkCapacity, company, addNotification } = useData();
  const { canAddSite } = useSubscription();

  // Statuts par défaut
  const DEFAULT_STATUSES: Status[] = ['NOUVEAU', 'EN RÉVISION', 'EN COURS', 'TERMINÉ'];
  const siteStatuses = useMemo(
    () => (company?.siteStatuses && company.siteStatuses.length > 0
      ? company.siteStatuses as Status[]
      : DEFAULT_STATUSES),
    [company?.siteStatuses]
  );

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    clientId: '',
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '17:30',
    budget: '',
    status: (siteStatuses[0] || 'NOUVEAU') as Status,
    pipelineStage: 'Nouveau' as PipelineStage,
    coordinates: null as [number, number] | null,
    color: getRandomColor()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const capacityWarning = useMemo(() => {
    if (formData.startDate && formData.endDate) {
      const result = checkCapacity(formData.startDate, formData.endDate);
      return result.exceeds ? result.maxCount : null;
    }
    return null;
  }, [formData.startDate, formData.endDate, checkCapacity]);

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient && selectedClient.address) {
      setAddressSearch(selectedClient.address);
      setFormData(prev => ({ 
        ...prev, 
        clientId, 
        address: selectedClient.address!,
        coordinates: selectedClient.coordinates || null
      }));
    } else {
      setFormData(prev => ({ ...prev, clientId }));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const limitCheck = canAddSite();
      if (!limitCheck.allowed) {
        setError(`Limite atteinte: ${limitCheck.current}/${limitCheck.max} chantiers utilisés.`);
        setIsSubmitting(false);
        return;
      }

      if (capacityWarning !== null) {
        addNotification(
          `Chantier créé malgré le dépassement de capacité (${capacityWarning + 1} chantiers en simultané).`,
          'warning'
        );
      }

      await addSite({
        ...formData,
        budget: parseInt(formData.budget) || 0
      });
      onClose();
      setFormData({
        name: '', address: '', clientId: '', startDate: '', endDate: '',
        startTime: '08:00', endTime: '17:30', budget: '', status: (siteStatuses[0] || 'NOUVEAU') as Status,
        pipelineStage: 'Nouveau', coordinates: null, color: getRandomColor()
      });
      setAddressSearch('');
    } catch (error: any) {
      setError(error?.message || "Erreur lors de la création du chantier");
      console.error("Erreur lors de la création du chantier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] animate-fade-in"
        onClick={isSubmitting ? undefined : onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[90] flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
              <HardHat size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nouveau Chantier</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Configuration du projet</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {isSubmitting && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          )}

          {capacityWarning !== null && (
            <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-[2rem] flex gap-4 animate-in slide-in-from-top-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Alerte Surcharge Planning</h4>
                <p className="text-xs text-amber-700 font-bold mt-1 leading-relaxed">
                  Attention : vous dépassez votre seuil de {company?.maxSimultaneousSites} chantiers simultanés sur cette période. ({capacityWarning + 1} chantiers prévus).
                </p>
              </div>
            </div>
          )}

          <form id="new-site-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Relation Client</label>
              <div className="relative group">
                <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors z-10" />
                <select 
                  required
                  disabled={isSubmitting}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-700 relative disabled:opacity-50"
                  value={formData.clientId}
                  onChange={e => handleClientChange(e.target.value)}
                >
                  <option value="" disabled>Sélectionner un client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.company} - {client.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Informations générales</label>
              
              <div className="relative group">
                <Layout size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  disabled={isSubmitting}
                  type="text"
                  placeholder="Nom du chantier (ex: Villa Cap d'Antibes)"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-bold text-slate-800 disabled:opacity-50"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="relative group" ref={suggestionRef}>
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  disabled={isSubmitting}
                  type="text"
                  placeholder="Rechercher l'adresse (N°, rue, CP, ville...)"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all text-slate-600 font-medium disabled:opacity-50"
                  value={addressSearch}
                  onChange={e => handleAddressChange(e.target.value)}
                  autoComplete="off"
                />
                {isLoadingAddress && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-emerald-500" />
                  </div>
                )}
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectAddress(s)}
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

            <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
               <label className="text-[11px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2">
                 <Clock size={16} /> Planning opérationnel
               </label>
               
               <CustomRangeDatePicker 
                 startDate={formData.startDate} 
                 endDate={formData.endDate} 
                 onChange={(start, end) => setFormData(p => ({ ...p, startDate: start, endDate: end }))} 
               />

               <div className="grid grid-cols-2 gap-4 pt-2">
                 <CustomTimePicker 
                   label="Heure de début" 
                   value={formData.startTime} 
                   onChange={(v) => setFormData(p => ({ ...p, startTime: v }))} 
                 />
                 <CustomTimePicker 
                   label="Heure de fin prévue" 
                   value={formData.endTime} 
                   onChange={(v) => setFormData(p => ({ ...p, endTime: v }))} 
                 />
               </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Finance</label>
              <div className="relative group">
                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 transition-colors" />
                <input 
                  required
                  disabled={isSubmitting}
                  type="number"
                  placeholder="Budget estimé (€)"
                  className="w-full bg-emerald-50/30 border border-emerald-100/50 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-black text-emerald-900 placeholder:text-emerald-700/30 disabled:opacity-50"
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut production</label>
                <select
                  disabled={isSubmitting}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10 disabled:opacity-50"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as Status})}
                >
                  {siteStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Étape pipeline</label>
                <select 
                  disabled={isSubmitting}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10 disabled:opacity-50"
                  value={formData.pipelineStage}
                  onChange={e => setFormData({...formData, pipelineStage: e.target.value as PipelineStage})}
                >
                  <option value="Nouveau">Nouveau</option>
                  <option value="Qualifié">Qualifié</option>
                  <option value="Devis envoyé">Devis envoyé</option>
                  <option value="Négociation">Négociation</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            type="submit"
            form="new-site-form"
            disabled={isSubmitting}
            className="flex-[2] py-4 px-6 bg-[#1a4d44] text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
            {isSubmitting ? 'Création...' : 'Créer le chantier'}
          </button>
        </div>
      </div>
    </>
  );
};

export default NewSiteModal;
