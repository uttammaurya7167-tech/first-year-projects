// =============================================
// ECOSPHERE — Core Type Definitions
// =============================================

export type GameMode = 'sandbox' | 'challenge' | 'evolution' | 'disaster';
export type SimulationSpeed = 0 | 1 | 5 | 10 | 50 | 100 | 1000;
export type SpeciesType = 'plant' | 'animal' | 'microbe';
export type BiomeZone = 'aquatic' | 'aerial' | 'surface' | 'deep';

// ---------------------------------------------
// Environment System
// ---------------------------------------------
export interface EnvironmentState {
  lighting: number;        // 0–100
  humidity: number;        // 0–100
  temperature: number;     // -20 to 60 (°C)
  uvRadiation: number;     // 0–100
  oxygen: number;          // 0–100
  co2: number;             // 0–100
  nutrients: number;       // 0–100
  pH: number;              // 0–14
  waterVolume: number;     // 0–100
  pressure: number;        // 0–100 (atmospheric pressure)
}

export type EnvironmentKey = keyof EnvironmentState;

export interface EnvironmentVariable {
  key: EnvironmentKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  color: string;
  icon: string;
  description: string;
}

// ---------------------------------------------
// Entity System
// ---------------------------------------------
export interface Vec2 {
  x: number;
  y: number;
}

export interface GeneticTrait {
  heatResistance: number;       // 0–1
  coldResistance: number;       // 0–1
  uvResistance: number;         // 0–1
  reproductionRate: number;     // 0–1
  efficiency: number;           // 0–1 (resource consumption efficiency)
  aggression: number;           // 0–1
  size: number;                 // 0.5–2.0 (relative size)
  speed: number;                // 0–1
  bioluminescent: boolean;
  mutationChance: number;       // 0–1
  color: string;                // hex color
}

export interface EntityState {
  id: string;
  speciesId: string;
  speciesName: string;
  type: SpeciesType;
  position: Vec2;
  velocity: Vec2;
  age: number;                  // in simulation ticks
  maxAge: number;               // max lifespan in ticks
  health: number;               // 0–100
  energy: number;               // 0–100
  hunger: number;               // 0–100 (100 = starving)
  hydration: number;            // 0–100 (100 = dying of thirst)
  traits: GeneticTrait;
  alive: boolean;
  generation: number;
  parentId?: string;
  isDead?: boolean;
  deathCause?: string;
  zone: BiomeZone;
  radius: number;
}

// ---------------------------------------------
// Species Definition
// ---------------------------------------------
export interface SpeciesDefinition {
  id: string;
  name: string;
  type: SpeciesType;
  emoji: string;
  description: string;
  baseTraits: GeneticTrait;
  preferredTemp: [number, number];
  preferredHumidity: [number, number];
  preferredLight: [number, number];
  preferredPH: [number, number];
  dietType: 'photosynthetic' | 'herbivore' | 'carnivore' | 'omnivore' | 'decomposer';
  prey?: string[];              // species IDs this can eat
  baseReproductionInterval: number; // ticks between reproduction
  color: string;
  glowColor?: string;
  initialPopulation: number;
  zone: BiomeZone;
  canBeAdded: boolean;          // player can spawn this
}

// ---------------------------------------------
// Simulation State
// ---------------------------------------------
export interface SimulationStats {
  totalEntities: number;
  aliveEntities: number;
  totalBirths: number;
  totalDeaths: number;
  extinctionEvents: number;
  mutations: number;
  speciesDiversity: number;
}

export interface HistoricalDataPoint {
  year: number;
  tick: number;
  populations: Record<string, number>;
  oxygen: number;
  co2: number;
  nutrients: number;
  diversity: number;
  temperature: number;
}

// ---------------------------------------------
// Events
// ---------------------------------------------
export type EventType = 
  | 'meteor_strike' 
  | 'solar_flare' 
  | 'nutrient_bloom' 
  | 'alien_microbe'
  | 'radiation_leak'
  | 'disease_outbreak'
  | 'power_outage'
  | 'mutation_wave';

export interface GameEvent {
  id: string;
  type: EventType;
  label: string;
  description: string;
  timestamp: number;          // simulation year
  duration?: number;          // how many years it lasts
  severity: 'low' | 'medium' | 'high' | 'catastrophic';
  emoji: string;
}

// ---------------------------------------------
// Notifications
// ---------------------------------------------
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  timestamp: number;
  emoji?: string;
}

// ---------------------------------------------
// UI State
// ---------------------------------------------
export type ActivePanel = 'environment' | 'species' | 'analytics' | null;

export interface UIState {
  activePanel: ActivePanel;
  selectedSpeciesId: string | null;
  showGrid: boolean;
  showTrails: boolean;
  showLabels: boolean;
  showGlow: boolean;
  isDomeFocused: boolean;
}

// ---------------------------------------------
// Achievement
// ---------------------------------------------
export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: number;
}
