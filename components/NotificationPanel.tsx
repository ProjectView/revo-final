
import React from 'react';
import { X, Bell, CheckCircle2, HardHat, Wrench, Clock, Info, Check } from 'lucide-react';
import { useData } from '../context/DataContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { userNotifications, markNotificationRead, markAllNotificationsRead } = useData();

  if (!isOpen) return null;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'site_update': return <HardHat size={16} className="text-emerald-500" />;
      case 'prestation_update': return <Wrench size={16} className="text-blue-500" />;
      case 'assignment': return <CheckCircle2 size={16} className="text-purple-500" />;
      default: return <Info size={16} className="text-slate-400" />;
    }
  };

  const getTimeLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[210] flex flex-col animate-slide-in">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Notifications</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Activité de vos chantiers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {userNotifications.length > 0 ? (
            <div className="flex justify-end px-2 mb-2">
              <button 
                onClick={markAllNotificationsRead}
                className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline"
              >
                <Check size={12} strokeWidth={4} /> Tout marquer comme lu
              </button>
            </div>
          ) : null}

          {userNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20 px-8 text-center">
              <Bell size={48} strokeWidth={1} className="opacity-20 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">Aucune alerte récente</p>
              <p className="text-[11px] font-medium mt-2 italic">Vous serez notifié dès qu'un chantier qui vous concerne est modifié.</p>
            </div>
          ) : (
            userNotifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`relative p-4 rounded-[1.5rem] border transition-all cursor-pointer group hover:shadow-md ${
                  notif.read ? 'bg-white border-slate-100 opacity-60' : 'bg-emerald-50/30 border-emerald-100 ring-1 ring-emerald-50'
                }`}
              >
                {!notif.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                )}
                
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    notif.read ? 'bg-slate-50 text-slate-400' : 'bg-white text-emerald-600'
                  }`}>
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate mb-0.5">{notif.title}</p>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tight">
                        <Clock size={10} /> {getTimeLabel(notif.createdAt)}
                      </div>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                        {notif.authorName.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <p className="text-[9px] text-slate-400 font-bold text-center uppercase tracking-[0.2em]">
            Notifications filtrées pour votre profil
          </p>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
