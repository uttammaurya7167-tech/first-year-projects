/**
 * ANTIGRAVITY retro 2.5D Doom-style Game Engine
 * 
 * Architecture & Features:
 * - Pure Vanilla JavaScript, zero dependencies, single 2D Canvas.
 * - True Software Raycaster rendering variable sector heights (floors, ceilings, steps).
 * - Pixel-perfect 2D Z-Buffer for absolute rendering precision and depth.
 * - Decoupled Physics Loop: Calibrated at a steady 35Hz Doom-standard tick rate.
 * - Momentum & Sliding Cylinder Physics: Standard circle-to-AABB pushing collision.
 * - Sprite Billboards: Z-buffered scaling sprites with interactive states.
 * - Animated Weapon & Hitscan: Frame-by-frame reloading and raycast enemy collision.
 * - Web Audio Sound FX Synth: 8-bit noise, frequency sweeps, and clicks.
 * - Procedural Retro Texture Generation: Generates custom textures and sprites on startup.
 */

// ============================================================================
// CONSTANTS & VIEWPORT CONFIGURATION
// ============================================================================
const VIEW_WIDTH = 320;      // 3D Viewport Width
const VIEW_HEIGHT = 200;     // 3D Viewport Height
const SCREEN_WIDTH = 320;    // Canvas Buffer Width
const SCREEN_HEIGHT = 240;   // Canvas Buffer Height (top 200px 3D, bottom 40px HUD)
const FOV = 60 * Math.PI / 180;
const FOCAL_LENGTH = (VIEW_WIDTH / 2) / Math.tan(FOV / 2); // ~277.13 pixels

// ============================================================================
// MAP DEFINITION (SECTOR GRID)
// ============================================================================
// Sectors: 
// floorHeight/ceilingHeight control the 2.5D space.
// brightness controls sector lighting.
// wall/floor/ceilingTexture map to the procedural textures.
const SECTORS = {
    0: { id: 0, floorHeight: 0.0, ceilingHeight: 2.0, wallTexture: 'brick', floorTexture: 'floor_panel', ceilingTexture: 'grate', brightness: 1.0 },
    1: { id: 1, floorHeight: 1.0, ceilingHeight: 3.5, wallTexture: 'wood', floorTexture: 'floor_panel', ceilingTexture: 'stone', brightness: 0.9 },
    2: { id: 2, floorHeight: 0.0, ceilingHeight: 1.5, wallTexture: 'stone', floorTexture: 'lava', ceilingTexture: 'stone', brightness: 0.65 },
    
    // Stairs connecting Sector 0 (0.0) to Sector 1 (1.0)
    3: { id: 3, floorHeight: 0.25, ceilingHeight: 2.375, wallTexture: 'brick_step', floorTexture: 'floor_panel', ceilingTexture: 'grate', brightness: 0.97 },
    4: { id: 4, floorHeight: 0.50, ceilingHeight: 2.750, wallTexture: 'brick_step', floorTexture: 'floor_panel', ceilingTexture: 'grate', brightness: 0.95 },
    5: { id: 5, floorHeight: 0.75, ceilingHeight: 3.125, wallTexture: 'brick_step', floorTexture: 'floor_panel', ceilingTexture: 'grate', brightness: 0.92 },
    
    // Solid Block Sector
    9: { id: 9, floorHeight: 0.0, ceilingHeight: 0.0, wallTexture: 'solid', floorTexture: 'none', ceilingTexture: 'none', brightness: 0.0 }
};

