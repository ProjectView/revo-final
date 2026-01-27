import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeadLocationMapProps {
  coordinates?: [number, number] | null;
  address: string;
  leadName: string;
}

// Fix Leaflet default icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.setIcon(defaultIcon);

const LeadLocationMap: React.FC<LeadLocationMapProps> = ({ coordinates, address, leadName }) => {
  // Default coordinates to France center if not provided
  const defaultCoordinates: [number, number] = [46.2276, 2.2137];
  const mapCoordinates = coordinates || defaultCoordinates;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md">
      {coordinates ? (
        <MapContainer
          center={mapCoordinates}
          zoom={14}
          style={{ height: '280px', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={mapCoordinates}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-slate-800">{leadName}</p>
                <p className="text-slate-600">{address}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <div className="h-[280px] bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
          <MapPin size={32} className="text-slate-300 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pas de coordonnées</p>
          <p className="text-[9px] text-slate-300 mt-1">Adresse non géolocalisée</p>
        </div>
      )}
    </div>
  );
};

export default LeadLocationMap;
