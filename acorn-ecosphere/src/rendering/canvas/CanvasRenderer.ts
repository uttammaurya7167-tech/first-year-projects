// =============================================
// ECOSPHERE — Core Canvas Renderer v1 (Phase 1)
// Clean, high-performance rendering for the biodome
// =============================================
import type { EntityState, EnvironmentState } from '../../types';
import { colorWithAlpha } from '../../utils/math';

interface RenderOptions {
  showGlow: boolean;
  showTrails: boolean;
  showLabels: boolean;
  showGrid: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  age: number;
  color: string;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private cx: number;
  private cy: number;
  private domeRadius: number;
  private trails: Map<string, TrailPoint[]> = new Map();
  private particles: DomeParticle[] = [];
  private frameCount = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.cx = canvas.width / 2;
    this.cy = canvas.height / 2;
    this.domeRadius = Math.min(canvas.width, canvas.height) * 0.44;
    this.initParticles();
  }

  get center() {
    return { x: this.cx, y: this.cy };
  }

  get radius() {
    return this.domeRadius;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cx = width / 2;
    this.cy = height / 2;
    this.domeRadius = Math.min(width, height) * 0.44;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private initParticles() {
    for (let i = 0; i < 60; i++) {
      this.particles.push(new DomeParticle(this.cx, this.cy, this.domeRadius));
    }
  }

  // =============================================
  // MAIN RENDER
  // =============================================
  render(
    entities: EntityState[],
    env: EnvironmentState,
    year: number,
    options: RenderOptions
  ) {
    this.frameCount++;
    const ctx = this.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, this.width, this.height);

    // Background + stars
    this.drawBackground(env);

    // Grid (optional)
    if (options.showGrid) {
      this.drawGrid();
    }

    // Dome atmosphere
    this.drawDome(env);

    // Floating background particles
    this.drawParticles(env);

    // Trails (optional)
    if (options.showTrails) {
      this.drawTrails();
    }

    const alive = entities.filter(e => e.alive);

    // Draw glow of bioluminescent entities first
    if (options.showGlow) {
      for (const entity of alive) {
        if (entity.traits.bioluminescent) {
          this.drawBioluminescentGlow(entity);
        }
      }
    }

    // Draw all alive entities
    for (const entity of alive) {
      this.drawEntity(entity, options);
      if (options.showTrails) {
        this.updateTrail(entity);
      }
    }

    // Draw dead entities (fade out)
    for (const entity of entities.filter(e => !e.alive)) {
      this.drawDeadEntity(entity);
    }

    // HUD overlays
    this.drawDomeRing(env);
    this.drawYearLabel(year);
    this.drawEnvIndicators(env);
    this.drawEntityCount(alive.length);

    // Cleanup abandoned trails
    if (this.frameCount % 120 === 0) {
      this.cleanupTrails(new Set(alive.map(e => e.id)));
    }
  }

  // =============================================
  // BACKGROUND & STARS
  // =============================================
  private starData: Array<{ x: number; y: number; r: number; a: number; twinkle: number }> = [];

  private drawBackground(env: EnvironmentState) {
    const ctx = this.ctx;
    const light = env.lighting / 100;

    const bgGrad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(this.width, this.height));
    bgGrad.addColorStop(0, `rgba(0, ${Math.round(8 + light * 12)}, ${Math.round(18 + light * 18)}, 1)`);
    bgGrad.addColorStop(1, '#000205');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawStars();
  }

  private drawStars() {
    if (this.starData.length === 0) {
      for (let i = 0; i < 180; i++) {
        this.starData.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          r: Math.random() * 1.1 + 0.1,
          a: 0.15 + Math.random() * 0.5,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    }
    const ctx = this.ctx;
    const t = this.frameCount * 0.008;
    for (const star of this.starData) {
      const brightness = star.a * (0.7 + 0.3 * Math.sin(t + star.twinkle));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 235, 255, ${brightness})`;
      ctx.fill();
    }
  }

  // =============================================
  // DOME ATMOSPHERE & SHAPE
  // =============================================
  private drawDome(env: EnvironmentState) {
    const ctx = this.ctx;
    const { cx, cy, domeRadius: r } = this;
    const o2 = env.oxygen / 100;
    const co2 = env.co2 / 100;
    const light = env.lighting / 100;

    // Atmosphere color based on gas mix
    const atmGrad = ctx.createRadialGradient(cx, cy - r * 0.15, 0, cx, cy, r);
    atmGrad.addColorStop(0, `rgba(${Math.round(co2 * 15)}, ${Math.round(30 + o2 * 50 + light * 20)}, ${Math.round(60 + light * 30)}, 0.12)`);
    atmGrad.addColorStop(0.5, `rgba(0, ${Math.round(20 + o2 * 30)}, ${Math.round(40 + light * 20)}, 0.07)`);
    atmGrad.addColorStop(1, 'rgba(0, 255, 255, 0.015)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = atmGrad;
    ctx.fill();

    // Glass reflection highlights
    const glassGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.05, cx, cy, r);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
    glassGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.01)');
    glassGrad.addColorStop(1, 'rgba(0, 180, 255, 0.02)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = glassGrad;
    ctx.fill();

    // Internal structural lines
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.035)';
    ctx.lineWidth = 0.8;
    
    // Latitudes
    for (let i = -4; i <= 4; i++) {
      const yOff = (i / 4.5) * r;
      const lr = Math.sqrt(Math.max(0, r * r - yOff * yOff));
      ctx.beginPath();
      ctx.ellipse(cx, cy + yOff, lr, lr * 0.12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Longitudes
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.quadraticCurveTo(cx + Math.cos(a) * r, cy, cx, cy + r);
      ctx.stroke();
    }
    ctx.restore();
  }

  // =============================================
  // BACKGROUND PARTICLES
  // =============================================
  private drawParticles(env: EnvironmentState) {
    for (const p of this.particles) {
      p.update(this.cx, this.cy, this.domeRadius, env);
      p.draw(this.ctx);
    }
  }

  // =============================================
  // INDEPENDENT BIOLUMINESCENCE GLOW (INLINE)
  // =============================================
  private drawBioluminescentGlow(entity: EntityState) {
    const ctx = this.ctx;
    const { x, y } = entity.position;
    const glowR = entity.radius * 7;
    const t = Date.now() * 0.0008;
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + entity.id.charCodeAt(0) * 0.5);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    grad.addColorStop(0, colorWithAlpha(entity.traits.color, 0.35 * pulse));
    grad.addColorStop(0.4, colorWithAlpha(entity.traits.color, 0.12 * pulse));
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // =============================================
  // ENTITY DRAWING
  // =============================================
  private drawEntity(entity: EntityState, options: RenderOptions) {
    const ctx = this.ctx;
    const { x, y } = entity.position;
    const r = entity.radius;
    const color = entity.traits.color;
    const healthRatio = entity.health / 100;
    const energyRatio = entity.energy / 100;

    // Body radial gradient
    const bodyGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r);
    bodyGrad.addColorStop(0, colorWithAlpha(color, 0.95));
    bodyGrad.addColorStop(0.65, colorWithAlpha(color, 0.75));
    bodyGrad.addColorStop(1, colorWithAlpha(color, 0.35));

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Energy aura ring
    if (options.showGlow && energyRatio > 0.5) {
      ctx.beginPath();
      ctx.arc(x, y, r + 1, 0, Math.PI * 2 * energyRatio);
      ctx.strokeStyle = colorWithAlpha(color, 0.35);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Health stress rim
    if (healthRatio < 0.5) {
      const rimAlpha = (0.5 - healthRatio) * 2;
      ctx.beginPath();
      ctx.arc(x, y, r + 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, ${Math.round(60 + healthRatio * 100)}, 60, ${rimAlpha * 0.7})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Behavioral representation
    if (entity.type === 'plant') {
      // Plant nucleus dot
      ctx.beginPath();
      ctx.arc(x, y, r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fill();
    } else if (entity.type === 'animal') {
      // Vector arrow towards direction of velocity
      const angle = Math.atan2(entity.velocity.y, entity.velocity.x);
      const tipX = x + Math.cos(angle) * r * 0.65;
      const tipY = y + Math.sin(angle) * r * 0.65;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(x + Math.cos(angle + 2.5) * r * 0.35, y + Math.sin(angle + 2.5) * r * 0.35);
      ctx.lineTo(x + Math.cos(angle - 2.5) * r * 0.35, y + Math.sin(angle - 2.5) * r * 0.35);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fill();
    } else {
      // Microbe membrane
      ctx.beginPath();
      ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = colorWithAlpha(color, 0.35);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Species letter label
    if (options.showLabels && r > 7) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = `bold ${Math.round(r * 0.65 + 6)}px Orbitron, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(entity.speciesName.slice(0, 1), x, y);
    }
  }

  private drawDeadEntity(entity: EntityState) {
    if (!entity.age && entity.age !== 0) return;
    const ctx = this.ctx;
    const { x, y } = entity.position;
    const alpha = Math.max(0, 0.4 - entity.age * 0.02);
    if (alpha <= 0) return;

    ctx.beginPath();
    ctx.arc(x, y, entity.radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(80, 40, 40, ${alpha})`;
    ctx.fill();

    // Dead entity X mark
    ctx.strokeStyle = `rgba(180, 60, 60, ${alpha * 0.8})`;
    ctx.lineWidth = 0.8;
    const s = entity.radius * 0.35;
    ctx.beginPath();
    ctx.moveTo(x - s, y - s);
    ctx.lineTo(x + s, y + s);
    ctx.moveTo(x + s, y - s);
    ctx.lineTo(x - s, y + s);
    ctx.stroke();
  }

  // =============================================
  // TRAILS
  // =============================================
  private updateTrail(entity: EntityState) {
    if (!this.trails.has(entity.id)) {
      this.trails.set(entity.id, []);
    }
    const trail = this.trails.get(entity.id)!;
    trail.push({ x: entity.position.x, y: entity.position.y, age: 0, color: entity.traits.color });
    if (trail.length > 15) {
      trail.shift();
    }
    for (const p of trail) {
      p.age++;
    }
  }

  private drawTrails() {
    const ctx = this.ctx;
    for (const [, trail] of this.trails) {
      if (trail.length < 2) continue;
      for (let i = 1; i < trail.length; i++) {
        const alpha = (i / trail.length) * 0.18;
        const w = (i / trail.length) * 1.4;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = colorWithAlpha(trail[i].color, alpha);
        ctx.lineWidth = w;
        ctx.stroke();
      }
    }
  }

  // =============================================
  // DOME RING OVERLAYS
  // =============================================
  private drawDomeRing(env: EnvironmentState) {
    const ctx = this.ctx;
    const { cx, cy, domeRadius: r } = this;
    const t = Date.now() * 0.0008;
    const pulse = 0.35 + Math.sin(t) * 0.12;

    // Primary metal ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 255, 255, ${pulse})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 255, 255, ${pulse * 0.2})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Diffuse atmospheric glow
    const glow = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 35);
    glow.addColorStop(0, `rgba(0, 255, 255, ${pulse * 0.1})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r + 35, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Stress warning ring (low oxygen or high co2)
    const suitability = (env.oxygen + (100 - env.co2)) / 200;
    if (suitability < 0.4) {
      const warningAlpha = (0.4 - suitability) * 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 60, 60, ${warningAlpha * Math.abs(Math.sin(t * 3.5))})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
  }

  // =============================================
  // GRID
  // =============================================
  private drawGrid() {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.domeRadius - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
    ctx.lineWidth = 0.5;
    const step = 40;
    for (let x = 0; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // =============================================
  // HUD INFO
  // =============================================
  private drawYearLabel(year: number) {
    const ctx = this.ctx;
    const text = year < 1 ? `Day ${Math.floor(year * 365)}` : `Year ${year.toFixed(1)}`;
    ctx.font = '12px Orbitron, monospace';
    ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText(text, this.cx, this.cy + this.domeRadius + 22);
  }

  private drawEntityCount(count: number) {
    const ctx = this.ctx;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(57, 255, 20, 0.45)';
    ctx.textAlign = 'center';
    ctx.fillText(`${count} alive`, this.cx, this.cy + this.domeRadius + 37);
  }

  private drawEnvIndicators(env: EnvironmentState) {
    const ctx = this.ctx;
    const { cx, cy, domeRadius: r } = this;
    const barW = 55;
    const barH = 3;
    const startX = cx - barW - 6;
    const startY = cy + r - 18;

    // Oxygen
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(startX, startY, barW, barH);
    ctx.fillStyle = `rgba(0, 220, 255, ${0.35 + (env.oxygen / 100) * 0.55})`;
    ctx.fillRect(startX, startY, barW * (env.oxygen / 100), barH);
    ctx.fillStyle = 'rgba(0,220,255,0.5)';
    ctx.font = '8px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText('O₂ ' + Math.round(env.oxygen) + '%', startX, startY - 3);

    // Carbon Dioxide
    const co2X = cx + 6;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(co2X, startY, barW, barH);
    ctx.fillStyle = `rgba(168, 224, 99, ${0.35 + (env.co2 / 100) * 0.55})`;
    ctx.fillRect(co2X, startY, barW * (env.co2 / 100), barH);
    ctx.fillStyle = 'rgba(168,224,99,0.5)';
    ctx.fillText('CO₂ ' + Math.round(env.co2) + '%', co2X, startY - 3);
  }

  cleanupTrails(aliveIds: Set<string>) {
    for (const id of this.trails.keys()) {
      if (!aliveIds.has(id)) {
        this.trails.delete(id);
      }
    }
  }
}

// =============================================
// BACKGROUND FLOATING PARTICLE CLASS
// =============================================
class DomeParticle {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  radius = 1;
  alpha = 0.3;
  color = '#44aaff';
  life = 0;
  maxLife = 300;
  cx = 0;
  cy = 0;
  domeR = 300;

  constructor(cx: number, cy: number, domeR: number) {
    this.cx = cx;
    this.cy = cy;
    this.domeR = domeR;
    this.reset();
    this.life = Math.random() * this.maxLife;
  }

  reset() {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * this.domeR * 0.88;
    this.x = this.cx + Math.cos(angle) * r;
    this.y = this.cy + Math.sin(angle) * r;
    
    const speed = 0.05 + Math.random() * 0.18;
    const dir = Math.random() * Math.PI * 2;
    this.vx = Math.cos(dir) * speed;
    this.vy = Math.sin(dir) * speed - 0.04;
    
    this.radius = 0.4 + Math.random() * 1.6;
    this.maxLife = 150 + Math.random() * 300;
    this.life = 0;
    
    const t = Math.random();
    this.color = t < 0.4 ? '#44aaff' : t < 0.7 ? '#aaaabb' : '#aaff44';
    this.alpha = 0.08 + Math.random() * 0.3;
  }

  update(cx: number, cy: number, domeR: number, env: EnvironmentState) {
    this.cx = cx;
    this.cy = cy;
    this.domeR = domeR;
    this.life++;
    
    if (this.life > this.maxLife) {
      this.reset();
      return;
    }

    // Drift based on light and temperature
    const lightFactor = env.lighting / 100;
    this.x += this.vx * (0.8 + lightFactor * 0.4);
    this.y += this.vy * (0.8 + (env.temperature + 20) / 80 * 0.4);

    // Bounce off dome boundaries
    const dx = this.x - this.cx;
    const dy = this.y - this.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > this.domeR * 0.92) {
      const angle = Math.atan2(dy, dx);
      this.x = this.cx + Math.cos(angle) * this.domeR * 0.92;
      this.vx = -this.vx * 0.8;
      this.vy = -this.vy * 0.8;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const lifeRatio = this.life / this.maxLife;
    const fade = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.8 ? (1 - lifeRatio) * 5 : 1;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = colorWithAlpha(this.color, this.alpha * fade);
    ctx.fill();
  }
}