// 16x16 Grid Map representing index into SECTORS
const MAP_GRID = [
    [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
    [9,0,0,0,9,9,9,9,9,9,0,0,0,0,0,9],
    [9,0,0,0,9,9,1,1,1,9,0,2,2,2,0,9],
    [9,0,0,0,9,9,1,1,1,9,0,2,2,2,0,9],
    [9,9,3,9,9,9,1,1,1,9,0,0,0,0,0,9], // cell (2, 4) is step-up!
    [9,0,0,0,0,9,1,1,1,9,9,9,0,9,9,9],
    [9,0,0,0,0,9,5,4,3,9,9,9,0,9,9,9], // Stairs connecting to sector 1
    [9,0,0,0,0,9,0,0,0,9,0,0,0,0,0,9],
    [9,9,9,0,9,9,0,0,0,0,0,0,0,0,0,9],
    [9,0,0,0,0,9,0,0,0,9,0,0,0,0,0,9],
    [9,0,0,0,0,9,9,9,9,9,9,9,9,9,0,9],
    [9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9],
    [9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9],
    [9,0,2,2,2,0,0,0,0,0,0,2,2,2,0,9],
    [9,0,2,2,2,0,0,0,0,0,0,2,2,2,0,9],
    [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9]
];

// ============================================================================
// PROCEDURAL RETRO GRAPHICS ENGINE
// ============================================================================
const textures = {};

/**
 * Generates all procedural walls, floors, weapons, and sprites on startup.
 */
function generateProceduralTextures() {
    const createTex = (name, w, h, drawFn) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        drawFn(ctx, w, h);
        textures[name] = {
            width: w,
            height: h,
            data: ctx.getImageData(0, 0, w, h).data
        };
    };

    // 1. Red Bricks
    createTex('brick', 64, 64, (ctx, w, h) => {
        ctx.fillStyle = '#781f1d';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 400; i++) {
            let n = Math.random() * 30 - 15;
            ctx.fillStyle = `rgba(${120 + n}, ${31 + n}, ${29 + n}, 0.25)`;
            ctx.fillRect(Math.random()*w, Math.random()*h, 2+Math.random()*4, 2+Math.random()*4);
        }
        ctx.strokeStyle = '#3e3e47';
        ctx.lineWidth = 1.5;
        for (let y = 0; y < h; y += 8) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        for (let row = 0; row < 8; row++) {
            let offset = (row % 2) * 8;
            for (let x = offset; x < w + 8; x += 16) {
                ctx.beginPath(); ctx.moveTo(x, row * 8); ctx.lineTo(x, row * 8 + 8); ctx.stroke();
            }
        }
    });

    // 2. Wooden Planks
    createTex('wood', 64, 64, (ctx, w, h) => {
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#422a18';
        for (let x = 0; x < w; x += 16) {
            ctx.fillRect(x, 0, 2, h);
        }
        for (let i = 0; i < 80; i++) {
            ctx.fillStyle = 'rgba(40, 25, 14, 0.4)';
            ctx.fillRect(Math.random()*w, Math.random()*h, 1+Math.random()*3, 3+Math.random()*15);
        }
        ctx.fillStyle = '#828291';
        for (let x = 8; x < w; x += 16) {
            ctx.beginPath(); ctx.arc(x, 4, 1.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x, h - 4, 1.5, 0, Math.PI*2); ctx.fill();
        }
    });

    // 3. Cracked Stone
    createTex('stone', 64, 64, (ctx, w, h) => {
        ctx.fillStyle = '#55555d';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 400; i++) {
            let n = Math.random() * 24 - 12;
            ctx.fillStyle = `rgba(${85 + n}, ${85 + n}, ${93 + n}, 0.3)`;
            ctx.fillRect(Math.random()*w, Math.random()*h, 1+Math.random()*2, 1+Math.random()*2);
        }
        ctx.strokeStyle = '#28282c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 12); ctx.lineTo(18, 24); ctx.lineTo(28, 16); ctx.lineTo(38, 38); ctx.lineTo(64, 32);
        ctx.moveTo(28, 16); ctx.lineTo(24, 48); ctx.lineTo(36, 64);
        ctx.moveTo(38, 38); ctx.lineTo(50, 58);
        ctx.stroke();
    });

    // 4. Brick Step Tread (Metal Plate + Brick)
    createTex('brick_step', 64, 64, (ctx, w, h) => {
        ctx.fillStyle = '#612a29';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#38383f';
        ctx.lineWidth = 1.5;
        for (let y = 0; y < h; y += 8) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        for (let row = 0; row < 8; row++) {
            let offset = (row % 2) * 8;
            for (let x = offset; x < w + 8; x += 16) {
                ctx.beginPath(); ctx.moveTo(x, row * 8); ctx.lineTo(x, row * 8 + 8); ctx.stroke();
            }
        }
        ctx.fillStyle = '#585860';
        ctx.fillRect(0, 0, w, 14);
        ctx.fillStyle = '#7a7a85';
        for (let y = 2; y < 14; y += 3) {
            for (let x = (y%2)*3; x < w; x += 6) {
                ctx.fillRect(x, y, 2, 1.5);
            }
        }
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 13, w, 2);
    });

    // 5. Metal Floor Panel
    createTex('floor_panel', 64, 64, (ctx, w, h) => {
        ctx.fillStyle = '#3a3a42';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#4c4c56';
        ctx.fillRect(2, 2, w - 4, h - 4);
        ctx.strokeStyle = '#222228';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, w, h);
        ctx.beginPath();
        ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
        ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
        ctx.stroke();
        ctx.fillStyle = '#82828e';
        const spots = [5, 26, 38, 59];
        spots.forEach(cx => {
            spots.forEach(cy => {
                ctx.fillRect(cx, cy, 2, 2);
            });
        });
        for (let i = 0; i < 150; i++) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(Math.random()*w, Math.random()*h, 1, 1);
        }
    });

    // 6. Floor Grate
    createTex('grate', 64, 64, (ctx, w, h) => {
        ctx.fillStyle = '#101015';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#8a6b2c'; // rusted brass
        ctx.lineWidth = 2;
        for (let x = 4; x < w; x += 8) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 4; y < h; y += 8) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
    });

    // 7. Lava (4 Animated Frames)
    for (let frame = 0; frame < 4; frame++) {
        createTex(`lava${frame}`, 64, 64, (ctx, w, h) => {
            ctx.fillStyle = '#660b00';
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 16; i++) {
                let phase = (frame * Math.PI / 2) + i;
                let cx = (Math.sin(phase * 0.7) * 0.38 + 0.5) * w;
                let cy = (Math.cos(phase * 1.1) * 0.38 + 0.5) * h;
                let r = 7 + Math.sin(phase * 1.4) * 4;
                let grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
                grad.addColorStop(0, '#ffd940');
                grad.addColorStop(0.3, '#ff6a00');
                grad.addColorStop(0.7, '#d11f00');
                grad.addColorStop(1, 'rgba(102, 11, 0, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
            }
        });
    }

    // 8. Weapon (Shotgun) Frames
    // Frame 0: Shotgun Idle
    createTex('shotgun0', 128, 128, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2;
        ctx.fillStyle = '#5c4335'; // Hands
        ctx.fillRect(cx - 24, h - 22, 10, 22);
        ctx.fillRect(cx + 14, h - 22, 10, 22);
        ctx.fillStyle = '#472d1a'; // Wood stock
        ctx.fillRect(cx - 12, h - 45, 24, 25);
        ctx.fillStyle = '#222'; // Receiver
        ctx.fillRect(cx - 8, h - 70, 16, 28);
        ctx.fillStyle = '#2d2d33'; // Gun barrels
        ctx.fillRect(cx - 5, h - 110, 4, 44);
        ctx.fillRect(cx + 1, h - 110, 4, 44);
        ctx.fillStyle = '#55555c'; // Barrel highlights
        ctx.fillRect(cx - 4, h - 110, 1.5, 44);
        ctx.fillRect(cx + 2, h - 110, 1.5, 44);
        ctx.fillStyle = '#111'; // Bore holes
        ctx.beginPath(); ctx.arc(cx - 3, h - 110, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 3, h - 110, 1.5, 0, Math.PI*2); ctx.fill();
    });

    // Frame 1: Shotgun Firing (Muzzle Flash & Kickback)
    createTex('shotgun1', 128, 128, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2;
        ctx.fillStyle = '#5c4335'; // Hands lower
        ctx.fillRect(cx - 26, h - 16, 10, 16);
        ctx.fillRect(cx + 16, h - 16, 10, 16);
        ctx.fillStyle = '#472d1a';
        ctx.fillRect(cx - 14, h - 35, 28, 20);
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - 10, h - 55, 20, 22);
        ctx.fillStyle = '#2d2d33'; // Barrels kicked back
        ctx.fillRect(cx - 7, h - 90, 5, 38);
        ctx.fillRect(cx + 2, h - 90, 5, 38);
        // Radial muzzle flash
        let flashY = h - 94;
        let grad = ctx.createRadialGradient(cx, flashY, 2, cx, flashY, 28);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, '#ffff55');
        grad.addColorStop(0.5, '#ff5500');
        grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, flashY, 28, 0, Math.PI*2); ctx.fill();
        // Muzzle fire lines
        ctx.strokeStyle = '#ffffcc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, flashY); ctx.lineTo(cx - 18, flashY - 18);
        ctx.moveTo(cx, flashY); ctx.lineTo(cx + 18, flashY - 18);
        ctx.moveTo(cx, flashY); ctx.lineTo(cx, flashY - 32);
        ctx.moveTo(cx, flashY); ctx.lineTo(cx - 24, flashY - 4);
        ctx.moveTo(cx, flashY); ctx.lineTo(cx + 24, flashY - 4);
        ctx.stroke();
    });

    // Frame 2: Cocking Down (Breech open, ejecting shells)
    createTex('shotgun2', 128, 128, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2;
        ctx.fillStyle = '#5c4335'; // Hands tilt
        ctx.fillRect(cx - 30, h - 18, 10, 18);
        ctx.fillRect(cx + 8, h - 25, 10, 18);
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - 18, h - 42, 22, 26);
        ctx.strokeStyle = '#2d2d33'; // Barrels cracked open to the right
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(cx - 4, h - 32); ctx.lineTo(cx + 26, h - 60); ctx.stroke();
        // Ejected brass shell casings
        ctx.fillStyle = '#ffd700'; ctx.fillRect(cx + 4, h - 46, 3, 7);
        ctx.fillStyle = '#c21807'; ctx.fillRect(cx + 4, h - 44, 3, 5);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(cx + 13, h - 51, 3, 7);
        ctx.fillStyle = '#c21807'; ctx.fillRect(cx + 13, h - 49, 3, 5);
    });

    // Frame 3: Returning breech shut
    createTex('shotgun3', 128, 128, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2;
        ctx.fillStyle = '#5c4335';
        ctx.fillRect(cx - 26, h - 20, 10, 20);
        ctx.fillRect(cx + 12, h - 20, 10, 20);
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - 10, h - 48, 20, 26);
        ctx.strokeStyle = '#2d2d33';
        ctx.lineWidth = 5.5;
        ctx.beginPath(); ctx.moveTo(cx - 2, h - 40); ctx.lineTo(cx + 5, h - 82); ctx.stroke();
        // Snap shut spark
        ctx.fillStyle = '#ffae00';
        ctx.fillRect(cx + 1, h - 50, 3, 3);
        ctx.fillRect(cx - 4, h - 45, 2, 2);
    });

    // 9. IMP Sprite Frames (64x64)
    // Imp Walk 0
    createTex('imp_walk0', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#9e3521'; // Red-brown body
        ctx.beginPath(); ctx.arc(cx, cy - 8, 9, 0, Math.PI*2); ctx.fill(); // Head
        ctx.fillRect(cx - 11, cy + 1, 22, 18); // Torso
        ctx.fillStyle = '#dcd0b3'; // Horns
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy - 15); ctx.lineTo(cx - 11, cy - 22); ctx.lineTo(cx - 3, cy - 15);
        ctx.moveTo(cx + 7, cy - 15); ctx.lineTo(cx + 11, cy - 22); ctx.lineTo(cx + 3, cy - 15);
        ctx.fill();
        ctx.fillStyle = '#39ff14'; // Green eyes
        ctx.fillRect(cx - 5, cy - 10, 2.5, 2); ctx.fillRect(cx + 2, cy - 10, 2.5, 2);
        ctx.fillStyle = '#6b2011'; // Legs
        ctx.fillRect(cx - 9, cy + 18, 5, 14); ctx.fillRect(cx + 4, cy + 18, 5, 14);
        ctx.fillStyle = '#9e3521'; // Arms standing
        ctx.fillRect(cx - 15, cy + 1, 4, 10); ctx.fillRect(cx + 11, cy + 1, 4, 10);
    });
    // Imp Walk 1
    createTex('imp_walk1', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#9e3521';
        ctx.beginPath(); ctx.arc(cx, cy - 7, 9, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(cx - 11, cy + 2, 22, 17);
        ctx.fillStyle = '#dcd0b3'; // Horns
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy - 14); ctx.lineTo(cx - 10, cy - 21); ctx.lineTo(cx - 3, cy - 14);
        ctx.moveTo(cx + 7, cy - 14); ctx.lineTo(cx + 10, cy - 21); ctx.lineTo(cx + 3, cy - 14);
        ctx.fill();
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(cx - 5, cy - 9, 2.5, 2); ctx.fillRect(cx + 2, cy - 9, 2.5, 2);
        ctx.fillStyle = '#6b2011'; // Legs moving
        ctx.fillRect(cx - 9, cy + 19, 5, 13);
        ctx.fillRect(cx + 5, cy + 16, 5, 16); // One foot raised
        ctx.fillStyle = '#9e3521'; // Arms swinging
        ctx.fillRect(cx - 15, cy - 1, 4, 10); ctx.fillRect(cx + 11, cy + 4, 4, 10);
    });
    // Imp Attack Frame
    createTex('imp_attack', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#9e3521';
        ctx.beginPath(); ctx.arc(cx, cy - 7, 9, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(cx - 11, cy + 2, 22, 17);
        ctx.fillStyle = '#dcd0b3'; // Horns
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy - 14); ctx.lineTo(cx - 10, cy - 21); ctx.lineTo(cx - 3, cy - 14);
        ctx.moveTo(cx + 7, cy - 14); ctx.lineTo(cx + 10, cy - 21); ctx.lineTo(cx + 3, cy - 14);
        ctx.fill();
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(cx - 5, cy - 9, 2.5, 2); ctx.fillRect(cx + 2, cy - 9, 2.5, 2);
        ctx.fillStyle = '#6b2011';
        ctx.fillRect(cx - 8, cy + 19, 5, 13); ctx.fillRect(cx + 3, cy + 19, 5, 13);
        // Arms raised holding fireball
        ctx.fillStyle = '#9e3521';
        ctx.fillRect(cx - 16, cy - 8, 5, 12); ctx.fillRect(cx + 11, cy - 8, 5, 12);
        // Glowing fireballs in hands
        let grad = ctx.createRadialGradient(cx - 14, cy - 10, 1, cx - 14, cy - 10, 6);
        grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, '#ffaa00'); grad.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx - 14, cy - 10, 6, 0, Math.PI*2); ctx.fill();
        let grad2 = ctx.createRadialGradient(cx + 14, cy - 10, 1, cx + 14, cy - 10, 6);
        grad2.addColorStop(0, '#fff'); grad2.addColorStop(0.5, '#ffaa00'); grad2.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grad2; ctx.beginPath(); ctx.arc(cx + 14, cy - 10, 6, 0, Math.PI*2); ctx.fill();
    });
    // Imp Pain / Hurt Frame
    createTex('imp_pain', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        // Flesh pain flash: Draw white tint outline
        ctx.fillStyle = '#c23c25';
        ctx.beginPath(); ctx.arc(cx + 2, cy - 6, 10, 0, Math.PI*2); ctx.fill(); // head tilted back
        ctx.fillRect(cx - 12, cy + 3, 24, 16);
        ctx.fillStyle = '#39ff14'; // Eyes wide
        ctx.fillRect(cx - 4, cy - 9, 3, 3); ctx.fillRect(cx + 3, cy - 9, 3, 3);
        ctx.fillStyle = '#ff0000'; // Blood splash
        ctx.fillRect(cx - 5, cy + 2, 10, 5);
        ctx.fillStyle = '#6b2011';
        ctx.fillRect(cx - 10, cy + 18, 5, 14); ctx.fillRect(cx + 5, cy + 18, 5, 14);
    });
    // Imp Death Frames (0 to 3)
    createTex('imp_dead0', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#7a2213'; // collapsing dark red
        ctx.fillRect(cx - 14, cy + 5, 28, 14);
        ctx.beginPath(); ctx.arc(cx - 3, cy + 1, 8, 0, Math.PI*2); ctx.fill(); // slumping head
        ctx.fillStyle = '#6b2011';
        ctx.fillRect(cx - 10, cy + 18, 6, 10); ctx.fillRect(cx + 4, cy + 18, 6, 10);
        ctx.fillStyle = '#ff0000'; // Blood spurt
        ctx.fillRect(cx - 8, cy - 4, 16, 5);
    });
    createTex('imp_dead1', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#6b2011';
        ctx.fillRect(cx - 18, cy + 10, 36, 10); // flat torso
        ctx.beginPath(); ctx.arc(cx - 8, cy + 8, 7, 0, Math.PI*2); ctx.fill(); // head on floor
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(cx - 16, cy + 14, 32, 6);
    });
    createTex('imp_dead2', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#ff0000'; // Blood pool dominates
        ctx.beginPath(); ctx.ellipse(cx, cy + 22, 24, 8, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#4f170c'; // decomposed lump
        ctx.beginPath(); ctx.ellipse(cx - 2, cy + 18, 16, 6, 0, 0, Math.PI*2); ctx.fill();
    });

    // 10. CACODEMON Floating Eyeball (64x64)
    // Caco Idle/Walk
    createTex('caco_walk0', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        // Large purple-blue circle body
        ctx.fillStyle = '#3041a3';
        ctx.beginPath(); ctx.arc(cx, cy - 4, 20, 0, Math.PI*2); ctx.fill();
        // Spikes surrounding body
        ctx.fillStyle = '#7a8bff';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            let sx = cx + Math.cos(a) * 20;
            let sy = cy - 4 + Math.sin(a) * 20;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(cx + Math.cos(a) * 26, cy - 4 + Math.sin(a) * 26);
            ctx.lineTo(cx + Math.cos(a + 0.1) * 19, cy - 4 + Math.sin(a + 0.1) * 19);
            ctx.fill();
        }
        // Giant glowing yellow pupil in the center
        let grad = ctx.createRadialGradient(cx, cy - 4, 1, cx, cy - 4, 10);
        grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.3, '#ffea00'); grad.addColorStop(1, '#ff6a00');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy - 4, 10, 0, Math.PI*2); ctx.fill();
        // Black slit pupil
        ctx.fillStyle = '#111'; ctx.fillRect(cx - 1, cy - 10, 2, 12);
        // Small floating tail spikes
        ctx.fillStyle = '#222d7a';
        ctx.fillRect(cx - 6, cy + 16, 3, 8); ctx.fillRect(cx + 3, cy + 16, 3, 8);
    });
    // Caco Attack Frame (Mouth gaping glowing)
    createTex('caco_attack', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#3041a3';
        ctx.beginPath(); ctx.arc(cx, cy - 4, 20, 0, Math.PI*2); ctx.fill();
        // Spikes
        ctx.fillStyle = '#7a8bff';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            let sx = cx + Math.cos(a) * 20;
            let sy = cy - 4 + Math.sin(a) * 20;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(cx + Math.cos(a) * 26, cy - 4 + Math.sin(a) * 26);
            ctx.lineTo(cx + Math.cos(a + 0.1) * 19, cy - 4 + Math.sin(a + 0.1) * 19);
            ctx.fill();
        }
        // Gaping mouth bottom half
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(cx, cy + 2, 11, 0, Math.PI); ctx.fill();
        // Glowing energy ball inside mouth
        let grad = ctx.createRadialGradient(cx, cy + 4, 1, cx, cy + 4, 9);
        grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.4, '#00ffff'); grad.addColorStop(1, '#0055ff');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy + 4, 8, 0, Math.PI*2); ctx.fill();
        // Teeth
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx - 8, cy + 1, 2, 3); ctx.fillRect(cx + 6, cy + 1, 2, 3);
        ctx.fillRect(cx - 3, cy + 9, 2, 3); ctx.fillRect(cx + 1, cy + 9, 2, 3);
    });
    // Caco Pain Frame
    createTex('caco_pain', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#a62452'; // Purple bruised look
        ctx.beginPath(); ctx.arc(cx, cy - 2, 17, 0, Math.PI*2); ctx.fill();
        // Eye squinted in agony
        ctx.fillStyle = '#ffd700'; ctx.fillRect(cx - 7, cy - 5, 14, 3);
        ctx.fillStyle = '#ff0000'; // bleeding eye
        ctx.fillRect(cx - 4, cy - 2, 8, 4);
    });
    // Caco Death Frames
    createTex('caco_dead0', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#222d7a';
        ctx.beginPath(); ctx.arc(cx, cy + 3, 16, 0, Math.PI*2); ctx.fill();
        // Blue explosion splat
        ctx.fillStyle = '#00ffff';
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(cx - 15 + Math.random()*30, cy - 10 + Math.random()*30, 4, 4);
        }
    });
    createTex('caco_dead1', 64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#1c1b3f'; // deflated ball
        ctx.beginPath(); ctx.ellipse(cx, cy + 16, 22, 10, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ff0000'; // purple and red pool
        ctx.beginPath(); ctx.ellipse(cx, cy + 20, 24, 6, 0, 0, Math.PI*2); ctx.fill();
    });

    // 11. FIREBALL Projectile (32x32)
    createTex('fireball', 32, 32, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        let cx = w / 2, cy = h / 2;
        let grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 14);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ffea00');
        grad.addColorStop(0.7, '#ff4800');
        grad.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI*2); ctx.fill();
        // Flame tail particles
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(cx - 12, cy - 4, 4, 8);
        ctx.fillRect(cx - 8, cy + 6, 3, 5);
        ctx.fillRect(cx + 6, cy - 9, 3, 6);
    });

    // 12. PICKUPS (32x32)
    // Medkit
    createTex('medkit', 32, 32, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#eef2f7'; // white case
        ctx.fillRect(4, 10, 24, 18);
        ctx.fillStyle = '#9e9e9e'; // metallic hinges
        ctx.fillRect(8, 8, 4, 3); ctx.fillRect(20, 8, 4, 3);
        ctx.fillStyle = '#d32f2f'; // RED CROSS
        ctx.fillRect(14, 13, 4, 12);
        ctx.fillRect(10, 17, 12, 4);
    });
    // Armor
    createTex('armor', 32, 32, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#2e7d32'; // green security vest
        ctx.fillRect(6, 8, 20, 20);
        ctx.clearRect(12, 8, 8, 4); // collar cutout
        ctx.fillStyle = '#4caf50'; // lighter plate accents
        ctx.fillRect(8, 12, 6, 12); ctx.fillRect(18, 12, 6, 12);
        ctx.fillStyle = '#ffd700'; // small gold badge
        ctx.fillRect(15, 14, 2, 2);
    });
    // Ammo
    createTex('ammo', 32, 32, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#55555d'; // ammo box metal
        ctx.fillRect(6, 10, 20, 18);
        ctx.fillStyle = '#3a3a3f'; // top indent
        ctx.fillRect(8, 8, 16, 2);
        ctx.fillStyle = '#ffd700'; // brass shotgun shells showing inside
        ctx.fillRect(10, 12, 3, 10); ctx.fillRect(15, 12, 3, 10); ctx.fillRect(20, 12, 3, 10);
        ctx.fillStyle = '#d32f2f'; // red shell bodies
        ctx.fillRect(10, 15, 3, 7); ctx.fillRect(15, 15, 3, 7); ctx.fillRect(20, 15, 3, 7);
    });
}

