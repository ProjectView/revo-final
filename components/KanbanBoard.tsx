
import React, { useState } from 'react';
import { Site, Status, User } from '../types';
import { MapPin, DollarSign, Calendar, MoreHorizontal, Users as UsersIcon, Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSubscription } from '../hooks/useSubscription';

interface KanbanBoardProps {
  sites: Site[];
  onSiteClick: (site: Site) => void;
  onStatusChange?: (siteId: string, newStatus: Status) => Promise<void>;
  statuses?: Status[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ sites, onSiteClick, onStatusChange, statuses: customStatuses }) => {
  const { clients, users } = useData();
  const { isReadOnly } = useSubscription();
  const DEFAULT_STATUSES: Status[] = ['NOUVEAU', 'EN RÉVISION', 'EN COURS', 'TERMINÉ'];
  const statuses = customStatuses || DEFAULT_STATUSES;
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedFromStatus, setDraggedFromStatus] = useState<Status | null>(null);

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
      case 'TERMINÉ': return 'bg-emerald-50/10 border-emerald-100';
      case 'EN COURS': return 'bg-orange-50/10 border-orange-100';
      default: return 'bg-white border-slate-100';
    }
  };

  const getInitials = (name: string = '') => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, siteId: string, status: Status) => {
    if (isReadOnly('site', siteId)) {
      e.preventDefault();
      return;
    }
    setDraggedItem(siteId);
    setDraggedFromStatus(status);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', siteId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStatus: Status) => {
    e.preventDefault();
    e.stopPropagation();

    const siteId = e.dataTransfer.getData('text/plain');

    if (siteId && draggedFromStatus && draggedFromStatus !== targetStatus && onStatusChange) {
      try {
        await onStatusChange(siteId, targetStatus);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }

    setDraggedItem(null);
    setDraggedFromStatus(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedFromStatus(null);
  };

  const handleCompleteStatus = async (e: React.MouseEvent, site: Site) => {
    e.stopPropagation();
    if (isReadOnly('site', site.id)) {
      return;
    }
    if (site.status !== 'TERMINÉ' && onStatusChange) {
      await onStatusChange(site.id, 'TERMINÉ');
    }
  };

  return (
    <div className="flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-6 md:pb-10 -mx-4 px-4 scrollbar-hide items-stretch h-[calc(100vh-280px)]">
      {statuses.map((status) => {
        const sitesInStatus = sites.filter(s => s.status === status);
        const totalBudget = sitesInStatus.reduce((acc, curr) => acc + curr.budget, 0);

        const isTerminedStatus = status === 'TERMINÉ';

        return (
          <div
            key={status}
            className={`flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px] rounded-[2rem] sm:rounded-[2.5rem] p-3 sm:p-4 flex flex-col border shadow-sm transition-all hover:shadow-xl ${
              isTerminedStatus
                ? 'bg-emerald-50/10 border-emerald-200'
                : getColumnBg(status)
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 sm:px-3 mb-3 sm:mb-4 pt-1 sm:pt-2 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${getStatusColor(status)} shadow-sm flex-shrink-0 ${isTerminedStatus ? 'animate-pulse' : ''}`}></div>
                <h3 className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] ${isTerminedStatus ? 'text-emerald-800' : 'text-slate-800'} truncate`}>
                  {status}
                </h3>
                <span className={`text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border shadow-sm flex-shrink-0 ${
                  isTerminedStatus
                    ? 'bg-emerald-100/50 text-emerald-600 border-emerald-100'
                    : 'bg-white text-slate-400 border-slate-100'
                }`}>
                  {sitesInStatus.length}
                </span>
              </div>
            </div>

            {/* Column Stats Summary */}
            <div className={`mx-1 sm:mx-2 mb-3 sm:mb-4 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border flex items-center justify-between shadow-inner text-[8px] sm:text-[9px] ${
              isTerminedStatus
                ? 'bg-emerald-100/50 border-emerald-100'
                : 'bg-slate-50/50 border-slate-100'
            }`}>
               <span className={`font-black uppercase tracking-widest ${isTerminedStatus ? 'text-emerald-600' : 'text-slate-400'}`}>
                 Volume
               </span>
               <span className={`font-black ${isTerminedStatus ? 'text-emerald-900' : 'text-slate-900'}`}>
                 {(totalBudget / 1000).toFixed(0)}k <span className="text-[7px] sm:text-[8px] uppercase ml-0.5">€</span>
               </span>
            </div>

            {/* Cards Container */}
            <div
              className="flex-1 flex flex-col gap-3 sm:gap-4 overflow-y-auto pr-1 scrollbar-hide px-0.5 sm:px-1 pb-3 sm:pb-4 rounded-xl transition-colors"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              {sitesInStatus.map((site) => {
                const client = clients.find(c => c.id === site.clientId);
                const assignedUsers = users.filter(u => site.assignedUserIds?.includes(u.id));

                return (
                  <div
                    key={site.id}
                    draggable={!isReadOnly('site', site.id)}
                    onDragStart={(e) => handleDragStart(e, site.id, status)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSiteClick(site)}
                    className={`bg-white p-3 sm:p-4 rounded-[1.2rem] sm:rounded-[1.5rem] border shadow-sm hover:shadow-xl transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                      isReadOnly('site', site.id)
                        ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : draggedItem === site.id
                        ? 'opacity-50 scale-95 cursor-grabbing'
                        : `${isTerminedStatus
                          ? 'border-emerald-200 ring-1 ring-emerald-50'
                          : 'border-slate-100 hover:border-emerald-200 hover:-translate-y-1'
                        } cursor-grab`
                    }`}
                  >
                    {/* Client & ID */}
                    <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <div className={`w-6 sm:w-8 h-6 sm:h-8 rounded-lg flex-shrink-0 ${client?.color || 'bg-slate-100'} flex items-center justify-center text-white text-[8px] sm:text-[10px] font-black shadow-sm group-hover:scale-110 transition-transform`}>
                          {client?.initials || '?'}
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                          {client?.name || 'Inconnu'}
                        </span>
                      </div>
                      <span className="text-[7px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-widest flex-shrink-0">#{site.id.substring(0, 4)}</span>
                    </div>

                    {/* Title */}
                    <h4 className={`text-[12px] sm:text-[13px] font-black leading-tight mb-2 sm:mb-3 transition-colors line-clamp-2 ${
                      isTerminedStatus
                        ? 'text-slate-600 group-hover:text-slate-800'
                        : 'text-slate-800 group-hover:text-emerald-900'
                    }`}>
                      {site.name}
                    </h4>

                    {/* Details */}
                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-[8px] sm:text-[10px]">
                        <MapPin size={10} className="sm:size-[12px] shrink-0" />
                        <span className="font-bold truncate italic">{site.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-[8px] sm:text-[10px]">
                        <Calendar size={10} className="sm:size-[12px] shrink-0" />
                        <span className="font-black uppercase tracking-wider">
                          {new Date(site.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 sm:pt-3 border-t border-slate-50">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-1 sm:gap-1.5 text-slate-900 text-[10px] sm:text-sm">
                          <DollarSign size={10} className="sm:size-[12px] text-emerald-500" strokeWidth={3} />
                          <span className="font-black">{(site.budget / 1000).toFixed(0)}k</span>
                        </div>
                        {!isTerminedStatus && (
                          <button
                            onClick={(e) => handleCompleteStatus(e, site)}
                            title="Marquer comme terminé"
                            className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Check size={12} className="sm:size-[14px]" strokeWidth={3} />
                          </button>
                        )}
                      </div>
                      <div className="flex -space-x-1.5 sm:-space-x-2">
                        {assignedUsers.length > 0 ? (
                          assignedUsers.slice(0, 3).map((u) => (
                            <div key={u.id} className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[6px] sm:text-[8px] font-black text-slate-500 shadow-sm overflow-hidden flex-shrink-0" title={u.name}>
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                getInitials(u.name)
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-slate-300">
                            <UsersIcon size={10} className="sm:size-[12px]" />
                          </div>
                        )}
                        {assignedUsers.length > 3 && (
                          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-white bg-emerald-900 text-white flex items-center justify-center text-[6px] sm:text-[8px] font-black shadow-sm flex-shrink-0">
                            +{assignedUsers.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {sitesInStatus.length === 0 && (
                <div className="flex-1 border-2 border-dashed border-slate-100/50 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center p-4 sm:p-8 bg-slate-50/20">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center">Aucune activité</p>
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
