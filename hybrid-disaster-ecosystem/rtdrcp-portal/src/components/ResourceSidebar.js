'use client';
import { useState } from 'react';
import { Truck, Users, Heart, Anchor, Plane, Radio, Plus, Send } from 'lucide-react';

const RESOURCE_ICONS = {
  ndrf: Users,
  boat: Anchor,
  helicopter: Plane,
  ambulance: Heart,
  fire_brigade: Radio,
  supply_truck: Truck,
  field_hospital: Heart,
  team: Users,
  vehicle: Truck,
  medical_unit: Heart,
};

const STATUS_COLORS = {
  available: { color: '#00FF88', label: 'AVAIL' },
  deployed: { color: '#FF6B2B', label: 'DEPLOYED' },
  en_route: { color: '#FFD700', label: 'EN ROUTE' },
  unavailable: { color: '#4A5568', label: 'UNAVAIL' },
};

export default function ResourceSidebar({ resources, onDispatch }) {
  const [capMessage, setCapMessage] = useState('');
  const [capSeverity, setCapSeverity] = useState('Extreme');
  const [showCAPPanel, setShowCAPPanel] = useState(false);

  const available = resources.filter(r => r.status === 'available');
  const deployed = resources.filter(r => r.status !== 'available' && r.status !== 'unavailable');

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg, #060F1F 0%, #0A1628 100%)' }}
    >
      {/* Resources Header */}
      <div className="px-3 py-2.5 border-b" style={{ borderColor: 'rgba(0, 180, 255, 0.15)' }}>
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: '#00FF88', fontFamily: 'var(--font-outfit)' }}
          >
            Resources & Assets
          </span>
          <div className="flex gap-2 text-xs font-mono">
            <span style={{ color: '#00FF88' }}>{available.length} avail</span>
            <span style={{ color: '#FF6B2B' }}>{deployed.length} out</span>
          </div>
        </div>
      </div>

      {/* Resource list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {resources.map(resource => (
          <ResourceCard key={resource.resourceId} resource={resource} onDispatch={onDispatch} />
        ))}
      </div>

      {/* CAP Alert Panel Toggle */}
      <div className="border-t" style={{ borderColor: 'rgba(255,31,61,0.2)' }}>
        <button
          onClick={() => setShowCAPPanel(!showCAPPanel)}
          className="w-full px-3 py-2.5 flex items-center justify-between transition-all duration-200"
          style={{
            background: showCAPPanel ? 'rgba(255,31,61,0.1)' : 'transparent',
            color: '#FF1F3D',
          }}
        >
          <div className="flex items-center gap-2">
            <Radio size={12} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-outfit)' }}>
              Issue CAP Alert
            </span>
          </div>
          <span className="text-xs font-mono opacity-60">{showCAPPanel ? '▼' : '▶'}</span>
        </button>

        {showCAPPanel && (
          <div className="px-3 pb-3 space-y-2 animate-fade-in">
            <select
              value={capSeverity}
              onChange={e => setCapSeverity(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded font-mono"
              style={{
                background: '#0F2040',
                border: '1px solid rgba(255,31,61,0.3)',
                color: '#FF1F3D',
                outline: 'none',
              }}
            >
              {['Extreme', 'Severe', 'Moderate', 'Minor'].map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
            <textarea
              value={capMessage}
              onChange={e => setCapMessage(e.target.value)}
              placeholder="Enter emergency broadcast message..."
              rows={3}
              className="w-full text-xs px-2 py-1.5 rounded font-mono resize-none"
              style={{
                background: '#0F2040',
                border: '1px solid rgba(255,31,61,0.2)',
                color: '#E0E8F0',
                outline: 'none',
              }}
            />
            <button
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #8B0000, #FF1F3D)',
                color: 'white',
                boxShadow: '0 0 12px rgba(255,31,61,0.3)',
              }}
              onClick={() => alert(`CAP Alert Issued:\n[${capSeverity.toUpperCase()}] ${capMessage}`)}
            >
              <Send size={12} />
              Broadcast CAP Alert
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource, onDispatch }) {
  const Icon = RESOURCE_ICONS[resource.subType] || RESOURCE_ICONS[resource.type] || Truck;
  const statusCfg = STATUS_COLORS[resource.status] || STATUS_COLORS.unavailable;
  const loadPct = resource.capacity > 0 ? Math.round((resource.currentLoad / resource.capacity) * 100) : 0;

  return (
    <div
      className="p-2 rounded-lg transition-all duration-200 group"
      style={{
        background: 'rgba(15, 32, 64, 0.6)',
        border: `1px solid rgba(0, 180, 255, 0.1)`,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: `${statusCfg.color}15`, border: `1px solid ${statusCfg.color}40` }}
        >
          <Icon size={11} style={{ color: statusCfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-200 font-medium truncate">{resource.name}</span>
            <span
              className="text-xs font-mono ml-1 flex-shrink-0"
              style={{ color: statusCfg.color, fontSize: '9px' }}
            >
              {statusCfg.label}
            </span>
          </div>
          {resource.capacity > 0 && (
            <div className="mt-0.5 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${loadPct}%`, background: statusCfg.color }}
              />
            </div>
          )}
        </div>
        {resource.status === 'available' && (
          <button
            onClick={() => onDispatch && onDispatch(resource)}
            className="flex-shrink-0 p-1 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
            style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)', color: '#00FF88' }}
            title="Dispatch Resource"
          >
            <Send size={9} />
          </button>
        )}
      </div>
    </div>
  );
}