// ============================================================================
// SOUND SYNTHESIZER (WEB AUDIO API)
// ============================================================================
let audioCtx = null;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

/**
 * Procedurally synthesizes a raw, crunchy 8-bit retro sound effect.
 */
function playSound(type) {
    if (!audioCtx) return;
    
    // Resume audio context if suspended (browser security)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const t = audioCtx.currentTime;

    if (type === 'shotgun') {
        // High impact explosions (Shotgun Blast)
        const bufferSize = audioCtx.sampleRate * 0.35; // 0.35s blast
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // Pure White Noise
        }
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, t);
        filter.frequency.exponentialRampToValueAtTime(10, t + 0.3);
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        noise.start();
    } 
    else if (type === 'click') {
        // Shotgun reloading cocking click
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
        
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(t + 0.07);
    } 
    else if (type === 'hurt') {
        // Lower pitched grunt sweep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.linearRampToValueAtTime(60, t + 0.15);
        
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(t + 0.22);
    } 
    else if (type === 'pickup') {
        // Upward arpeggio/chime
        const notes = [261.6, 329.6, 392.0, 523.3]; // C-E-G-C
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t + idx * 0.05);
            
            gain.gain.setValueAtTime(0.15, t + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.08);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(t + idx * 0.05);
            osc.stop(t + idx * 0.05 + 0.09);
        });
    }
    else if (type === 'alert') {
        // Spooky demonic screech
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.3);
        
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(t + 0.36);
    }
}

// ============================================================================
// THE PLAYER & ACTOR SYSTEM
// ============================================================================
class Player {
    constructor() {
        this.x = 2.5;
        this.y = 2.5;
        this.z = 0.0;
        this.vz = 0.0; // vertical velocity
        this.angle = Math.PI / 4;
        this.pitch = 0; // vertical shear in pixels
        this.radius = 0.28;
        this.vx = 0;
        this.vy = 0;
        
        // Stats
        this.health = 100;
        this.armor = 0;
        this.ammo = 20;
        
        // Firing states
        this.weaponState = 'IDLE'; // IDLE, FIRING
        this.weaponFrame = 0;
        this.weaponTimer = 0;
        
        // Input tracking
        this.keys = {
            forward: false,
            backward: false,
            strafeLeft: false,
            strafeRight: false
        };
    }
}

