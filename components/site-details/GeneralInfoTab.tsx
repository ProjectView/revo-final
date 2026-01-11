
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Clock, MessageSquare, Users, Phone, Mail, Loader2, ChevronDown } from 'lucide-react';
import { Site, Client, User } from '../../types';
import { useData } from '../../context/DataContext';
import AssignUsersModal from '../AssignUsersModal';

interface GeneralInfoTabProps {
  site: Site;
  client?: Client;
  isEditing?: boolean;
  onUpdate?: (updates: Partial<Site>) => void;
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ site, client, isEditing, onUpdate }) => {
  const { clients, users, updateSite } = useData();
  const [addressSearch, setAddressSearch] = useState(site.address);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
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

  const handleAddressChange = async (val: string) => {
    setAddressSearch(val);
    if (onUpdate) onUpdate({ address: val });
    
    if (val.length > 3) {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=5`);
        const data = await response.json();
        setSuggestions(data.features.map((f: any) => f.properties));
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

  const selectAddress = (label: string) => {
    setAddressSearch(label);
    if (onUpdate) onUpdate({ address: label });
    setShowSuggestions(false);
  };

  // Get assigned users from context data
  const assignedUsers = users.filter(u => site.assignedUserIds?.includes(u.id));

  const handleAssignUsers = async (userIds: string[]) => {
    await updateSite(site.id, { assignedUserIds: userIds });
  };

  if (isEditing) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse du chantier</label>
            <div className="relative group" ref={suggestionRef}>
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all text-slate-600 font-bold"
                value={addressSearch}
                onChange={e => handleAddressChange(e.target.value)}
              />
              {isLoadingAddress && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" />}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectAddress(s.label)}
                      className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-0"
                    >
                      <span className="text-xs font-bold text-slate-800">{s.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium uppercase">{s.postcode} {s.city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client</label>
              <div className="relative">
                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10 appearance-none"
                  value={site.clientId}
                  onChange={e => onUpdate && onUpdate({ clientId: e.target.value })}
                >
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company} - {c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget (€)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/10"
                value={site.budget}
                onChange={e => onUpdate && onUpdate({ budget: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date début</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 outline-none"
                value={site.startDate}
                onChange={e => onUpdate && onUpdate({ startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date fin</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 outline-none"
                value={site.endDate}
                onChange={e => onUpdate && onUpdate({ endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Heure début</label>
              <input 
                type="time"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 outline-none"
                value={site.startTime || '08:00'}
                onChange={e => onUpdate && onUpdate({ startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Heure fin</label>
              <input 
                type="time"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 outline-none"
                value={site.endTime || '17:30'}
                onChange={e => onUpdate && onUpdate({ endTime: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Début du chantier</label>
          <div className="flex items-center gap-3 text-slate-700">
            <Calendar size={16} className="text-emerald-600" />
            <span className="text-sm font-bold">{new Date(site.startDate).toLocaleDateString('fr-FR')}</span>
            <Clock size={16} className="text-slate-400 ml-auto" />
            <span className="text-sm font-medium">{site.startTime || '08:00'}</span>
          </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fin prévue</label>
          <div className="flex items-center gap-3 text-slate-700">
            <Calendar size={16} className="text-emerald-600" />
            <span className="text-sm font-bold">{new Date(site.endDate).toLocaleDateString('fr-FR')}</span>
            <Clock size={16} className="text-slate-400 ml-auto" />
            <span className="text-sm font-medium">{site.endTime || '17:30'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Équipe assignée</h3>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {assignedUsers.map((u) => (
              <div key={u.id} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-1 ring-slate-100" title={u.name}>
                {u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            ))}
            <button 
              onClick={() => setIsAssignModalOpen(true)}
              className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-300 transition-all"
            >
              <Users size={16} />
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium ml-2">
            {assignedUsers.length === 0 ? 'Aucun membre assigné' : `${assignedUsers.length} membre(s) assigné(s)`}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Coordonnées</h3>
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 flex items-start gap-3 border-b border-slate-50">
            <MapPin size={18} className="text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-800">{site.address}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Adresse du chantier</p>
            </div>
          </div>
          {client && (
            <div className="p-4 bg-slate-50/50 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${client.color} flex items-center justify-center text-white text-[10px] font-black shadow-sm`}>
                  {client.initials}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">{client.name}</p>
                  <p className="text-[10px] text-slate-500">{client.company}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${client.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-700 transition-all">
                  <Phone size={12} /> Appeler
                </a>
                <a href={`mailto:${client.email}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-700 transition-all">
                  <Mail size={12} /> Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Commentaires & Notes</h3>
        <div className="relative group">
          <div className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
            <MessageSquare size={18} />
          </div>
          <textarea 
            readOnly
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm text-slate-600 min-h-[120px] outline-none resize-none"
            placeholder="Pas d'instructions particulières."
            defaultValue={site.budget > 1000000 ? "Chantier majeur. Vigilance accrue sur le respect des délais." : ""}
          ></textarea>
        </div>
      </div>

      <AssignUsersModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        assignedUserIds={site.assignedUserIds || []} 
        onAssign={handleAssignUsers} 
      />
    </div>
  );
};

export default GeneralInfoTab;
