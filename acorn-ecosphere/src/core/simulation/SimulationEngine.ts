// =============================================
// ECOSPHERE — Simulation Engine
// Master tick loop — biology, physics, evolution
// =============================================

import type { EntityState, EnvironmentState, HistoricalDataPoint } from '../../types';
import { SPECIES_DATABASE } from '../biology/speciesDatabase';
import { globalPhysics } from '../physics/PhysicsEngine';
import {
  generateId, randFloat, randBool, randInt, clamp,
  randomPointInCircle, getEnvScore,
} from '../../utils/math';
import { calculateEnvironmentSuitability } from '../biology/environment';

const TICKS_PER_YEAR = 1000;
const RECORD_INTERVAL = 50; // Record history every 50 ticks

export class SimulationEngine {
  private tick = 0;
  private totalBirths = 0;
  private totalDeaths = 0;
  private totalMutations = 0;
  private extinctionCount = 0;
  private prevPopulations: Record<string, number> = {};

  // Dome dimensions (set by canvas)
  private domeRadius = 300;
  private domeCx = 400;
  private domeCy = 400;

  setDomeDimensions(cx: number, cy: number, radius: number) {
    this.domeRadius = radius;
    this.domeCx = cx;
    this.domeCy = cy;
    globalPhysics.updateConfig({ domeRadius: radius, domeCenterX: cx, domeCenterY: cy });
  }

