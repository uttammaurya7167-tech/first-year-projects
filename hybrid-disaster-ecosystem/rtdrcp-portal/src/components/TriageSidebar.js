'use client';
import { useState } from 'react';
import { AlertTriangle, Flame, Droplets, Heart, Users, Home, Search, ChevronRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const INCIDENT_ICONS = {
  flood: Droplets,
  fire: Flame,
  collapse: AlertTriangle,
  medical: Heart,
  missing: Search,
  shelter: Home,
  other: AlertTriangle,
};

const SEVERITY_CONFIG = {
  P1_critical: { label: 'P1 CRITICAL', color: '#FF1F3D', bg: 'rgba(255,31,61,0.1)', border: 'rgba(255,31,61,0.4)' },
  P2_high: { label: 'P2 HIGH', color: '#FF6B2B', bg: 'rgba(255,107,43,0.1)', border: 'rgba(255,107,43,0.4)' },
  P3_medium: { label: 'P3 MED', color: '#FFD700', bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.4)' },
  P4_low: { label: 'P4 LOW', color: '#00B4FF', bg: 'rgba(0,180,255,0.1)', border: 'rgba(0,180,255,0.4)' },
};

const STATUS_CONFIG = {
  new: { label: 'INCOMING', color: '#FF1F3D', pulse: true },
  triaged: { label: 'TRIAGED', color: '#FFD700', pulse: false },
  assigned: { label: 'ASSIGNED', color: '#00B4FF', pulse: false },
  in_progress: { label: 'IN PROGRESS', color: '#00FF88', pulse: false },
  resolved: { label: 'RESOLVED', color: '#4A5568', pulse: false },
};

export default function TriageSidebar({ incidents, onSelectIncident, selectedId }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? incidents
    : incidents.filter(i => i.aiTriage?.severity === filter || i.status === filter);

  const sortedIncidents = [...filtered].sort((a, b) => {
    const priorityOrder = { P1_critical: 0, P2_high: 1, P3_medium: 2, P4_low: 3 };
    return (priorityOrder[a.aiTriage?.severity] ?? 9) - (priorityOrder[b.aiTriage?.severity] ?? 9);
  });

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg, #060F1F 0%, #0A1628 100%)' }}
    >
      {/* Header */}
      <div
        className="px-3 py-2.5 border-b"
        style={{ borderColor: 'rgba(0, 180, 255, 0.15)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: '#FF1F3D' }} />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#FF1F3D', fontFamily: 'var(--font-outfit)' }}
            >
              Live Triage Queue
            </span>
          </div>
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,31,61,0.15)', color: '#FF1F3D', border: '1px solid rgba(255,31,61,0.3)' }}
          >
            {incidents.filter(i => i.status === 'new').length} NEW
          </span>
        </div>
        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'new', 'triaged', 'assigned'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-2 py-0.5 rounded-full transition-all duration-200"
              style={{
                background: filter === f ? 'rgba(0, 180, 255, 0.2)' : 'transparent',
                border: `1px solid ${filter === f ? 'rgba(0,180,255,0.5)' : 'rgba(0,180,255,0.15)'}`,
                color: filter === f ? '#00B4FF' : '#64748B',
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Incident list */}
      <div className="flex-1 overflow-y-auto">
        {sortedIncidents.map(incident => (
          <IncidentCard
            key={incident.incidentId}
            incident={incident}
            isSelected={selectedId === incident.incidentId}
            onClick={() => onSelectIncident(incident)}
          />
        ))}
      </div>

      {/* AI Status bar */}
      <div
        className="px-3 py-2 border-t text-xs"
        style={{ borderColor: 'rgba(0, 180, 255, 0.15)', background: 'rgba(0,180,255,0.03)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00FF88', boxShadow: '0 0 4px #00FF88' }} />
          <span className="text-slate-500 font-mono">AI Triage Engine</span>
          <span className="ml-auto" style={{ color: '#00FF88' }}>ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

function IncidentCard({ incident, isSelected, onClick }) {
  const Icon = INCIDENT_ICONS[incident.incidentType] || AlertTriangle;
  const severity = SEVERITY_CONFIG[incident.aiTriage?.severity] || SEVERITY_CONFIG.P4_low;
  const statusCfg = STATUS_CONFIG[incident.status] || STATUS_CONFIG.new;

  return (
    <div
      onClick={onClick}
      className="px-3 py-2.5 border-b cursor-pointer transition-all duration-200 group"
      style={{
        borderColor: 'rgba(0, 180, 255, 0.08)',
        background: isSelected ? 'rgba(0, 180, 255, 0.07)' : 'transparent',
        borderLeft: isSelected ? `3px solid #00B4FF` : '3px solid transparent',
      }}
    >
      <div className="flex items-start gap-2">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center mt-0.5"
          style={{ background: severity.bg, border: `1px solid ${severity.border}` }}
        >
          <Icon size={12} style={{ color: severity.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="text-xs font-mono font-bold px-1 py-0.5 rounded"
              style={{ background: severity.bg, color: severity.color, border: `1px solid ${severity.border}`, fontSize: '9px' }}
            >
              {severity.label}
            </span>
            <span
              className={`text-xs font-mono ${statusCfg.pulse ? 'animate-pulse' : ''}`}
              style={{ color: statusCfg.color, fontSize: '9px' }}
            >
              {statusCfg.label}
            </span>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-1">
            {incident.aiTriage?.triageNotes || incident.rawDescription}
          </p>

          <div className="flex items-center gap-2 text-slate-500" style={{ fontSize: '10px' }}>
            <span className="font-mono">📍 {incident.location?.landmark}</span>
            <span className="ml-auto flex items-center gap-1">
              <Clock size={9} />
              {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        <ChevronRight size={12} className="flex-shrink-0 text-slate-600 group-hover:text-blue-400 transition-colors mt-1" />
      </div>
    </div>
  );
}
