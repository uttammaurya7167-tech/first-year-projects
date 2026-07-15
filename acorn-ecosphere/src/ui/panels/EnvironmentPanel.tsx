// =============================================
// ECOSPHERE — Environment Control Panel
// Sliders for all 10 environment variables
// =============================================
import React, { useState } from 'react';
import { useEnvironmentStore } from '../../store';
import { ENV_VARIABLES, calculateEnvironmentSuitability } from '../../core/biology/environment';
import type { EnvironmentKey } from '../../types';
import { clamp } from '../../utils/math';

const EnvironmentPanel: React.FC = () => {
  const { env, setEnvVariable, resetEnv } = useEnvironmentStore();
  const [hoveredVar, setHoveredVar] = useState<EnvironmentKey | null>(null);

  const suitability = calculateEnvironmentSuitability(env);
  const suitColor = suitability > 0.7 ? '#39ff14' : suitability > 0.4 ? '#ffa500' : '#ff3b3b';
  const suitLabel = suitability > 0.7 ? 'OPTIMAL' : suitability > 0.4 ? 'STRESSED' : 'CRITICAL';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-panel-header">
        <span className="text-cyan-400">⚗️</span>
        <span className="text-cyber text-xs text-cyan-300/90 tracking-widest">ENVIRONMENT</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono" style={{ color: suitColor }}>
            ◉ {suitLabel}
          </span>
          <button
            onClick={resetEnv}
            className="text-[10px] px-2 py-0.5 rounded border border-cyan-400/20 text-cyan-400/50 hover:border-cyan-400/40 hover:text-cyan-400/80 transition-all font-mono"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Suitability bar */}
      <div className="px-4 py-2 border-b border-cyan-400/05">
        <div className="flex justify-between text-[10px] font-mono mb-1">
          <span className="text-cyan-400/40">ECOSYSTEM HEALTH</span>
          <span style={{ color: suitColor }}>{Math.round(suitability * 100)}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${suitability * 100}%`,
              background: `linear-gradient(90deg, #ff3b3b, ${suitColor})`,
              boxShadow: `0 0 8px ${suitColor}88`,
            }}
          />
        </div>
      </div>

      {/* Sliders */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {ENV_VARIABLES.map((variable) => {
          const value = env[variable.key];
          const normalizedValue = (value - variable.min) / (variable.max - variable.min);
          const isHovered = hoveredVar === variable.key;

          return (
            <div
              key={variable.key}
              className="group rounded-xl p-2.5 transition-all duration-200"
              style={{
                background: isHovered ? 'rgba(0, 255, 255, 0.04)' : 'transparent',
                border: `1px solid ${isHovered ? 'rgba(0, 255, 255, 0.1)' : 'transparent'}`,
              }}
              onMouseEnter={() => setHoveredVar(variable.key)}
              onMouseLeave={() => setHoveredVar(null)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{variable.icon}</span>
                  <span className="text-xs font-inter text-white/70 group-hover:text-white/90 transition-colors">
                    {variable.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={Math.round(value * 10) / 10}
                    onChange={(e) => {
                      const v = clamp(parseFloat(e.target.value) || 0, variable.min, variable.max);
                      setEnvVariable(variable.key, v);
                    }}
                    className="w-12 text-right text-xs font-mono bg-transparent border-b border-transparent hover:border-cyan-400/30 focus:border-cyan-400/60 outline-none text-cyan-300/90 transition-colors"
                    min={variable.min}
                    max={variable.max}
                    step={variable.key === 'pH' ? 0.1 : 1}
                  />
                  <span className="text-[10px] font-mono text-white/30 w-6">{variable.unit}</span>
                </div>
              </div>

              {/* Track */}
              <div className="relative h-2 bg-white/[0.06] rounded-full overflow-visible">
                {/* Fill */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${normalizedValue * 100}%`,
                    background: `linear-gradient(90deg, ${variable.color}44, ${variable.color}cc)`,
                    boxShadow: isHovered ? `0 0 8px ${variable.color}66` : 'none',
                  }}
                />
                {/* Slider */}
                <input
                  type="range"
                  min={variable.min}
                  max={variable.max}
                  step={variable.key === 'pH' ? 0.1 : variable.key === 'temperature' ? 0.5 : 1}
                  value={value}
                  onChange={(e) => setEnvVariable(variable.key, parseFloat(e.target.value))}
                  className="env-slider absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                  style={{ height: '100%' }}
                />
                {/* Thumb visual */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none transition-all duration-100"
                  style={{
                    left: `calc(${normalizedValue * 100}% - 6px)`,
                    background: variable.color,
                    boxShadow: `0 0 ${isHovered ? 12 : 6}px ${variable.color}`,
                  }}
                />
              </div>

              {/* Description tooltip */}
              {isHovered && (
                <p className="text-[10px] text-white/40 mt-1.5 leading-snug font-inter">
                  {variable.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick presets */}
      <div className="px-3 py-2 border-t border-cyan-400/05">
        <div className="text-[10px] text-cyan-400/40 font-mono mb-1.5 tracking-wider">QUICK PRESETS</div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Tropical', values: { temperature: 35, humidity: 85, lighting: 80, oxygen: 60 } },
            { label: 'Arctic', values: { temperature: -10, humidity: 40, lighting: 30, oxygen: 70 } },
            { label: 'Volcanic', values: { temperature: 55, humidity: 20, uvRadiation: 80, co2: 70 } },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                Object.entries(preset.values).forEach(([k, v]) => {
                  setEnvVariable(k as EnvironmentKey, v);
                });
              }}
              className="text-[10px] py-1 px-2 rounded-lg font-mono text-white/40 border border-white/10 hover:border-cyan-400/30 hover:text-cyan-400/70 transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentPanel;
