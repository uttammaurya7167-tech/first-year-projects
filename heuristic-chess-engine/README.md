# ♟️ Heuristic Chess AI Engine

A high-performance chess artificial intelligence engine written in Python, featuring an interactive web interface. The engine implements a state-of-the-art heuristic search pipeline, custom move ordering, and difficulty scaling.

---

## 🏗️ Architecture & Algorithm Stack

The core engine is structured around a minimax framework optimized by classic heuristics and game theory search pruning techniques.

```
                  [UCI Command / FEN Board State]
                               │
                    ┌──────────▼──────────┐
                    │ Iterative Deepening │
                    └──────────┬──────────┘
                               │ (Increments depth 1, 2, ... N)
                    ┌──────────▼──────────┐
                    │  Negamax Search &   ◀────────┐
                    │  Alpha-Beta Pruning │        │ Hits / Refutations
                    └──────────┬──────────┘        │
                               │                   │
                    ┌──────────▼──────────┐ ┌──────┴──────────────┐
                    │    Move Ordering    │ │ Transposition Table │
                    │ (MVV-LVA, Killer)  │ │   (Zobrist Hash)    │
                    └──────────┬──────────┘ └─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Quiescence Search  │ (Only searches captures)
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Evaluation Function │ (Material + PST)
                    └─────────────────────┘
```

### 1. Negamax Search with Alpha-Beta Pruning
* **Negamax Formulation**: Simplifies Minimax search logic by utilizing the mathematical property that \(\max(a, b) = -\min(-a, -b)\). This reduces code duplication for white and black nodes.
* **Alpha-Beta Pruning**: Recursively discards game tree branches that cannot possibly affect the final search outcome. Reduces the branching factor from \(\approx 35\) to \(\approx 6\) in average positions.

### 2. Transposition Table (TT) & Zobrist Hashing
* **Zobrist Hashing**: Encodes board states into unique 64-bit integers using XOR keys. Updates hashes incrementally during moves (rather than recalculating the whole board).
* **Hash Table Storage**: Caches already-searched positions, saving depth, score, evaluation bound types (EXACT, UPPER_BOUND, LOWER_BOUND), and the best refutation move. Avoids re-searching sub-trees.

### 3. Move Ordering Optimization
Critical to maximum Alpha-Beta performance (finding cutoffs immediately):
* **PV Move**: The principal variation move found in the previous iterative deepening iteration is searched first.
* **MVV-LVA (Most Valuable Victim - Least Valuable Attacker)**: Orders capture sequences (e.g., PxQ is searched before RxP).
* **Killer Moves**: Non-capture moves that caused beta-cutoffs at the same depth in sibling branches are prioritized.

### 4. Quiescence Search & The Horizon Effect
* Prevents tactical oversights that occur when a search stops mid-exchange (the "horizon effect").
* Extends search limits by executing a capture-only search at the leaf nodes, running until a quiet (quiescent) position is achieved.

### 5. Elo Scaling Module
Implements human-like difficulty levels mapped to target Elo ratings (800 to 2000 Elo) using two primary scaling techniques:
1. **Depth Limits**: Restricts the maximum search horizon (e.g., Level 0 search is capped at depth 1).
2. **Centipawn Noise Window**: Applies Gaussian evaluation noise. The engine dynamically chooses from all available legal moves within `X` centipawns of the actual best move, simulating tactical blunders.

---

## 📦 Project Layout

```
heuristic-chess-engine/
├── app.py                      # Flask/Python HTTP wrapper for UCI API
├── main.py                     # Universal Chess Interface (UCI) terminal interface
├── search.py                   # Iterative deepening, alpha-beta, quiescence algorithms
├── evaluate.py                 # Evaluation matrix (Material, Piece-Square Tables)
├── requirements.txt            # Python dependencies (python-chess)
│
└── frontend/                   # Interactive Chess GUI
    ├── index.html              # Main chessboard portal
    ├── style.css               # Dark theme & retro board stylesheet
    └── script.js               # Frontend board handlers & API query loops
```

---

## 🚀 Setup & Execution

### Running the HTTP API Server
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Launch the Flask API server:
   ```bash
   python app.py
   ```

### Playing in the Browser
Open `frontend/index.html` directly in a browser (or run a local server: `python -m http.server 8000` inside the `frontend/` directory).
Select the difficulty slider (800 Elo to 2000 Elo) and begin play.
The UI will query the Flask engine server at `http://127.0.0.1:5000/move` on each play.
