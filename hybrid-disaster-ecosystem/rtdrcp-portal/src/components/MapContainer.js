'use client';
import { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon path issue with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ---- Custom SVG Icons ----
function createSosIcon(severity) {
  const colors = {
    P1_critical: '#FF1F3D',
    P2_high: '#FF6B2B',
    P3_medium: '#FFD700',
    P4_low: '#00B4FF',
  };
  const color = colors[severity] || '#FF1F3D';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="18" cy="18" r="14" fill="${color}" fill-opacity="0.2" filter="url(#glow)"/>
      <circle cx="18" cy="18" r="10" fill="${color}" fill-opacity="0.8" filter="url(#glow)"/>
      <circle cx="18" cy="18" r="5" fill="white"/>
      <line x1="18" y1="28" x2="18" y2="44" stroke="${color}" stroke-width="2" stroke-opacity="0.6"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: 'sos-icon',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

function createResourceIcon(subType, status) {
  const statusColors = {
    available: '#00FF88',
    deployed: '#FF6B2B',
    en_route: '#FFD700',
    unavailable: '#4A5568',
  };
  const color = statusColors[status] || '#00B4FF';

  const emojis = {
    boat: '⛵', helicopter: '🚁', ambulance: '🚑',
    fire_brigade: '🚒', supply_truck: '🚛', ndrf: '🛡️',
    field_hospital: '🏥', team: '👥',
  };
  const emoji = emojis[subType] || '📍';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect x="2" y="2" width="28" height="28" rx="6" fill="${color}" fill-opacity="0.15"/>
      <rect x="2" y="2" width="28" height="28" rx="6" fill="none" stroke="${color}" stroke-width="1.5"/>
      <text x="16" y="21" text-anchor="middle" font-size="14">${emoji}</text>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: 'resource-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// MapUpdater: smoothly pan/zoom map when center/zoom changes
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function MapContainer({
  incidents = [],
  resources = [],
  selectedIncident,
  onSelectIncident,
  center = [22.307, 73.181],
  zoom = 13,
}) {
  const SEVERITY_COLORS = {
    P1_critical: '#FF1F3D',
    P2_high: '#FF6B2B',
    P3_medium: '#FFD700',
    P4_low: '#00B4FF',
  };

  return (
    <LeafletMap
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%', background: '#020B18' }}
      zoomControl={true}
      attributionControl={true}
    >
      {/* Dark military-style tile layer */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
      />

      <MapUpdater center={center} zoom={zoom} />

      {/* Incident markers */}
      {incidents.map(incident => {
        const { lat, lng } = incident.location || {};
        if (!lat || !lng) return null;

        const severity = incident.aiTriage?.severity || 'P1_critical';
        const color = SEVERITY_COLORS[severity] || '#FF1F3D';
        const isNew = incident.status === 'new';
        const isSelected = selectedIncident?.incidentId === incident.incidentId;

        return (
          <div key={incident.incidentId}>
            {/* Pulsing radius circle */}
            <Circle
              center={[lat, lng]}
              radius={isNew ? 300 : 150}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: isNew ? 0.08 : 0.05,
                weight: isNew ? 2 : 1,
                opacity: isNew ? 0.7 : 0.4,
                dashArray: isNew ? '4 4' : null,
              }}
            />

            {/* Selected ring */}
            {isSelected && (
              <Circle
                center={[lat, lng]}
                radius={500}
                pathOptions={{
                  color: '#00B4FF',
                  fillColor: '#00B4FF',
                  fillOpacity: 0.05,
                  weight: 2,
                  dashArray: '6 3',
                }}
              />
            )}

            {/* Incident pin marker */}
            <Marker
              position={[lat, lng]}
              icon={createSosIcon(severity)}
              eventHandlers={{ click: () => onSelectIncident(incident) }}
            >
              <Popup
                className="cop-popup"
                maxWidth={280}
              >
                <div style={{ fontFamily: 'monospace', background: '#0A1628', color: '#E0E8F0', borderRadius: '6px', padding: '10px' }}>
                  <div style={{ color, fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>
                    {severity.replace('_', ' ')} — {incident.incidentType.toUpperCase()}
                  </div>
                  <p style={{ fontSize: '12px', marginBottom: '6px', lineHeight: '1.4' }}>
                    {incident.aiTriage?.triageNotes || incident.rawDescription}
                  </p>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    📍 {incident.location?.landmark}
                    <br />👥 {incident.casualtyCount} reported affected
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        );
      })}

      {/* Resource markers */}
      {resources.map(resource => {
        const { lat, lng } = resource.location || {};
        if (!lat || !lng) return null;

        return (
          <Marker
            key={resource.resourceId}
            position={[lat, lng]}
            icon={createResourceIcon(resource.subType, resource.status)}
          >
            <Popup maxWidth={200}>
              <div style={{ fontFamily: 'monospace', background: '#0A1628', color: '#E0E8F0', borderRadius: '6px', padding: '8px' }}>
                <div style={{ color: '#00FF88', fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>
                  {resource.name}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                  Status: <span style={{ color: resource.status === 'available' ? '#00FF88' : '#FF6B2B' }}>
                    {resource.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {resource.capacity > 0 && (
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    Load: {resource.currentLoad}/{resource.capacity}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </LeafletMap>
  );
}
