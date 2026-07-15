// =============================================
// ECOSPHERE — Zustand Store
// Global simulation state management
// =============================================
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  EnvironmentState,
  EntityState,
  HistoricalDataPoint,
  GameEvent,
  Notification,
  UIState,
  ActivePanel,
  SimulationStats,
  GameMode,
  SimulationSpeed,
  Achievement,
  SpeciesType,
} from '../types';
import { DEFAULT_ENVIRONMENT } from '../core/biology/environment';
import { generateId } from '../utils/math';

// =============================================
// Simulation Store
// =============================================
interface SimulationStore {
  // Time
  tick: number;
  year: number;
  speed: SimulationSpeed;
  isRunning: boolean;
  gameMode: GameMode;

  // Entities
  entities: EntityState[];

  // Stats
  stats: SimulationStats;
  historicalData: HistoricalDataPoint[];

  // Events
  activeEvents: GameEvent[];
  eventLog: GameEvent[];

  // Notifications
  notifications: Notification[];

  // Achievements
  achievements: Achievement[];

  // Actions
  setSpeed: (speed: SimulationSpeed) => void;
  toggleRunning: () => void;
  setGameMode: (mode: GameMode) => void;
  setEntities: (entities: EntityState[]) => void;
  addEntity: (entity: EntityState) => void;
  removeEntity: (id: string) => void;
  updateEntity: (id: string, updates: Partial<EntityState>) => void;
  tick_: () => void;
  addNotification: (msg: string, type?: Notification['type'], emoji?: string) => void;
  dismissNotification: (id: string) => void;
  addHistoricalPoint: (point: HistoricalDataPoint) => void;
  addEvent: (event: GameEvent) => void;
  updateStats: (stats: Partial<SimulationStats>) => void;
  unlockAchievement: (id: string) => void;
  resetSimulation: () => void;
}

const DEFAULT_STATS: SimulationStats = {
  totalEntities: 0,
  aliveEntities: 0,
  totalBirths: 0,
  totalDeaths: 0,
  extinctionEvents: 0,
  mutations: 0,
  speciesDiversity: 0,
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_life', title: 'First Life', description: 'Spawn your first organism', emoji: '🌱', unlocked: false },
  { id: 'self_sustaining', title: 'Self-Sustaining', description: 'Reach equilibrium for 10 simulation years', emoji: '♾️', unlocked: false },
  { id: 'century', title: '100 Years Survived', description: 'Keep an ecosystem alive for 100 simulation years', emoji: '🏆', unlocked: false },
  { id: 'evolution_master', title: 'Evolution Master', description: 'Trigger 50 successful mutations', emoji: '🧬', unlocked: false },
  { id: 'mass_extinction', title: 'Mass Extinction', description: 'Lose 5 or more species', emoji: '💀', unlocked: false },
  { id: 'perfect_balance', title: 'Perfect Balance', description: 'Maintain all environment parameters in the green', emoji: '⚖️', unlocked: false },
  { id: 'biodiversity', title: 'Biodiversity', description: 'Have all 12 species alive simultaneously', emoji: '🌈', unlocked: false },
  { id: 'resilience', title: 'Resilience', description: 'Recover from a catastrophic event', emoji: '🔄', unlocked: false },
];

