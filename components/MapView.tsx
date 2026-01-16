
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Site, Status } from '../types';
import { Briefcase, MapPin, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';

// Localisation Leaflet en français
L.Control.Zoom.prototype._zoomInTitle = 'Zoomer';
L.Control.Zoom.prototype._zoomOutTitle = 'Dézoomer';

interface MapViewProps {
  sites: Site[];
  onSiteClick: (site: Site) => void;
}

// Composant pour ajuster la vue de la carte aux marqueurs
const ChangeView: React.FC<{ sites: Site[] }> = ({ sites }) => {
  const map = useMap();
  useEffect(() => {
    // CRITIQUE : Force Leaflet à recalculer sa taille de conteneur
    // (Nécessaire quand le mode vue change de liste à carte)
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    if (sites.length > 0) {
      const validCoords = sites
        .filter(s => s.coordinates)
        .map(s => s.coordinates as [number, number]);
      
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        // Ajout de maxZoom pour éviter un zoom excessif si un seul point est présent
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [sites, map]);
  return null;
};

const createCustomIcon = (status: Status) => {
  let colorClass = 'bg-slate-500';
  switch (status) {
    case 'EN RÉVISION': colorClass = 'bg-purple-500'; break;
    case 'NOUVEAU': colorClass = 'bg-blue-500'; break;
    case 'EN COURS': colorClass = 'bg-orange-500'; break;
    case 'TERMINÉ': colorClass = 'bg-emerald-500'; break;
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 ${colorClass} rounded-2xl rotate-45 border-2 border-white shadow-lg animate-in zoom-in-50 duration-300"></div>
        <div class="relative text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const MapView: React.FC<MapViewProps> = ({ sites, onSiteClick }) => {
  const { clients } = useData();
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) return <div className="w-full h-full min-h-[600px] bg-slate-50 rounded-[2rem] animate-pulse"></div>;

  return (
    <div className="w-full h-full min-h-[600px] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl relative animate-in fade-in duration-700">
      <MapContainer
        center={[45.75, 4.85]}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under_fr/{z}/{x}/{y}{r}.png"
        />
        
        <ChangeView sites={sites} />

        {sites.map(site => {
          if (!site.coordinates) return null;
          // Correction : Utilisation des clients du contexte au lieu des mocks
          const client = clients.find(c => c.id === site.clientId);
          
          return (
            <Marker 
              key={site.id} 
              position={site.coordinates} 
              icon={createCustomIcon(site.status)}
            >
              <Popup>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${client?.color || 'bg-slate-400'} flex items-center justify-center text-white text-[10px] font-black shadow-sm`}>
                      {client?.initials || '?'}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 leading-tight">{site.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{client?.name || 'Inconnu'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin size={12} className="text-slate-300" />
                      <span className="text-[10px] font-medium truncate">{site.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Briefcase size={12} className="text-slate-300" />
                      <span className="text-[10px] font-black">{site.budget.toLocaleString()} €</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onSiteClick(site)}
                    className="mt-2 w-full flex items-center justify-between px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all group"
                  >
                    Voir les détails
                    <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 text-slate-600 hover:text-emerald-600 transition-colors">
          <MapPin size={20} />
        </button>
      </div>
    </div>
  );
};

export default MapView;
