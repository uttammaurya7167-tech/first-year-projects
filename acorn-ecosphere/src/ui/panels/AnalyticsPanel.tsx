// =============================================
// ECOSPHERE — Analytics Dashboard Panel
// Population charts, trends, event log
// =============================================
import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart,
  CartesianGrid, Legend,
} from 'recharts';
import { useSimulationStore, useEnvironmentStore, selectPopulationBySpecies } from '../../store';
import { SPECIES_DATABASE } from '../../core/biology/speciesDatabase';
import { formatSimTime, formatNumber } from '../../utils/math';

const CHART_COLORS = [
  '#39ff14', '#00ffff', '#bf5af2', '#ffd700', '#ff6b35',
  '#87ceeb', '#ff4500', '#00ffa3', '#4169e1', '#c8a97e', '#ffd700', '#228b22',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel p-2 text-[10px] font-mono border border-cyan-400/20 min-w-[120px]">
      <div className="text-cyan-400/60 mb-1">{formatSimTime(label)}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white/60">{Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; unit?: string; color?: string; icon?: string }> = ({
  label, value, unit, color = '#00ffff', icon,
}) => (
  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
    <div className="text-[9px] font-mono text-white/30 tracking-wider mb-1 flex items-center gap-1">
      {icon && <span>{icon}</span>}
      {label}
    </div>
    <div className="text-lg font-mono font-bold leading-none" style={{ color }}>
      {value}
      {unit && <span className="text-xs text-white/30 ml-0.5">{unit}</span>}
    </div>
  </div>
);

const AnalyticsPanel: React.FC = () => {
  const { historicalData, stats, eventLog, year } = useSimulationStore();
  const { env } = useEnvironmentStore();
  const { entities } = useSimulationStore();

  const populations = selectPopulationBySpecies(entities);
  const aliveSpeciesIds = Object.keys(populations);

  // Transform historical data for recharts
  const populationData = useMemo(() => {
    return historicalData.slice(-80).map(point => {
      const entry: Record<string, number> = { year: parseFloat(point.year.toFixed(1)) };
      for (const [specId, count] of Object.entries(point.populations)) {
        const species = SPECIES_DATABASE.find(s => s.id === specId);
        if (species) entry[species.name.split(' ')[0]] = count;
      }
      return entry;
    });
  }, [historicalData]);

  const envData = useMemo(() => {
    return historicalData.slice(-80).map(point => ({
      year: parseFloat(point.year.toFixed(1)),
      O2: parseFloat(point.oxygen.toFixed(1)),
      CO2: parseFloat(point.co2.toFixed(1)),
      Nutrients: parseFloat(point.nutrients.toFixed(1)),
      Diversity: point.diversity * 5, // scale for visibility
    }));
  }, [historicalData]);

  const speciesInHistory = useMemo(() => {
    const seen = new Set<string>();
    historicalData.forEach(p => Object.keys(p.populations).forEach(id => seen.add(id)));
    return Array.from(seen);
  }, [historicalData]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-panel-header">
        <span className="text-cyan-400">📊</span>
        <span className="text-cyber text-xs text-cyan-300/90 tracking-widest">ANALYTICS</span>
        <div className="ml-auto text-[10px] font-mono text-white/30">
          {formatSimTime(year)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Stat cards */}
        <div className="p-3 grid grid-cols-2 gap-2">
          <StatCard label="ORGANISMS" value={formatNumber(stats.aliveEntities)} icon="🧬" color="#39ff14" />
          <StatCard label="SPECIES" value={`${stats.speciesDiversity}/12`} icon="🌈" color="#00ffff" />
          <StatCard label="BIRTHS" value={formatNumber(stats.totalBirths)} icon="🌱" color="#7fff00" />
          <StatCard label="DEATHS" value={formatNumber(stats.totalDeaths)} icon="💀" color="#ff6b35" />
          <StatCard label="MUTATIONS" value={formatNumber(stats.mutations)} icon="⚡" color="#bf5af2" />
          <StatCard label="EXTINCTIONS" value={stats.extinctionEvents} icon="☠️" color="#ff3b3b" />
        </div>

        {/* Population chart */}
        <div className="px-3 pb-1">
          <div className="text-[10px] font-mono text-cyan-400/40 tracking-wider mb-2">
            POPULATION TRENDS
          </div>
          {populationData.length > 1 ? (
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={populationData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.05)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 9, fill: 'rgba(0,255,255,0.4)', fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(v) => `Y${v}`}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: 'rgba(0,255,255,0.4)', fontFamily: 'JetBrains Mono' }}
                    width={25}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {speciesInHistory.slice(0, 6).map((specId, i) => {
                    const species = SPECIES_DATABASE.find(s => s.id === specId);
                    if (!species) return null;
                    const name = species.name.split(' ')[0];
                    return (
                      <Area
                        key={specId}
                        type="monotone"
                        dataKey={name}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        fill={`${CHART_COLORS[i % CHART_COLORS.length]}18`}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-[10px] text-white/20 font-mono border border-white/[0.04] rounded-xl">
              Simulation data will appear here
            </div>
          )}
        </div>

        {/* Env chart */}
        <div className="px-3 pb-1 mt-2">
          <div className="text-[10px] font-mono text-cyan-400/40 tracking-wider mb-2">
            ATMOSPHERIC CONDITIONS
          </div>
          {envData.length > 1 ? (
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={envData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.05)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 9, fill: 'rgba(0,255,255,0.4)', fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(v) => `Y${v}`}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: 'rgba(0,255,255,0.4)', fontFamily: 'JetBrains Mono' }}
                    domain={[0, 100]}
                    width={25}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="O2" stroke="#00ffff" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="CO2" stroke="#a8e063" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="Nutrients" stroke="#ffa500" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-28 flex items-center justify-center text-[10px] text-white/20 font-mono border border-white/[0.04] rounded-xl">
              Run the simulation to see data
            </div>
          )}
        </div>

        {/* Current Live populations */}
        <div className="px-3 py-2 mt-1">
          <div className="text-[10px] font-mono text-cyan-400/40 tracking-wider mb-2">
            LIVE POPULATIONS
          </div>
          <div className="space-y-1">
            {SPECIES_DATABASE.map((species, i) => {
              const pop = populations[species.id] ?? 0;
              const maxPop = 150;
              return (
                <div key={species.id} className="flex items-center gap-2">
                  <span className="text-sm w-5 flex-shrink-0">{species.emoji}</span>
                  <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (pop / maxPop) * 100)}%`,
                        background: pop === 0 ? '#ff3b3b44' : CHART_COLORS[i % CHART_COLORS.length],
                        boxShadow: pop > 0 ? `0 0 4px ${CHART_COLORS[i % CHART_COLORS.length]}66` : 'none',
                      }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono w-8 text-right ${pop === 0 ? 'text-red-500/50' : 'text-white/40'}`}>
                    {pop > 0 ? pop : 'EXT'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event log */}
        {eventLog.length > 0 && (
          <div className="px-3 py-2 border-t border-white/[0.04]">
            <div className="text-[10px] font-mono text-cyan-400/40 tracking-wider mb-2">
              EVENT LOG
            </div>
            <div className="space-y-1">
              {eventLog.slice(0, 8).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 text-[10px] font-mono py-1 border-b border-white/[0.03]"
                >
                  <span>{event.emoji}</span>
                  <span className="text-white/50 flex-1 truncate">{event.label}</span>
                  <span className="text-white/25 flex-shrink-0">Y{event.timestamp.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;
