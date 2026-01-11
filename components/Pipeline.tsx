
import React, { useState } from 'react';
import { Plus, Settings2, DollarSign, User, MoreHorizontal } from 'lucide-react';
import { PipelineStage, Lead } from '../types';
import NewLeadModal from './NewLeadModal';
import { useData } from '../context/DataContext';

const Pipeline: React.FC = () => {
  const { leads, addLead, updateLeadStage } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stages: PipelineStage[] = ['Nouveau', 'Qualifié', 'Devis envoyé', 'Négociation'];
  
  const getStageColor = (stage: PipelineStage) => {
    switch (stage) {
      case 'Nouveau': return 'bg-blue-500';
      case 'Qualifié': return 'bg-indigo-500';
      case 'Devis envoyé': return 'bg-amber-500';
      case 'Négociation': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const getLeadsForStage = (stage: PipelineStage) => leads.filter(l => l.stage === stage);

  const onDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    updateLeadStage(leadId, targetStage);
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

          return (
            <div 
              key={stage} 
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, stage)}
              className="flex-shrink-0 w-[360px] flex flex-col rounded-[2.5rem] bg-white border border-slate-100 shadow-sm p-4 h-full overflow-hidden transition-all hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-6 px-4 pt-2">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getStageColor(stage)} shadow-sm`}></div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">{stage}</h3>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                    {stageLeads.length}
                  </span>
                </div>
                <button className="text-slate-300 hover:text-slate-500">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="mx-2 mb-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between shadow-inner">
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pipeline</span>
                 <span className="text-base font-black text-emerald-900">{totalValue.toLocaleString()} <span className="text-[10px] uppercase ml-0.5">€</span></span>
              </div>

              <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2 scrollbar-hide px-1">
                {stageLeads.map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, lead.id)}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shadow-sm">
                          <User size={18} />
                        </div>
                        <span className="text-base font-black text-slate-800 truncate max-w-[180px]">{lead.leadName}</span>
                      </div>
                      <div className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                        lead.priority === 'Haute' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                        lead.priority === 'Moyenne' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {lead.priority}
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-slate-600 leading-snug mb-5 group-hover:text-slate-900 transition-colors">
                      {lead.project}
                    </h4>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-900">
                        <DollarSign size={16} className="text-emerald-500" strokeWidth={3} />
                        <span className="text-lg font-black">{lead.budget.toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                        {lead.company || 'Particulier'}
                      </span>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-5 border-2 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center gap-3 text-slate-300 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Ajouter un prospect</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <NewLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddLead={addLead} 
      />
    </div>
  );
};

export default Pipeline;
