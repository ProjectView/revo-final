
import React, { useState, useMemo } from 'react';
import { Plus, Settings2, DollarSign, User, MoreHorizontal, Trophy, Settings, X, GripVertical, Trash2, ArrowUp, ArrowDown, Check, Folder, RotateCcw, Loader2, HardHat, CalendarClock, Filter, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PipelineStage, Lead } from '../types';
import NewLeadModal from './NewLeadModal';
import LeadConversionModal from './LeadConversionModal';
import LeadDetailModal from './LeadDetailModal';
import SiteDetailModal from './SiteDetailModal';
import PrestationDetailModal from './PrestationDetailModal';
import { useData } from '../context/DataContext';

const DEFAULT_STAGES = ['Nouvelle opportunité', 'En discussion', 'Gagné', 'Perdu'];

const Pipeline: React.FC = () => {
  const { leads, updateLeadStage, company, updateCompany } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLeadToConvert, setSelectedLeadToConvert] = useState<Lead | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedConvertedSiteId, setSelectedConvertedSiteId] = useState<string | null>(null);
  const [selectedConvertedPrestationId, setSelectedConvertedPrestationId] = useState<string | null>(null);
  const [hoveredLeadId, setHoveredLeadId] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);

  const availableCreators = useMemo(() => {
    const set = new Set<string>();
    for (const l of leads) {
      if (l.createdBy) set.add(l.createdBy);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [leads]);

  const activeFiltersCount = [
    dateStart,
    dateEnd,
    selectedCreators.length > 0 ? 'creators' : null,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setDateStart('');
    setDateEnd('');
    setSelectedCreators([]);
  };

  const setThisMonth = () => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setDateStart(first);
    setDateEnd(last);
  };

  const toggleCreator = (name: string) => {
    setSelectedCreators(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };
  
  const stages = useMemo(() => company?.pipelineStages || DEFAULT_STAGES, [company]);
  
  const getStageColor = (stage: string) => {
    if (stage === 'Gagné') return 'bg-emerald-500';
    if (stage === 'Perdu') return 'bg-red-500';
    if (stage === 'Nouvelle opportunité') return 'bg-blue-500';
    if (stage === 'En discussion') return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const getLeadsForStage = (stage: string) => {
    return leads
      .filter(l => l.stage === stage)
      .filter(l => {
        // Date range filter applies on dueDate. Leads without a dueDate are
        // kept (otherwise enabling the filter hides every lead missing one).
        if (l.dueDate) {
          if (dateStart && l.dueDate < dateStart) return false;
          if (dateEnd && l.dueDate > dateEnd) return false;
        }
        if (selectedCreators.length > 0) {
          if (!l.createdBy || !selectedCreators.includes(l.createdBy)) return false;
        }
        return true;
      })
      // Sort by dueDate ascending (soonest first); leads without a dueDate go to the end.
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  };

  const getArchivedLeads = () => leads.filter(l => l.stage === 'Perdu');

  const handleRestoreLead = async (leadId: string) => {
    setIsRestoringId(leadId);
    try {
      await updateLeadStage(leadId, stages[0]);
    } finally {
      setIsRestoringId(null);
    }
  };

  const onDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    updateLeadStage(leadId, targetStage);
  };

  const handleWinLead = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    triggerConfetti();
    setSelectedLeadToConvert(lead);
  };

  const handleLoseLead = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    updateLeadStage(lead.id, 'Perdu');
  };

  const handleConversionSuccess = (newId: string, type: 'site' | 'prestation') => {
    if (type === 'site') {
      setSelectedConvertedSiteId(newId);
    } else {
      setSelectedConvertedPrestationId(newId);
    }
  };

  const triggerConfetti = () => {
    // Confettis du centre
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Confettis depuis la gauche
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 }
    });

    // Confettis depuis la droite
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 }
    });
  };

  // --- Pipeline Settings Logic ---
  const [editedStages, setEditedStages] = useState<string[]>([]);
  const openSettings = () => {
    setEditedStages([...stages]);
    setIsSettingsOpen(true);
  };

  const saveStages = async () => {
    await updateCompany({ pipelineStages: editedStages });
    setIsSettingsOpen(false);
  };

  const addStage = () => setEditedStages([...editedStages, 'Nouvelle étape']);
  const removeStage = (index: number) => setEditedStages(editedStages.filter((_, i) => i !== index));
  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...editedStages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStages.length) return;
    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
    setEditedStages(newStages);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6 lg:pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Pipeline Commerciale</h1>
          <p className="text-slate-500 text-sm sm:text-base font-semibold mt-1 uppercase tracking-widest">Opportunités & Prévisions</p>
        </div>
        <div className="flex gap-3 sm:gap-4 items-center">
          <button
            onClick={() => setIsArchiveModalOpen(true)}
            className="p-3 sm:p-4 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 rounded-2xl transition-all shadow-sm group relative"
            title="Voir les opportunités archivées"
          >
            <Folder size={20} />
            {getArchivedLeads().length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {getArchivedLeads().length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm ${
              activeFiltersCount > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Filtrer les opportunités"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                {activeFiltersCount}
              </span>
            )}
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={openSettings}
            className="p-3 sm:p-4 bg-white border border-slate-200 text-slate-400 hover:text-emerald-700 hover:border-emerald-200 rounded-2xl transition-all shadow-sm group"
            title="Paramètres de la pipeline"
          >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1a4d44] text-white px-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2 sm:gap-3 shadow-xl hover:bg-emerald-800 transition-all active:scale-95"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Nouvelle</span> opportunité
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="px-4 sm:px-6 lg:px-10 pb-4 sm:pb-6 flex-shrink-0">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-4 sm:p-6 shadow-xl animate-in slide-in-from-top-2 duration-300 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar size={12} /> Échéance après le
                </label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar size={12} /> Échéance avant le
                </label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="flex flex-col justify-end gap-2">
                <div className="flex gap-2">
                  <button onClick={setThisMonth} className="flex-1 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 transition-all">Ce mois-ci</button>
                  <button onClick={resetFilters} className="flex-1 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 transition-all flex items-center justify-center gap-2">
                    <X size={14} /> Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Créateur de l'opportunité</label>
              {availableCreators.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium italic">Aucun créateur identifié sur les opportunités existantes.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableCreators.map(name => {
                    const isSelected = selectedCreators.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => toggleCreator(name)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter border-2 transition-all transform hover:scale-105 flex items-center gap-2 ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-md'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <User size={12} />
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto px-4 sm:px-6 lg:px-10 pb-6 sm:pb-8 lg:pb-10 scrollbar-hide items-stretch">
        {stages.map(stage => {
          const stageLeads = getLeadsForStage(stage);
          const totalValue = stageLeads.reduce((sum, l) => sum + l.budget, 0);
          const isWonStage = stage === 'Gagné';

          return (
            <div
              key={stage}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, stage)}
              className="flex-shrink-0 w-[260px] sm:w-[290px] lg:w-[320px] flex flex-col rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-slate-100 shadow-sm p-3 sm:p-4 h-full overflow-hidden transition-all hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-4 px-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${getStageColor(stage)} shadow-sm`}></div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">{stage}</h3>
                  <span className="text-[9px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                    {stageLeads.length}
                  </span>
                </div>
              </div>

              <div className="mx-2 mb-4 px-4 py-2.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-inner bg-slate-50/50">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Volume</span>
                 <span className="text-sm font-black text-slate-900">{totalValue.toLocaleString()} <span className="text-[10px] uppercase ml-0.5">€</span></span>
              </div>

              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-hide px-1 pb-4">
                {stageLeads.map(lead => {
                  const isLostLead = lead.stage === 'Perdu';
                  return (
                  <div
                    key={lead.id}
                    draggable={!isLostLead}
                    onDragStart={(e) => !isLostLead && onDragStart(e, lead.id)}
                    onClick={() => setSelectedLeadId(lead.id)}
                    onMouseEnter={() => setHoveredLeadId(lead.id)}
                    onMouseLeave={() => setHoveredLeadId(null)}
                    className={`bg-white rounded-[1.5rem] border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all group flex flex-col ${isLostLead ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${hoveredLeadId === lead.id ? 'p-5' : 'p-4'}`}
                  >
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 shrink-0">
                          <HardHat size={14} />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight truncate group-hover:text-emerald-700 transition-colors">
                          {lead.project}
                        </h4>
                      </div>
                      <div className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border shrink-0 ${
                        lead.priority === 'Haute' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                        lead.priority === 'Moyenne' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {lead.priority}
                      </div>
                    </div>

                    <div className="mb-3 pl-10 space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {lead.company || 'Particulier'}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 truncate flex items-center gap-1">
                        <User size={10} className="shrink-0" />
                        <span className="truncate">{lead.leadName}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 gap-2">
                      <div className="flex items-center gap-1.5 text-slate-900">
                        <DollarSign size={12} className="text-emerald-500" strokeWidth={3} />
                        <span className="text-sm font-black">{lead.budget.toLocaleString()}</span>
                      </div>
                      {lead.dueDate && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <CalendarClock size={11} />
                          <span>
                            {new Date(lead.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons - always visible on mobile, hover on desktop */}
                    {!isLostLead && (
                      <div className={`mt-3 flex gap-2 ${hoveredLeadId === lead.id ? 'flex' : 'flex sm:hidden'}`}>
                        <button
                          onClick={(e) => handleWinLead(e, lead)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1 shadow-lg shadow-emerald-600/30 active:scale-95"
                        >
                          <Trophy size={12} /> Gagné
                        </button>
                        <button
                          onClick={(e) => handleLoseLead(e, lead)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1 shadow-lg shadow-red-600/30 active:scale-95"
                        >
                          Perdu
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })}
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[1.5rem] flex items-center justify-center gap-3 text-slate-300 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group"
                >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nouveau</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <NewLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <LeadConversionModal
        lead={selectedLeadToConvert}
        onClose={() => setSelectedLeadToConvert(null)}
        onSuccess={handleConversionSuccess}
      />

      <LeadDetailModal
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />

      {selectedConvertedSiteId && (
        <SiteDetailModal
          siteId={selectedConvertedSiteId}
          onClose={() => setSelectedConvertedSiteId(null)}
        />
      )}

      {selectedConvertedPrestationId && (
        <PrestationDetailModal
          prestationId={selectedConvertedPrestationId}
          onClose={() => setSelectedConvertedPrestationId(null)}
        />
      )}

      {/* --- Archives Modal --- */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsArchiveModalOpen(false)} />
          <div className="relative w-full max-w-[95vw] sm:max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[80vh] flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-600 shadow-lg">
                  <Folder size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Opportunités archivées</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Leads perdus</p>
                </div>
              </div>
              <button onClick={() => setIsArchiveModalOpen(false)} className="p-2 text-slate-400 hover:bg-white rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {getArchivedLeads().length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                  <Folder size={32} className="opacity-20 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Aucune opportunité archivée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getArchivedLeads().map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-all group">
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-800">{lead.project}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">{lead.leadName}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleRestoreLead(lead.id)}
                          disabled={isRestoringId === lead.id}
                          className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                          title="Restaurer cette opportunité"
                        >
                          {isRestoringId === lead.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              <RotateCcw size={16} />
                              <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Restaurer</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Voir les détails"
                        >
                          <User size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Pipeline Settings Modal --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative w-full max-w-[95vw] sm:max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                  <Settings size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Étapes de la Pipeline</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Configuration société</p>
                </div>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400 hover:bg-white rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 mb-6">
                <Settings2 className="text-amber-600 shrink-0" size={18} />
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                  Attention : Modifier le nom d'une étape affectera la visibilité des prospects actuellement dans cette colonne.
                </p>
              </div>

              {editedStages.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="p-2 text-slate-300 cursor-grab active:cursor-grabbing"><GripVertical size={18} /></div>
                  <input 
                    className="flex-1 bg-transparent border-none outline-none text-sm font-black text-slate-800 placeholder:text-slate-300"
                    value={stage}
                    onChange={(e) => {
                      const updated = [...editedStages];
                      updated[idx] = e.target.value;
                      setEditedStages(updated);
                    }}
                  />
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveStage(idx, 'up')} className="p-2 text-slate-400 hover:text-emerald-600"><ArrowUp size={14} /></button>
                    <button onClick={() => moveStage(idx, 'down')} className="p-2 text-slate-400 hover:text-emerald-600"><ArrowDown size={14} /></button>
                    <button onClick={() => removeStage(idx)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}

              <button 
                onClick={addStage}
                className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Ajouter une colonne
              </button>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
              <button onClick={() => setIsSettingsOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Annuler</button>
              <button onClick={saveStages} className="flex-[2] bg-emerald-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                <Check size={18} /> Appliquer les changements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline;
