// =============================================
// ECOSPHERE — Physics Engine
// Microgravity simulation with drift, currents,
// wall bouncing and soft repulsion
// =============================================

import type { EntityState, Vec2 } from '../../types';
import { clamp, vecAdd, vecScale, randFloat } from '../../utils/math';

export interface PhysicsConfig {
  domeRadius: number;
  domeCenterX: number;
  domeCenterY: number;
  airResistance: number;        // 0–1 damping
  baseGravity: number;          // microgravity strength (near 0)
  turbulence: number;           // random drift factor
  wallRepulsion: number;        // repulsion force from dome walls
}

export const DEFAULT_PHYSICS: PhysicsConfig = {
  domeRadius: 300,
  domeCenterX: 400,
  domeCenterY: 400,
  airResistance: 0.98,
  baseGravity: 0.002,
  turbulence: 0.008,
  wallRepulsion: 0.5,
};

// Air current directions that evolve slowly over time
let airCurrentAngle = 0;
let airCurrentStrength = 0.03;

export class PhysicsEngine {
  private config: PhysicsConfig;
  private tick = 0;

  constructor(config: Partial<PhysicsConfig> = {}) {
    this.config = { ...DEFAULT_PHYSICS, ...config };
  }

  updateConfig(updates: Partial<PhysicsConfig>) {
    this.config = { ...this.config, ...updates };
  }

  // Update a single entity's position and velocity
  updateEntity(entity: EntityState, deltaTime: number = 1): EntityState {
    if (!entity.alive || entity.traits.speed === 0) return entity;

    const { domeCenterX: cx, domeCenterY: cy, domeRadius: r } = this.config;

    let { x, y } = entity.position;
    let { x: vx, y: vy } = entity.velocity;

    // 1. Air current drift
    const currentX = Math.cos(airCurrentAngle) * airCurrentStrength;
    const currentY = Math.sin(airCurrentAngle) * airCurrentStrength;
    vx += currentX * entity.traits.speed;
    vy += currentY * entity.traits.speed;

    // 2. Microgravity — very gentle pull toward center
    const dxToCenter = cx - x;
    const dyToCenter = cy - y;
    const distToCenter = Math.sqrt(dxToCenter ** 2 + dyToCenter ** 2);
    if (distToCenter > 0) {
      const gravFactor = this.config.baseGravity * distToCenter * 0.001;
      vx += (dxToCenter / distToCenter) * gravFactor;
      vy += (dyToCenter / distToCenter) * gravFactor;
    }

    // 3. Random turbulence
    vx += randFloat(-this.config.turbulence, this.config.turbulence) * entity.traits.speed;
    vy += randFloat(-this.config.turbulence, this.config.turbulence) * entity.traits.speed;

    // 4. Air resistance damping
    vx *= this.config.airResistance;
    vy *= this.config.airResistance;

    // 5. Cap velocity by species speed trait
    const maxSpeed = entity.traits.speed * 2.5;
    const speed = Math.sqrt(vx ** 2 + vy ** 2);
    if (speed > maxSpeed) {
      vx = (vx / speed) * maxSpeed;
      vy = (vy / speed) * maxSpeed;
    }

    // 6. Update position
    x += vx * deltaTime;
    y += vy * deltaTime;

    // 7. Dome wall collision & repulsion
    const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const effectiveRadius = r - entity.radius;

    if (distFromCenter >= effectiveRadius) {
      // Push back inside the dome
      const nx = (x - cx) / distFromCenter;
      const ny = (y - cy) / distFromCenter;

      // Reflect velocity
      const dot = vx * nx + vy * ny;
      vx -= 2 * dot * nx * 0.7; // 0.7 = energy loss on bounce
      vy -= 2 * dot * ny * 0.7;

      // Reposition just inside
      x = cx + nx * (effectiveRadius - 1);
      y = cy + ny * (effectiveRadius - 1);
    }

    // 8. Wall repulsion force (gradual push away from walls)
    const wallDist = effectiveRadius - distFromCenter;
    if (wallDist < 30 && distFromCenter > 0) {
      const repulse = (30 - wallDist) / 30 * this.config.wallRepulsion;
      vx -= ((x - cx) / distFromCenter) * repulse * 0.05;
      vy -= ((y - cy) / distFromCenter) * repulse * 0.05;
    }

    return {
      ...entity,
      position: { x, y },
      velocity: { x: vx, y: vy },
    };
  }

  // Batch update all entities
  updateAll(entities: EntityState[], deltaTime: number = 1): EntityState[] {
    this.tick++;

    // Slowly evolve air current direction
    airCurrentAngle += 0.002;
    airCurrentStrength = 0.02 + Math.sin(this.tick * 0.01) * 0.01;

    return entities.map(e => this.updateEntity(e, deltaTime));
  }

  // Spawn velocity for a new entity (natural drift)
  randomSpawnVelocity(speedTrait: number): Vec2 {
    const angle = Math.random() * Math.PI * 2;
    const mag = randFloat(0.2, 1.0) * speedTrait;
    return { x: Math.cos(angle) * mag, y: Math.sin(angle) * mag };
  }

  // Calculate simple entity repulsion to avoid overlapping
  applyRepulsion(entities: EntityState[], strength: number = 0.5): EntityState[] {
    const result = entities.map(e => ({ ...e, velocity: { ...e.velocity } }));

    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i];
        const b = result[j];
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const dist = Math.sqrt(dx ** 2 + dy ** 2);
        const minDist = (a.radius + b.radius) * 1.2;

        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / minDist;
          const fx = (dx / dist) * overlap * strength * 0.1;
          const fy = (dy / dist) * overlap * strength * 0.1;

          result[i].velocity.x -= fx;
          result[i].velocity.y -= fy;
          result[j].velocity.x += fx;
          result[j].velocity.y += fy;
        }
      }
    }

    return result;
  }
}

export const globalPhysics = new PhysicsEngine();
