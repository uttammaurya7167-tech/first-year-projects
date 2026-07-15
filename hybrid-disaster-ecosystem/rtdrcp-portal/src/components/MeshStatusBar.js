'use client';
import { Wifi, WifiOff, Radio, RefreshCw, Database } from 'lucide-react';

export default function MeshStatusBar({ stats }) {
  const lastSync = stats?.lastSyncAt
    ? new Date(stats.lastSyncAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '--:--';

  return (
    <footer
      className="flex items-center justify-between px-4 border-t"
      style={{
        height: '32px',
        background: 'linear-gradient(90deg, #020B18 0%, #060F1F 50%, #020B18 100%)',
        borderColor: 'rgba(0, 180, 255, 0.12)',
      }}
    >
      {/* Left: Mesh cluster info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Radio size={10} style={{ color: '#00FF88' }} />
          <span className="text-xs font-mono" style={{ color: '#00FF88' }}>
            MESH: {stats?.activeMeshNodes ?? 0} NODES
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-slate-500">
            {stats?.meshClusters ?? 0} CLUSTERS
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database size={10} style={{ color: '#FFD700' }} />
          <span className="text-xs font-mono" style={{ color: '#FFD700' }}>
            {stats?.pendingSync ?? 0} PENDING SYNC
          </span>
        </div>
      </div>

      {/* Center: System status */}
      <div className="flex items-center gap-3">
        <StatusDot color="#00FF88" label="FIRESTORE" />
        <StatusDot color="#00FF88" label="AI TRIAGE" />
        <StatusDot color="#00FF88" label="CAP RELAY" />
        <StatusDot color="#FFD700" label="SATELLITE UPLINK" blink />
      </div>

      {/* Right: last sync time */}
      <div className="flex items-center gap-2">
        <RefreshCw size={9} style={{ color: '#4A5568' }} />
        <span className="text-xs font-mono text-slate-500">
          LAST SYNC {lastSync} IST
        </span>
        <span className="text-xs font-mono" style={{ color: '#4A5568' }}>
          | RTDRCP v1.0.0 | OPERATIONAL
        </span>
      </div>
    </footer>
  );
}

function StatusDot({ color, label, blink }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className={`w-1.5 h-1.5 rounded-full ${blink ? 'animate-pulse' : ''}`}
        style={{ background: color, boxShadow: `0 0 4px ${color}` }}
      />
      <span className="text-xs font-mono" style={{ color: '#4A5568', fontSize: '9px' }}>{label}</span>
    </div>
  );
}
