// =============================================
// ECOSPHERE — Main App Layout v2 (Phase 2)
// Added: Events panel, Evolution panel
// =============================================
import React, { useEffect } from 'react';
import { useSimulationStore, useUIStore } from './store';
import BiodomeCanvas from './ui/panels/BiodomeCanvas';
import EnvironmentPanel from './ui/panels/EnvironmentPanel';
import SpeciesPanel from './ui/panels/SpeciesPanel';
import AnalyticsPanel from './ui/panels/AnalyticsPanel';
import ControlsBar from './ui/controls/ControlsBar';
import NotificationSystem from './ui/panels/NotificationSystem';
import type { ActivePanel } from './types';

interface NavItem {
  panel: ActivePanel;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { panel: 'environment', icon: '⚗️',  label: 'ENV'      },
  { panel: 'species',     icon: '🧬',  label: 'SPECIES'  },
  { panel: 'analytics',   icon: '📊',  label: 'DATA'     },
];

const App: React.FC = () => {
  const { ui, setActivePanel } = useUIStore();
  const { addNotification } = useSimulationStore();

  useEffect(() => {
    setTimeout(() => {
      addNotification('Welcome to ECOSPHERE! Design a self-sustaining ecosystem.', 'info', '🌱');
    }, 600);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#000308] flex flex-col select-none">
      {/* Background grid */}
      <div className="absolute inset-0 grid-overlay opacity-25 pointer-events-none" />

      {/* Ambient center glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65vmin] h-[65vmin] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.025) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Main area ── */}
      <div className="relative flex-1 flex min-h-0">

        {/* ── Left Nav ── */}
        <div
          className="relative z-20 flex flex-col items-center py-4 px-1.5 gap-1.5"
          style={{
            background: 'rgba(0,4,10,0.88)',
            borderRight: '1px solid rgba(0,255,255,0.07)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Logo */}
          <div className="mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center animate-dome-pulse"
              style={{
                background: 'rgba(0,255,255,0.07)',
                border: '1px solid rgba(0,255,255,0.18)',
              }}
            >
              <span className="text-lg">🌐</span>
            </div>
          </div>
          <div className="w-6 h-px bg-cyan-400/10 mb-1" />

          {/* Nav buttons */}
          {NAV_ITEMS.map(({ panel, icon, label }) => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              title={label}
              className={`group flex flex-col items-center gap-0.5 w-11 py-2 px-0.5 rounded-xl transition-all duration-200 ${
                ui.activePanel === panel
                  ? 'bg-cyan-400/12 border border-cyan-400/28 shadow-[0_0_14px_rgba(0,255,255,0.12)]'
                  : 'border border-transparent hover:bg-white/[0.035] hover:border-white/[0.09]'
              }`}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span
                className={`text-[7px] font-mono tracking-wider transition-colors ${
                  ui.activePanel === panel ? 'text-cyan-300/90' : 'text-white/22 group-hover:text-white/45'
                }`}
              >
                {label}
              </span>
            </button>
          ))}

          <div className="flex-1" />

          {/* Mode indicator */}
          <div
            className="text-[7px] font-mono text-cyan-400/20 tracking-widest"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            SANDBOX MODE
          </div>
        </div>

        {/* ── Side Panel ── */}
        {ui.activePanel && (
          <div
            className="relative z-10 w-80 flex-shrink-0 flex flex-col border-r"
            style={{
              background: 'rgba(0,6,18,0.88)',
              borderColor: 'rgba(0,255,255,0.07)',
              backdropFilter: 'blur(22px)',
            }}
          >
            {/* Top gradient */}
            <div
              className="absolute inset-x-0 top-0 h-20 pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(0,255,255,0.018) 0%, transparent 100%)' }}
            />
            <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
              {ui.activePanel === 'environment' && <EnvironmentPanel />}
              {ui.activePanel === 'species'     && <SpeciesPanel />}
              {ui.activePanel === 'analytics'   && <AnalyticsPanel />}
            </div>
          </div>
        )}

        {/* ── Biodome Viewport ── */}
        <div className="relative flex-1 min-w-0">
          <BiodomeCanvas />
        </div>
      </div>

      {/* ── Bottom Controls ── */}
      <div
        className="relative z-20 h-14 flex-shrink-0"
        style={{
          background: 'rgba(0,4,14,0.92)',
          borderTop: '1px solid rgba(0,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.25), transparent)' }}
        />
        <ControlsBar />
      </div>

      {/* ── Notifications ── */}
      <NotificationSystem />

      {/* Version tag */}
      <div className="fixed bottom-16 right-2 text-[8px] font-mono text-white/8 pointer-events-none">
        ECOSPHERE v1.0 · PHASE 1
      </div>
    </div>
  );
};

export default App;
