
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Briefcase, Trash2, Edit3, Info, CheckSquare, Image as ImageIcon, ChevronDown, Check, Save, Loader2, History, Lock } from 'lucide-react';
import { LeadActivity } from '../types';
import { Site, Status } from '../types';
import { useData } from '../context/DataContext';
import { useSubscription } from '../hooks/useSubscription';
import { ReadOnlyBadge } from './ReadOnlyBadge';
import GeneralInfoTab from './site-details/GeneralInfoTab';
import ChecklistTab from './site-details/ChecklistTab';
import DocsTab from './site-details/DocsTab';
import AssignUsersModal from './AssignUsersModal';
import ConfirmationModal from './ConfirmationModal';
import CloseSiteModal from './CloseSiteModal';

interface SiteDetailModalProps {
  siteId: string | null;
  onClose: () => void;
}

type TabType = 'info' | 'checklist' | 'docs' | 'activities';

const SiteDetailModal: React.FC<SiteDetailModalProps> = ({ siteId, onClose }) => {
  const { sites, clients, updateSite, deleteSite, closeSite, company, getSiteActivities } = useData();
  const { isReadOnly } = useSubscription();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const site = sites.find(s => s.id === siteId);
  const [editedSite, setEditedSite] = useState<Site | null>(null);

  // Statuts par défaut
  const DEFAULT_STATUSES: Status[] = ['NOUVEAU', 'EN RÉVISION', 'EN COURS', 'TERMINÉ'];
  const statuses = useMemo(
    () => (company?.siteStatuses && company.siteStatuses.length > 0
      ? company.siteStatuses as Status[]
      : DEFAULT_STATUSES),
    [company?.siteStatuses]
  );

  useEffect(() => {
    if (site && !isEditing) {
      setEditedSite({ ...site });
    }
  }, [site, isEditing]);

  useEffect(() => {
    if (site) {
      const unsubActivities = getSiteActivities(site.id, setActivities);
      return () => unsubActivities();
    }
  }, [site, getSiteActivities]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!siteId || !site || !editedSite) return null;

  const client = clients.find(c => c.id === site.clientId);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'EN RÉVISION': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'NOUVEAU': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'EN COURS': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'TERMINÉ': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const tabs = [
    { id: 'info' as TabType, label: 'Informations', icon: <Info size={16} /> },
    { id: 'checklist' as TabType, label: 'Checklist', icon: <CheckSquare size={16} /> },
    { id: 'docs' as TabType, label: 'Photos & Docs', icon: <ImageIcon size={16} /> },
    { id: 'activities' as TabType, label: 'Activités', icon: <History size={16} /> },
  ];

  const siteReadOnly = isReadOnly('site', site.id) || !!site.closedAt;

  const handleSave = async () => {
    if (siteReadOnly) return;
    setIsSubmitting(true);
    try {
      await updateSite(site.id, editedSite);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur sauvegarde chantier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (siteReadOnly) return;
    setIsDeleting(true);
    try {
      await deleteSite(site.id);
      setIsDeleteModalOpen(false);
      onClose();
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (siteReadOnly) return;
    if (!isEditing) {
      try { await updateSite(site.id, { status: newStatus }); } catch (error) {}
    } else {
      setEditedSite({...editedSite, status: newStatus});
    }
    setIsStatusOpen(false);
  };

  const handleAssignUsers = async (userIds: string[]) => {
    if (siteReadOnly) return;
    await updateSite(site.id, { assignedUserIds: userIds });
  };

  const handleCloseSite = async () => {
    await closeSite(site.id);
    setIsCloseModalOpen(false);
    onClose();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <GeneralInfoTab
            site={editedSite}
            client={client}
            isEditing={isEditing && !siteReadOnly}
            onUpdate={(updates) => setEditedSite({ ...editedSite, ...updates })}
            onOpenAssignModal={() => !siteReadOnly && setIsAssignModalOpen(true)}
            isReadOnly={siteReadOnly}
          />
        );
      case 'checklist':
        return <ChecklistTab site={site} isReadOnly={siteReadOnly} onUpdateTasks={(tasks) => updateSite(site.id, { tasks })} />;
      case 'docs':
        return <DocsTab siteId={site.id} site={site} isReadOnly={siteReadOnly} onUpdate={(updates) => updateSite(site.id, updates)} />;
      case 'activities':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {activities.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                  <History size={32} className="opacity-20 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Aucune activité pour le moment</p>
                </div>
              ) : (
                activities.map(a => (
                  <div key={a.id} className="relative">
                    <div className="absolute -left-[22px] top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 z-10" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{a.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-900 uppercase">{a.user}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(a.timestamp).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] animate-fade-in" onClick={isEditing || isSubmitting ? undefined : onClose} />

      <div className="fixed top-0 bottom-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[210] flex flex-col animate-slide-in overflow-hidden">
        <div className="pt-10 pb-6 px-8 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${getStatusColor(site.status)}`}><Briefcase size={20} /></div>
              <div className="relative" ref={dropdownRef}>
                {isEditing ? (
                  <input className="text-xl font-black text-slate-900 leading-tight border-b-2 border-emerald-500 focus:outline-none bg-emerald-50/30 px-2 rounded-t-lg" value={editedSite.name} onChange={(e) => setEditedSite({...editedSite, name: e.target.value})} />
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900 leading-tight">{site.name}</h2>
                    {isReadOnly('site', site.id) && <ReadOnlyBadge />}
                  </div>
                )}
                <button
                  onClick={() => !isSubmitting && !siteReadOnly && setIsStatusOpen(!isStatusOpen)}
                  disabled={siteReadOnly}
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border mt-1 transition-all ${getStatusColor(site.status)} ${siteReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {site.status} <ChevronDown size={12} className={`transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                </button>
                {isStatusOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    {statuses.map((s) => (
                      <button key={s} onClick={() => handleStatusChange(s)} className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors hover:bg-slate-50 ${site.status === s ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {s} {site.status === s && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
          </div>
          <div className="flex gap-1 bg-slate-100/50 p-1 rounded-2xl">
            {tabs.map(tab => (
              <button key={tab.id} disabled={(isEditing && tab.id !== 'info') || isSubmitting} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white relative scrollbar-hide">{renderTabContent()}</div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => { setIsEditing(false); setEditedSite({...site}); }} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600">Annuler</button>
              <button onClick={handleSave} className="flex-[2] flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm">Sauvegarder</button>
            </>
          ) : (
            <>
              <button
                disabled={isReadOnly('site', site.id)}
                onClick={() => { setIsEditing(true); setActiveTab('info'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  isReadOnly('site', site.id)
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'bg-[#1a4d44] text-white hover:bg-emerald-800'
                }`}
              >
                <Edit3 size={18} /> Modifier
              </button>
              <button
                disabled={isReadOnly('site', site.id)}
                onClick={() => setIsDeleteModalOpen(true)}
                className={`p-3 border rounded-xl transition-all ${
                  isReadOnly('site', site.id)
                    ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'border-red-100 text-red-500 hover:bg-red-50'
                }`}
              >
                <Trash2 size={20} />
              </button>
              {!site.closedAt && (
                <button
                  disabled={isReadOnly('site', site.id)}
                  onClick={() => setIsCloseModalOpen(true)}
                  className={`p-3 border rounded-xl transition-all ${
                    isReadOnly('site', site.id)
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'border-amber-100 text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  <Lock size={20} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {/* Placé ici pour être au même niveau que le contenu de SiteDetailModal mais au-dessus de tout le reste */}
      <AssignUsersModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        assignedUserIds={site.assignedUserIds || []}
        onAssign={handleAssignUsers}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Supprimer le chantier"
        message="Voulez-vous vraiment supprimer ce chantier ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
      <CloseSiteModal
        isOpen={isCloseModalOpen}
        site={site}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseSite}
      />
    </>
  );
};

export default SiteDetailModal;
