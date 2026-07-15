'use client';
import { AlertTriangle, MapPin, Users, Clock, Shield, Truck, ChevronDown, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_CONFIG = {
  P1_critical: { label: 'P1 CRITICAL', color: '#FF1F3D', bg: 'rgba(255,31,61,0.12)', border: 'rgba(255,31,61,0.4)' },
  P2_high:     { label: 'P2 HIGH',     color: '#FF6B2B', bg: 'rgba(255,107,43,0.12)', border: 'rgba(255,107,43,0.4)' },
  P3_medium:   { label: 'P3 MEDIUM',   color: '#FFD700', bg: 'rgba(255,215,0,0.12)',  border: 'rgba(255,215,0,0.4)' },
  P4_low:      { label: 'P4 LOW',      color: '#00B4FF', bg: 'rgba(0,180,255,0.12)',  border: 'rgba(0,180,255,0.4)' },
};

export default function IncidentDetailPanel({ incident, resources, onClose, onDispatch }) {
  if (!incident) return null;

  const severity = SEVERITY_CONFIG[incident.aiTriage?.severity] || SEVERITY_CONFIG.P4_low;
  const assignedResources = resources.filter(r =>
    (incident.assignedResourceIds || []).includes(r.resourceId)
  );
  const availableResources = resources.filter(r => r.status === 'available');

  return (
    <div
      className="glass-card p-4 relative"
      style={{
        background: 'rgba(6, 15, 31, 0.96)',
        border: `1px solid ${severity.border}`,
        boxShadow: `0 0 24px ${severity.color}20`,
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 rounded transition-all duration-200 hover:bg-white/10"
        style={{ color: '#64748B' }}
      >
        <X size={14} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3 pr-6">
        <div
          className="px-2 py-1 rounded text-xs font-mono font-bold flex-shrink-0"
          style={{ background: severity.bg, color: severity.color, border: `1px solid ${severity.border}` }}
        >
          {severity.label}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 leading-tight">
            {incident.incidentType.toUpperCase()} — {incident.location?.landmark || 'Unknown Location'}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <Users size={10} />
              {incident.casualtyCount} affected
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {incident.location?.lat?.toFixed(4)}, {incident.location?.lng?.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* AI Triage Notes */}
      {incident.aiTriage && (
        <div
          className="rounded p-2.5 mb-3"
          style={{ background: 'rgba(0, 180, 255, 0.06)', border: '1px solid rgba(0, 180, 255, 0.15)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Shield size={10} style={{ color: '#00B4FF' }} />
            <span className="text-xs font-mono uppercase" style={{ color: '#00B4FF', fontSize: '9px' }}>
              AI Triage — {(incident.aiTriage.triageConfidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {incident.aiTriage.triageNotes}
          </p>
          {incident.aiTriage.keyEntities?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {incident.aiTriage.keyEntities.map((e, i) => (
                <span
                  key={i}
                  className="text-xs px-1.5 py-0.5 rounded font-mono"
                  style={{ background: 'rgba(0,180,255,0.1)', color: '#94A3B8', border: '1px solid rgba(0,180,255,0.15)', fontSize: '9px' }}
                >
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assigned resources */}
      {assignedResources.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-mono uppercase text-slate-500 mb-1.5" style={{ fontSize: '9px' }}>Assigned Resources</p>
          <div className="flex flex-wrap gap-1.5">
            {assignedResources.map(r => (
              <span
                key={r.resourceId}
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.3)' }}
              >
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick dispatch */}
      {availableResources.length > 0 && incident.status !== 'resolved' && (
        <div>
          <p className="text-xs font-mono uppercase text-slate-500 mb-1.5" style={{ fontSize: '9px' }}>Quick Dispatch</p>
          <div className="flex flex-wrap gap-1.5">
            {availableResources.slice(0, 4).map(r => (
              <button
                key={r.resourceId}
                onClick={() => onDispatch(r)}
                className="text-xs px-2 py-1 rounded flex items-center gap-1.5 transition-all duration-200"
                style={{
                  background: 'rgba(0,255,136,0.07)',
                  border: '1px solid rgba(0,255,136,0.2)',
                  color: '#00FF88',
                }}
              >
                <Truck size={9} />
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
