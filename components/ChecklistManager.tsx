
import React, { useState, useMemo } from 'react';
import { Plus, Search, ClipboardList, Trash2, Edit3, ArrowRight, CheckCircle2, AlertTriangle, FilterX, X, Loader2, Settings2 } from 'lucide-react';
import { ChecklistTemplate } from '../types';
import NewChecklistTemplateModal from './NewChecklistTemplateModal';
import ChecklistSettingsModal from './ChecklistSettingsModal';
import { useData } from '../context/DataContext';

const ChecklistManager: React.FC = () => {
  const { checklists, sites, company, deleteChecklistTemplate, assignChecklistToSite } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [templateToEdit, setTemplateToEdit] = useState<ChecklistTemplate | null>(null);
  const [selectedTemplateForAssign, setSelectedTemplateForAssign] = useState<ChecklistTemplate | null>(null);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const categories = useMemo(() => {
    const baseCategories = company?.checklistCategories || ['Technique', 'ADV'];
    return ['Tous', ...baseCategories];
  }, [company?.checklistCategories]);

  const filteredTemplates = checklists.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Tous' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous vraiment supprimer ce modèle de checklist ?')) {
      await deleteChecklistTemplate(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, template: ChecklistTemplate) => {
    e.stopPropagation();
    setTemplateToEdit(template);
    setIsNewTemplateModalOpen(true);
  };

  const handleAssignToSite = async (siteId: string) => {
    if (!selectedTemplateForAssign) return;
    setIsAssigning(true);
    try {
      await assignChecklistToSite(siteId, selectedTemplateForAssign);
      setSelectedTemplateForAssign(null);
      alert('Tâches ajoutées au chantier avec succès !');
    } catch (error) {
      console.error("Erreur assignation:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCloseModal = () => {
    setIsNewTemplateModalOpen(false);
    setTemplateToEdit(null);
  };

  return (
    <div className="w-full px-6 lg:px-12 py-8 lg:py-10 space-y-8 lg:space-y-10 animate-in fade-in duration-700 pb-24 lg:pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Bibliothèque Qualité</h1>
          <p className="text-slate-500 text-base font-semibold mt-1">Standards de contrôle et procédures opérationnelles.</p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <button onClick={() => setIsSettingsModalOpen(true)}
            className="p-5 border border-slate-200 bg-white rounded-[1.5rem] text-slate-400 hover:text-slate-600 hover:border-emerald-200 transition-all shadow-sm">
            <Settings2 size={22} />
          </button>
          <button onClick={() => setIsNewTemplateModalOpen(true)}
            className="flex-1 lg:flex-none bg-[#1a4d44] text-white px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-800 transition-all active:scale-95">
            <Plus size={22} /> Nouveau Template
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
          <input type="text" placeholder="Rechercher un modèle de contrôle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-base focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium shadow-inner"/>
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeCategory === cat ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {checklists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 px-6 bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-inner group animate-in zoom-in-95 duration-700">
          <div className="relative mb-10">
            <div className="w-36 h-36 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 group-hover:scale-110 transition-transform duration-700">
              <ClipboardList size={72} strokeWidth={1} />
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-900 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-12 group-hover:rotate-0 transition-all duration-500">
              <Plus size={28} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight text-center">Aucun modèle de contrôle</h3>
          <p className="text-slate-400 text-sm font-semibold mt-4 text-center max-w-sm leading-relaxed uppercase tracking-widest">
            Créez vos standards de qualité pour assurer une exécution parfaite sur vos chantiers.
          </p>
          <button 
            onClick={() => setIsNewTemplateModalOpen(true)}
            className="mt-12 bg-emerald-900 text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/30 active:scale-95 hover:bg-emerald-800 transition-all flex items-center gap-4 group/btn"
          >
            <Plus size={20} className="group-hover/btn:rotate-90 transition-transform" /> 
            Créer mon premier modèle
          </button>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-slate-300 space-y-4 bg-white/50 rounded-[3rem] border border-dashed border-slate-200 animate-in fade-in">
           <FilterX size={48} className="opacity-20" />
           <p className="text-sm font-black uppercase tracking-widest italic">Aucun modèle ne correspond à votre recherche</p>
           <button onClick={() => {setSearchTerm(''); setActiveCategory('Tous');}} className="text-xs font-black text-emerald-700 hover:underline">Réinitialiser les filtres</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col overflow-hidden group">
              <div className="p-8 flex-1 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm border border-emerald-100/50">
                    <ClipboardList size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => handleEdit(e, template)} className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={(e) => handleDelete(e, template.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-full text-[8px] font-black uppercase tracking-[0.2em] inline-block mb-3">
                    {template.category}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-emerald-900 transition-colors line-clamp-2 min-h-[3rem]">{template.title}</h3>
                  <p className="text-slate-400 text-xs mt-3 line-clamp-2 leading-relaxed h-8 font-medium italic">{template.description}</p>
                </div>
                <div className="space-y-2 pt-4 border-t border-slate-50">
                  {template.items.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-[10px] text-slate-600 font-bold truncate">
                      {item.isCritical ? <AlertTriangle size={12} className="text-amber-500 shrink-0" /> : <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                      {item.label}
                    </div>
                  ))}
                  {template.items.length > 3 && (
                    <p className="text-[10px] text-slate-300 font-bold italic pl-5 mt-0.5">+{template.items.length - 3} autres points...</p>
                  )}
                </div>
              </div>
              <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50">
                <button onClick={() => { setSelectedTemplateForAssign(template); }}
                  className="w-full bg-[#1a4d44] text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 hover:bg-emerald-800 active:scale-95">
                  Assigner au chantier <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setIsNewTemplateModalOpen(true)}
            className="bg-slate-50 border-3 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-6 text-slate-300 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all group min-h-[380px]"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center group-hover:border-emerald-500 transition-colors bg-white">
              <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] max-w-[120px] text-center leading-relaxed">Nouveau Modèle</span>
          </button>
        </div>
      )}

      {selectedTemplateForAssign && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => !isAssigning && setSelectedTemplateForAssign(null)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-slide-in">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Assigner au chantier</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Modèle: {selectedTemplateForAssign.title}</p>
              </div>
              <button onClick={() => !isAssigning && setSelectedTemplateForAssign(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {isAssigning && (
                <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                  <Loader2 size={48} className="animate-spin text-emerald-900" />
                </div>
              )}
              {sites.map(site => (
                <button 
                  key={site.id} 
                  onClick={() => handleAssignToSite(site.id)}
                  disabled={isAssigning}
                  className="w-full p-5 bg-white border border-slate-100 rounded-[1.5rem] text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-800 truncate group-hover:text-emerald-900">{site.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5 uppercase tracking-tight italic">{site.address}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shadow-sm">
                    <ArrowRight size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <NewChecklistTemplateModal
        isOpen={isNewTemplateModalOpen}
        onClose={handleCloseModal}
        initialData={templateToEdit}
      />

      <ChecklistSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default ChecklistManager;
