
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Site } from '../types';
import SiteDetailModal from './SiteDetailModal';
import { useData } from '../context/DataContext';

type CalendarMode = 'Semaine' | 'Mois';

const CalendarView: React.FC = () => {
  const { sites } = useData();
  const [viewMode, setViewMode] = useState<CalendarMode>('Semaine');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 15));

  const weekDays = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  const HOUR_HEIGHT = 70;
  const START_HOUR = 7;
  const END_HOUR = 21;
  const MONTH_EVENT_HEIGHT = 30;

  const parseTime = (timeStr?: string) => {
    if (!timeStr) return 8;
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const dayOfWeek = firstDayOfMonth.getDay(); 
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    const startDay = new Date(firstDayOfMonth);
    startDay.setDate(startDay.getDate() - diff);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(startDay);
      d.setDate(startDay.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const currentWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const siteSlots = useMemo(() => {
    const slots: Record<string, number> = {};
    const sortedSites = [...sites].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    sortedSites.forEach(site => {
      let slot = 0;
      const start = new Date(site.startDate);
      const end = new Date(site.endDate);
      while (true) {
        const hasCollision = Object.entries(slots).some(([otherId, otherSlot]) => {
          if (otherSlot !== slot) return false;
          const otherSite = sites.find(s => s.id === otherId);
          if (!otherSite) return false;
          return (start <= new Date(otherSite.endDate) && end >= new Date(otherSite.startDate));
        });
        if (!hasCollision) { slots[site.id] = slot; break; }
        slot++;
      }
    });
    return slots;
  }, [sites]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Mois') newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Mois') newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const renderMonthView = () => (
    <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col animate-in fade-in duration-500 w-full">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-[1200px] flex flex-col">
          <div className="grid grid-cols-7 border-b border-emerald-800 bg-emerald-900 sticky top-0 z-10">
            {weekDays.map(day => (
              <div key={day} className="py-5 text-center text-[10px] font-black text-emerald-50/90 uppercase tracking-[0.2em]">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 bg-slate-100/20">
            {monthDays.map((day, i) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`border-r border-b border-slate-100 flex flex-col relative min-h-[140px] ${!isCurrentMonth ? 'bg-slate-50/40 opacity-40' : 'bg-white'} hover:bg-slate-50 transition-colors group`}>
                  <div className="flex justify-between items-center h-10 px-4 mt-2">
                    <span className={`text-base font-black flex items-center justify-center transition-all ${isToday ? 'bg-emerald-600 text-white w-8 h-8 rounded-xl shadow-md' : 'text-slate-400'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="flex-1 relative mt-2 px-1">
                    {sites.map(site => {
                      const dStr = day.toISOString().split('T')[0];
                      const sStr = site.startDate;
                      const eStr = site.endDate;
                      if (dStr < sStr || dStr > eStr) return null;
                      const isFirstDay = dStr === sStr;
                      const isLastDay = dStr === eStr;
                      const slotIndex = siteSlots[site.id] || 0;
                      return (
                        <div key={site.id} onClick={() => setSelectedSite(site)} style={{ top: `${slotIndex * MONTH_EVENT_HEIGHT}px` }}
                          className={`absolute left-0 right-0 h-[24px] flex items-center px-3 cursor-pointer transition-all hover:brightness-110 z-10 text-white shadow-sm font-black ${site.color || 'bg-blue-600'}
                            ${isFirstDay ? 'rounded-l-xl ml-2' : ''} ${isLastDay ? 'rounded-r-xl mr-2' : ''}`}>
                          {(isFirstDay || day.getDay() === 1) && <p className="text-[11px] truncate uppercase tracking-tight">{site.name}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 w-full">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-[1200px] flex flex-col">
          <div className="flex border-b border-emerald-800 bg-emerald-900 sticky top-0 z-40">
            <div className="w-24 border-r border-emerald-800/50"></div>
            {currentWeekDays.map((date, i) => (
              <div key={i} className="flex-1 py-6 text-center">
                <p className="text-[10px] font-black text-emerald-100/70 uppercase tracking-[0.2em]">{weekDays[i]}</p>
                <p className={`text-2xl font-black mt-1 ${date.toDateString() === new Date().toDateString() ? 'text-white' : 'text-white/90'}`}>
                  {date.getDate()}
                </p>
              </div>
            ))}
          </div>
          <div className="flex min-h-[800px] relative">
            <div className="w-24 border-r border-slate-100 bg-slate-50/30 sticky left-0 z-30">
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR).map(h => (
                <div key={h} style={{ height: `${HOUR_HEIGHT}px` }} className="border-b border-slate-100 flex items-start justify-center pt-3">
                  <span className="text-[10px] font-black text-slate-400">{h}:00</span>
                </div>
              ))}
            </div>
            <div className="flex-1 flex">
              {currentWeekDays.map((date, dayIdx) => (
                <div key={dayIdx} className="flex-1 border-r border-slate-100 relative group">
                  {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                    <div key={i} style={{ height: `${HOUR_HEIGHT}px` }} className="border-b border-slate-100 group-hover:bg-slate-50/30 transition-colors"></div>
                  ))}
                  {sites.map(site => {
                    const dStr = date.toISOString().split('T')[0];
                    if (dStr < site.startDate || dStr > site.endDate) return null;
                    
                    const isStartDay = dStr === site.startDate;
                    const isEndDay = dStr === site.endDate;
                    const startVal = isStartDay ? parseTime(site.startTime) : START_HOUR;
                    const endVal = isEndDay ? parseTime(site.endTime) : END_HOUR;
                    const clampedStart = Math.max(START_HOUR, startVal);
                    const clampedEnd = Math.min(END_HOUR, endVal);
                    
                    if (clampedStart >= clampedEnd) return null;

                    const top = (clampedStart - START_HOUR) * HOUR_HEIGHT;
                    const height = (clampedEnd - clampedStart) * HOUR_HEIGHT;
                    
                    return (
                      <div key={site.id} onClick={() => setSelectedSite(site)} style={{ top: `${top}px`, height: `${height}px`, width: '100%' }}
                        className={`absolute p-4 opacity-95 border-l-4 cursor-pointer text-white shadow-md z-10 transition-all hover:scale-[1.01] hover:z-20 ${site.color || 'bg-blue-600'} border-white/30`}>
                        <p className="text-sm font-black truncate uppercase tracking-tight">{site.name}</p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold opacity-80">
                          <Clock size={12} /> {isStartDay ? site.startTime : '07:00'} - {isEndDay ? site.endTime : '21:00'}
                        </div>
                        {height > 100 && (
                          <div className="mt-4 flex items-center gap-2 text-[10px] font-medium opacity-60 italic">
                             <MapPin size={10} /> {site.address}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full px-6 lg:px-12 py-8 lg:py-10 flex flex-col space-y-8 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Calendrier Opérationnel</h1>
          <p className="text-slate-500 text-base font-semibold mt-1">Données réelles synchronisées.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm w-full sm:w-auto">
            {['Semaine', 'Mois'].map(mode => (
              <button key={mode} onClick={() => setViewMode(mode as any)} 
                className={`flex-1 sm:px-8 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${viewMode === mode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                {mode}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-full sm:w-auto justify-between min-w-[240px]">
            <button onClick={handlePrev} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={22} /></button>
            <span className="px-6 font-black text-slate-800 text-sm uppercase tracking-widest text-center">
              {viewMode === 'Mois' ? currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : `Sem. ${currentWeekDays[0].getDate()} ${currentWeekDays[0].toLocaleDateString('fr-FR', { month: 'short' })}`}
            </span>
            <button onClick={handleNext} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronRight size={22} /></button>
          </div>
        </div>
      </div>
      {viewMode === 'Mois' ? renderMonthView() : renderWeekView()}
      <SiteDetailModal siteId={selectedSite?.id || null} onClose={() => setSelectedSite(null)} />
    </div>
  );
};

export default CalendarView;
