'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CommandHeader from '../components/CommandHeader';
import TriageSidebar from '../components/TriageSidebar';
import ResourceSidebar from '../components/ResourceSidebar';
import IncidentDetailPanel from '../components/IncidentDetailPanel';
import MeshStatusBar from '../components/MeshStatusBar';
import { MOCK_INCIDENTS, MOCK_RESOURCES, SYSTEM_STATS } from '../lib/mockData';

// Leaflet must be loaded client-side only (no SSR)
const MapContainer = dynamic(() => import('../components/MapContainer'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: '#020B18' }}
    >
      <div className="text-center space-y-3">
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent mx-auto animate-spin"
          style={{ borderColor: '#00B4FF', borderTopColor: 'transparent' }}
        />
        <p className="text-sm font-mono" style={{ color: '#00B4FF' }}>
          Initializing COP Map...
        </p>
      </div>
    </div>
  ),
});

export default function RTDRCPDashboard() {
  const [incidents, setIncidents]       = useState(MOCK_INCIDENTS);
  const [resources, setResources]       = useState(MOCK_RESOURCES);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [stats, setStats]               = useState(SYSTEM_STATS);
  const [newAlertCount, setNewAlertCount] = useState(0);
  const [mapCenter, setMapCenter]       = useState([22.3072, 73.1812]);
  const [mapZoom, setMapZoom]           = useState(13);

  // Simulate live incoming alerts (mock real-time)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeMeshNodes: prev.activeMeshNodes + Math.floor(Math.random() * 3 - 1),
        pendingSync: Math.max(0, prev.pendingSync + Math.floor(Math.random() * 3 - 1)),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectIncident = useCallback((incident) => {
    setSelectedIncident(incident);
    if (incident?.location?.lat) {
      setMapCenter([incident.location.lat, incident.location.lng]);
      setMapZoom(16);
    }
  }, []);

  const handleDispatchResource = useCallback((resource) => {
    if (!selectedIncident) {
      alert('Select an incident first, then dispatch a resource.');
      return;
    }
    setResources(prev =>
      prev.map(r =>
        r.resourceId === resource.resourceId
          ? { ...r, status: 'en_route', assignedIncidentIds: [selectedIncident.incidentId] }
          : r
      )
    );
    setIncidents(prev =>
      prev.map(i =>
        i.incidentId === selectedIncident.incidentId
          ? { ...i, status: 'assigned', assignedResourceIds: [...(i.assignedResourceIds || []), resource.resourceId] }
          : i
      )
    );
  }, [selectedIncident]);

  return (
    <div
      className="tactical-bg flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      {/* CRT scanline overlay */}
      <div className="scanline-overlay" />

      {/* Top command header bar */}
      <CommandHeader stats={stats} />

      {/* Main content: sidebars + map */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT SIDEBAR — Triage Queue (15% width) */}
        <aside
          className="flex-none overflow-hidden border-r"
          style={{
            width: '280px',
            borderColor: 'rgba(0, 180, 255, 0.12)',
            background: 'linear-gradient(180deg, #060F1F 0%, #0A1628 100%)',
          }}
        >
          <TriageSidebar
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
            selectedId={selectedIncident?.incidentId}
          />
        </aside>

        {/* CENTER — GIS Map (70% viewport) */}
        <main className="flex-1 relative overflow-hidden min-w-0">
          <MapContainer
            incidents={incidents}
            resources={resources}
            selectedIncident={selectedIncident}
            onSelectIncident={handleSelectIncident}
            center={mapCenter}
            zoom={mapZoom}
          />

          {/* Map overlay — active incident detail panel */}
          {selectedIncident && (
            <div
              className="absolute bottom-4 left-4 right-4 z-50 animate-fade-in"
              style={{ maxWidth: '520px' }}
            >
              <IncidentDetailPanel
                incident={selectedIncident}
                resources={resources}
                onClose={() => setSelectedIncident(null)}
                onDispatch={handleDispatchResource}
              />
            </div>
          )}

          {/* Map legend overlay */}
          <div
            className="absolute top-3 right-3 z-40 glass-card px-3 py-2 space-y-1.5"
            style={{ minWidth: '140px' }}
          >
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#00B4FF', fontSize: '9px' }}>
              Map Legend
            </p>
            <LegendItem color="#FF1F3D" label="SOS / New Incident" pulse />
            <LegendItem color="#00FF88" label="Triaged / Assigned" />
            <LegendItem color="#00B4FF" label="Responder Unit" />
            <LegendItem color="#FFD700" label="En Route" />
          </div>

          {/* Map coord overlay */}
          <div
            className="absolute bottom-3 right-3 z-40 glass-card px-2 py-1"
          >
            <span className="text-xs font-mono" style={{ color: '#4A5568' }}>
              {mapCenter[0].toFixed(4)}°N  {mapCenter[1].toFixed(4)}°E
            </span>
          </div>
        </main>

        {/* RIGHT SIDEBAR — Resources & CAP (15% width) */}
        <aside
          className="flex-none overflow-hidden border-l"
          style={{
            width: '260px',
            borderColor: 'rgba(0, 180, 255, 0.12)',
            background: 'linear-gradient(180deg, #060F1F 0%, #0A1628 100%)',
          }}
        >
          <ResourceSidebar
            resources={resources}
            onDispatch={handleDispatchResource}
          />
        </aside>
      </div>

      {/* Bottom mesh status bar */}
      <MeshStatusBar stats={stats} />
    </div>
  );
}

function LegendItem({ color, label, pulse }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${pulse ? 'animate-pulse' : ''}`}
        style={{ background: color, boxShadow: `0 0 5px ${color}` }}
      />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
