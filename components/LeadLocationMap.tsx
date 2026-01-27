import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, DollarSign } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeadLocationMapProps {
  coordinates?: [number, number] | null;
  address: string;
  leadName: string;
  budget?: number;
}

// Localisation Leaflet en français
L.Control.Zoom.prototype._zoomInTitle = 'Zoomer';
L.Control.Zoom.prototype._zoomOutTitle = 'Dézoomer';

// Composant pour ajuster la vue de la carte
const SetMapView: React.FC<{ coordinates: [number, number] }> = ({ coordinates }) => {
  const map = useMap();
  React.useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    map.setView(coordinates, 15);
  }, [coordinates, map]);
  return null;
};

// Créer un marqueur personnalisé bleu
const createLeadMarker = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 bg-blue-500 rounded-2xl rotate-45 border-2 border-white shadow-lg animate-in zoom-in-50 duration-300"></div>
        <div class="relative text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const LeadLocationMap: React.FC<LeadLocationMapProps> = ({ coordinates, address, leadName, budget }) => {
  // Coordonnées par défaut (Lyon)
  const defaultCoordinates: [number, number] = [45.75, 4.85];
  const mapCoordinates = coordinates || defaultCoordinates;

  return (
    <div className="w-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl">
      {coordinates ? (
        <MapContainer
          center={mapCoordinates}
          zoom={15}
          style={{ height: '300px', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <SetMapView coordinates={mapCoordinates} />
          <Marker position={mapCoordinates} icon={createLeadMarker()}>
            <Popup>
              <div className="p-3 flex flex-col gap-2">
                <div>
                  <h4 className="text-sm font-black text-slate-800">{leadName}</h4>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-300 flex-shrink-0" />
                    <span className="text-[10px] font-medium text-slate-600 line-clamp-2">{address}</span>
                  </div>
                  {budget !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={12} className="text-slate-300 flex-shrink-0" />
                      <span className="text-[10px] font-black text-slate-700">{budget.toLocaleString()} €</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <div className="h-[300px] bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100">
            <MapPin size={24} className="text-slate-300" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pas de localisation</p>
          <p className="text-[9px] text-slate-400 mt-1">Adresse non géolocalisée</p>
        </div>
      )}
    </div>
  );
};

export default LeadLocationMap;
