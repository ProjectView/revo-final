
import React, { useState, useEffect, useRef } from 'react';
import { X, User, Building2, Mail, Phone, MapPin, Briefcase, FileText, Edit3, Trash2, ExternalLink, TrendingUp, Calendar, Save, Loader2 } from 'lucide-react';
import { Client } from '../types';
import { useData } from '../context/DataContext';

interface ClientDetailModalProps {
  client: Client | null;
  onClose: () => void;
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

type TabType = 'overview' | 'projects' | 'docs';

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, onClose }) => {
  const { sites, updateClient, deleteClient } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address Autocomplete states
  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (client) {
      setEditedClient({ ...client });
      setAddressSearch(client.address || '');
      setIsEditing(false);
      setActiveTab('overview');
    }
  }, [client]);

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
    if (editedClient) setEditedClient({ ...editedClient, address: val });
    
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
    if (editedClient) {
      setEditedClient({ 
        ...editedClient, 
        address: s.label,
        coordinates: [s.geometry.coordinates[1], s.geometry.coordinates[0]]
      });
    }
    setShowSuggestions(false);
  };

  if (!client || !editedClient) return null;

  const clientSites = sites.filter(s => s.clientId === client.id);
  const totalBudget = clientSites.reduce((sum, s) => sum + s.budget, 0);
  const isPro = editedClient.company !== 'Particulier';

  const tabs = [
    { id: 'overview' as TabType, label: 'Profil', icon: <User size={16} /> },
    { id: 'projects' as TabType, label: 'Chantiers', icon: <Briefcase size={16} /> },
    { id: 'docs' as TabType, label: 'Documents', icon: <FileText size={16} /> },
  ];

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateClient(client.id, {
        name: editedClient.name,
        company: editedClient.company,
        email: editedClient.email,
        phone: editedClient.phone,
        address: editedClient.address,
        coordinates: editedClient.coordinates
      });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer ce client ? Cette action est irréversible.')) {
      await deleteClient(client.id);
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[180] animate-fade-in"
        onClick={isEditing ? undefined : onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[190] flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-white relative">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-6 mt-4">
            <div className={`w-20 h-20 rounded-3xl ${editedClient.color} flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-white flex-shrink-0`}>
              {editedClient.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1 mb-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input 
                      className="text-2xl font-black text-slate-900 leading-tight border-b-2 border-emerald-500 focus:outline-none bg-emerald-50/30 px-2 rounded-t-lg w-full"
                      value={editedClient.name}
                      onChange={(e) => setEditedClient({...editedClient, name: e.target.value})}
                      placeholder="Nom complet"
                    />
                    <input 
                      className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 focus:border-emerald-500 focus:outline-none bg-slate-50/50 px-2 py-1 rounded w-full"
                      value={editedClient.company}
                      onChange={(e) => setEditedClient({...editedClient, company: e.target.value})}
                      placeholder="Société / Type"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight truncate">{editedClient.name}</h2>
                      <div className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                        isPro ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {isPro ? 'PRO' : 'PART'}
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider truncate">{editedClient.company}</p>
                  </>
                )}
              </div>
              
              {!isEditing && (
                <div className="flex gap-4 mt-4">
                  <a href={`tel:${editedClient.phone}`} className="flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Phone size={14} /> Appeler
                  </a>
                  <a href={`mailto:${editedClient.email}`} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Mail size={14} /> Email
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1 bg-slate-100/50 p-1 rounded-2xl mt-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                disabled={isEditing && tab.id !== 'overview'}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                } ${isEditing && tab.id !== 'overview' ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-emerald-900 rounded-3xl text-white shadow-lg shadow-emerald-900/20">
                  <TrendingUp size={18} className="text-emerald-400 mb-2" />
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Volume d'affaires</p>
                  <p className="text-xl font-black">{totalBudget.toLocaleString()} €</p>
                </div>
                <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <Briefcase size={18} className="text-emerald-600 mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Chantiers</p>
                  <p className="text-xl font-black text-slate-900">{clientSites.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Informations du client</h3>
                <div className="grid grid-cols-1 gap-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2" ref={suggestionRef}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse principale</label>
                        <div className="relative group">
                          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                          <input 
                            type="text"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all"
                            value={addressSearch}
                            onChange={(e) => handleAddressChange(e.target.value)}
                            placeholder="Rechercher une adresse..."
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
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative group">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                          <input 
                            type="email"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all"
                            value={editedClient.email}
                            onChange={(e) => setEditedClient({...editedClient, email: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                        <div className="relative group">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                          <input 
                            type="tel"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all"
                            value={editedClient.phone}
                            onChange={(e) => setEditedClient({...editedClient, phone: e.target.value})}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all cursor-text">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-50">
                          <MapPin size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adresse principale</p>
                          <p className="text-sm font-bold text-slate-800 truncate">{editedClient.address || 'Non renseignée'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all cursor-text">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-50">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email principal</p>
                          <p className="text-sm font-bold text-slate-800">{editedClient.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all cursor-text">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-50">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone</p>
                          <p className="text-sm font-bold text-slate-800">{editedClient.phone}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Historique des chantiers</h3>
              {clientSites.length > 0 ? (
                clientSites.map((site) => (
                  <div key={site.id} className="p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">{site.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{site.address}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[8px] font-black border ${
                        site.status === 'TERMINÉ' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        site.status === 'EN COURS' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {site.status}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar size={12} />
                          {new Date(site.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <button className="text-emerald-600 hover:text-emerald-800 transition-colors">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                  <Briefcase size={40} className="mb-4 opacity-20" />
                  <p className="text-sm font-bold">Aucun chantier historique</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          {isEditing ? (
            <>
              <button 
                onClick={() => { setIsEditing(false); setEditedClient({...client}); setAddressSearch(client.address || ''); }}
                className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-white transition-all shadow-sm"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Enregistrer
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setIsEditing(true); setActiveTab('overview'); }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a4d44] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg active:scale-[0.98]"
              >
                <Edit3 size={18} /> Modifier le profil
              </button>
              <button 
                onClick={handleDelete}
                className="p-4 border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientDetailModal;
