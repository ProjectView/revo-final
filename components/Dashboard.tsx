
import React, { useState } from 'react';
import { Clock, TrendingUp, Plus, Check, Search, Calendar, ChevronRight, HardHat, UserPlus, Zap, AlertTriangle, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSubscription } from '../hooks/useSubscription';
import { View } from '../types';
import NewSiteModal from './NewSiteModal';
import NewClientModal from './NewClientModal';
import NewLeadModal from './NewLeadModal';
import { SubscriptionBanner } from './SubscriptionBanner';

interface DashboardProps {
  onViewChange?: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { sites, leads, todos, addTodo, toggleTodo, deleteTodo, addClient } = useData();
  const { getUsagePercentage, canAddSite, canAddClient } = useSubscription();
  const [newTask, setNewTask] = useState('');
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // Calcul des chantiers actifs : Ni Nouveau, Ni Terminé
  const activeSitesCount = sites.filter(s => s.status !== 'NOUVEAU' && s.status !== 'TERMINÉ').length;
  const pipelineValue = leads.reduce((acc, curr) => acc + curr.budget, 0);
  
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTodo(newTask);
    setNewTask('');
  };

  const siteUsage = getUsagePercentage('sites');
  const clientUsage = getUsagePercentage('clients');
  const limitWarningClients = !canAddClient().allowed;
  const limitWarningSites = !canAddSite().allowed;

  return (
    <div className="p-4 sm:p-6 lg:p-12 w-full max-w-full overflow-x-hidden space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="overflow-hidden">
        <SubscriptionBanner />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Vue d'ensemble</h1>
          <p className="text-slate-500 text-base font-semibold mt-1">L'activité de votre entreprise en un coup d'œil.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
              <Clock size={24} />
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase text-[10px]">Production</span>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Chantiers Actifs</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">{activeSitesCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase text-[10px]">Opportunités</span>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Leads en cours</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">{leads.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
              <span className="text-xl font-black">€</span>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase text-[10px]">Finances</span>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Pipeline Prospect</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">{Math.round(pipelineValue).toLocaleString('fr-FR')} <span className="text-lg sm:text-xl font-bold text-slate-400">€</span></p>
          </div>
        </div>

        <div className="bg-[#1a4d44] p-4 sm:p-6 lg:p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-center">
          <h4 className="text-xs font-black mb-6 opacity-70 uppercase tracking-widest">Actions Rapides</h4>
          <div className="flex flex-col gap-4">
            <button
              disabled={limitWarningSites}
              onClick={() => setIsNewSiteModalOpen(true)}
              className={`w-full py-4 px-5 rounded-2xl flex items-center justify-between transition-all font-black text-xs uppercase tracking-widest group relative ${
                limitWarningSites
                  ? 'bg-white/5 text-white/40 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white text-white hover:text-[#1a4d44]'
              }`}
            >
              <div className="flex items-center gap-2">
                Nouveau chantier
                {siteUsage > 80 && <AlertTriangle size={14} className="text-amber-400" />}
              </div>
              <Plus size={18} />
            </button>
            <button
              onClick={() => setIsNewLeadModalOpen(true)}
              className="w-full bg-white/10 hover:bg-white text-white hover:text-[#1a4d44] py-4 px-5 rounded-2xl flex items-center justify-between transition-all font-black text-xs uppercase tracking-widest group"
            >
              Nouvelle affaire
              <Zap size={18} />
            </button>
            <button
              disabled={limitWarningClients}
              onClick={() => setIsNewClientModalOpen(true)}
              className={`w-full py-4 px-5 rounded-2xl flex items-center justify-between transition-all font-black text-xs uppercase tracking-widest group relative ${
                limitWarningClients
                  ? 'bg-white/5 text-white/40 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white text-white hover:text-[#1a4d44]'
              }`}
            >
              <div className="flex items-center gap-2">
                Nouveau client
                {clientUsage > 80 && <AlertTriangle size={14} className="text-amber-400" />}
              </div>
              <UserPlus size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
          <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Planning Réel</h3>
            </div>
            <button
              onClick={() => onViewChange?.('calendar')}
              className="text-emerald-700 font-black text-sm hover:underline flex items-center gap-1"
            >
              Calendrier complet <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex-1 min-h-[420px] p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
             {sites.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                 <HardHat size={64} strokeWidth={1} className="mb-4 opacity-20" />
                 <p className="text-sm font-bold uppercase tracking-widest">Aucun chantier planifié</p>
               </div>
             ) : (
               sites.slice(0, 4).map(site => (
                <div key={site.id} className="flex items-center gap-6 p-5 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className={`w-3 h-12 rounded-full ${site.color || 'bg-slate-400'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800">{site.name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{site.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-800">{site.startTime} - {site.endTime}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{new Date(site.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
                  </div>
                </div>
               ))
             )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-500 flex flex-col">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 className="font-black text-slate-900 text-xl sm:text-2xl tracking-tight">À faire</h3>
            <span className="bg-emerald-500 text-white px-3.5 py-1 rounded-xl text-xs font-black shadow-lg">
              {todos.filter(t => !t.completed).length}
            </span>
          </div>

          <form onSubmit={handleAddTodo} className="flex gap-3 mb-8">
            <input 
              type="text" 
              placeholder="Ajouter une tâche..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-inner"
            />
            <button type="submit" className="bg-[#1a4d44] text-white p-3.5 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg">
              <Plus size={22} />
            </button>
          </form>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[350px] scrollbar-hide">
            {todos.length === 0 ? (
              <p className="text-center text-slate-300 text-xs font-bold uppercase py-10">Toutes les tâches sont terminées !</p>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <div
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className="flex-1 flex items-center gap-4 cursor-pointer"
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      todo.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-200 group-hover:border-emerald-400 bg-white'
                    }`}>
                      {todo.completed && <Check size={14} strokeWidth={4} />}
                    </div>
                    <span className={`text-base font-bold transition-all truncate ${
                      todo.completed ? 'text-slate-300 line-through font-semibold' : 'text-slate-700'
                    }`}>
                      {todo.label}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <NewSiteModal isOpen={isNewSiteModalOpen} onClose={() => setIsNewSiteModalOpen(false)} />
      <NewLeadModal isOpen={isNewLeadModalOpen} onClose={() => setIsNewLeadModalOpen(false)} />
      <NewClientModal isOpen={isNewClientModalOpen} onClose={() => setIsNewClientModalOpen(false)} onSave={addClient} />
    </div>
  );
};

export default Dashboard;
