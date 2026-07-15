// =============================================
// ECOSPHERE — Species Management Panel
// Browse, spawn, and observe species
// =============================================
import React, { useState } from 'react';
import { useSimulationStore, useUIStore, selectPopulationBySpecies } from '../../store';
import { SPECIES_DATABASE } from '../../core/biology/speciesDatabase';
import type { SpeciesDefinition } from '../../types';

const SpeciesPanel: React.FC = () => {
  const { entities, stats } = useSimulationStore();
  const { ui, setSelectedSpecies } = useUIStore();
  const [filterType, setFilterType] = useState<'all' | 'plant' | 'animal' | 'microbe'>('all');

  const populations = selectPopulationBySpecies(entities);
  const aliveSpecies = new Set(entities.filter(e => e.alive).map(e => e.speciesId));

  const filtered = SPECIES_DATABASE.filter(s =>
    filterType === 'all' || s.type === filterType
  );

  const totalAlive = stats.aliveEntities;
  const totalSpecies = stats.speciesDiversity;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-panel-header">
        <span className="text-cyan-400">🧬</span>
        <span className="text-cyber text-xs text-cyan-300/90 tracking-widest">SPECIES</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10px] font-mono text-green-400/70">{totalAlive} organisms</span>
          <span className="text-[10px] font-mono text-cyan-400/50">{totalSpecies}/12 species</span>
        </div>
      </div>

      {/* Selected species banner */}
      {ui.selectedSpeciesId && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{SPECIES_DATABASE.find(s => s.id === ui.selectedSpeciesId)?.emoji}</span>
              <span className="text-xs text-cyan-300 font-inter">
                {SPECIES_DATABASE.find(s => s.id === ui.selectedSpeciesId)?.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-cyan-400/60 font-mono">Click dome to spawn</span>
              <button
                onClick={() => setSelectedSpecies(null)}
                className="text-[10px] text-white/30 hover:text-white/60 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Type filter */}
      <div className="flex gap-1 px-3 py-2">
        {(['all', 'plant', 'animal', 'microbe'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`flex-1 text-[10px] py-1 rounded-lg font-mono transition-all ${
              filterType === type
                ? 'bg-cyan-400/15 border border-cyan-400/30 text-cyan-300'
                : 'border border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
            }`}
          >
            {type === 'all' ? '🌐' : type === 'plant' ? '🌿' : type === 'animal' ? '🦎' : '🦠'}
            &nbsp;{type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Species list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-2">
        {filtered.map((species) => (
          <SpeciesCard
            key={species.id}
            species={species}
            population={populations[species.id] ?? 0}
            isAlive={aliveSpecies.has(species.id)}
            isSelected={ui.selectedSpeciesId === species.id}
            onSelect={() => setSelectedSpecies(
              ui.selectedSpeciesId === species.id ? null : species.id
            )}
          />
        ))}
      </div>

      {/* Instruction */}
      <div className="px-4 py-2 border-t border-cyan-400/05 text-[10px] text-white/25 font-mono text-center">
        Select a species then click inside the biodome to spawn
      </div>
    </div>
  );
};

const SpeciesCard: React.FC<{
  species: SpeciesDefinition;
  population: number;
  isAlive: boolean;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ species, population, isAlive, isSelected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  const dietColors = {
    photosynthetic: '#39ff14',
    herbivore: '#7fff00',
    carnivore: '#ff4444',
    omnivore: '#ffa500',
    decomposer: '#bf5af2',
  };

  const statusColor = population > 10 ? '#39ff14' : population > 0 ? '#ffa500' : '#ff3b3b';
  const statusLabel = population === 0 ? 'EXTINCT' : population > 10 ? 'THRIVING' : 'LOW';

  return (
    <div
      className={`species-card rounded-xl border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-cyan-400/40 bg-cyan-400/10'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Emoji with colored dot */}
        <div className="relative flex-shrink-0">
          <span className="text-2xl leading-none">{species.emoji}</span>
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black"
            style={{ background: statusColor, boxShadow: `0 0 4px ${statusColor}` }}
          />
        </div>

        {/* Name and info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/80 font-inter truncate">{species.name}</span>
            <span className="text-[10px] font-mono ml-2 flex-shrink-0" style={{ color: statusColor }}>
              {population > 0 ? population : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[9px] font-mono px-1 py-0.5 rounded"
              style={{
                color: dietColors[species.dietType],
                background: `${dietColors[species.dietType]}18`,
                border: `1px solid ${dietColors[species.dietType]}33`,
              }}
            >
              {species.dietType.toUpperCase()}
            </span>
            <span className="text-[9px] font-mono text-white/25">
              {species.zone}
            </span>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-white/20 hover:text-white/50 text-xs transition-colors flex-shrink-0"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded traits */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-white/[0.04]">
          <p className="text-[10px] text-white/35 font-inter pt-2 leading-snug">
            {species.description}
          </p>
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: 'Repro Rate', value: species.baseTraits.reproductionRate },
              { label: 'Mutation', value: species.baseTraits.mutationChance * 10 },
              { label: 'Speed', value: species.baseTraits.speed },
              { label: 'Efficiency', value: species.baseTraits.efficiency },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <div className="flex justify-between text-[9px]">
                  <span className="text-white/30 font-mono">{label}</span>
                  <span className="text-cyan-400/60 font-mono">{Math.round(value * 100)}%</span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${value * 100}%`,
                      background: isSelected ? '#00ffff' : species.baseTraits.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {species.baseTraits.bioluminescent && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono text-cyan-300 border border-cyan-400/20 bg-cyan-400/5">
                ✦ BIOLUMINESCENT
              </span>
            )}
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-mono border"
              style={{
                color: species.color,
                borderColor: `${species.color}33`,
                background: `${species.color}11`,
              }}
            >
              {species.type.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeciesPanel;