export const useSimulationStore = create<SimulationStore>()(
  subscribeWithSelector((set, get) => ({
    tick: 0,
    year: 0,
    speed: 1,
    isRunning: false,
    gameMode: 'sandbox',
    entities: [],
    stats: { ...DEFAULT_STATS },
    historicalData: [],
    activeEvents: [],
    eventLog: [],
    notifications: [],
    achievements: DEFAULT_ACHIEVEMENTS,

    setSpeed: (speed) => set({ speed }),
    toggleRunning: () => set((s) => ({ isRunning: !s.isRunning })),
    setGameMode: (mode) => set({ gameMode: mode }),

    setEntities: (entities) => set({ entities }),
    addEntity: (entity) => set((s) => ({ entities: [...s.entities, entity] })),
    removeEntity: (id) => set((s) => ({ entities: s.entities.filter(e => e.id !== id) })),
    updateEntity: (id, updates) => set((s) => ({
      entities: s.entities.map(e => e.id === id ? { ...e, ...updates } : e),
    })),

    tick_: () => set((s) => {
      const TICKS_PER_YEAR = 1000;
      const newTick = s.tick + 1;
      return { tick: newTick, year: newTick / TICKS_PER_YEAR };
    }),

    addNotification: (message, type = 'info', emoji) => {
      const notification: Notification = {
        id: generateId(),
        message,
        type,
        timestamp: get().year,
        emoji,
      };
      set((s) => ({
        notifications: [notification, ...s.notifications].slice(0, 8),
      }));
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        get().dismissNotification(notification.id);
      }, 5000);
    },

    dismissNotification: (id) => set((s) => ({
      notifications: s.notifications.filter(n => n.id !== id),
    })),

    addHistoricalPoint: (point) => set((s) => ({
      historicalData: [...s.historicalData, point].slice(-500), // Keep last 500 points
    })),

    addEvent: (event) => set((s) => ({
      activeEvents: [...s.activeEvents, event],
      eventLog: [event, ...s.eventLog].slice(0, 50),
    })),

    updateStats: (stats) => set((s) => ({
      stats: { ...s.stats, ...stats },
    })),

    unlockAchievement: (id) => {
      const achievement = get().achievements.find(a => a.id === id);
      if (achievement && !achievement.unlocked) {
        set((s) => ({
          achievements: s.achievements.map(a =>
            a.id === id ? { ...a, unlocked: true, unlockedAt: s.year } : a
          ),
        }));
        get().addNotification(
          `Achievement unlocked: ${achievement.title}`,
          'success',
          achievement.emoji
        );
      }
    },

    resetSimulation: () => set({
      tick: 0,
      year: 0,
      entities: [],
      stats: { ...DEFAULT_STATS },
      historicalData: [],
      activeEvents: [],
      eventLog: [],
      notifications: [],
      achievements: DEFAULT_ACHIEVEMENTS,
    }),
  }))
);

// =============================================
// Environment Store
// =============================================
interface EnvironmentStore {
  env: EnvironmentState;
  setEnvVariable: (key: keyof EnvironmentState, value: number) => void;
  setEnv: (env: Partial<EnvironmentState>) => void;
  resetEnv: () => void;
}

export const useEnvironmentStore = create<EnvironmentStore>()(
  subscribeWithSelector((set) => ({
    env: { ...DEFAULT_ENVIRONMENT },

    setEnvVariable: (key, value) => set((s) => ({
      env: { ...s.env, [key]: value },
    })),

    setEnv: (env) => set((s) => ({
      env: { ...s.env, ...env },
    })),

    resetEnv: () => set({ env: { ...DEFAULT_ENVIRONMENT } }),
  }))
);

// =============================================
// UI Store
// =============================================
interface UIStoreState {
  ui: UIState;
  setActivePanel: (panel: ActivePanel) => void;
  setSelectedSpecies: (id: string | null) => void;
  toggleOption: (key: keyof Pick<UIState, 'showGrid' | 'showTrails' | 'showLabels' | 'showGlow'>) => void;
  setDomeFocused: (focused: boolean) => void;
}

export const useUIStore = create<UIStoreState>()((set) => ({
  ui: {
    activePanel: 'environment',
    selectedSpeciesId: null,
    showGrid: false,
    showTrails: true,
    showLabels: false,
    showGlow: true,
    isDomeFocused: false,
  },

  setActivePanel: (panel) => set((s) => ({
    ui: { ...s.ui, activePanel: s.ui.activePanel === panel ? null : panel },
  })),

  setSelectedSpecies: (id) => set((s) => ({
    ui: { ...s.ui, selectedSpeciesId: id },
  })),

  toggleOption: (key) => set((s) => ({
    ui: { ...s.ui, [key]: !s.ui[key] },
  })),

  setDomeFocused: (focused) => set((s) => ({
    ui: { ...s.ui, isDomeFocused: focused },
  })),
}));

// =============================================
// Derived selectors
// =============================================
export const selectPopulationBySpecies = (entities: EntityState[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const e of entities) {
    if (e.alive) {
      counts[e.speciesId] = (counts[e.speciesId] || 0) + 1;
    }
  }
  return counts;
};

export const selectAliveEntities = (entities: EntityState[]): EntityState[] =>
  entities.filter(e => e.alive);

export const selectByType = (entities: EntityState[], type: SpeciesType): EntityState[] =>
  entities.filter(e => e.alive && e.type === type);
