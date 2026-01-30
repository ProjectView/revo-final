
import React, { useState, useRef, useEffect } from 'react';
import { X, Wrench, Trash2, Edit3, Info, CheckSquare, Image as ImageIcon, ChevronDown, Check, Save, Loader2, History, Lock } from 'lucide-react';
import { Prestation, Status, LeadActivity } from '../types';
import { useData } from '../context/DataContext';
import { useSubscription } from '../hooks/useSubscription';
import GeneralInfoTab from './site-details/GeneralInfoTab';
import ChecklistTab from './site-details/ChecklistTab';
import DocsTab from './site-details/DocsTab';
import AssignUsersModal from './AssignUsersModal';
import { ReadOnlyBadge } from './ReadOnlyBadge';
import ConfirmationModal from './ConfirmationModal';
import ClosePrestationModal from './ClosePrestationModal';

interface PrestationDetailModalProps {
  prestationId: string | null;
  onClose: () => void;
}

type TabType = 'info' | 'checklist' | 'docs' | 'activities';

const PrestationDetailModal: React.FC<PrestationDetailModalProps> = ({ prestationId, onClose }) => {
  const { prestations, clients, updatePrestation, deletePrestation, closePrestation, getPrestationActivities } = useData();
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

  const prestation = prestations.find(p => p.id === prestationId);
  const [editedPrestation, setEditedPrestation] = useState<Prestation | null>(null);

  useEffect(() => {
    if (prestation && !isEditing) {
      setEditedPrestation({ ...prestation });
    }
  }, [prestation, isEditing]);

  useEffect(() => {
    if (prestation) {
      const unsubActivities = getPrestationActivities(prestation.id, setActivities);
      return () => unsubActivities();
    }
  }, [prestation, getPrestationActivities]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!prestationId || !prestation || !editedPrestation) return null;

  const client = clients.find(c => c.id === prestation.clientId);
  const isClientReadOnly = isReadOnly('client', prestation.clientId) || !!prestation.closedAt;
  const statuses: Status[] = ['NOUVEAU', 'EN RÉVISION', 'EN COURS', 'TERMINÉ'];

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

  const handleSave = async () => {
    if (isClientReadOnly) return;
    setIsSubmitting(true);
    try {
      await updatePrestation(prestation.id, editedPrestation);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur sauvegarde prestation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isClientReadOnly) return;
    setIsDeleting(true);
    try {
      await deletePrestation(prestation.id);
      setIsDeleteModalOpen(false);
      onClose();
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (isClientReadOnly) return;
    if (!isEditing) {
      try { await updatePrestation(prestation.id, { status: newStatus }); } catch (error) {}
    } else {
      setEditedPrestation({...editedPrestation, status: newStatus});
    }
    setIsStatusOpen(false);
  };

  const handleAssignUsers = async (userIds: string[]) => {
    if (isClientReadOnly) return;
    await updatePrestation(prestation.id, { assignedUserIds: userIds });
  };

  const handleClosePrestation = async () => {
    await closePrestation(prestation.id);
    setIsCloseModalOpen(false);
    onClose();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <GeneralInfoTab
            site={editedPrestation}
            client={client}
            isEditing={isEditing && !isClientReadOnly}
            onUpdate={(updates) => setEditedPrestation({ ...editedPrestation, ...updates })}
            onOpenAssignModal={() => !isClientReadOnly && setIsAssignModalOpen(true)}
          />
        );
      case 'checklist':
        return <ChecklistTab site={prestation} isReadOnly={isClientReadOnly} onUpdateTasks={(tasks) => updatePrestation(prestation.id, { tasks })} type="prestation" />;
      case 'docs':
        return <DocsTab siteId={prestation.id} />;
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
        {isClientReadOnly && (
          <div className="px-8 pt-6 pb-4 border-b border-rose-200 bg-rose-50/50">
            <ReadOnlyBadge />
          </div>
        )}
        <div className="pt-10 pb-6 px-8 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${getStatusColor(prestation.status)}`}><Wrench size={20} /></div>
              <div className="relative" ref={dropdownRef}>
                {isEditing ? (
                  <input className="text-xl font-black text-slate-900 leading-tight border-b-2 border-emerald-500 focus:outline-none bg-emerald-50/30 px-2 rounded-t-lg" value={editedPrestation.name} onChange={(e) => setEditedPrestation({...editedPrestation, name: e.target.value})} />
                ) : (
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{prestation.name}</h2>
                )}
                <button
                  onClick={() => !isSubmitting && !isClientReadOnly && setIsStatusOpen(!isStatusOpen)}
                  disabled={isClientReadOnly}
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border mt-1 transition-all ${getStatusColor(prestation.status)} ${isClientReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {prestation.status} <ChevronDown size={12} className={`transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                </button>
                {isStatusOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    {statuses.map((s) => (
                      <button key={s} onClick={() => handleStatusChange(s)} className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors hover:bg-slate-50 ${prestation.status === s ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {s} {prestation.status === s && <Check size={14} />}
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
              <button onClick={() => { setIsEditing(false); setEditedPrestation({...prestation}); }} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600">Annuler</button>
              <button onClick={handleSave} disabled={isSubmitting} className="flex-[2] flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm disabled:bg-slate-300"><Save size={18} /> Sauvegarder</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setIsEditing(true); setActiveTab('info'); }}
                disabled={isClientReadOnly}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a4d44] text-white py-3 rounded-xl font-bold text-sm disabled:bg-slate-300 disabled:cursor-not-allowed">
                <Edit3 size={18} /> Modifier
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isClientReadOnly}
                className="p-3 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl disabled:border-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed">
                <Trash2 size={20} />
              </button>
              {!prestation.closedAt && (
                <button
                  disabled={isClientReadOnly}
                  onClick={() => setIsCloseModalOpen(true)}
                  className={`p-3 border rounded-xl transition-all ${
                    isClientReadOnly
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
      <AssignUsersModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        assignedUserIds={prestation.assignedUserIds || []}
        onAssign={handleAssignUsers}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Supprimer la prestation"
        message="Voulez-vous vraiment supprimer cette prestation ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
      <ClosePrestationModal
        isOpen={isCloseModalOpen}
        prestation={prestation}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleClosePrestation}
      />
    </>
  );
};

export default PrestationDetailModal;
