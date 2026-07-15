// =============================================
// ECOSPHERE — Time & Controls Bar
// Bottom HUD with play/pause, speed, tools
// =============================================
import React from 'react';
import { useSimulationStore, useUIStore } from '../../store';
import { globalSimulation } from '../../core/simulation/SimulationEngine';
import type { SimulationSpeed } from '../../types';
import { formatSimTime } from '../../utils/math';

const SPEEDS: SimulationSpeed[] = [0, 1, 5, 10, 50, 100, 1000];
const SPEED_LABELS: Record<SimulationSpeed, string> = {
  0: '‖ PAUSE',
  1: '▶ 1×',
  5: '▶▶ 5×',
  10: '▶▶ 10×',
  50: '▶▶▶ 50×',
  100: '⚡ 100×',
  1000: '🌀 1000×',
};

const ControlsBar: React.FC = () => {
  const {
    speed, isRunning, setSpeed, toggleRunning,
    year, stats, resetSimulation, addNotification,
    setEntities,
  } = useSimulationStore();
  const { ui, toggleOption } = useUIStore();

  const aliveCount = stats.aliveEntities;
  const diversityCount = stats.speciesDiversity;

  const handleSeed = () => {
    const domW = window.innerWidth;
    const domH = window.innerHeight;
    const cx = domW / 2;
    const cy = domH / 2;
    const r = Math.min(domW, domH) * 0.44;
    const seeded = globalSimulation.seedPopulation(r, cx, cy);
    setEntities(seeded);
    addNotification('Ecosystem seeded with initial populations', 'success', '🌱');
    if (!isRunning) toggleRunning();
  };

  const handleReset = () => {
    resetSimulation();
    globalSimulation.reset();
    addNotification('Simulation reset — all systems cleared', 'info', '🔄');
  };

  return (
    <div className="flex items-center h-full px-4 gap-3">
      {/* Left: Time info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="text-center">
          <div className="text-[10px] font-mono text-white/25 tracking-wider">SIM TIME</div>
          <div className="text-sm font-mono text-cyan-300 font-bold leading-tight">
            {formatSimTime(year)}
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="status-dot alive" />
            <span className="text-white/40">{aliveCount} organisms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400/60">🧬</span>
            <span className="text-white/40">{diversityCount} species</span>
          </div>
        </div>
      </div>

      {/* Center: Speed controls */}
      <div className="flex-1 flex items-center justify-center gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSpeed(s);
              if (s === 0) {
                if (isRunning) toggleRunning();
              } else {
                if (!isRunning) toggleRunning();
              }
            }}
            className={`text-[10px] font-mono px-2 py-1.5 rounded-lg transition-all ${
              speed === s && isRunning
                ? 'bg-cyan-400/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,255,255,0.2)]'
                : s === 0
                ? 'border border-amber-400/20 text-amber-400/50 hover:border-amber-400/40 hover:text-amber-400/80'
                : 'border border-white/10 text-white/30 hover:border-white/20 hover:text-white/60'
            }`}
          >
            {SPEED_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-2">
        {/* Seed button */}
        <button
          onClick={handleSeed}
          className="btn-green text-[10px] py-1.5 px-3"
        >
          🌱 SEED
        </button>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="btn-danger text-[10px] py-1.5 px-3"
        >
          🔄 RESET
        </button>

        {/* View options */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          {([
            { key: 'showGlow' as const, label: '✨', title: 'Toggle Glow' },
            { key: 'showTrails' as const, label: '〰', title: 'Toggle Trails' },
            { key: 'showLabels' as const, label: 'Aa', title: 'Toggle Labels' },
            { key: 'showGrid' as const, label: '⊞', title: 'Toggle Grid' },
          ]).map(({ key, label, title }) => (
            <button
              key={key}
              onClick={() => toggleOption(key)}
              title={title}
              className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                ui[key]
                  ? 'bg-cyan-400/15 border border-cyan-400/30 text-cyan-300'
                  : 'border border-white/10 text-white/25 hover:border-white/20 hover:text-white/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlsBar;
