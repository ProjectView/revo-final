
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar as CalendarIcon, ExternalLink, AlertTriangle, X } from 'lucide-react';
import { Site, Status } from '../types';
import SiteDetailModal from './SiteDetailModal';
import { useData } from '../context/DataContext';

type CalendarMode = 'Semaine' | 'Mois' | 'Année';

const CalendarView: React.FC = () => {
  const { sites, updateSite, checkCapacity, company, addNotification } = useData();
  const [viewMode, setViewMode] = useState<CalendarMode>('Mois');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Statuts par défaut
  const DEFAULT_STATUSES: Status[] = ['NOUVEAU', 'EN RÉVISION', 'EN COURS', 'TERMINÉ'];
  const statuses = useMemo(
    () => (company?.siteStatuses && company.siteStatuses.length > 0
      ? company.siteStatuses as Status[]
      : DEFAULT_STATUSES),
    [company?.siteStatuses]
  );

  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);

  // Initialiser selectedStatuses avec tous les statuts disponibles
  useMemo(() => {
    setSelectedStatuses(statuses);
  }, [statuses]);

  // State for resize handling
  const [resizing, setResizing] = useState<{ siteId: string; direction: 'start' | 'end' } | null>(null);

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case 'EN RÉVISION': return { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' };
      case 'NOUVEAU': return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' };
      case 'EN COURS': return { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' };
      case 'TERMINÉ': return { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-700' };
      default: return { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700' };
    }
  };

  const toggleStatusFilter = (status: Status) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const filteredSites = useMemo(() => {
    return sites.filter(s => selectedStatuses.includes(s.status));
  }, [sites, selectedStatuses]);

  const weekDays = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  const weekDaysShort = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  
  const HOUR_HEIGHT = 70;
  const START_HOUR = 7;
  const END_HOUR = 21;
  const MONTH_EVENT_HEIGHT = 30;

  const toLocalISOString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseTime = (timeStr?: string) => {
    if (!timeStr) return 8;
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    let startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
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
    const sortedSites = [...filteredSites].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    sortedSites.forEach(site => {
      let slot = 0;
      const start = new Date(site.startDate);
      const end = new Date(site.endDate);
      while (true) {
        const hasCollision = Object.entries(slots).some(([otherId, otherSlot]) => {
          if (otherSlot !== slot) return false;
          const otherSite = filteredSites.find(s => s.id === otherId);
          if (!otherSite) return false;
          return (start <= new Date(otherSite.endDate) && end >= new Date(otherSite.startDate));
        });
        if (!hasCollision) { slots[site.id] = slot; break; }
        slot++;
      }
    });
    return slots;
  }, [filteredSites]);

  // Calculate concurrent sites for a given date/time range
  const getSimultaneousSites = (date: string, siteId: string) => {
    return sites.filter(s =>
      s.id !== siteId &&
      date >= s.startDate &&
      date <= s.endDate
    );
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Année') newDate.setFullYear(newDate.getFullYear() - 1);
    else if (viewMode === 'Mois') newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Année') newDate.setFullYear(newDate.getFullYear() + 1);
    else if (viewMode === 'Mois') newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const onSiteDragStart = (e: React.DragEvent, siteId: string, draggedDateStr: string) => {
    e.dataTransfer.setData('siteId', siteId);
    e.dataTransfer.setData('draggedDate', draggedDateStr);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDayDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDayDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const siteId = e.dataTransfer.getData('siteId');
    const draggedDateStr = e.dataTransfer.getData('draggedDate');
    const site = sites.find(s => s.id === siteId);
    if (site && draggedDateStr) {
      const originalStart = new Date(site.startDate);
      const draggedDay = new Date(draggedDateStr);
      const offsetMs = draggedDay.getTime() - originalStart.getTime();
      const durationMs = new Date(site.endDate).getTime() - originalStart.getTime();
      const newStart = new Date(targetDate.getTime() - offsetMs);
      const newEnd = new Date(newStart.getTime() + durationMs);

      const newStartStr = toLocalISOString(newStart);
      const newEndStr = toLocalISOString(newEnd);

      const capacity = checkCapacity(newStartStr, newEndStr, siteId);
      if (capacity.exceeds) {
        addNotification(
          `Alerte Capacité : Ce déplacement place ${capacity.maxCount + 1} chantiers en simultané sur cette période (seuil : ${company?.maxSimultaneousSites}).`,
          'warning'
        );
      }

      await updateSite(siteId, {
        startDate: newStartStr,
        endDate: newEndStr
      });
    }
  };

  const onResizeStart = (e: React.MouseEvent | React.TouchEvent, siteId: string, direction: 'start' | 'end') => {
    e.stopPropagation();
    setResizing({ siteId, direction });
  };

  React.useEffect(() => {
    if (!resizing) return;

    const handleResizeEnd = (e: MouseEvent | TouchEvent) => {
      const site = sites.find(s => s.id === resizing.siteId);
      if (!site) {
        setResizing(null);
        return;
      }

      // Get client coordinates from both mouse and touch events
      let clientX: number, clientY: number;
      if (e instanceof TouchEvent) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const target = document.elementFromPoint(clientX, clientY);
      if (!target) {
        setResizing(null);
        return;
      }

      // Find the day cell that was dropped on
      let dayCell = target as HTMLElement;
      while (dayCell && !dayCell.dataset.date) {
        dayCell = dayCell.parentElement as HTMLElement;
      }

      if (dayCell && dayCell.dataset.date) {
        const newDate = dayCell.dataset.date;
        const updates: Partial<Site> = {};

        if (resizing.direction === 'start') {
          // Check if new start date is before end date
          if (newDate <= site.endDate) {
            updates.startDate = newDate;
          }
        } else {
          // Check if new end date is after start date
          if (newDate >= site.startDate) {
            updates.endDate = newDate;
          }
        }

        if (Object.keys(updates).length > 0) {
          const newStartStr = updates.startDate || site.startDate;
          const newEndStr = updates.endDate || site.endDate;
          const capacity = checkCapacity(newStartStr, newEndStr, resizing.siteId);
          if (capacity.exceeds) {
            addNotification(
              `Alerte Capacité : Ce changement place ${capacity.maxCount + 1} chantiers en simultané (seuil : ${company?.maxSimultaneousSites}).`,
              'warning'
            );
          }
          updateSite(resizing.siteId, updates);
        }
      }

      setResizing(null);
    };

    document.addEventListener('mouseup', handleResizeEnd);
    document.addEventListener('touchend', handleResizeEnd);
    return () => {
      document.removeEventListener('mouseup', handleResizeEnd);
      document.removeEventListener('touchend', handleResizeEnd);
    };
  }, [resizing, sites, updateSite, checkCapacity, company, addNotification]);

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-1 scrollbar-hide pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in duration-500">
          {monthNames.map((name, monthIdx) => {
            const days = getDaysInMonth(year, monthIdx);
            const monthStart = new Date(year, monthIdx, 1);
            const monthEnd = new Date(year, monthIdx + 1, 0);
            const monthSites = filteredSites.filter(s => {
              const sStart = new Date(s.startDate);
              const sEnd = new Date(s.endDate);
              return sStart <= monthEnd && sEnd >= monthStart;
            });
            return (
              <div key={name} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all group flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{name}</h3>
                  <button onClick={() => { setCurrentDate(new Date(year, monthIdx, 1)); setViewMode('Mois'); }} className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Détails</button>
                </div>
                <div className="grid grid-cols-7 text-center mb-2">{weekDaysShort.map(d => <span key={d} className="text-[8px] font-black text-slate-300">{d}</span>)}</div>
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {days.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="h-8" />;
                    const dStr = toLocalISOString(day);
                    const daySites = filteredSites.filter(s => dStr >= s.startDate && dStr <= s.endDate);
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div key={i} className="h-8 flex flex-col items-center justify-center relative">
                        <span className={`text-[10px] font-bold ${isToday ? 'bg-emerald-600 text-white w-6 h-6 rounded-lg flex items-center justify-center shadow-md' : 'text-slate-600'}`}>{day.getDate()}</span>
                        <div className="flex gap-0.5 mt-0.5">{daySites.slice(0, 3).map(s => <div key={s.id} className={`w-1 h-1 rounded-full ${s.color || 'bg-blue-500'}`} />)}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-auto border-t border-slate-50 pt-4 space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Chantiers du mois</p>
                  {monthSites.length === 0 ? <p className="text-[10px] text-slate-300 italic px-1">Aucune activité</p> : (
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto scrollbar-hide pr-1">
                      {monthSites.map(site => (
                        <button key={site.id} onClick={() => setSelectedSite(site)} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors group/item text-left">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${site.color || 'bg-blue-500'}`} />
                          <span className="text-[10px] font-black text-slate-600 truncate uppercase tracking-tighter flex-1">{site.name}</span>
                          <ExternalLink size={10} className="text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const limit = company?.maxSimultaneousSites || 2;

    return (
      <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col animate-in fade-in duration-500 w-full">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1200px] flex flex-col">
            <div className="grid grid-cols-7 border-b border-emerald-800 bg-emerald-900 sticky top-0 z-10">
              {weekDays.map(day => <div key={day} className="py-5 text-center text-[10px] font-black text-emerald-50/90 uppercase tracking-[0.2em]">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 bg-slate-100/20">
              {monthDays.map((day, i) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const dStr = toLocalISOString(day);

                // Calcul du chevauchement pour ce jour précis
                const daySites = filteredSites.filter(s => dStr >= s.startDate && dStr <= s.endDate);
                const isOverLimit = daySites.length > limit;

                return (
                  <div
                    key={i}
                    data-date={dStr}
                    onDragOver={onDayDragOver}
                    onDrop={(e) => onDayDrop(e, day)}
                    className={`border-r border-b border-slate-100 flex flex-col relative min-h-[140px] transition-colors group
                      ${!isCurrentMonth ? 'bg-slate-50/40 opacity-40' : 'bg-white'}
                      ${isOverLimit ? 'bg-rose-50/50 ring-2 ring-inset ring-rose-100/50' : 'hover:bg-slate-50/80'}
                    `}
                  >
                    <div className="flex justify-between items-center h-10 px-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-black flex items-center justify-center transition-all ${day.toDateString() === new Date().toDateString() ? 'bg-emerald-600 text-white w-8 h-8 rounded-xl shadow-md' : 'text-slate-400'}`}>
                          {day.getDate()}
                        </span>
                        {isOverLimit && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-600 rounded-lg animate-pulse" title={`${daySites.length} chantiers simultanés`}>
                            <AlertTriangle size={12} />
                            <span className="text-[10px] font-black">{daySites.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 relative mt-2 px-1">
                      {filteredSites.map(site => {
                        if (dStr < site.startDate || dStr > site.endDate) return null;
                        const slotIndex = siteSlots[site.id] || 0;
                        const isStart = dStr === site.startDate;
                        const isEnd = dStr === site.endDate;
                        return (
                          <div
                            key={site.id}
                            draggable={!resizing}
                            onDragStart={(e) => onSiteDragStart(e, site.id, dStr)}
                            onClick={() => setSelectedSite(site)}
                            style={{ top: `${slotIndex * MONTH_EVENT_HEIGHT}px` }}
                            className={`absolute left-0 right-0 h-[24px] flex items-center px-3 cursor-grab active:cursor-grabbing transition-all hover:brightness-110 z-10 text-white shadow-sm font-black ${site.color || 'bg-blue-600'} ${isStart ? 'rounded-l-xl ml-2' : ''} ${isEnd ? 'rounded-r-xl mr-2' : ''} group`}
                          >
                            {isStart && (
                              <div
                                onMouseDown={(e) => onResizeStart(e, site.id, 'start')}
                                onTouchStart={(e) => onResizeStart(e, site.id, 'start')}
                                className="absolute -left-1 top-0 bottom-0 w-3 cursor-col-resize hover:bg-white/30 rounded-l-xl group-hover:opacity-100 opacity-0 transition-opacity active:opacity-100 touch-none"
                                title="Redimensionner le début"
                              />
                            )}
                            {(isStart || day.getDay() === 1) && <p className="text-[11px] truncate uppercase tracking-tight pointer-events-none">{site.name}</p>}
                            {isEnd && (
                              <div
                                onMouseDown={(e) => onResizeStart(e, site.id, 'end')}
                                onTouchStart={(e) => onResizeStart(e, site.id, 'end')}
                                className="absolute -right-1 top-0 bottom-0 w-3 cursor-col-resize hover:bg-white/30 rounded-r-xl group-hover:opacity-100 opacity-0 transition-opacity active:opacity-100 touch-none"
                                title="Redimensionner la fin"
                              />
                            )}
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
  };

  const renderWeekView = () => {
    // Calculate max concurrent slots across entire week
    const maxSlots = Math.max(...Object.values(siteSlots), 0) + 1; // +1 because slots are 0-indexed

    return (
      <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 w-full">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1200px] flex flex-col">
            <div className="flex border-b border-emerald-800 bg-emerald-900 sticky top-0 z-40">
              <div className="w-24 border-r border-emerald-800/50"></div>
              {currentWeekDays.map((date, i) => (
                <div key={i} className="flex-1 py-6 text-center">
                  <p className="text-[10px] font-black text-emerald-100/70 uppercase tracking-[0.2em]">{weekDays[i]}</p>
                  <p className="text-2xl font-black mt-1 text-white">{date.getDate()}</p>
                </div>
              ))}
            </div>
            <div className="flex min-h-[800px] relative">
              <div className="w-24 border-r border-slate-100 bg-slate-50/30 sticky left-0 z-30">
                {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR).map(h => (
                  <div key={h} style={{ height: `${HOUR_HEIGHT}px` }} className="border-b border-slate-100 flex items-start justify-center pt-3"><span className="text-[10px] font-black text-slate-400">{h}:00</span></div>
                ))}
              </div>
              <div className="flex-1 flex">
                {currentWeekDays.map((date, dayIdx) => (
                  <div key={dayIdx} className="flex-1 border-r border-slate-100 relative group">
                    {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => <div key={i} style={{ height: `${HOUR_HEIGHT}px` }} className="border-b border-slate-100 group-hover:bg-slate-50/30 transition-colors"></div>)}
                    {filteredSites.map(site => {
                      const dStr = toLocalISOString(date);
                      if (dStr < site.startDate || dStr > site.endDate) return null;
                      const startVal = dStr === site.startDate ? parseTime(site.startTime) : START_HOUR;
                      const endVal = dStr === site.endDate ? parseTime(site.endTime) : END_HOUR;
                      const cStart = Math.max(START_HOUR, startVal), cEnd = Math.min(END_HOUR, endVal);
                      if (cStart >= cEnd) return null;

                      // Use slot-based positioning across entire duration
                      const slotIndex = siteSlots[site.id] || 0;
                      const itemWidth = maxSlots > 1 ? 100 / maxSlots : 100;
                      const itemLeft = slotIndex * (100 / maxSlots);

                      return (
                        <div
                          key={site.id}
                          onClick={() => setSelectedSite(site)}
                          style={{
                            top: `${(cStart - START_HOUR) * HOUR_HEIGHT}px`,
                            height: `${(cEnd - cStart) * HOUR_HEIGHT}px`,
                            width: `${itemWidth}%`,
                            left: `${itemLeft}%`
                          }}
                          className={`absolute p-2 opacity-95 border-l-4 cursor-pointer text-white shadow-md z-10 transition-all hover:scale-[1.01] hover:z-20 ${site.color || 'bg-blue-600'} border-white/30 flex flex-col items-center justify-start`}
                        >
                          <p className="text-xs font-black uppercase tracking-tight text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate-180' }}>
                            {site.name}
                          </p>
                          <div className="mt-1 text-[8px] font-bold opacity-80 text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate-180' }}>
                            {dStr === site.startDate ? site.startTime : '07:00'} - {dStr === site.endDate ? site.endTime : '21:00'}
                          </div>
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
  };

  return (
    <>
      <div className="w-full h-full px-6 lg:px-12 py-8 lg:py-10 flex flex-col space-y-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 flex-shrink-0">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Calendrier Opérationnel</h1>
            <p className="text-slate-500 text-base font-semibold mt-1">Données réelles synchronisées.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm w-full sm:w-auto">
              {['Semaine', 'Mois', 'Année'].map(mode => <button key={mode} onClick={() => setViewMode(mode as any)} className={`flex-1 sm:px-8 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${viewMode === mode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{mode}</button>)}
            </div>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-full sm:w-auto justify-between min-w-[240px]">
              <button onClick={handlePrev} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={22} /></button>
              <span className="px-6 font-black text-slate-800 text-sm uppercase tracking-widest text-center">
                {viewMode === 'Année' ? currentDate.getFullYear() : viewMode === 'Mois' ? currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : `Sem. ${currentWeekDays[0].getDate()} ${currentWeekDays[0].toLocaleDateString('fr-FR', { month: 'short' })}`}
              </span>
              <button onClick={handleNext} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronRight size={22} /></button>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrer par statut :</span>
          {statuses.map(status => {
            const style = getStatusStyle(status);
            const isSelected = selectedStatuses.includes(status);
            return (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${
                  isSelected
                    ? `${style.bg} ${style.text} ${style.border} border-2 shadow-sm`
                    : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${style.bg}`} />
                {status}
              </button>
            );
          })}
        </div>

        {viewMode === 'Année' ? renderYearView() : viewMode === 'Mois' ? renderMonthView() : renderWeekView()}
      </div>
      <SiteDetailModal siteId={selectedSite?.id || null} onClose={() => setSelectedSite(null)} />
    </>
  );
};

export default CalendarView;
