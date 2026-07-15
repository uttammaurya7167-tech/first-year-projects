'use client';
import { useState, useEffect } from 'react';
import { Shield, Wifi, WifiOff, AlertTriangle, Clock, Activity } from 'lucide-react';

export default function CommandHeader({ stats }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('live');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b"
      style={{
        background: 'linear-gradient(135deg, #060F1F 0%, #0A1628 50%, #0F2040 100%)',
        borderColor: 'rgba(0, 180, 255, 0.2)',
        height: '56px',
      }}
    >
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ background: 'linear-gradient(135deg, #FF1F3D, #8B0000)', boxShadow: '0 0 12px rgba(255,31,61,0.4)' }}
        >
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <div
            className="text-sm font-bold tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-outfit)', color: '#00B4FF', letterSpacing: '0.2em' }}
          >
            RTDRCP
          </div>
          <div className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>
            Real-Time Disaster Relief Coordination Portal
          </div>
        </div>
      </div>

      {/* Center: Live Stats */}
      <div className="hidden md:flex items-center gap-6">
        <StatPill
          icon={<AlertTriangle size={12} />}
          label="CRITICAL"
          value={stats?.critical ?? 0}
          color="#FF1F3D"
          pulse
        />
        <StatPill
          icon={<Activity size={12} />}
          label="INCIDENTS"
          value={stats?.totalIncidents ?? 0}
          color="#FF6B2B"
        />
        <StatPill
          label="MESH NODES"
          value={stats?.activeMeshNodes ?? 0}
          color="#00FF88"
        />
        <StatPill
          label="RESOURCES"
          value={`${stats?.resourcesAvailable ?? 0} avail`}
          color="#00B4FF"
        />
      </div>

      {/* Right: Time & Connection */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded"
          style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#00FF88', boxShadow: '0 0 6px #00FF88', animation: 'sosPulse 2s infinite' }}
          />
          <span className="text-xs font-mono" style={{ color: '#00FF88' }}>LIVE</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono font-semibold" style={{ color: '#00B4FF' }}>
            {formatTime(currentTime)}
          </div>
          <div className="text-xs text-slate-500">{formatDate(currentTime)} IST</div>
        </div>
      </div>
    </header>
  );
}

function StatPill({ icon, label, value, color, pulse }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span style={{ color }}>{icon}</span>}
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider" style={{ fontSize: '9px' }}>{label}</div>
        <div
          className={`text-sm font-mono font-bold ${pulse ? 'animate-pulse' : ''}`}
          style={{ color }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
