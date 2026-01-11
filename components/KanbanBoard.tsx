
import React from 'react';
import { Site, Status } from '../types';
import { MOCK_CLIENTS } from '../constants';
import { MapPin, DollarSign, Calendar, MoreHorizontal } from 'lucide-react';

interface KanbanBoardProps {
  sites: Site[];
  onSiteClick: (site: Site) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ sites, onSiteClick }) => {
  const statuses: Status[] = ['NOUVEAU', 'EN RÉVISION', 'EN COURS', 'TERMINÉ'];

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'EN RÉVISION': return 'bg-purple-500';
      case 'NOUVEAU': return 'bg-blue-500';
      case 'EN COURS': return 'bg-orange-500';
      case 'TERMINÉ': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  };

  const getColumnBg = (status: Status) => {
    switch (status) {
      case 'EN RÉVISION': return 'bg-purple-50/30';
      case 'NOUVEAU': return 'bg-blue-50/30';
      case 'EN COURS': return 'bg-orange-50/30';
      case 'TERMINÉ': return 'bg-emerald-50/30';
      default: return 'bg-slate-50/30';
    }
  };

  return (
    <div className="flex gap-8 overflow-x-auto pb-10 -mx-4 px-4 scrollbar-hide items-stretch">
      {statuses.map((status) => {
        const sitesInStatus = sites.filter(s => s.status === status);
        const totalBudget = sitesInStatus.reduce((acc, curr) => acc + curr.budget, 0);

        return (
          <div key={status} className={`flex-shrink-0 w-[360px] rounded-[2.5rem] p-5 flex flex-col gap-6 ${getColumnBg(status)} border border-slate-100/50 shadow-sm transition-all hover:shadow-md`}>
            {/* Column Header */}
            <div className="flex items-center justify-between px-3 mb-2 pt-2">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} shadow-md`}></div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">{status}</h3>
                <span className="text-[10px] font-black bg-white text-slate-400 px-3 py-1 rounded-xl border border-slate-100">
                  {sitesInStatus.length}
                </span>
              </div>
              <button className="text-slate-300 hover:text-slate-600 transition-colors">
                <MoreHorizontal size={22} />
              </button>
            </div>

            {/* Column Stats Summary */}
            {sitesInStatus.length > 0 && (
              <div className="px-4 py-3 bg-white/50 rounded-2xl border border-slate-100/50 shadow-inner flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valeur cumulée</span>
                <span className="text-sm font-black text-slate-700">{totalBudget.toLocaleString()} <span className="text-[10px]">€</span></span>
              </div>
            )}

            {/* Cards Container */}
            <div className="flex-1 flex flex-col gap-5 min-h-[300px] overflow-y-auto scrollbar-hide">
              {sitesInStatus.map((site) => {
                const client = MOCK_CLIENTS.find(c => c.id === site.clientId);
                return (
                  <div 
                    key={site.id}
                    onClick={() => onSiteClick(site)}
                    className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 hover:border-emerald-200 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className={`w-12 h-12 rounded-2xl ${client?.color} flex items-center justify-center text-white text-sm font-black shadow-xl ring-4 ring-white group-hover:scale-110 transition-transform`}>
                        {client?.initials}
                      </div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">#{site.id}</span>
                    </div>
                    
                    <h4 className="text-lg font-black text-slate-800 group-hover:text-emerald-900 leading-tight mb-4 transition-colors">
                      {site.name}
                    </h4>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-slate-400">
                        <MapPin size={16} className="shrink-0" />
                        <span className="text-xs font-bold truncate leading-tight italic">{site.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <Calendar size={16} className="shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {new Date(site.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
                        </span>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-emerald-500" strokeWidth={3} />
                        <span className="text-lg font-black text-slate-900">{site.budget.toLocaleString()} <span className="text-xs">€</span></span>
                      </div>
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                            {['JD', 'ML', 'TP'][i-1]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {sitesInStatus.length === 0 && (
                <div className="flex-1 border-3 border-dashed border-slate-100/50 rounded-[2rem] flex items-center justify-center p-12 bg-white/10">
                  <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] text-center">Aucun chantier à afficher</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div className="flex-shrink-0 w-10"></div>
    </div>
  );
};

export default KanbanBoard;
