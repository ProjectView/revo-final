
import React, { useState, useMemo } from 'react';
import { Plus, Settings2, DollarSign, User, MoreHorizontal, Trophy, Settings, X, GripVertical, Trash2, ArrowUp, ArrowDown, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PipelineStage, Lead } from '../types';
import NewLeadModal from './NewLeadModal';
import LeadConversionModal from './LeadConversionModal';
import LeadDetailModal from './LeadDetailModal';
import { useData } from '../context/DataContext';

const DEFAULT_STAGES = ['Nouveau', 'Qualifié', 'Devis envoyé', 'Négociation', 'Gagné'];

const Pipeline: React.FC = () => {
  const { leads, updateLeadStage, company, updateCompany } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLeadToConvert, setSelectedLeadToConvert] = useState<Lead | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  const stages = useMemo(() => company?.pipelineStages || DEFAULT_STAGES, [company]);
  
  const getStageColor = (stage: string) => {
    if (stage === 'Gagné') return 'bg-emerald-500';
    if (stage === 'Nouveau') return 'bg-blue-500';
    if (stage === 'Qualifié') return 'bg-indigo-500';
    if (stage === 'Devis envoyé') return 'bg-amber-500';
    if (stage === 'Négociation') return 'bg-rose-500';
    return 'bg-slate-400';
  };

  const getLeadsForStage = (stage: string) => leads.filter(l => l.stage === stage);

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
    updateLeadStage(lead.id, 'Gagné');
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
      <div className="px-10 pt-10 pb-8 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Pipeline Commerciale</h1>
          <p className="text-slate-500 text-base font-semibold mt-1 uppercase tracking-widest">Opportunités & Prévisions</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={openSettings}
            className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-emerald-700 hover:border-emerald-200 rounded-2xl transition-all shadow-sm group"
            title="Paramètres de la pipeline"
          >
            <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1a4d44] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-emerald-800 transition-all active:scale-95"
          >
            <Plus size={20} /> Nouveau Lead
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-x-auto px-10 pb-10 scrollbar-hide items-stretch">
        {stages.map(stage => {
          const stageLeads = getLeadsForStage(stage);
          const totalValue = stageLeads.reduce((sum, l) => sum + l.budget, 0);
          const isWonStage = stage === 'Gagné';

          return (
            <div 
              key={stage} 
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, stage)}
              className={`flex-shrink-0 w-[320px] flex flex-col rounded-[2.5rem] bg-white border ${isWonStage ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'} shadow-sm p-4 h-full overflow-hidden transition-all hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-4 px-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${getStageColor(stage)} shadow-sm ${isWonStage ? 'animate-pulse' : ''}`}></div>
                  <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isWonStage ? 'text-emerald-800' : 'text-slate-800'}`}>{stage}</h3>
                  <span className="text-[9px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                    {stageLeads.length}
                  </span>
                </div>
                {isWonStage && <Trophy size={14} className="text-emerald-500" />}
              </div>

              <div className={`mx-2 mb-4 px-4 py-2.5 rounded-xl border flex items-center justify-between shadow-inner ${isWonStage ? 'bg-emerald-100/50 border-emerald-100' : 'bg-slate-50/50 border-slate-100'}`}>
                 <span className={`text-[9px] font-black uppercase tracking-widest ${isWonStage ? 'text-emerald-600' : 'text-slate-400'}`}>Volume</span>
                 <span className={`text-sm font-black ${isWonStage ? 'text-emerald-900' : 'text-slate-900'}`}>{totalValue.toLocaleString()} <span className="text-[10px] uppercase ml-0.5">€</span></span>
              </div>

              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-hide px-1 pb-4">
                {stageLeads.map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, lead.id)}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`bg-white p-4 rounded-[1.5rem] border shadow-sm hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group flex flex-col ${isWonStage ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm ${isWonStage ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                          {isWonStage ? <Trophy size={14} /> : <User size={14} />}
                        </div>
                        <span className="text-xs font-black text-slate-800 truncate max-w-[140px]">{lead.leadName}</span>
                      </div>
                      <div className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${
                        lead.priority === 'Haute' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                        lead.priority === 'Moyenne' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {lead.priority}
                      </div>
                    </div>

                    <h4 className="text-[13px] font-bold text-slate-600 leading-snug mb-3 group-hover:text-slate-900 transition-colors line-clamp-2">
                      {lead.project}
                    </h4>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-slate-900">
                        <DollarSign size={12} className="text-emerald-500" strokeWidth={3} />
                        <span className="text-sm font-black">{lead.budget.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                        {lead.company || 'Particulier'}
                      </span>
                    </div>

                    {/* Action de conversion */}
                    {isWonStage ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerConfetti(); setSelectedLeadToConvert(lead); }}
                        className="mt-3 w-full bg-emerald-900 text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95"
                      >
                         Démarrer le projet
                      </button>
                    ) : (
                      (lead.stage === 'Négociation' || lead.stage === 'Devis envoyé') && (
                        <button 
                          onClick={(e) => handleWinLead(e, lead)}
                          className="mt-3 w-full bg-emerald-900/5 hover:bg-emerald-900 text-emerald-900 hover:text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-emerald-900/10"
                        >
                          <Trophy size={12} /> Gagner
                        </button>
                      )
                    )}
                  </div>
                ))}
                
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
      />

      <LeadDetailModal 
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />

      {/* --- Pipeline Settings Modal --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
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
