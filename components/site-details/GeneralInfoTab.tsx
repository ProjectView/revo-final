
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, MapPin, Clock, MessageSquare, Users, Phone, Mail, Loader2, ChevronDown, AlertTriangle, Send } from 'lucide-react';
import { Site, Client, SiteComment } from '../../types';
import { useData } from '../../context/DataContext';

interface GeneralInfoTabProps {
  site: Site;
  client?: Client;
  isEditing?: boolean;
  onUpdate?: (updates: Partial<Site>) => void;
  onOpenAssignModal?: () => void;
}

interface AddressSuggestion {
  label: string;
  name: string;
  postcode: string;
  city: string;
  geometry: {
    coordinates: [number, number];
  };
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ site, client, isEditing, onUpdate, onOpenAssignModal }) => {
  const { clients, users, checkCapacity, company, addSiteComment, getSiteComments } = useData();
  const [addressSearch, setAddressSearch] = useState(site.address);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [comments, setComments] = useState<SiteComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (site.id) {
      const unsub = getSiteComments(site.id, setComments);
      return () => unsub();
    }
  }, [site.id]);

  const capacityWarning = useMemo(() => {
    if (site.startDate && site.endDate) {
      const result = checkCapacity(site.startDate, site.endDate, site.id);
      return result.exceeds ? result.maxCount : null;
    }
    return null;
  }, [site.startDate, site.endDate, site.id, checkCapacity]);

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
        setSuggestions(data.features.map((f: any) => ({ ...f.properties, geometry: f.geometry })));
        setShowSuggestions(true);
      } catch (error) {} finally { setIsLoadingAddress(false); }
    } else { setShowSuggestions(false); }
  };

  const selectAddress = (s: AddressSuggestion) => {
    setAddressSearch(s.label);
    if (onUpdate) {
      onUpdate({ 
        address: s.label,
        coordinates: [s.geometry.coordinates[1], s.geometry.coordinates[0]] // Conversion vers [lat, lng]
      });
    }
    setShowSuggestions(false);
  };

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;
    await addSiteComment(site.id, newComment.trim());
    setNewComment('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const assignedUsers = users.filter(u => site.assignedUserIds?.includes(u.id));

  if (isEditing) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {capacityWarning !== null && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
            <p className="text-[10px] text-amber-900 font-bold uppercase leading-relaxed tracking-tight">
              Attention : ce changement de planning place {capacityWarning + 1} chantiers en simultané (limite : {company?.maxSimultaneousSites}).
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse du chantier</label>
            <div className="relative group" ref={suggestionRef}>
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all text-slate-600 font-bold" value={addressSearch} onChange={e => handleAddressChange(e.target.value)} />
              {isLoadingAddress && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" />}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => selectAddress(s)} className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-0">
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
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-700 outline-none appearance-none" value={site.clientId} onChange={e => onUpdate && onUpdate({ clientId: e.target.value })}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company} - {c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget (€)</label>
              <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-black text-emerald-700 outline-none" value={site.budget} onChange={e => onUpdate && onUpdate({ budget: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold" value={site.startDate} onChange={e => onUpdate && onUpdate({ startDate: e.target.value })} />
            <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold" value={site.endDate} onChange={e => onUpdate && onUpdate({ endDate: e.target.value })} />
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
              <div key={u.id} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-1 ring-slate-100 overflow-hidden" title={u.name}>
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                ) : (
                  u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                )}
              </div>
            ))}
            <button onClick={onOpenAssignModal} className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-300 transition-all">
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
            <div><p className="text-sm font-bold text-slate-800">{site.address}</p><p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Adresse du chantier</p></div>
          </div>
          {client && (
            <div className="p-4 bg-slate-50/50 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${client.color} flex items-center justify-center text-white text-[10px] font-black`}>{client.initials}</div>
                <div className="flex-1"><p className="text-xs font-bold text-slate-800">{client.name}</p><p className="text-[10px] text-slate-500">{client.company}</p></div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${client.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:text-emerald-700 transition-all"><Phone size={12} /> Appeler</a>
                <a href={`mailto:${client.email}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:text-emerald-700 transition-all"><Mail size={12} /> Email</a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Commentaires & Notes</h3>
        
        <div className="relative group">
          <div className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors z-10">
            <MessageSquare size={18} />
          </div>
          <textarea 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none min-h-[80px] resize-none shadow-inner" 
            placeholder="Ajouter une note de chantier... (Entrée pour valider)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={() => handleAddComment()}
            className="absolute right-3 bottom-3 p-2 bg-emerald-900 text-white rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-30"
            disabled={!newComment.trim()}
          >
            <Send size={16} />
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {comments.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-50 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest italic">Aucun commentaire historisé</p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-900 uppercase tracking-tighter">{c.user}</span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {new Date(c.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{c.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;
