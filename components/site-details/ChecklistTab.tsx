
import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, ListChecks, Trash2, AlertTriangle, Loader2, Library, ChevronDown, Check } from 'lucide-react';
import { Site, SiteTask, ChecklistTemplate } from '../../types';
import { useData } from '../../context/DataContext';

interface ChecklistTabProps {
  site: Site;
  isReadOnly?: boolean;
  onUpdateTasks: (tasks: SiteTask[]) => Promise<void>;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ site, isReadOnly, onUpdateTasks }) => {
  const { checklists, assignChecklistToSite } = useData();
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const tasks = site.tasks || [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowTemplatePicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTask = async (taskId: string) => {
    if (isBusy || isReadOnly) return;
    setIsBusy(true);
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    try {
      await onUpdateTasks(updatedTasks);
    } catch (error) {
      console.error("Erreur toggle task:", error);
    } finally {
      setIsBusy(false);
    }
  };

  const addTask = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const label = newTaskLabel.trim();
    if (!label || isBusy || isReadOnly) return;

    setIsBusy(true);
    const newTask: SiteTask = {
      id: `manual-${Date.now()}`,
      label: label,
      completed: false
    };

    try {
      await onUpdateTasks([...tasks, newTask]);
      setNewTaskLabel('');
    } catch (error) {
      console.error("Erreur ajout tâche:", error);
    } finally {
      setIsBusy(false);
    }
  };

  const deleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (isBusy || isReadOnly) return;

    setIsBusy(true);
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    try {
      await onUpdateTasks(updatedTasks);
    } catch (error) {
      console.error("Erreur suppression tâche:", error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleImportTemplate = async (template: ChecklistTemplate) => {
    if (isBusy || isReadOnly) return;
    setIsBusy(true);
    try {
      await assignChecklistToSite(site.id, template);
      setShowTemplatePicker(false);
    } catch (error) {
      console.error("Erreur import template:", error);
    } finally {
      setIsBusy(false);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Progress & Tools */}
      <div className="space-y-4">
        <div className="bg-[#1a4d44] rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
          <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
              <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Avancement global</p>
              <h4 className="text-2xl font-black">{progress}% <span className="text-emerald-400/50 text-sm font-bold">terminé</span></h4>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl">
              <ListChecks size={24} className="text-emerald-300" />
            </div>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative z-10">
            <div 
              className="h-full bg-emerald-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(52,211,153,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-emerald-300/60 font-medium mt-4 italic relative z-10">
            {completedCount} tâches sur {tasks.length} validées
          </p>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Template Importer */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            disabled={isBusy || isReadOnly}
            onClick={() => setShowTemplatePicker(!showTemplatePicker)}
            className="w-full flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-4 text-xs font-black text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <Library size={18} className="text-emerald-600" />
              <span className="uppercase tracking-widest">Importer un modèle de checklist</span>
            </div>
            <ChevronDown size={16} className={`text-slate-300 transition-transform ${showTemplatePicker ? 'rotate-180' : ''}`} />
          </button>

          {showTemplatePicker && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] py-3 animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
              <p className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2">Sélectionnez un standard</p>
              {checklists.length === 0 ? (
                <p className="px-5 py-4 text-xs text-slate-400 font-medium italic">Aucun modèle créé dans la bibliothèque.</p>
              ) : (
                checklists.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleImportTemplate(template)}
                    className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-900">{template.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{template.category}</p>
                    </div>
                    <Check size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <div className="px-2 flex items-center justify-between">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions du chantier</h3>
          {isBusy && <Loader2 className="animate-spin text-emerald-600" size={14} />}
        </div>

        {/* Quick Add Form */}
        {isReadOnly ? (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Ce chantier est en lecture seule</p>
          </div>
        ) : (
          <form
            onSubmit={addTask}
            className="relative group"
          >
            <input
              type="text"
              placeholder="Saisir une tâche + Entrée..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-5 pr-12 py-4 text-xs font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 outline-none transition-all shadow-inner placeholder:text-slate-300 disabled:opacity-50"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              disabled={isBusy}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-md"
              disabled={!newTaskLabel.trim() || isBusy}
            >
              <Plus size={18} />
            </button>
          </form>
        )}
        
        <div className="space-y-2.5">
          {tasks.length === 0 ? (
            <div className="py-16 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 bg-slate-50/20">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-50">
                <ListChecks size={24} strokeWidth={1} className="opacity-30" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aucune tâche assignée</p>
               <p className="text-[9px] font-bold mt-1 text-slate-400 italic">Utilisez le bouton d'importation ou saisissez-en une</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`group flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all animate-in slide-in-from-right-2 duration-300 ${
                  task.completed
                    ? 'bg-slate-50/50 border-transparent'
                    : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'
                } ${isBusy ? 'opacity-70 cursor-wait' : isReadOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`transition-all duration-300 ${task.completed ? 'text-emerald-500 scale-110' : 'text-slate-200 group-hover:text-emerald-400'}`}>
                  {task.completed ? (
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg border-2 border-current bg-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-bold transition-all flex items-center gap-2 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.label}
                    {task.isCritical && (
                      <span className={`p-1 rounded bg-amber-50 text-amber-500 ${task.completed ? 'opacity-30' : ''}`}>
                        <AlertTriangle size={10} />
                      </span>
                    )}
                  </span>
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={(e) => deleteTask(e, task.id)}
                    disabled={isBusy}
                    className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90 disabled:opacity-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistTab;
