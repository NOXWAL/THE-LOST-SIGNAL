# THE LOST SIGNAL

[![Deploy to GitHub Pages](https://github.com/NOXWAL/THE-LOST-SIGNAL/actions/workflows/deploy.yml/badge.svg)](https://github.com/Uj1710glitch/THE-LOST-SIGNAL/actions/workflows/deploy.yml)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r169-000000?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Live Demo:** [https://NOXWAL.github.io/THE-LOST-SIGNAL/](https://NOXWAL.github.io/THE-LOST-SIGNAL/)

---

## 🛰️ Overview

**THE LOST SIGNAL** is a modular 3D tactical sci-fi exploration game built natively for the web using **Three.js**, **TypeScript**, and **Vite**. 

Set on an isolated desolate exoplanet outpost, you awaken to an encrypted planetary distress broadcast. Armed with a signal receiver scanner, your mission is to explore rugged alien terrain, locate ancient communication monoliths, restore localized power grids, converse with survivor engineers, and trace the origin of the anomalous transmission.

The game is engineered entirely with decoupled, event-driven modules—eliminating tight coupling between rendering, gameplay systems, world simulation, and user interface.

---

## 🎮 Gameplay Features

- **Atmospheric 3D World**: Procedurally elevated terrain with dynamic ACESFilmic tone-mapped lighting, volumetric exponential fog, and an interactive particle weather system.
- **Signal Resonance Scanner**: Real-time frequency oscillation meter that detects radio signal strength and calculates proximity to active monolith beacons.
- **Decoupled Event-Driven Architecture**: Core engine, physics, quest evaluation, inventory, and HUD communicate purely via an asynchronous, typed `EventBus`.
- **Interactive NPC & Branching Dialogue**: Proximity-triggered interaction prompts and multi-choice dialogue trees with non-player characters.
- **Dynamic Tactical Radar / Minimap**: Real-time 2D radar overlay mapping player coordinates, landmarks, discovered beacons, and friendly outposts.
- **Objective & Quest Progression Engine**: Reactive mission tracker tracking primary and secondary objectives (beacon calibrations, cell recoveries) in real time.
- **Client-Side Persistent Save System**: Pure browser-based storage (`localStorage`) supporting seamless game saves, loads, and state restorations without requiring external backend servers.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Engine / Graphics** | [Three.js](https://threejs.org/) (r169) | 3D scene graph, PBR shaders, particle systems, camera rigs, shadow maps |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (v5.6+) | Strongly typed game logic, event payloads, interfaces, and contracts |
| **Bundler / Tooling** | [Vite](https://vitejs.dev/) (v5.4+) | Lightning-fast HMR dev server and optimized production rollups |
| **CI / CD** | GitHub Actions | Automated build, artifact packaging, and zero-downtime GitHub Pages deployment |
| **Storage** | Web Storage API (`localStorage`) | Client-side game state, quest progress, and player inventory persistence |

---

## 📸 Screenshots

<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" alt="Atmospheric Exploration" style="border-radius: 8px; width: 100%;" /><br />
        <em>Atmospheric Outpost Exploration & Beacon Scanning</em>
      </td>
      <td width="50%" align="center">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" alt="Tactical Radar UI" style="border-radius: 8px; width: 100%;" /><br />
        <em>Tactical Radar & Frequency Analysis Interface</em>
      </td>
    </tr>
  </table>
</div>

---

## ⌨️ Controls

| Key / Input | Action |
|---|---|
| <kbd>W</kbd> / <kbd>▲</kbd> | Move Forward |
| <kbd>S</kbd> / <kbd>▼</kbd> | Move Backward |
| <kbd>A</kbd> / <kbd>◀</kbd> | Move Left (Strafe) |
| <kbd>D</kbd> / <kbd>▶</kbd> | Move Right (Strafe) |
| <kbd>Shift</kbd> | Sprint Boost |
| <kbd>Space</kbd> | Jump / Elevate |
| <kbd>Mouse Move</kbd> | Look / Rotate Camera (Click canvas for Pointer Lock) |
| <kbd>E</kbd> | Interact (NPC Dialogue, Terminal activation, Pickup) |
| <kbd>M</kbd> | Toggle Sector Radar Map |
| <kbd>I</kbd> or <kbd>Tab</kbd> | Toggle Inventory |
| <kbd>Esc</kbd> | Pause Game / Return to Expedition Menu |

---

## 🚀 Getting Started Locally

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or v20+ recommended) and `npm` installed.

Verify installation:
```bash
node -v
npm -v
```

### Installation

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/Uj1710glitch/THE-LOST-SIGNAL.git
   cd THE-LOST-SIGNAL
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000` (or the port specified in terminal output).

---

## 📦 Building for Production

To create an optimized, tree-shaken static production bundle:

```bash
npm run build
```

This compiles TypeScript code and bundles assets into the `dist/` directory.

To test and preview the production build locally before publishing:
```bash
npm run preview
```

---

## 🌐 Deploying to GitHub Pages

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the game upon every push to the `main` branch.

### Step-by-Step Setup:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for the lost signal"
   git branch -M main
   git remote add origin https://github.com/Uj1710glitch/THE-LOST-SIGNAL.git
   git push -u origin main
   ```

2. **Enable GitHub Pages via Actions**:
   - Go to your repository on GitHub.
   - Click on **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.

3. **Automatic Deployment**:
   - Every push to `main` will trigger the `Deploy to GitHub Pages` workflow.
   - You can inspect the build and deployment progress in the **Actions** tab of your repository.
   - Once completed, your game will be live at:
     ```
     https://uj1710glitch.github.io/THE-LOST-SIGNAL/
     ```

### Subdirectory Path Compatibility

In `vite.config.ts`, the base path is pre-configured for GitHub Pages:
```typescript
export default defineConfig({
  base: '/the-lost-signal/',
  // ...
});
```
*Note: If your repository is named differently (e.g. `<user>.github.io`), adjust `base` to `'/'`.*

---

## 🔒 Security & Privacy

- **No Backend Dependency**: The game runs 100% in the client's browser.
- **No Secret Leakage**: No private API keys, database credentials, or tokens are embedded or required in the codebase.
- **Offline Capable**: Save files and player progression are stored locally within the user's browser storage context.

---

## 📜 Credits and Licenses

- **Game Engine & Core Logic**: Custom modular framework created with [Three.js](https://github.com/mrdoob/three.js/blob/dev/LICENSE) (MIT License).
- **Icons & Font Stack**: Native system font stacks & SVG HUD primitives.
- **License**: This project is licensed under the [MIT License](LICENSE). You are free to modify, distribute, and build upon it.