class Actor {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.z = 0.0;
        this.vx = 0.0;
        this.vy = 0.0;
        this.type = type; // 'imp', 'cacodemon', 'projectile', 'medkit', 'armor', 'ammo'
        this.radius = 0.3;
        this.height = 0.8;
        
        // AI State Machine (for enemies)
        this.state = 'IDLE'; // IDLE, CHASE, ATTACK, PAIN, DEAD
        this.stateTimer = 0;
        this.health = type === 'imp' ? 40 : 100;
        this.maxHealth = this.health;
        this.speed = type === 'imp' ? 1.4 : 0.9;
        this.activeFrame = 0;
        
        // Projectiles/Pickups configuration
        if (type === 'projectile') {
            this.radius = 0.15;
            this.height = 0.3;
            this.speed = 4.2;
        } else if (['medkit', 'armor', 'ammo'].includes(type)) {
            this.radius = 0.25;
            this.height = 0.4;
            this.state = 'PICKUP';
        }
    }
}

// ============================================================================
// MAIN GAME ENGINE CLASS
// ============================================================================
class Engine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.screenBuffer = this.ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
        this.screenPixels = this.screenBuffer.data;
        this.zBuffer = new Float32Array(VIEW_WIDTH * VIEW_HEIGHT);
        
        this.player = new Player();
        this.actors = [];
        this.kills = 0;
        this.totalEnemies = 0;
        
        // Decoupled loop timers
        this.lastTime = 0;
        this.accumulator = 0.0;
        this.tickRate = 1 / 35; // 35Hz Internal Tick Rate (~28.57ms)
        this.ticks = 0;
        
        this.pointerLocked = false;
        
        this.init();
    }

    init() {
        generateProceduralTextures();
        this.setupInput();
        this.spawnActors();
        this.resetGame();
    }

    resetGame() {
        this.player = new Player();
        this.kills = 0;
        this.spawnActors();
        this.totalEnemies = this.actors.filter(a => ['imp', 'cacodemon'].includes(a.type)).length;
        
        document.getElementById('dead-overlay').classList.add('hidden');
        document.getElementById('win-overlay').classList.add('hidden');
    }

    spawnActors() {
        this.actors = [
            // Standard Enemies
            new Actor(8.5, 2.5, 'imp'),
            new Actor(3.5, 8.5, 'imp'),
            new Actor(8.5, 8.5, 'cacodemon'),
            new Actor(13.5, 13.5, 'cacodemon'),
            new Actor(2.5, 13.5, 'imp'),
            
            // Pickups
            new Actor(10.5, 2.5, 'medkit'),
            new Actor(10.5, 3.5, 'armor'),
            new Actor(6.5, 8.5, 'ammo')
        ];
    }

    setupInput() {
        const c = this.canvas;
        const p = this.player;

        // Pointer Lock activations
        c.addEventListener('click', () => {
            initAudio();
            if (!this.pointerLocked) {
                c.requestPointerLock();
            } else if (p.health > 0 && !this.checkVictory()) {
                this.fireWeapon();
            }
        });

        // Start/End overlays click resets
        document.getElementById('start-overlay').addEventListener('click', () => {
            document.getElementById('start-overlay').classList.add('hidden');
            c.requestPointerLock();
        });

        const resetFn = () => {
            this.resetGame();
            c.requestPointerLock();
        };
        document.getElementById('dead-overlay').addEventListener('click', resetFn);
        document.getElementById('win-overlay').addEventListener('click', resetFn);

        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = (document.pointerLockElement === c);
        });

        // Key listeners
        document.addEventListener('keydown', (e) => {
            this.handleKey(e.key, true);
            if (e.key === ' ' && this.pointerLocked) {
                this.fireWeapon();
            }
        });
        document.addEventListener('keyup', (e) => {
            this.handleKey(e.key, false);
        });

        // Mouse move listener
        document.addEventListener('mousemove', (e) => {
            if (!this.pointerLocked || p.health <= 0) return;
            
            // Yaw (Rotation Angle)
            p.angle += e.movementX * 0.0035;
            
            // Pitch (Screen Shearing)
            p.pitch -= e.movementY * 1.4;
            p.pitch = Math.max(-100, Math.min(100, p.pitch));
        });
    }

    handleKey(key, pressed) {
        const p = this.player;
        if (p.health <= 0) return;

        switch (key.toLowerCase()) {
            case 'w': case 'arrowup': p.keys.forward = pressed; break;
            case 's': case 'arrowdown': p.keys.backward = pressed; break;
            case 'a': p.keys.strafeLeft = pressed; break;
            case 'd': p.keys.strafeRight = pressed; break;
        }
    }

    // ============================================================================
    // PHYSICS TICK (RUNS AT STEADY 35HZ DECOUPLED TICKRATE)
    // ============================================================================
    tick() {
        this.ticks++;
        const p = this.player;
        const dt = this.tickRate;

        if (p.health > 0) {
            this.updatePlayerMovement(dt);
            this.updateWeaponAnimation();
        }

        this.updateActors(dt);
        this.checkCollisionsAndPickups();
        
        // Handle visual screen flashes fade
        if (this.hurtFlashVal > 0) this.hurtFlashVal -= 5 * dt;
        if (this.pickupFlashVal > 0) this.pickupFlashVal -= 5 * dt;
    }

    updatePlayerMovement(dt) {
        const p = this.player;
        
        // Compute input acceleration vector
        let ax = 0;
        let ay = 0;
        const speedMultiplier = 8.5; // High speed momentum
        
        if (p.keys.forward) { ax += Math.cos(p.angle); ay += Math.sin(p.angle); }
        if (p.keys.backward) { ax -= Math.cos(p.angle); ay -= Math.sin(p.angle); }
        if (p.keys.strafeLeft) { ax -= -Math.sin(p.angle); ay -= Math.cos(p.angle); }
        if (p.keys.strafeRight) { ax += -Math.sin(p.angle); ay += Math.cos(p.angle); }
        
        // Normalize diagonals
        let len = Math.sqrt(ax*ax + ay*ay);
        if (len > 0) {
            ax = (ax / len) * speedMultiplier;
            ay = (ay / len) * speedMultiplier;
        }

        // Apply acceleration & friction momentum decay
        p.vx += ax * dt;
        p.vy += ay * dt;
        p.vx *= 0.82; // momentum friction
        p.vy *= 0.82;

        if (Math.abs(p.vx) < 0.005) p.vx = 0;
        if (Math.abs(p.vy) < 0.005) p.vy = 0;

        // Apply movement delta
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Sliding Cylinder Collision check
        this.resolveSlidingCollision(p);

        // Vertical Gravity & stair-step positioning
        const gx = Math.floor(p.x);
        const gy = Math.floor(p.y);
        if (gx >= 0 && gx < 16 && gy >= 0 && gy < 16) {
            const sec = SECTORS[MAP_GRID[gy][gx]];
            const targetFloor = sec.floorHeight;
            
            if (targetFloor > p.z) {
                // Stair Step Up (height steps up to 0.35m instantly)
                if (targetFloor - p.z <= 0.35) {
                    p.z = targetFloor;
                    p.vz = 0;
                }
            } else {
                // Gravity / falling down
                if (p.z > targetFloor) {
                    p.vz -= 9.8 * dt;
                    p.z += p.vz * dt;
                    if (p.z <= targetFloor) {
                        p.z = targetFloor;
                        p.vz = 0;
                    }
                } else {
                    p.z = targetFloor;
                    p.vz = 0;
                }
            }
        }
    }

    resolveSlidingCollision(actor) {
        const px = actor.x;
        const py = actor.y;
        const r = actor.radius;
        
        // Bounding box overlapping cells
        const xMin = Math.floor(px - r);
        const xMax = Math.floor(px + r);
        const yMin = Math.floor(py - r);
        const yMax = Math.floor(py + r);

        for (let gy = yMin; gy <= yMax; gy++) {
            for (let gx = xMin; gx <= xMax; gx++) {
                if (gx < 0 || gx >= 16 || gy < 0 || gy >= 16) continue;
                
                const cellSec = SECTORS[MAP_GRID[gy][gx]];
                const playerSec = SECTORS[MAP_GRID[Math.floor(py)][Math.floor(px)]];
                
                let isSolid = (cellSec.id === 9);
                
                // If adjacent sector is too high to step onto or too low to fit under, act as solid!
                if (!isSolid && playerSec) {
                    if (cellSec.floorHeight - playerSec.floorHeight > 0.35) {
                        isSolid = true;
                    }
                    if (cellSec.ceilingHeight - playerSec.floorHeight < 1.1) {
                        isSolid = true;
                    }
                }

                if (isSolid) {
                    // Circle-to-AABB overlap resolution
                    let cx = Math.max(gx, Math.min(px, gx + 1));
                    let cy = Math.max(gy, Math.min(py, gy + 1));
                    let dx = px - cx;
                    let dy = py - cy;
                    let distSq = dx*dx + dy*dy;
                    
                    if (distSq < r*r) {
                        let dist = Math.sqrt(distSq);
                        if (dist < 0.001) dist = 0.001;
                        let overlap = r - dist;
                        // Push actor directly out of wall
                        actor.x += (dx / dist) * overlap;
                        actor.y += (dy / dist) * overlap;
                    }
                }
            }
        }
    }

    updateWeaponAnimation() {
        const p = this.player;
        if (p.weaponState === 'FIRING') {
            p.weaponTimer++;
            if (p.weaponTimer >= 3) {
                p.weaponTimer = 0;
                p.weaponFrame++;
                if (p.weaponFrame === 2) {
                    playSound('click'); // shell ejection sound
                }
                if (p.weaponFrame > 3) {
                    p.weaponState = 'IDLE';
                    p.weaponFrame = 0;
                }
            }
        }
    }

    fireWeapon() {
        const p = this.player;
        if (p.weaponState !== 'IDLE') return;
        if (p.ammo <= 0) {
            playSound('click');
            return;
        }
        
        p.weaponState = 'FIRING';
        p.weaponFrame = 0;
        p.weaponTimer = 0;
        p.ammo--;
        
        playSound('shotgun');
        
        // Execute Shotgun Hitscan
        this.executeHitscan();
    }

    executeHitscan() {
        const p = this.player;
        const rx = Math.cos(p.angle);
        const ry = Math.sin(p.angle);
        
        // Step DDA to find closest wall distance blocking the bullet
        let mapX = Math.floor(p.x);
        let mapY = Math.floor(p.y);
        let stepX = rx < 0 ? -1 : 1;
        let stepY = ry < 0 ? -1 : 1;
        let deltaDistX = Math.abs(1 / rx);
        let deltaDistY = Math.abs(1 / ry);
        let sideDistX = rx < 0 ? (p.x - mapX) * deltaDistX : (mapX + 1 - p.x) * deltaDistX;
        let sideDistY = ry < 0 ? (p.y - mapY) * deltaDistY : (mapY + 1 - p.y) * deltaDistY;
        
        let side = 0;
        let hitWallDist = 20.0; // limit bullet distance
        
        for (let i = 0; i < 20; i++) {
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            if (mapX < 0 || mapX >= 16 || mapY < 0 || mapY >= 16 || MAP_GRID[mapY][mapX] === 9) {
                hitWallDist = side === 0 ? (sideDistX - deltaDistX) : (sideDistY - deltaDistY);
                break;
            }
        }

        // Ray vs Cylinder checks for all active enemies
        let closestActor = null;
        let minT = hitWallDist;

        this.actors.forEach(actor => {
            if (!['imp', 'cacodemon'].includes(actor.type) || actor.state === 'DEAD') return;
            
            // Calculate closest projection point
            let dx = actor.x - p.x;
            let dy = actor.y - p.y;
            let t = dx * rx + dy * ry;
            
            if (t > 0 && t < minT) {
                let cx = p.x + rx * t;
                let cy = p.y + ry * t;
                let distSq = (actor.x - cx) * (actor.x - cx) + (actor.y - cy) * (actor.y - cy);
                
                if (distSq < (actor.radius * 1.5) * (actor.radius * 1.5)) { // expanded hitbox for shotgun pellets!
                    minT = t;
                    closestActor = actor;
                }
            }
        });

        if (closestActor) {
            // Apply high-impact damage!
            let dmg = Math.floor(Math.random() * 25) + 30; // 30-55 damage
            closestActor.health -= dmg;
            
            if (closestActor.health <= 0) {
                closestActor.state = 'DEAD';
                closestActor.stateTimer = 0;
                closestActor.radius = 0; // Disable physics collision
                this.kills++;
                playSound('hurt');
            } else {
                closestActor.state = 'PAIN';
                closestActor.stateTimer = 5; // Hurt stun duration
                closestActor.vx = rx * 3;   // Knockback physics!
                closestActor.vy = ry * 3;
                playSound('hurt');
            }
        }
    }

    updateActors(dt) {
        const p = this.player;
        
        this.actors.forEach(actor => {
            actor.stateTimer -= dt;
            
            // 1. PROJECTILES PHYSICS
            if (actor.type === 'projectile') {
                actor.x += actor.vx * dt;
                actor.y += actor.vy * dt;
                
                // Bullet wall hitcheck
                let mx = Math.floor(actor.x);
                let my = Math.floor(actor.y);
                if (mx < 0 || mx >= 16 || my < 0 || my >= 16 || MAP_GRID[my][mx] === 9) {
                    actor.health = 0; // explode
                    return;
                }
                
                // Bullet vs Player hitcheck
                let dx = actor.x - p.x;
                let dy = actor.y - p.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < p.radius + actor.radius) {
                    // Deal damage to player
                    this.damagePlayer(15);
                    actor.health = 0; // delete
                }
                return;
            }

            // 2. ENEMY COGNITION STATE MACHINE
            if (['imp', 'cacodemon'].includes(actor.type)) {
                if (actor.state === 'DEAD') {
                    // Handle death animations sequence
                    let maxFrames = actor.type === 'imp' ? 3 : 2;
                    let speed = 4;
                    actor.activeFrame = Math.min(maxFrames - 1, Math.floor(-actor.stateTimer * speed));
                    return;
                }

                // Check Line of Sight
                let hasLOS = this.checkLineOfSight(actor, p);
                
                if (actor.state === 'PAIN') {
                    // Knockback momentum
                    actor.x += actor.vx * dt;
                    actor.y += actor.vy * dt;
                    actor.vx *= 0.8;
                    actor.vy *= 0.8;
                    this.resolveSlidingCollision(actor);
                    
                    if (actor.stateTimer <= 0) {
                        actor.state = 'CHASE';
                    }
                    actor.activeFrame = 0; // hurt sprite
                    return;
                }

                let dx = p.x - actor.x;
                let dy = p.y - actor.y;
                let dist = Math.sqrt(dx*dx + dy*dy);

                if (actor.state === 'IDLE') {
                    actor.activeFrame = 0;
                    if (hasLOS && dist < 11.5) {
                        actor.state = 'CHASE';
                        playSound('alert');
                    }
                } 
                else if (actor.state === 'CHASE') {
                    // Bounce animation
                    actor.activeFrame = Math.floor(this.ticks / 6) % 2;

                    if (dist > 3.2 || !hasLOS) {
                        // Move directly toward player
                        let moveX = dx / dist;
                        let moveY = dy / dist;
                        actor.x += moveX * actor.speed * dt;
                        actor.y += moveY * actor.speed * dt;
                        this.resolveSlidingCollision(actor);
                    } 
                    else if (hasLOS && dist <= 3.2) {
                        // Enter Attack Mode
                        actor.state = 'ATTACK';
                        actor.stateTimer = 1.0; // 1 second charge/windup
                    }
                } 
                else if (actor.state === 'ATTACK') {
                    actor.activeFrame = 2; // attack pose
                    
                    if (actor.stateTimer <= 0) {
                        if (hasLOS && dist < 12) {
                            this.shootEnemyProjectile(actor, p);
                        }
                        actor.state = 'CHASE';
                    }
                }

                // Position enemy vertically on floor
                let gx = Math.floor(actor.x);
                let gy = Math.floor(actor.y);
                if (gx >= 0 && gx < 16 && gy >= 0 && gy < 16) {
                    actor.z = SECTORS[MAP_GRID[gy][gx]].floorHeight;
                }
            }
        });

        // Filter out spent projectiles/dead bodies that collapsed
        this.actors = this.actors.filter(a => a.health > 0 || (['imp', 'cacodemon'].includes(a.type) && a.state === 'DEAD'));
    }

    checkLineOfSight(actor, target) {
        let rx = target.x - actor.x;
        let ry = target.y - actor.y;
        let dist = Math.sqrt(rx*rx + ry*ry);
        if (dist === 0) return true;
        rx /= dist;
        ry /= dist;

        let mapX = Math.floor(actor.x);
        let mapY = Math.floor(actor.y);
        let stepX = rx < 0 ? -1 : 1;
        let stepY = ry < 0 ? -1 : 1;
        let deltaDistX = Math.abs(1 / rx);
        let deltaDistY = Math.abs(1 / ry);
        let sideDistX = rx < 0 ? (actor.x - mapX) * deltaDistX : (mapX + 1 - actor.x) * deltaDistX;
        let sideDistY = ry < 0 ? (actor.y - mapY) * deltaDistY : (mapY + 1 - actor.y) * deltaDistY;

        // Perform DDA traversal up to target distance
        let currentDist = 0;
        while (currentDist < dist) {
            if (sideDistX < sideDistY) {
                currentDist = sideDistX;
                sideDistX += deltaDistX;
                mapX += stepX;
            } else {
                currentDist = sideDistY;
                sideDistY += deltaDistY;
                mapY += stepY;
            }
            if (mapX < 0 || mapX >= 16 || mapY < 0 || mapY >= 16) return false;
            
            // Check solid block obstruction
            if (MAP_GRID[mapY][mapX] === 9) {
                return false;
            }
        }
        return true;
    }

    shootEnemyProjectile(enemy, target) {
        let proj = new Actor(enemy.x, enemy.y, 'projectile');
        proj.z = enemy.z + 0.4;
        
        let dx = target.x - enemy.x;
        let dy = target.y - enemy.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        proj.vx = (dx / dist) * proj.speed;
        proj.vy = (dy / dist) * proj.speed;
        proj.health = 1; // 1 hitpoint (spent when hitting walls)
        
        this.actors.push(proj);
    }

    damagePlayer(amount) {
        const p = this.player;
        if (p.health <= 0) return;

        // Armor absorbs 50% damage
        if (p.armor > 0) {
            let absorbed = Math.floor(amount * 0.5);
            let direct = amount - absorbed;
            p.armor = Math.max(0, p.armor - absorbed);
            p.health = Math.max(0, p.health - direct);
        } else {
            p.health = Math.max(0, p.health - amount);
        }

        playSound('hurt');
        
        // Trigger red pain flash screen overlay
        this.hurtFlashVal = 0.5;
        
        if (p.health <= 0) {
            document.exitPointerLock();
            document.getElementById('dead-overlay').classList.remove('hidden');
        }
    }

    checkCollisionsAndPickups() {
        const p = this.player;
        
        this.actors.forEach(actor => {
            if (!['medkit', 'armor', 'ammo'].includes(actor.type)) return;
            
            let dx = actor.x - p.x;
            let dy = actor.y - p.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < p.radius + actor.radius) {
                // Collect item!
                let pickedUp = false;
                if (actor.type === 'medkit' && p.health < 100) {
                    p.health = Math.min(100, p.health + 25);
                    pickedUp = true;
                } 
                else if (actor.type === 'armor' && p.armor < 100) {
                    p.armor = Math.min(100, p.armor + 50);
                    pickedUp = true;
                } 
                else if (actor.type === 'ammo' && p.ammo < 50) {
                    p.ammo = Math.min(50, p.ammo + 10);
                    pickedUp = true;
                }

                if (pickedUp) {
                    actor.health = 0; // kill pickup actor
                    playSound('pickup');
                    this.pickupFlashVal = 0.4; // gold flash overlay
                }
            }
        });
    }

    checkVictory() {
        return this.kills >= this.totalEnemies;
    }

    // ============================================================================
    // RENDERING & RAYCASTING ENGINE (THE SOFTWARE PIPELINE)
    // ============================================================================
    render() {
        const p = this.player;
        
        // Clear background buffer to black
        this.screenPixels.fill(0);
        
        // Clear 2D Z-Buffer to Infinity
        this.zBuffer.fill(Infinity);
        
        // Dynamic floor/ceiling and wall portal casting
        this.castRayColumns();

        // Sprite Billboard projections
        this.drawBillboardSprites();
        
        // Copy software buffer pixels to screen canvas context
        this.ctx.putImageData(this.screenBuffer, 0, 0);
        
        // Overlay HUD & Gun drawing
        this.drawHUDAndWeapon();
        
        // Check game endings triggers
        this.updateOverlays();
    }

    castRayColumns() {
        const p = this.player;
        const lavaFrame = Math.floor(this.ticks / 5) % 4; // Animated lava frame
        
        for (let col = 0; col < VIEW_WIDTH; col++) {
            // Precise horizontal perspective angle spacing
            let rayAngle = p.angle + Math.atan((col - 160) / FOCAL_LENGTH);
            while (rayAngle < 0) rayAngle += Math.PI * 2;
            while (rayAngle >= Math.PI * 2) rayAngle -= Math.PI * 2;

            let rx = Math.cos(rayAngle);
            let ry = Math.sin(rayAngle);
            let cosCorrect = Math.cos(rayAngle - p.angle);

            // DDA setup
            let mapX = Math.floor(p.x);
            let mapY = Math.floor(p.y);
            let stepX = rx < 0 ? -1 : 1;
            let stepY = ry < 0 ? -1 : 1;
            let deltaDistX = Math.abs(1 / rx);
            let deltaDistY = Math.abs(1 / ry);
            let sideDistX = rx < 0 ? (p.x - mapX) * deltaDistX : (mapX + 1 - p.x) * deltaDistX;
            let sideDistY = ry < 0 ? (p.y - mapY) * deltaDistY : (mapY + 1 - p.y) * deltaDistY;

            // Render clipping limits (Front-to-Back portal rendering occlusion window)
            let yClipMin = 0;
            let yClipMax = VIEW_HEIGHT - 1;

            // Track height of cells
            let cellX = mapX, cellY = mapY;
            let currentSec = SECTORS[MAP_GRID[cellY][cellX]] || SECTORS[0];
            let currFloorH = currentSec.floorHeight;
            let currCeilH = currentSec.ceilingHeight;

            // Run DDA through sectors
            let side = 0;
            let d_perp = 0.0;
            
            for (let step = 0; step < 22; step++) {
                if (sideDistX < sideDistY) {
                    d_perp = sideDistX;
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    d_perp = sideDistY;
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }

                // Straight line corrected distance (eliminating fisheye distortion)
                let d_corr = d_perp * cosCorrect;
                d_corr = Math.max(0.02, d_corr);

                // Grid boundary check
                let outside = (mapX < 0 || mapX >= 16 || mapY < 0 || mapY >= 16);
                let sec = outside ? SECTORS[9] : SECTORS[MAP_GRID[mapY][mapX]];

                // Determine wall intersection coordinate (fractional texture coordinate u)
                let wallX = 0;
                if (side === 0) {
                    wallX = p.y + d_perp * ry;
                } else {
                    wallX = p.x + d_perp * rx;
                }
                wallX -= Math.floor(wallX);

                // --- 1. SOLID WALL PORTAL TRANSITION ---
                if (sec.id === 9) {
                    // Project final solid wall
                    let yTop = VIEW_HEIGHT / 2 - ((currCeilH - p.z) / d_corr) * FOCAL_LENGTH + p.pitch;
                    let yBottom = VIEW_HEIGHT / 2 - ((currFloorH - p.z) / d_corr) * FOCAL_LENGTH + p.pitch;

                    // Draw floor/ceiling segments in the remaining open space
                    this.drawCeilingCol(col, yClipMin, yTop, currCeilH, currentSec.ceilingTexture, currentSec.brightness, rayAngle);
                    this.drawFloorCol(col, yBottom, yClipMax, currFloorH, currentSec.floorTexture === 'lava' ? `lava${lavaFrame}` : currentSec.floorTexture, currentSec.brightness, rayAngle);

                    // Draw solid wall in center
                    this.drawWallCol(col, yTop, yBottom, d_corr, currentSec.wallTexture, side, wallX, currentSec.brightness);
                    
                    break; // Closed column! Raycast finished
                }

                // --- 2. HEIGHT CHANGES PORTAL TRANSITIONS ---
                // Calculate projected floor/ceiling bounds of the NEW sector at boundary distance d_corr
                let yCeil = VIEW_HEIGHT / 2 - ((sec.ceilingHeight - p.z) / d_corr) * FOCAL_LENGTH + p.pitch;
                let yFloor = VIEW_HEIGHT / 2 - ((sec.floorHeight - p.z) / d_corr) * FOCAL_LENGTH + p.pitch;

                // Calculate projected floor/ceiling bounds of OLD sector at boundary distance d_corr
                let yPrevCeil = VIEW_HEIGHT / 2 - ((currCeilH - p.z) / d_corr) * FOCAL_LENGTH + p.pitch;
                let yPrevFloor = VIEW_HEIGHT / 2 - ((currFloorH - p.z) / d_corr) * FOCAL_LENGTH + p.pitch;

                // Render floor/ceiling segment of OLD cell up to this boundary
                this.drawCeilingCol(col, yClipMin, yPrevCeil, currCeilH, currentSec.ceilingTexture, currentSec.brightness, rayAngle);
                this.drawFloorCol(col, yPrevFloor, yClipMax, currFloorH, currentSec.floorTexture === 'lava' ? `lava${lavaFrame}` : currentSec.floorTexture, currentSec.brightness, rayAngle);

                // Clip horizontal screen boundaries (ensuring front-to-back occlusion)
                yClipMin = Math.max(yClipMin, Math.floor(yPrevCeil));
                yClipMax = Math.min(yClipMax, Math.floor(yPrevFloor));

                // Draw vertical step walls at boundary
                // Floor Step UP
                if (sec.floorHeight > currFloorH) {
                    this.drawWallCol(col, yFloor, yPrevFloor, d_corr, sec.wallTexture, side, wallX, sec.brightness);
                } 
                // Floor Step DOWN
                else if (sec.floorHeight < currFloorH) {
                    this.drawWallCol(col, yPrevFloor, yFloor, d_corr, currentSec.wallTexture, side, wallX, currentSec.brightness);
                }

                // Ceiling Step DOWN (Ceiling Drop)
                if (sec.ceilingHeight < currCeilH) {
                    this.drawWallCol(col, yPrevCeil, yCeil, d_corr, currentSec.wallTexture, side, wallX, currentSec.brightness);
                }
                // Ceiling Step UP (Ceiling Rise)
                else if (sec.ceilingHeight > currCeilH) {
                    this.drawWallCol(col, yCeil, yPrevCeil, d_corr, sec.wallTexture, side, wallX, sec.brightness);
                }

                // Update current sector and check occlusion
                currentSec = sec;
                currFloorH = sec.floorHeight;
                currCeilH = sec.ceilingHeight;

                if (yClipMin >= yClipMax) break; // Screen column is fully closed
            }
        }
    }

    drawFloorCol(col, yStart, yEnd, height, texKey, brightness, rayAngle) {
        let startY = Math.ceil(yStart);
        let endY = Math.floor(yEnd);
        if (startY > endY) return;

        startY = Math.max(0, startY);
        endY = Math.min(VIEW_HEIGHT - 1, endY);

        const tex = textures[texKey] || textures['floor_panel'];
        const texData = tex.data;
        const texW = tex.width;
        const texH = tex.height;

        const rayCos = Math.cos(rayAngle);
        const raySin = Math.sin(rayAngle);
        const cosCorrect = Math.cos(rayAngle - this.player.angle);
        const p = this.player;

        for (let y = startY; y <= endY; y++) {
            let yRelative = y - VIEW_HEIGHT / 2 - p.pitch;
            if (Math.abs(yRelative) < 0.1) continue;

            let h = height - p.z;
            let d_perp = (h * FOCAL_LENGTH) / yRelative;
            if (d_perp < 0) continue;

            let d_ray = d_perp / cosCorrect;
            let px = p.x + rayCos * d_ray;
            let py = p.y + raySin * d_ray;

            let tx = Math.floor(px * texW) % texW;
            let ty = Math.floor(py * texH) % texH;
            if (tx < 0) tx += texW;
            if (ty < 0) ty += texH;

            let texIdx = (ty * texW + tx) * 4;
            let r = texData[texIdx];
            let g = texData[texIdx + 1];
            let b = texData[texIdx + 2];

            // Shading Depth Fog
            let shade = 1.0 / (1.0 + d_perp * d_perp * 0.035 + d_perp * 0.05);
            let light = brightness * shade;

            r = Math.min(255, Math.floor(r * light));
            g = Math.min(255, Math.floor(g * light));
            b = Math.min(255, Math.floor(b * light));

            let scrIdx = (y * SCREEN_WIDTH + col) * 4;
            this.screenPixels[scrIdx] = r;
            this.screenPixels[scrIdx + 1] = g;
            this.screenPixels[scrIdx + 2] = b;
            this.screenPixels[scrIdx + 3] = 255;

            this.zBuffer[y * VIEW_WIDTH + col] = d_perp;
        }
    }

    drawCeilingCol(col, yStart, yEnd, height, texKey, brightness, rayAngle) {
        let startY = Math.ceil(yStart);
        let endY = Math.floor(yEnd);
        if (startY > endY) return;

        startY = Math.max(0, startY);
        endY = Math.min(VIEW_HEIGHT - 1, endY);

        const tex = textures[texKey] || textures['grate'];
        const texData = tex.data;
        const texW = tex.width;
        const texH = tex.height;

        const rayCos = Math.cos(rayAngle);
        const raySin = Math.sin(rayAngle);
        const cosCorrect = Math.cos(rayAngle - this.player.angle);
        const p = this.player;

        for (let y = startY; y <= endY; y++) {
            let yRelative = y - VIEW_HEIGHT / 2 - p.pitch;
            if (Math.abs(yRelative) < 0.1) continue;

            let h = height - p.z;
            let d_perp = (h * FOCAL_LENGTH) / yRelative;
            if (d_perp < 0) continue;

            let d_ray = d_perp / cosCorrect;
            let px = p.x + rayCos * d_ray;
            let py = p.y + raySin * d_ray;

            let tx = Math.floor(px * texW) % texW;
            let ty = Math.floor(py * texH) % texH;
            if (tx < 0) tx += texW;
            if (ty < 0) ty += texH;

            let texIdx = (ty * texW + tx) * 4;
            let r = texData[texIdx];
            let g = texData[texIdx + 1];
            let b = texData[texIdx + 2];

            // Shading Depth Fog
            let shade = 1.0 / (1.0 + d_perp * d_perp * 0.035 + d_perp * 0.05);
            let light = brightness * shade;

            r = Math.min(255, Math.floor(r * light));
            g = Math.min(255, Math.floor(g * light));
            b = Math.min(255, Math.floor(b * light));

            let scrIdx = (y * SCREEN_WIDTH + col) * 4;
            this.screenPixels[scrIdx] = r;
            this.screenPixels[scrIdx + 1] = g;
            this.screenPixels[scrIdx + 2] = b;
            this.screenPixels[scrIdx + 3] = 255;

            this.zBuffer[y * VIEW_WIDTH + col] = d_perp;
        }
    }

    drawWallCol(col, yStart, yEnd, d_perp, texKey, side, wallX, brightness) {
        let startY = Math.ceil(yStart);
        let endY = Math.floor(yEnd);
        if (startY > endY) return;

        let activeStartY = Math.max(0, startY);
        let activeEndY = Math.min(VIEW_HEIGHT - 1, endY);

        const tex = textures[texKey] || textures['brick'];
        const texData = tex.data;
        const texW = tex.width;
        const texH = tex.height;

        let tx = Math.floor(wallX * texW) % texW;
        if (tx < 0) tx += texW;

        // Directional darkening shadow (Y-faces darker)
        let sideShadeMult = (side === 1) ? 0.72 : 1.0;

        for (let y = activeStartY; y <= activeEndY; y++) {
            let v = (y - startY) / (endY - startY);
            let ty = Math.floor(v * texH) % texH;
            if (ty < 0) ty += texH;

            let texIdx = (ty * texW + tx) * 4;
            let r = texData[texIdx];
            let g = texData[texIdx + 1];
            let b = texData[texIdx + 2];
            let a = texData[texIdx + 3];

            if (a < 15) continue; // Skip transparency/holes

            let shade = 1.0 / (1.0 + d_perp * d_perp * 0.035 + d_perp * 0.05);
            let light = brightness * shade * sideShadeMult;

            r = Math.min(255, Math.floor(r * light));
            g = Math.min(255, Math.floor(g * light));
            b = Math.min(255, Math.floor(b * light));

            let scrIdx = (y * SCREEN_WIDTH + col) * 4;
            this.screenPixels[scrIdx] = r;
            this.screenPixels[scrIdx + 1] = g;
            this.screenPixels[scrIdx + 2] = b;
            this.screenPixels[scrIdx + 3] = 255;

            this.zBuffer[y * VIEW_WIDTH + col] = d_perp;
        }
    }

    drawBillboardSprites() {
        const p = this.player;

        // Calculate and cache relative actor statistics
        this.actors.forEach(actor => {
            let dx = actor.x - p.x;
            let dy = actor.y - p.y;
            
            // Angular positioning relative to player rotation
            let relativeAng = Math.atan2(dy, dx) - p.angle;
            while (relativeAng < -Math.PI) relativeAng += Math.PI * 2;
            while (relativeAng > Math.PI) relativeAng -= Math.PI * 2;

            actor.dx = dx;
            actor.dy = dy;
            actor.relativeAng = relativeAng;
            
            // Perpendicular Z depth
            actor.d_perp = Math.cos(relativeAng) * Math.sqrt(dx*dx + dy*dy);
        });

        // 1. Z-Sorting Back-to-Front (Painters Algorithm fallback)
        const renderableActors = this.actors
            .filter(a => a.d_perp > 0.12 && Math.abs(a.relativeAng) < FOV * 1.5)
            .sort((a, b) => b.d_perp - a.d_perp);

        // 2. Loop and render billboards
        renderableActors.forEach(actor => {
            let d_perp = actor.d_perp;

            // Screen horizontal center projection
            let screenX = VIEW_WIDTH / 2 + Math.tan(actor.relativeAng) * FOCAL_LENGTH;

            // Project heights
            let yFloor = VIEW_HEIGHT / 2 - ((actor.z - p.z) / d_perp) * FOCAL_LENGTH + p.pitch;
            let yCeil = VIEW_HEIGHT / 2 - (((actor.z + actor.height) - p.z) / d_perp) * FOCAL_LENGTH + p.pitch;
            
            let spriteHeight = yFloor - yCeil;
            let spriteWidth = spriteHeight; // Square sprites

            let xLeft = Math.floor(screenX - spriteWidth / 2);
            let xRight = Math.floor(screenX + spriteWidth / 2);
            let yTop = Math.floor(yCeil);
            let yBottom = Math.floor(yFloor);

            // Retrieve texture key dynamically based on actor frame & state
            let texKey = this.getActorTextureKey(actor);
            const tex = textures[texKey];
            if (!tex) return;

            const texData = tex.data;
            const texW = tex.width;
            const texH = tex.height;

            let activeLeft = Math.max(0, xLeft);
            let activeRight = Math.min(VIEW_WIDTH - 1, xRight);
            let activeTop = Math.max(0, yTop);
            let activeBottom = Math.min(VIEW_HEIGHT - 1, yBottom);

            const gx = Math.floor(actor.x);
            const gy = Math.floor(actor.y);
            const sectorBrightness = (gx >= 0 && gx < 16 && gy >= 0 && gy < 16) ? SECTORS[MAP_GRID[gy][gx]].brightness : 1.0;

            for (let x = activeLeft; x <= activeRight; x++) {
                let tx = Math.floor((x - xLeft) / spriteWidth * texW) % texW;
                if (tx < 0) tx += texW;

                for (let y = activeTop; y <= activeBottom; y++) {
                    // 2D Z-Buffer Per-Pixel depth test
                    if (d_perp >= this.zBuffer[y * VIEW_WIDTH + x]) continue;

                    let ty = Math.floor((y - yTop) / spriteHeight * texH) % texH;
                    if (ty < 0) ty += texH;

                    let texIdx = (ty * texW + tx) * 4;
                    let r = texData[texIdx];
                    let g = texData[texIdx + 1];
                    let b = texData[texIdx + 2];
                    let a = texData[texIdx + 3];

                    if (a < 15) continue; // Transparency cutout

                    // Apply Sector Light and Distance Shading
                    let shade = 1.0 / (1.0 + d_perp * d_perp * 0.035 + d_perp * 0.05);
                    let light = sectorBrightness * shade;

                    // If actor is hurt, flash red!
                    if (actor.state === 'PAIN') {
                        r = 255; g = Math.floor(g * 0.3); b = Math.floor(b * 0.3);
                    } else {
                        r = Math.min(255, Math.floor(r * light));
                        g = Math.min(255, Math.floor(g * light));
                        b = Math.min(255, Math.floor(b * light));
                    }

                    let scrIdx = (y * SCREEN_WIDTH + x) * 4;
                    this.screenPixels[scrIdx] = r;
                    this.screenPixels[scrIdx + 1] = g;
                    this.screenPixels[scrIdx + 2] = b;
                    this.screenPixels[scrIdx + 3] = 255;

                    this.zBuffer[y * VIEW_WIDTH + x] = d_perp;
                }
            }
        });
    }

    getActorTextureKey(actor) {
        if (actor.type === 'projectile') return 'fireball';
        if (['medkit', 'armor', 'ammo'].includes(actor.type)) return actor.type;

        // Imp Enemies frames
        if (actor.type === 'imp') {
            if (actor.state === 'DEAD') return `imp_dead${actor.activeFrame}`;
            if (actor.state === 'PAIN') return 'imp_pain';
            if (actor.state === 'ATTACK') return 'imp_attack';
            return `imp_walk${actor.activeFrame}`;
        }
        
        // Cacodemon frames
        if (actor.type === 'cacodemon') {
            if (actor.state === 'DEAD') return `caco_dead${actor.activeFrame}`;
            if (actor.state === 'PAIN') return 'caco_pain';
            if (actor.state === 'ATTACK') return 'caco_attack';
            return 'caco_walk0';
        }
        
        return 'brick';
    }

    // ============================================================================
    // DYNAMIC OVERLAYS, WEAPON DRAWING, & THE HUD
    // ============================================================================
    drawHUDAndWeapon() {
        const p = this.player;

        // --- 1. RENDER ANIMATED WEAPON AT VIEW BOTTOM ---
        let gunTexKey = `shotgun${p.weaponFrame}`;
        const gunTex = textures[gunTexKey];
        if (gunTex) {
            const gunScale = 1.6; // Large chunky guns!
            let w = gunTex.width * gunScale;
            let h = gunTex.height * gunScale;
            
            // Centered vertically bobbing when running!
            let bobX = 0, bobY = 0;
            if (p.vx !== 0 || p.vy !== 0) {
                bobX = Math.sin(this.ticks * 0.4) * 8;
                bobY = Math.abs(Math.cos(this.ticks * 0.4)) * 6;
            }

            let gx = (SCREEN_WIDTH - w) / 2 + bobX;
            let gy = VIEW_HEIGHT - h + 15 + bobY;

            // Draw offscreen canvas gun buffer on top
            const offCanvas = document.createElement('canvas');
            offCanvas.width = gunTex.width;
            offCanvas.height = gunTex.height;
            offCanvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(gunTex.data), gunTex.width, gunTex.height), 0, 0);
            
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.drawImage(offCanvas, gx * 3, gy * 3, w * 3, h * 3); // Scaled 3x to fit upscaled screen
        }

        // --- 2. RENDER THE RETRO RETICLE ---
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        let rx = SCREEN_WIDTH * 1.5; // Scaled center (320*3 / 2)
        let ry = VIEW_HEIGHT * 1.5 + p.pitch * 3;
        this.ctx.fillRect(rx - 3, ry - 1, 7, 2);
        this.ctx.fillRect(rx - 1, ry - 3, 2, 7);

        // --- 3. RETRO HUD PANEL DRAWING ---
        let hudY = VIEW_HEIGHT * 3; // Renders exactly below the 200px 3D screen (200*3 = 600px)
        let hudH = 120;             // 40px * 3 = 120px

        // Panel base slate
        this.ctx.fillStyle = '#1c1c22';
        this.ctx.fillRect(0, hudY, SCREEN_WIDTH * 3, hudH);
        
        // Border red stripes
        this.ctx.strokeStyle = '#c21807';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(2, hudY + 2, SCREEN_WIDTH * 3 - 4, hudH - 4);
        
        // Column separators
        this.ctx.beginPath();
        this.ctx.moveTo((SCREEN_WIDTH * 3) * 0.28, hudY); this.lineTo((SCREEN_WIDTH * 3) * 0.28, hudY + hudH);
        this.ctx.moveTo((SCREEN_WIDTH * 3) * 0.44, hudY); this.lineTo((SCREEN_WIDTH * 3) * 0.44, hudY + hudH);
        this.ctx.moveTo((SCREEN_WIDTH * 3) * 0.56, hudY); this.lineTo((SCREEN_WIDTH * 3) * 0.56, hudY + hudH);
        this.ctx.moveTo((SCREEN_WIDTH * 3) * 0.72, hudY); this.lineTo((SCREEN_WIDTH * 3) * 0.72, hudY + hudH);
        this.ctx.stroke();

        // Standard HUD Fonts Styling
        this.ctx.font = '14px "Press Start 2P"';
        this.ctx.textAlign = 'center';

        // Counters Display & Text Labeling
        // A. AMMO
        this.ctx.fillStyle = '#82828e';
        this.ctx.fillText('AMMO', (SCREEN_WIDTH * 3) * 0.14, hudY + 35);
        this.ctx.fillStyle = '#ffb000';
        this.ctx.font = '28px "Press Start 2P"';
        this.ctx.fillText(`${p.ammo}`, (SCREEN_WIDTH * 3) * 0.14, hudY + 85);

        // B. HEALTH
        this.ctx.font = '14px "Press Start 2P"';
        this.ctx.fillStyle = '#82828e';
        this.ctx.fillText('HEALTH', (SCREEN_WIDTH * 3) * 0.36, hudY + 35);
        this.ctx.fillStyle = p.health < 25 ? '#c21807' : '#ffb000';
        this.ctx.font = '28px "Press Start 2P"';
        this.ctx.fillText(`${p.health}%`, (SCREEN_WIDTH * 3) * 0.36, hudY + 85);

        // C. PORTRAIT EYE FACE (THE DOOMGUY PORTRAIT!)
        this.drawDoomguyFace(hudY);

        // D. ARMOR
        this.ctx.font = '14px "Press Start 2P"';
        this.ctx.fillStyle = '#82828e';
        this.ctx.fillText('ARMOR', (SCREEN_WIDTH * 3) * 0.64, hudY + 35);
        this.ctx.fillStyle = '#ffb000';
        this.ctx.font = '28px "Press Start 2P"';
        this.ctx.fillText(`${p.armor}%`, (SCREEN_WIDTH * 3) * 0.64, hudY + 85);

        // E. PURGED KILLS
        this.ctx.font = '14px "Press Start 2P"';
        this.ctx.fillStyle = '#82828e';
        this.ctx.fillText('PURGED', (SCREEN_WIDTH * 3) * 0.86, hudY + 35);
        this.ctx.fillStyle = this.checkVictory() ? '#00ff00' : '#ffb000';
        this.ctx.font = '28px "Press Start 2P"';
        this.ctx.fillText(`${this.kills}/${this.totalEnemies}`, (SCREEN_WIDTH * 3) * 0.86, hudY + 85);
    }

    drawDoomguyFace(hudY) {
        const p = this.player;
        let cx = (SCREEN_WIDTH * 3) * 0.50;
        let cy = hudY + 60;
        let radius = 32;

        // Draw grey helmet base
        this.ctx.fillStyle = '#5c5c66';
        this.ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fill();
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Flesh colored head
        this.ctx.fillStyle = p.health <= 0 ? '#5a3d3c' : '#f7c397'; // dead ash grey or skin tone
        this.ctx.beginPath(); ctx.arc(cx, cy + 2, radius - 6, 0, Math.PI*2); ctx.fill();

        if (p.health > 0) {
            // Brown hair crop
            this.ctx.fillStyle = '#422417';
            this.ctx.beginPath();
            this.ctx.arc(cx, cy - 8, radius - 10, Math.PI, 0);
            this.ctx.fill();

            // Dynamic eyes looking left/right depending on tick
            let eyeLook = Math.sin(this.ticks * 0.05);
            let offsetEyesX = (eyeLook > 0.4) ? 2 : (eyeLook < -0.4 ? -2 : 0);

            // Shotgun Firing grin!
            let grinState = (p.weaponState === 'FIRING' && p.weaponFrame < 2);

            this.ctx.fillStyle = '#fff'; // sclera
            this.ctx.fillRect(cx - 10 + offsetEyesX, cy - 3, 5, 4);
            this.ctx.fillRect(cx + 4 + offsetEyesX, cy - 3, 5, 4);

            this.ctx.fillStyle = '#0055ff'; // iris pupils
            this.ctx.fillRect(cx - 9 + offsetEyesX + (offsetEyesX*0.5), cy - 2, 2, 2);
            this.ctx.fillRect(cx + 5 + offsetEyesX + (offsetEyesX*0.5), cy - 2, 2, 2);

            // Mouth
            if (grinState) {
                // Happy wicked evil smile grin
                this.ctx.strokeStyle = '#c21807';
                this.ctx.lineWidth = 2.5;
                this.ctx.beginPath();
                this.ctx.arc(cx, cy + 8, 8, 0, Math.PI);
                this.ctx.stroke();
            } else {
                // Normal straight mouth
                this.ctx.fillStyle = '#222';
                this.ctx.fillRect(cx - 5, cy + 10, 10, 2);
            }

            // Bloody wounds based on damage
            if (p.health < 45) {
                this.ctx.fillStyle = '#c21807';
                this.ctx.fillRect(cx - 4, cy - 12, 3, 5); // forehead scar
                this.ctx.fillRect(cx + 8, cy + 4, 4, 3);   // cheek slice
            }
            if (p.health < 25) {
                this.ctx.fillStyle = '#7a0000';
                this.ctx.fillRect(cx - 12, cy + 2, 4, 8);  // bleeding ear
                this.ctx.fillRect(cx - 6, cy + 11, 12, 3); // bleeding mouth
            }
        } else {
            // DRAW DEAD EYES (Red crosses)
            this.ctx.strokeStyle = '#c21807';
            this.ctx.lineWidth = 3;
            // Left Cross
            this.ctx.beginPath();
            this.ctx.moveTo(cx - 11, cy - 5); this.lineTo(cx - 5, cy + 1);
            this.ctx.moveTo(cx - 5, cy - 5); this.lineTo(cx - 11, cy + 1);
            this.ctx.stroke();
            // Right Cross
            this.ctx.beginPath();
            this.ctx.moveTo(cx + 5, cy - 5); this.lineTo(cx + 11, cy + 1);
            this.ctx.moveTo(cx + 11, cy - 5); this.lineTo(cx + 5, cy + 1);
            this.ctx.stroke();
            
            // Open jaw slumped dead mouth
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(cx - 6, cy + 8, 12, 8);
        }
    }

    updateOverlays() {
        const p = this.player;

        // 1. Red hurt overlay flash screen
        const hurtDiv = document.getElementById('hurt-overlay');
        hurtDiv.style.opacity = Math.max(0, this.hurtFlashVal || 0);

        // 2. Victory and Death toggling
        const deadDiv = document.getElementById('dead-overlay');
        const winDiv = document.getElementById('win-overlay');

        if (p.health <= 0) {
            deadDiv.classList.remove('hidden');
        } else {
            deadDiv.classList.add('hidden');
        }

        if (this.checkVictory()) {
            winDiv.classList.remove('hidden');
            if (this.pointerLocked) document.exitPointerLock();
        } else {
            winDiv.classList.add('hidden');
        }
    }

    // ============================================================================
    // MASTER GAME LOOP IMPLEMENTATION
    // ============================================================================
    run(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        let delta = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Clamp maximum frame delta to prevent accumulator spiral of death
        if (delta > 0.25) delta = 0.25;

        this.accumulator += delta;

        // Decouple physics execution at 35Hz ticks
        while (this.accumulator >= this.tickRate) {
            this.tick();
            this.accumulator -= this.tickRate;
        }

        // Render software Raycaster
        this.render();

        // Loop next frame animation
        requestAnimationFrame((t) => this.run(t));
    }
}

// Instantiate engine when window loads completely
window.onload = () => {
    const engine = new Engine();
    requestAnimationFrame((t) => engine.run(t));
};