  // -------------------------
  // Main Tick
  // -------------------------
  tickAll(
    entities: EntityState[],
    env: EnvironmentState,
    speed: number
  ): {
    entities: EntityState[];
    births: number;
    deaths: number;
    mutations: number;
    newHistoricalPoint?: HistoricalDataPoint;
    newExtinctions: string[];
  } {
    this.tick++;
    let births = 0;
    let deaths = 0;
    let mutations = 0;
    const newExtinctions: string[] = [];
    const newEntities: EntityState[] = [];

    // Physics update (only for moving entities)
    let updated = globalPhysics.updateAll(entities, 1);

    // Apply repulsion periodically (expensive)
    if (this.tick % 5 === 0) {
      updated = globalPhysics.applyRepulsion(updated, 0.3);
    }

    // Biology: age, hunger, health, death, reproduction
    const survivors: EntityState[] = [];
    const toReproduce: EntityState[] = [];

    for (const entity of updated) {
      if (!entity.alive) continue;

      const def = SPECIES_DATABASE.find(s => s.id === entity.speciesId);
      if (!def) continue;

      // Age
      const aged = { ...entity, age: entity.age + 1 };

      // Environmental stress
      const envScore = this.calcEnvScore(entity, env);

      // Energy changes
      let energyDelta = -0.05 * (1 - entity.traits.efficiency * 0.5);

      // Photosynthetic: gain energy from light
      if (def.dietType === 'photosynthetic') {
        const lightGain = (env.lighting / 100) * 0.15 * envScore;
        energyDelta += lightGain;
      }

      // Decomposers: gain from nutrients
      if (def.dietType === 'decomposer') {
        const nutrientGain = (env.nutrients / 100) * 0.1;
        energyDelta += nutrientGain;
      }

      // Environmental stress hurts energy
      if (envScore < 0.4) {
        energyDelta -= (0.4 - envScore) * 0.1;
      }

      // UV damage without resistance
      if (env.uvRadiation > 40) {
        const uvDamage = (env.uvRadiation - 40) * 0.001 * (1 - entity.traits.uvResistance);
        energyDelta -= uvDamage;
      }

      // Health based on energy
      let healthDelta = 0;
      const energy = clamp(aged.energy + energyDelta, 0, 100);
      if (energy < 20) healthDelta = -0.5;
      else if (energy > 70) healthDelta = 0.1;

      const health = clamp(aged.health + healthDelta, 0, 100);

      // Hunger
      const hunger = clamp(aged.hunger + (energy < 30 ? 2 : -1), 0, 100);
      const hydration = clamp(aged.hydration + (env.waterVolume < 20 ? 2 : -0.5), 0, 100);

      // Death checks
      let alive = true;
      let deathCause: string | undefined;

      if (health <= 0) { alive = false; deathCause = 'starvation'; }
      if (aged.age > aged.maxAge) { alive = false; deathCause = 'old_age'; }
      if (hunger >= 100) { alive = false; deathCause = 'hunger'; }
      if (hydration >= 100) { alive = false; deathCause = 'dehydration'; }
      if (env.oxygen < 5) { alive = false; deathCause = 'oxygen_depletion'; }

      const finalEntity = { ...aged, energy, health, hunger, hydration, alive, deathCause };

      if (!alive) {
        deaths++;
        this.totalDeaths++;
        survivors.push({ ...finalEntity, alive: false });
        continue;
      }

      survivors.push(finalEntity);

      // Reproduction eligibility
      if (energy > 60 && health > 50 && aged.age > 30) {
        toReproduce.push(finalEntity);
      }
    }

    // Reproduction
    const reproBySpecies: Record<string, number> = {};
    for (const e of survivors.filter(s => s.alive)) {
      reproBySpecies[e.speciesId] = (reproBySpecies[e.speciesId] || 0) + 1;
    }

    for (const entity of toReproduce) {
      const def = SPECIES_DATABASE.find(s => s.id === entity.speciesId);
      if (!def) continue;

      const popCount = reproBySpecies[entity.speciesId] || 0;
      const overcrowdFactor = Math.max(0, 1 - popCount / 150);
      const reproChance = entity.traits.reproductionRate * overcrowdFactor * 0.001;

      if (randBool(reproChance)) {
        const offspring = this.createOffspring(entity, env);
        if (offspring) {
          newEntities.push(offspring);
          births++;
          this.totalBirths++;

          if (offspring.traits.mutationChance > entity.traits.mutationChance * 1.1) {
            mutations++;
            this.totalMutations++;
          }
        }
      }
    }

    // Extinction tracking
    const currentPops = {} as Record<string, number>;
    for (const e of survivors.filter(e => e.alive)) {
      currentPops[e.speciesId] = (currentPops[e.speciesId] || 0) + 1;
    }

    for (const speciesId of Object.keys(this.prevPopulations)) {
      if (this.prevPopulations[speciesId] > 0 && !currentPops[speciesId]) {
        newExtinctions.push(speciesId);
        this.extinctionCount++;
      }
    }
    this.prevPopulations = currentPops;

    const allEntities = [...survivors, ...newEntities];

    // Environment effects (O2/CO2 cycling)
    // This is handled at a higher level via env store

    // Record history
    let newHistoricalPoint: HistoricalDataPoint | undefined;
    if (this.tick % RECORD_INTERVAL === 0) {
      newHistoricalPoint = {
        year: this.tick / TICKS_PER_YEAR,
        tick: this.tick,
        populations: currentPops,
        oxygen: env.oxygen,
        co2: env.co2,
        nutrients: env.nutrients,
        diversity: Object.keys(currentPops).length,
        temperature: env.temperature,
      };
    }

    return { entities: allEntities, births, deaths, mutations, newHistoricalPoint, newExtinctions };
  }

  // -------------------------
  // Offspring Creation
  // -------------------------
  private createOffspring(parent: EntityState, env: EnvironmentState): EntityState | null {
    const def = SPECIES_DATABASE.find(s => s.id === parent.speciesId);
    if (!def) return null;

    // Small position offset from parent
    const angle = Math.random() * Math.PI * 2;
    const dist = parent.radius * 2 + randFloat(5, 20);
    const pos = {
      x: clamp(parent.position.x + Math.cos(angle) * dist, this.domeCx - this.domeRadius + 20, this.domeCx + this.domeRadius - 20),
      y: clamp(parent.position.y + Math.sin(angle) * dist, this.domeCy - this.domeRadius + 20, this.domeCy + this.domeRadius - 20),
    };

    // Mutation
    const mutated = this.mutateTraits(parent.traits, parent.traits.mutationChance, env);

    const offspring: EntityState = {
      id: generateId(),
      speciesId: parent.speciesId,
      speciesName: parent.speciesName,
      type: parent.type,
      position: pos,
      velocity: globalPhysics.randomSpawnVelocity(mutated.speed),
      age: 0,
      maxAge: parent.maxAge + randInt(-50, 100),
      health: 80 + randInt(-10, 15),
      energy: 60 + randInt(-10, 20),
      hunger: 10,
      hydration: 10,
      traits: mutated,
      alive: true,
      generation: parent.generation + 1,
      parentId: parent.id,
      zone: parent.zone,
      radius: parent.radius * (0.8 + Math.random() * 0.4),
    };

    return offspring;
  }

