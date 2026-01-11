
import React, { useState } from 'react';
import { Search, Filter, Plus, List, Kanban, Map, HardHat, Ghost, FilterX, Construction } from 'lucide-react';
import { Status, Site } from '../types';
import SiteDetailModal from './SiteDetailModal';
import NewSiteModal from './NewSiteModal';
import KanbanBoard from './KanbanBoard';
import MapView from './MapView';
import { useData } from '../context/DataContext';

type ViewMode = 'list' | 'kanban' | 'map';

const SiteList: React.FC = () => {
  const { sites, clients, addSite } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);

  const filteredSites = sites.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case 'EN RÉVISION': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'NOUVEAU': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'EN COURS': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'TERMINÉ': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <>
      <div className="w-full px-6 lg:px-12 py-8 lg:py-10 space-y-8 lg:space-y-10 animate-in fade-in duration-500 pb-24 lg:pb-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Chantiers</h1>
            <p className="text-slate-500 text-base font-semibold mt-1">Vue d'ensemble et suivi de production.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm w-full sm:w-auto">
              {(['list', 'kanban', 'map'] as ViewMode[]).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} 
                  className={`flex-1 px-5 py-2.5 rounded-xl flex items-center justify-center gap-3 text-xs font-black transition-all uppercase tracking-widest ${viewMode === mode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                  {mode === 'list' && <List size={18}/>} {mode === 'kanban' && <Kanban size={18}/>} {mode === 'map' && <Map size={18}/>}
                  <span className="hidden sm:inline">{mode === 'list' ? 'Liste' : mode}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setIsNewSiteModalOpen(true)}
              className="w-full sm:w-auto bg-[#1a4d44] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-800 transition-all active:scale-95">
              <Plus size={20} /> Nouveau chantier
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {sites.length > 0 && (
          <div className="bg-white p-5 lg:p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
              <input type="text" placeholder="Rechercher un chantier..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] pl-14 pr-6 py-4 text-base focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all font-medium"/>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 px-6 bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-inner group animate-in zoom-in-95 duration-700">
            <div className="relative mb-10">
              <div className="w-36 h-36 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 group-hover:scale-110 transition-transform duration-700">
                <HardHat size={72} strokeWidth={1} />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-900 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-12 group-hover:rotate-0 transition-all duration-500">
                <Plus size={28} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight text-center">Aucun chantier actif</h3>
            <p className="text-slate-400 text-sm font-semibold mt-4 text-center max-w-sm leading-relaxed uppercase tracking-widest">
              Votre tableau de production est vide. Commencez par planifier votre première intervention.
            </p>
            <button 
              onClick={() => setIsNewSiteModalOpen(true)}
              className="mt-12 bg-emerald-900 text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/20 active:scale-95 hover:bg-emerald-800 transition-all flex items-center gap-4 group/btn"
            >
              <Plus size={20} className="group-hover/btn:rotate-90 transition-transform duration-300" /> 
              Créer mon premier chantier
            </button>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-300 space-y-4 bg-white/50 rounded-[3rem] border border-dashed border-slate-200 animate-in fade-in">
             <FilterX size={48} className="opacity-20" />
             <p className="text-sm font-black uppercase tracking-widest italic">Aucun chantier ne correspond à votre recherche</p>
             <button onClick={() => setSearchTerm('')} className="text-xs font-black text-emerald-700 hover:underline">Réinitialiser la recherche</button>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden w-full animate-in slide-in-from-bottom-4">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chantier</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Planning</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Budget</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSites.map(site => {
                        const client = clients.find(c => c.id === site.clientId);
                        return (
                          <tr key={site.id} onClick={() => setSelectedSiteId(site.id)} className="hover:bg-emerald-50/40 transition-all cursor-pointer group">
                            <td className="px-10 py-8">
                              <h4 className="font-black text-slate-800 text-base group-hover:text-emerald-900 transition-colors">{site.name}</h4>
                              <p className="text-xs font-bold text-slate-400 mt-2 tracking-tight flex items-center gap-2 italic">{site.address}</p>
                            </td>
                            <td className="px-8 py-8">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl ${client?.color || 'bg-slate-200'} flex items-center justify-center text-white text-xs font-black shadow-sm group-hover:scale-110 transition-transform`}>{client?.initials || '?'}</div>
                                <span className="text-sm text-slate-700 font-black">{client?.name || 'Inconnu'}</span>
                              </div>
                            </td>
                            <td className="px-8 py-8 text-sm text-slate-600 font-bold">
                              {new Date(site.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
                            </td>
                            <td className="px-8 py-8 font-black text-slate-900 text-base">
                              {site.budget.toLocaleString()} <span className="text-slate-400 text-xs font-bold uppercase ml-1">€</span>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <span className={`px-5 py-2 rounded-xl text-xs font-black border tracking-wider shadow-sm inline-block ${getStatusStyle(site.status)}`}>{site.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === 'kanban' && <KanbanBoard sites={filteredSites} onSiteClick={(s) => setSelectedSiteId(s.id)} />}
            {viewMode === 'map' && <MapView sites={filteredSites} onSiteClick={(s) => setSelectedSiteId(s.id)} />}
          </>
        )}
      </div>
      <SiteDetailModal siteId={selectedSiteId} onClose={() => setSelectedSiteId(null)} />
      <NewSiteModal isOpen={isNewSiteModalOpen} onClose={() => setIsNewSiteModalOpen(false)} />
    </>
  );
};

export default SiteList;
