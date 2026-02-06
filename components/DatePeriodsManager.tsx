import React, { useState } from 'react';
import { Plus, X, Calendar, Clock } from 'lucide-react';
import { DatePeriod } from '../types';

interface DatePeriodsManagerProps {
  periods: DatePeriod[];
  isEditing: boolean;
  isReadOnly: boolean;
  onUpdate: (periods: DatePeriod[]) => void;
}

const DatePeriodsManager: React.FC<DatePeriodsManagerProps> = ({
  periods = [],
  isEditing,
  isReadOnly,
  onUpdate
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const generateId = () => `period_${Date.now()}_${Math.random()}`;

  const addPeriod = () => {
    const newPeriod: DatePeriod = {
      id: generateId(),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '17:30'
    };
    onUpdate([...periods, newPeriod]);
    setExpandedId(newPeriod.id);
  };

  const removePeriod = (id: string) => {
    if (periods.length <= 1) return; // Garder au minimum une période
    onUpdate(periods.filter(p => p.id !== id));
  };

  const updatePeriod = (id: string, updates: Partial<DatePeriod>) => {
    onUpdate(periods.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interventions</label>
          <button
            type="button"
            onClick={addPeriod}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all text-[10px] font-bold"
          >
            <Plus size={14} /> Ajouter une période
          </button>
        </div>

        <div className="space-y-3">
          {periods.map((period, index) => (
            <div
              key={period.id}
              className="border border-slate-100 rounded-2xl overflow-hidden bg-white hover:border-slate-200 transition-all"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === period.id ? null : period.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="font-bold text-slate-700">
                      {new Date(period.startDate).toLocaleDateString('fr-FR')} → {new Date(period.endDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {period.startTime || '08:00'} - {period.endTime || '17:30'}
                  </span>
                  <div className={`transform transition-transform ${expandedId === period.id ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </button>

              {expandedId === period.id && (
                <div className="px-4 pb-4 border-t border-slate-100 space-y-4 bg-slate-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Date début</label>
                      <input
                        type="date"
                        value={period.startDate}
                        onChange={(e) => updatePeriod(period.id, { startDate: e.target.value })}
                        className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Date fin</label>
                      <input
                        type="date"
                        value={period.endDate}
                        onChange={(e) => updatePeriod(period.id, { endDate: e.target.value })}
                        className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Heure début</label>
                      <div className="relative">
                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                          type="time"
                          value={period.startTime || '08:00'}
                          onChange={(e) => updatePeriod(period.id, { startTime: e.target.value })}
                          className="w-full bg-white border border-slate-100 rounded-lg pl-10 pr-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Heure fin</label>
                      <div className="relative">
                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                          type="time"
                          value={period.endTime || '17:30'}
                          onChange={(e) => updatePeriod(period.id, { endTime: e.target.value })}
                          className="w-full bg-white border border-slate-100 rounded-lg pl-10 pr-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                    </div>
                  </div>

                  {periods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePeriod(period.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all font-bold text-xs"
                    >
                      <X size={14} /> Supprimer cette période
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Mode lecture
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interventions</h3>
      <div className="space-y-2">
        {periods.map((period, index) => (
          <div
            key={period.id}
            className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-emerald-600" />
                <span className="text-sm font-bold text-slate-700">
                  {new Date(period.startDate).toLocaleDateString('fr-FR')} → {new Date(period.endDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 ml-6">
                <Clock size={12} className="text-slate-400" />
                <span className="text-[12px] text-slate-600 font-medium">
                  {period.startTime || '08:00'} - {period.endTime || '17:30'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatePeriodsManager;
