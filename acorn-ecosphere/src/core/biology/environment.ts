// =============================================
// ECOSPHERE — Environment Variable Definitions
// =============================================
import type { EnvironmentVariable, EnvironmentState } from '../../types';

export const ENV_VARIABLES: EnvironmentVariable[] = [
  {
    key: 'lighting',
    label: 'Lighting',
    unit: '%',
    min: 0,
    max: 100,
    color: '#ffd700',
    icon: '☀️',
    description: 'Solar energy available for photosynthesis. High light boosts plant growth but increases heat.',
  },
  {
    key: 'humidity',
    label: 'Humidity',
    unit: '%',
    min: 0,
    max: 100,
    color: '#00bfff',
    icon: '💧',
    description: 'Atmospheric moisture level. Critical for hydration of all organisms.',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    unit: '°C',
    min: -20,
    max: 60,
    color: '#ff4500',
    icon: '🌡️',
    description: 'Thermal environment. Each species has an optimal temperature range.',
  },
  {
    key: 'uvRadiation',
    label: 'UV Radiation',
    unit: '%',
    min: 0,
    max: 100,
    color: '#9b59b6',
    icon: '⚡',
    description: 'Ultraviolet exposure. High UV drives mutations and can be lethal without resistance.',
  },
  {
    key: 'oxygen',
    label: 'Oxygen',
    unit: '%',
    min: 0,
    max: 100,
    color: '#00ffff',
    icon: '🫧',
    description: 'Atmospheric O₂ level. Produced by plants, consumed by fauna.',
  },
  {
    key: 'co2',
    label: 'CO₂',
    unit: '%',
    min: 0,
    max: 100,
    color: '#a8e063',
    icon: '🌫️',
    description: 'Carbon dioxide concentration. Fuel for photosynthesis. High CO₂ stresses animals.',
  },
  {
    key: 'nutrients',
    label: 'Nutrients',
    unit: '%',
    min: 0,
    max: 100,
    color: '#ff8c00',
    icon: '⚗️',
    description: 'Dissolved minerals and organic compounds. Fertilizes plant growth.',
  },
  {
    key: 'pH',
    label: 'pH Level',
    unit: 'pH',
    min: 0,
    max: 14,
    color: '#e74c3c',
    icon: '🧪',
    description: 'Acidity/alkalinity of the ecosystem. Extreme values are toxic to most life.',
  },
  {
    key: 'waterVolume',
    label: 'Water Volume',
    unit: '%',
    min: 0,
    max: 100,
    color: '#3498db',
    icon: '🌊',
    description: 'Total water available in the biodome. Evaporates over time based on temperature.',
  },
  {
    key: 'pressure',
    label: 'Pressure',
    unit: '%',
    min: 0,
    max: 100,
    color: '#95a5a6',
    icon: '🌀',
    description: 'Atmospheric pressure affects gas exchange rates and organism buoyancy.',
  },
];

export const DEFAULT_ENVIRONMENT: EnvironmentState = {
  lighting: 65,
  humidity: 60,
  temperature: 22,
  uvRadiation: 15,
  oxygen: 55,
  co2: 40,
  nutrients: 70,
  pH: 7,
  waterVolume: 65,
  pressure: 50,
};

// Hospitable range for life
export const HOSPITABLE_ENVIRONMENT: EnvironmentState = {
  lighting: 60,
  humidity: 65,
  temperature: 24,
  uvRadiation: 10,
  oxygen: 60,
  co2: 35,
  nutrients: 75,
  pH: 7,
  waterVolume: 70,
  pressure: 55,
};

// Calculates how suitable the environment is for life (0–1)
export function calculateEnvironmentSuitability(env: EnvironmentState): number {
  let score = 0;
  const checks = [
    env.oxygen >= 20 && env.oxygen <= 80,
    env.co2 <= 60,
    env.temperature >= 0 && env.temperature <= 45,
    env.pH >= 5 && env.pH <= 9,
    env.waterVolume >= 20,
    env.nutrients >= 20,
    env.humidity >= 20 && env.humidity <= 90,
  ];
  score = checks.filter(Boolean).length / checks.length;
  return score;
}

// Environmental interactions — variables that affect each other
export function applyEnvironmentInteractions(env: EnvironmentState): EnvironmentState {
  const updated = { ...env };

  // High temperature causes evaporation → reduces humidity
  if (env.temperature > 35) {
    const evaporation = (env.temperature - 35) * 0.1;
    updated.humidity = Math.max(0, env.humidity - evaporation);
    updated.waterVolume = Math.max(0, env.waterVolume - evaporation * 0.5);
  }

  // High humidity → increases water volume slightly (condensation)
  if (env.humidity > 80) {
    updated.waterVolume = Math.min(100, env.waterVolume + (env.humidity - 80) * 0.02);
  }

  // High UV radiation slightly increases temperature
  if (env.uvRadiation > 50) {
    updated.temperature = Math.min(60, env.temperature + (env.uvRadiation - 50) * 0.05);
  }

  return updated;
}
