
import React, { useState, useRef, useEffect } from 'react';
import { X, Briefcase, Trash2, Edit3, Info, CheckSquare, Image as ImageIcon, ChevronDown, Check, Save, Loader2 } from 'lucide-react';
import { Site, Status } from '../types';
import { useData } from '../context/DataContext';
import GeneralInfoTab from './site-details/GeneralInfoTab';
import ChecklistTab from './site-details/ChecklistTab';
import DocsTab from './site-details/DocsTab';

interface SiteDetailModalProps {
  siteId: string | null;
  onClose: () => void;
}

type TabType = 'info' | 'checklist' | 'docs';

const SiteDetailModal: React.FC<SiteDetailModalProps> = ({ siteId, onClose }) => {
  const { sites, clients, updateSite, deleteSite } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current site from context dynamically to ensure reactivity
  const site = sites.find(s => s.id === siteId);

  // local state for editing general info
  const [editedSite, setEditedSite] = useState<Site | null>(null);

  // Synchronize editedSite with the source of truth (site) 
  // ONLY if we are NOT currently in the middle of a manual edit
  useEffect(() => {
    if (site && !isEditing) {
      setEditedSite({ ...site });
    }
  }, [site, isEditing]);

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
  ];

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateSite(site.id, editedSite);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du chantier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer ce chantier ? Cette action est irréversible.')) {
      setIsSubmitting(true);
      try {
        await deleteSite(site.id);
        onClose();
      } catch (error) {
        console.error("Erreur lors de la suppression du chantier:", error);
        setIsSubmitting(false);
      }
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (!isEditing) {
      try {
        await updateSite(site.id, { status: newStatus });
      } catch (error) {
        console.error("Erreur lors du changement de statut:", error);
      }
    } else {
      setEditedSite({...editedSite, status: newStatus});
    }
    setIsStatusOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info': 
        return (
          <GeneralInfoTab 
            site={editedSite} 
            client={client} 
            isEditing={isEditing} 
            onUpdate={(updates) => setEditedSite({ ...editedSite, ...updates })}
          />
        );
      case 'checklist': 
        return (
          <ChecklistTab 
            site={site} 
            onUpdateTasks={(tasks) => updateSite(site.id, { tasks })} 
          />
        );
      case 'docs': 
        return <DocsTab siteId={site.id} />;
      default: return null;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={isEditing || isSubmitting ? undefined : onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[70] flex flex-col animate-slide-in">
        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${getStatusColor(site.status)}`}>
                <Briefcase size={20} />
              </div>
              <div className="relative" ref={dropdownRef}>
                {isEditing ? (
                  <input 
                    className="text-xl font-black text-slate-900 leading-tight border-b-2 border-emerald-500 focus:outline-none bg-emerald-50/30 px-2 rounded-t-lg"
                    value={editedSite.name}
                    onChange={(e) => setEditedSite({...editedSite, name: e.target.value})}
                  />
                ) : (
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{site.name}</h2>
                )}
                
                <button 
                  onClick={() => !isSubmitting && setIsStatusOpen(!isStatusOpen)}
                  disabled={isSubmitting}
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border mt-1 transition-all hover:brightness-95 active:scale-95 ${getStatusColor(site.status)} ${isSubmitting ? 'opacity-50' : ''}`}
                >
                  {site.status}
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
                </button>

                {isStatusOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Changer le statut</p>
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors hover:bg-slate-50 ${
                          site.status === s ? 'text-emerald-600' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            s === 'NOUVEAU' ? 'bg-blue-500' : 
                            s === 'EN RÉVISION' ? 'bg-purple-500' : 
                            s === 'EN COURS' ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}></div>
                          {s}
                        </div>
                        {site.status === s && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-1 bg-slate-100/50 p-1 rounded-2xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                disabled={(isEditing && tab.id !== 'info') || isSubmitting}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                } ${(isEditing && tab.id !== 'info') || isSubmitting ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white relative">
          {isSubmitting && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          )}
          {renderTabContent()}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => { setIsEditing(false); setEditedSite({...site}); }}
                disabled={isSubmitting}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-white transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setIsEditing(true); setActiveTab('info'); }}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a4d44] text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                <Edit3 size={18} /> Modifier
              </button>
              <button 
                onClick={handleDelete}
                disabled={isSubmitting}
                className="p-3 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SiteDetailModal;
