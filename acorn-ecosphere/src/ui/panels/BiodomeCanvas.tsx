// =============================================
// ECOSPHERE — Biodome Canvas v1 (Phase 1)
// Simple, smooth rendering and core biology loop
// =============================================
import React, { useRef, useEffect, useCallback } from 'react';
import { useSimulationStore, useEnvironmentStore, useUIStore } from '../../store';
import { CanvasRenderer } from '../../rendering/canvas/CanvasRenderer';
import { globalSimulation } from '../../core/simulation/SimulationEngine';
import { SPECIES_DATABASE } from '../../core/biology/speciesDatabase';
import { generateId } from '../../utils/math';

let renderer: CanvasRenderer | null = null;
let animFrameId: number | null = null;
let lastFrameTime = performance.now();

const TICKS_PER_SECOND_BASE = 12;

const BiodomeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    entities, speed, isRunning,
    tick_: tickStore, setEntities,
    addHistoricalPoint, updateStats,
    addNotification, unlockAchievement,
    stats,
  } = useSimulationStore();

  const { env } = useEnvironmentStore();
  const { ui } = useUIStore();

  // Stable refs to avoid RAF re-registration
  const stateRef = useRef({ entities, env, speed, isRunning, ui, stats });
  useEffect(() => { stateRef.current = { entities, env, speed, isRunning, ui, stats }; });

  // Setup canvas and renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (renderer) {
        renderer.resize(w, h);
        const r = Math.min(w, h) * 0.44;
        globalSimulation.setDomeDimensions(w / 2, h / 2, r);
      }
    };

    renderer = new CanvasRenderer(canvas);
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Main RAF loop
  useEffect(() => {
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);

    const loop = (timestamp: number) => {
      const deltaMs = Math.min(timestamp - lastFrameTime, 100); // cap at 100ms
      lastFrameTime = timestamp;

      const { entities, env, speed, isRunning, ui } = stateRef.current;

      if (renderer && canvasRef.current) {
        const opts = {
          showGlow: ui.showGlow,
          showTrails: ui.showTrails,
          showLabels: ui.showLabels,
          showGrid: ui.showGrid,
        };

        // Render frame
        const simYear = useSimulationStore.getState().year;
        renderer.render(entities, env, simYear, opts);

        // Run simulation ticks
        if (isRunning && speed > 0) {
          const ticksThisFrame = Math.min(
            Math.max(1, Math.round((deltaMs / 1000) * TICKS_PER_SECOND_BASE * speed)),
            speed >= 100 ? 80 : speed >= 10 ? 20 : 8
          );

          let currentEntities = entities;
          let totalBirths = 0, totalDeaths = 0, totalMutations = 0;

          for (let t = 0; t < ticksThisFrame; t++) {
            // Core biology tick
            const bioResult = globalSimulation.tickAll(currentEntities, env, speed);
            currentEntities = bioResult.entities;
            totalBirths += bioResult.births;
            totalDeaths += bioResult.deaths;
            totalMutations += bioResult.mutations;

            if (bioResult.newHistoricalPoint) {
              addHistoricalPoint(bioResult.newHistoricalPoint);
            }
            if (bioResult.newExtinctions.length > 0) {
              for (const id of bioResult.newExtinctions) {
                const sp = SPECIES_DATABASE.find(s => s.id === id);
                addNotification(`${sp?.name ?? id} has gone extinct!`, 'danger', '💀');
                useSimulationStore.getState().updateStats({
                  extinctionEvents: useSimulationStore.getState().stats.extinctionEvents + 1,
                });
                unlockAchievement('mass_extinction');
              }
            }

            // Environment cycling from biology
            if (t === 0) {
              const alive = currentEntities.filter(e => e.alive);
              const plants = alive.filter(e => e.type === 'plant').length;
              const fauna = alive.filter(e => e.type === 'animal' || e.type === 'microbe').length;
              const store = useEnvironmentStore.getState();
              const curEnv = store.env;

              const o2Delta = (plants * 0.003 - fauna * 0.0015) * 0.001;
              const co2Delta = (fauna * 0.0015 - plants * 0.003) * 0.001;
              const nutDelta = ((fauna * 0.001) - 0.001) * 0.001;

              store.setEnvVariable('oxygen', Math.max(0, Math.min(100, curEnv.oxygen + o2Delta)));
              store.setEnvVariable('co2', Math.max(0, Math.min(100, curEnv.co2 + co2Delta)));
              store.setEnvVariable('nutrients', Math.max(0, Math.min(100, curEnv.nutrients + nutDelta)));
            }
          }

          // Batch commit entities
          tickStore();
          setEntities(currentEntities);

          // Update stats
          const alive = currentEntities.filter(e => e.alive);
          const simStats = globalSimulation.getStats();
          updateStats({
            totalEntities: currentEntities.length,
            aliveEntities: alive.length,
            totalBirths: simStats.totalBirths,
            totalDeaths: simStats.totalDeaths,
            extinctionEvents: simStats.extinctionCount,
            mutations: simStats.totalMutations,
            speciesDiversity: new Set(alive.map(e => e.speciesId)).size,
          });

          // Achievements
          if (alive.length > 0) unlockAchievement('first_life');
          if (new Set(alive.map(e => e.speciesId)).size >= 12) unlockAchievement('biodiversity');
          if (useSimulationStore.getState().year >= 100) unlockAchievement('century');
          if (simStats.totalMutations >= 50) unlockAchievement('evolution_master');
        }
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);
    return () => {
      if (animFrameId !== null) cancelAnimationFrame(animFrameId);
    };
  }, []); // single registration, reads state via ref

  // Click to spawn
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !renderer) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

    const dx = x - renderer.center.x;
    const dy = y - renderer.center.y;
    if (Math.sqrt(dx * dx + dy * dy) > renderer.radius - 10) return;

    const selectedId = useUIStore.getState().ui.selectedSpeciesId;
    if (!selectedId) return;

    const def = SPECIES_DATABASE.find(s => s.id === selectedId);
    if (!def) return;

    const newEntity = {
      id: generateId(),
      speciesId: def.id,
      speciesName: def.name,
      type: def.type,
      position: { x, y },
      velocity: {
        x: (Math.random() - 0.5) * def.baseTraits.speed,
        y: (Math.random() - 0.5) * def.baseTraits.speed,
      },
      age: 0,
      maxAge: 800 + Math.random() * 800,
      health: 90 + Math.random() * 10,
      energy: 80 + Math.random() * 15,
      hunger: 5,
      hydration: 5,
      traits: { ...def.baseTraits },
      alive: true,
      generation: 1,
      zone: def.zone,
      radius: 4 + def.baseTraits.size * 6,
    };

    useSimulationStore.getState().addEntity(newEntity);
    addNotification(`Spawned ${def.name}`, 'success', def.emoji);
  }, [addNotification]);

  return (
    <div ref={containerRef} className="relative w-full h-full cursor-crosshair">
      <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full" />

      {/* Status indicators */}
      <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400/40 select-none pointer-events-none">
        ECOSPHERE v1 · PHASE 1
      </div>
      <div className="absolute top-3 right-3 text-[10px] font-mono select-none pointer-events-none">
        {isRunning ? (
          <span className="text-green-400/70">● RUNNING {speed}×</span>
        ) : (
          <span className="text-amber-400/70">◼ PAUSED</span>
        )}
      </div>

      {/* Spawn hint */}
      {useUIStore.getState().ui.selectedSpeciesId && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-400/50 pointer-events-none">
          Click inside the dome to spawn ·{' '}
          {SPECIES_DATABASE.find(s => s.id === useUIStore.getState().ui.selectedSpeciesId)?.name}
        </div>
      )}
    </div>
  );
};

export default BiodomeCanvas;
