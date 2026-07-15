# 🧬 Acorn Ecosphere

An interactive 2D artificial life biodome simulating species evolution and environmental genetics. The simulation utilizes a custom spatial partitioning engine and a genetic algorithm framework, all built in React, TypeScript, and HTML5 Canvas.

---

## 🏗️ Architecture & Engine Core

```
                         [React UI Controls Dashboard]
                                     │
                          ┌──────────▼──────────┐
                          │  Simulation Engine  │
                          └──────────┬──────────┘
                                     │ (Tick loop 60 FPS)
                          ┌──────────▼──────────┐
                          │ Custom QuadTree     │
                          │ Spatial Partitioning│
                          └──────────┬──────────┘
                                     │ (Prunes collision checks)
                          ┌──────────▼──────────┐
                          │  Physics & Forces   │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  Genetic Algorithm  │ (Mutation & Cross-over)
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Canvas Renderer   │
                          └─────────────────────┘
```

### 1. Spatial Partitioning: Custom QuadTree
In a dense ecosystem with hundreds of organisms and food items, checking all pairs for collisions results in an \(O(N^2)\) performance cost, causing frame rate drops.
* **QuadTree Subdivision**: Recursively divides 2D space into four quadrants (subnodes) based on density thresholds.
* **Query Efficiency**: Organisms query only their local subnode bounding box for neighbors. This reduces the collision and sensing complexity to \(O(N \log N)\), allowing the simulation to handle thousands of entities at 60 FPS.

### 2. Genetic Algorithm Engine
Every organism (agent) possesses an array of genes (chromosomes) representing behavior and physiology:
* **Genome Parameters**:
  * `maxSpeed` & `acceleration` (higher speed drains energy faster)
  * `perceptionRadius` (how far away they can sense food or predators)
  * `mutationRate` (determines DNA modification likelihood)
  * `reproductionThreshold` (energy level required to split/asexually reproduce)
* **Natural Selection & Evolution**:
  * Agents lose energy over time. They must seek food items (which grow dynamically based on environmental constants).
  * Agents that gather enough food reproduce, passing down DNA with slight mutations.
  * Over time, natural selectors drive species survival: traits that optimize resource acquisition dominate the gene pool.

### 3. Canvas Rendering & State Synchronization
* **Canvas Renderer**: Draws organisms, food items, perception radii, and path vectors in real-time.
* **State Bridge**: Connects canvas statistics (population count, genetic averages, history graphs) to React Zustand state stores, enabling real-time dashboard updates without causing unnecessary UI re-renders.

---

## 📦 Project Layout

```
acorn-ecosphere/
├── index.html                  # HTML entry skeleton
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite configuration (HMR, bundling)
├── package.json                # Project dependencies
│
└── src/
    ├── main.tsx                # React DOM render root
    ├── App.tsx                 # Main layout structure
    ├── index.css               # Design tokens, typography, and styling
    │
    ├── core/                   # Simulation logic
    │   ├── genetics/           # Chromosome structures, mutation rules
    │   ├── partition/          # QuadTree.ts implementation
    │   ├── physics/            # Vector2D math and simple forces
    │   └── simulation/         # SimulationEngine.ts main tick manager
    │
    ├── rendering/              # Canvas drawing layers
    │   └── canvas/             # CanvasRenderer.ts
    │
    ├── ui/                     # React controls and panels
    │   ├── controls/           # Pause, speed, play sliders
    │   └── panels/             # AnalyticsPanel, EnvironmentPanel
    │
    └── utils/                  # Math utilities
```

---

## 🚀 Setup & Execution

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local development server (Vite):
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.
   * Adjust environmental parameters (e.g. food growth rate, mutation probabilities) and watch the population adapt.