  // -------------------------
  // Mutation System
  // -------------------------
  private mutateTraits(
    traits: EntityState['traits'],
    mutationChance: number,
    env: EnvironmentState
  ): EntityState['traits'] {
    const mutated = { ...traits };

    // UV-driven mutation boost
    const uvBoost = env.uvRadiation > 50 ? (env.uvRadiation - 50) / 100 : 0;
    const effectiveChance = mutationChance + uvBoost * 0.05;

    if (!randBool(effectiveChance)) return mutated;

    // Pick a random trait to mutate
    const numericTraits: (keyof typeof traits)[] = [
      'heatResistance', 'coldResistance', 'uvResistance',
      'reproductionRate', 'efficiency', 'size', 'speed',
    ];

    const traitToMutate = numericTraits[randInt(0, numericTraits.length - 1)];
    const delta = randFloat(-0.15, 0.15);
    (mutated as any)[traitToMutate] = clamp(
      (traits as any)[traitToMutate] + delta,
      0, 1
    );

    // Bioluminescence can emerge
    if (randBool(0.005)) {
      mutated.bioluminescent = true;
    }

    // Color shift on mutation
    if (randBool(0.1)) {
      const hueShift = randInt(-30, 30);
      mutated.color = this.shiftHue(traits.color, hueShift);
    }

    return mutated;
  }

  private shiftHue(hex: string, degrees: number): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    h = (h + degrees / 360 + 1) % 1;
    const toRgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const nr = Math.round(toRgb(p, q, h + 1 / 3) * 255);
    const ng = Math.round(toRgb(p, q, h) * 255);
    const nb = Math.round(toRgb(p, q, h - 1 / 3) * 255);
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  }

  // -------------------------
  // Environment Score
  // -------------------------
  private calcEnvScore(entity: EntityState, env: EnvironmentState): number {
    const def = SPECIES_DATABASE.find(s => s.id === entity.speciesId);
    if (!def) return 0.5;

    const tempScore = getEnvScore(env.temperature, def.preferredTemp, -20, 60);
    const humScore = getEnvScore(env.humidity, def.preferredHumidity, 0, 100);
    const lightScore = getEnvScore(env.lighting, def.preferredLight, 0, 100);
    const phScore = getEnvScore(env.pH, def.preferredPH, 0, 14);

    return (tempScore + humScore + lightScore + phScore) / 4;
  }

  // -------------------------
  // Seeding Initial Population
  // -------------------------
  seedPopulation(domeRadius: number, domeCx: number, domeCy: number): EntityState[] {
    const entities: EntityState[] = [];

    for (const def of SPECIES_DATABASE) {
      if (def.initialPopulation === 0) continue;

      for (let i = 0; i < def.initialPopulation; i++) {
        const pos = randomPointInCircle(domeCx, domeCy, domeRadius * 0.75);
        const entity: EntityState = {
          id: generateId(),
          speciesId: def.id,
          speciesName: def.name,
          type: def.type,
          position: pos,
          velocity: globalPhysics.randomSpawnVelocity(def.baseTraits.speed),
          age: randInt(0, 100),
          maxAge: randInt(500, 2000),
          health: 80 + randInt(-10, 20),
          energy: 70 + randInt(-20, 20),
          hunger: randInt(5, 25),
          hydration: randInt(5, 20),
          traits: { ...def.baseTraits },
          alive: true,
          generation: 1,
          zone: def.zone,
          radius: 4 + def.baseTraits.size * 6,
        };
        entities.push(entity);
      }
    }

    return entities;
  }

  getStats() {
    return {
      tick: this.tick,
      totalBirths: this.totalBirths,
      totalDeaths: this.totalDeaths,
      totalMutations: this.totalMutations,
      extinctionCount: this.extinctionCount,
    };
  }

  reset() {
    this.tick = 0;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.totalMutations = 0;
    this.extinctionCount = 0;
    this.prevPopulations = {};
  }
}

export const globalSimulation = new SimulationEngine();
