
import React, { useState } from 'react';
import { Search, Plus, Mail, Phone, ExternalLink, Users2, Building2, HardHat, UserPlus, Ghost, FilterX } from 'lucide-react';
import { Client } from '../types';
import ClientDetailModal from './ClientDetailModal';
import NewClientModal from './NewClientModal';
import { useData } from '../context/DataContext';

const ClientGrid: React.FC = () => {
  const { clients, sites, addClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSegment, setActiveSegment] = useState('Tous');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  const filteredClients = clients.filter(c => {
    const nameMatch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const companyMatch = c.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesSearch = nameMatch || companyMatch;
    
    if (activeSegment === 'Tous') return matchesSearch;
    if (activeSegment === 'Professionnels') return matchesSearch && c.company !== 'Particulier';
    if (activeSegment === 'Particuliers') return matchesSearch && c.company === 'Particulier';
    return matchesSearch;
  });

  const proCount = clients.filter(c => c.company !== 'Particulier').length;
  const activeClientsCount = clients.filter(c => sites.some(s => s.clientId === c.id && s.status === 'EN COURS')).length;

  return (
    <div className="w-full px-4 lg:px-10 py-6 lg:py-8 space-y-6 lg:space-y-10 animate-in fade-in duration-700 pb-24 lg:pb-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Annuaire Clients</h1>
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
            <Users2 size={16} className="text-emerald-600" />
            Base de contacts centralisée
          </p>
        </div>
        <button 
          onClick={() => setIsNewClientModalOpen(true)}
          className="w-full lg:w-auto bg-emerald-900 text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-emerald-900/20 active:scale-95 hover:bg-emerald-800 transition-all group"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" /> 
          Nouveau Client
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:border-emerald-100 transition-all group">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
            <Users2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Contacts Total</p>
            <p className="text-2xl font-black text-slate-900">{clients.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:border-emerald-100 transition-all group">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
            <Building2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pros / B2B</p>
            <p className="text-2xl font-black text-slate-900">{proCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:border-emerald-100 transition-all group">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500">
            <HardHat size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">En Chantier</p>
            <p className="text-2xl font-black text-slate-900">{activeClientsCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, société, ville..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-base focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all font-semibold shadow-inner placeholder:text-slate-300"
          />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200/50 overflow-x-auto scrollbar-hide">
          {['Tous', 'Professionnels', 'Particuliers'].map((segment) => (
            <button 
              key={segment} 
              onClick={() => setActiveSegment(segment)}
              className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                activeSegment === segment ? 'bg-white text-emerald-900 shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              {segment}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid or Empty States */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 px-6 bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-inner group animate-in zoom-in-95 duration-700">
          <div className="relative mb-10">
            <div className="w-36 h-36 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 group-hover:scale-110 transition-transform duration-700">
              <Users2 size={72} strokeWidth={1} />
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-900 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-12 group-hover:rotate-0 transition-all duration-500">
              <UserPlus size={28} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight text-center">Base de clients vierge</h3>
          <p className="text-slate-400 text-sm font-semibold mt-4 text-center max-w-sm leading-relaxed uppercase tracking-widest">
            Prêt à lancer votre premier projet ? Commencez par enregistrer vos clients ici.
          </p>
          <button 
            onClick={() => setIsNewClientModalOpen(true)}
            className="mt-12 bg-emerald-900 text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/30 active:scale-95 hover:bg-emerald-800 transition-all flex items-center gap-4 group/btn"
          >
            <UserPlus size={20} className="group-hover/btn:rotate-12 transition-transform" /> 
            Créer mon premier client
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-slate-300 space-y-4 bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
           <FilterX size={48} className="opacity-20" />
           <p className="text-sm font-black uppercase tracking-widest italic">Aucun résultat pour cette recherche</p>
           <button onClick={() => {setSearchTerm(''); setActiveSegment('Tous');}} className="text-xs font-black text-emerald-700 hover:underline">Réinitialiser les filtres</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
          {filteredClients.map(client => (
            <div 
              key={client.id} 
              onClick={() => setSelectedClient(client)} 
              className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 hover:-translate-y-2 transition-all cursor-pointer overflow-hidden flex flex-col group animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="p-8 pb-4 flex items-start justify-between">
                <div className={`w-16 h-16 rounded-[1.5rem] ${client.color} flex items-center justify-center text-white text-2xl font-black shadow-xl ring-4 ring-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {client.initials}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                  client.company !== 'Particulier' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {client.company !== 'Particulier' ? 'B2B / PRO' : 'PARTICULIER'}
                </div>
              </div>
              <div className="p-8 pt-4 space-y-4 flex-1">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 truncate group-hover:text-emerald-900 transition-colors leading-tight">{client.name}</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] truncate">{client.company}</p>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 truncate group-hover:text-slate-800 transition-colors">
                    <Mail size={16} className="text-slate-300 shrink-0" /> 
                    {client.email}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">
                    <Phone size={16} className="text-slate-300 shrink-0" /> 
                    {client.phone}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50/80 border-t border-slate-100/50 flex gap-2">
                <button className="flex-1 bg-white border border-slate-200 text-slate-600 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 group-hover:bg-emerald-900 group-hover:text-white group-hover:border-emerald-900 group-hover:shadow-emerald-900/20 active:scale-95">
                  <ExternalLink size={14} /> Fiche Client
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      <NewClientModal 
        isOpen={isNewClientModalOpen} 
        onClose={() => setIsNewClientModalOpen(false)} 
        onSave={addClient} 
      />
    </div>
  );
};

export default ClientGrid;
