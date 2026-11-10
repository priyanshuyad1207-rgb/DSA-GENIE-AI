<div align="center">

# 🧞 DSA Genie AI

### See how algorithms think.

An interactive visualizer that turns sorting and pathfinding algorithms into animated, step-by-step stories — with side-by-side races and an AI Tutor interface.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

[Live Demo](#) · [Quick Start](#-quick-start) · [Features](#-features) · [How It Works](#-how-it-works) · [AI Tutor](#-ai-tutor-setup) · [Roadmap](#-roadmap) · [Report a Bug](../../issues)

<!-- Replace with a real GIF of the Sorting Lab in action -->
![DSA Genie AI demo](assets/demo.gif)

</div>

---

## 💡 Why DSA Genie?

Most people meet algorithms as walls of code and Big-O tables. **DSA Genie AI** lets you *watch* them instead. Pause mid-sort, step forward one comparison at a time, draw your own maze, and race algorithms against each other on identical data.

> **No build step. No framework. No dependencies.** Pure HTML, CSS and JavaScript ES modules. Clone it, serve it, learn.

---

## 🎬 Try These First

| Want to see… | Do this |
|---|---|
| Why Bubble Sort is slow | Open **Sorting Lab**, pick *Reversed* input, press Play |
| Quick Sort's worst case | Pick Quick Sort with a *Sorted* input pattern |
| Who really wins | Open **Race Mode**, select 4 algorithms, start the race |
| BFS finding the shortest path | Open **Pathfinding Lab**, draw walls, run BFS, then DFS on the same grid |
| Your own data | Enter a custom array like `8, 3, 5, 1, 9, 2` and step through it |

---

## ✨ Features

### 🔢 Sorting Lab
- **7 algorithms** rendered as animated bar charts
- **Playback controls:** play, pause, step, restart
- **Input patterns** or your own **custom array**
- **Live metrics:** comparisons, writes, swaps, step progress
- Plain-English explanation of every step

### ⚖️ Compare Mode
Run several algorithms on identical input and rank them by comparisons, writes, or steps.

### 🏁 Race Mode
Race **2–4 algorithms** in parallel. The winner has the **fewest recorded visualization steps** (not wall-clock time).

### 🗺️ Pathfinding Lab
- Editable grid: **draw walls**, move **start** and **end**
- **BFS** and **DFS**, manual stepping or auto-play
- See visited cells, the frontier, and the final path

### 📚 Algorithm Guides
One page per sorting algorithm: description, complexity, use cases and a worked example.

### 🤖 AI Tutor (interface)
- Chat panel that sends your question plus the current algorithm context to `/api/tutor`
- 🎤 Voice input via the browser Speech Recognition API (where supported)
- Answers require a backend you configure — see [AI Tutor Setup](#-ai-tutor-setup)

---

## 🖼️ Screenshots

| Homepage | Sorting Lab |
|---|---|
| <img width="1564" alt="Homepage" src="https://github.com/user-attachments/assets/69d61d85-06da-4d68-8481-882b21846000" /> | <img width="1550" alt="Sorting Lab" src="https://github.com/user-attachments/assets/a3f58d38-2d4d-4a0a-9d01-1a317e83703f" /> |

| Compare / Race Mode |
|---|
| <img width="1560" alt="Compare and Race Mode" src="https://github.com/user-attachments/assets/6a575ed5-6ea7-4ef7-ac85-8f2da35dc5cb" /> |

---

## 🚀 Quick Start

**Prerequisites:** a modern browser (Chrome or Edge recommended for voice input) and Python 3 *or* Node.js for a local server.

```bash
# 1. Clone
git clone https://github.com/priyanshuyad1207-rgb/<your-repo>.git
cd <your-repo>

# 2. Serve (ES modules need http://, not file://)
python -m http.server 3000
# or
npx serve -l 3000
```

Open **http://127.0.0.1:3000** and start exploring.

> ⚠️ Opening `index.html` straight from disk won't work — browsers block JavaScript modules over `file://`.

---

## ⚙️ How It Works

The core idea: **algorithms never touch the screen.**

```
Input array / grid
        │
        ▼
Algorithm module ── generates a list of steps (states)
        │             sorting.js · pathfinding.js
        ▼
Playback engine ── play · pause · step · restart · speed
        │             app.js
        ▼
Renderer ── bars / grid cells + counters + explanation text
```

Because logic and UI are separate, the same step list powers single runs, Compare Mode and Race Mode. Adding a new algorithm means writing one step generator — no UI changes needed.

### 📁 Project Structure

```
├── index.html          # Overview and navigation
├── lab.html            # Sorting Lab, Race Mode, AI Tutor interface
├── algorithm.html      # Sorting algorithm learning pages
├── pathfinding.html    # BFS / DFS grid visualizer
├── app.js              # Controls, playback, compare, race, tutor, speech input
├── sorting.js          # Sorting step generation
├── data.js             # Algorithm metadata and input presets
├── pathfinding.js      # BFS and DFS search steps
├── algorithm.js        # Algorithm guide content
├── main.css            # Shared theme and components
├── pages.css           # Page-specific styles
└── assets/             # Screenshots and demo GIF
```

> Adjust this tree to match your actual layout.

---

## 🧠 Algorithms Covered

### Sorting

| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Shell Sort | O(n log n) | depends on gaps | O(n²) | O(1) | ❌ |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |

### Pathfinding

| Algorithm | Data structure | Shortest path (unweighted)? | Time | Space |
|---|---|---|---|---|
| BFS | Queue | ✅ Yes | O(V + E) | O(V) |
| DFS | Stack | ❌ Not guaranteed | O(V + E) | O(V) |

*V = cells (vertices), E = connections (edges).*

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (theme, responsive layout, animations) |
| Logic | JavaScript ES modules + DOM |
| Voice input | Browser Speech Recognition API |
| AI requests | Fetch API → `/api/tutor` |
| Typography | Google Fonts (Inter) |
| Dev server | Python `http.server` (development only) |

---

## 🤖 AI Tutor Setup

The front end ships ready; **generated answers need a backend you provide.**

1. Create a service exposing `POST /api/tutor` on the same origin as the site.
2. The request carries the user's question and the current algorithm context.
3. Connect it to an LLM API of your choice. Keep the API key **server-side only** — never in front-end code.
4. Without a backend, the tutor shows a friendly "not configured" message and everything else works normally.

> This project does **not** train or host its own machine-learning model.

---

## ⚠️ Limitations

- The AI Tutor needs a configured backend and LLM API.
- Speech recognition support varies by browser and needs microphone permission.
- Only BFS and DFS are implemented for pathfinding so far.
- Race Mode compares **visualization steps**, not real execution time.

---

## 🗺️ Roadmap

- [x] Sorting Lab with 7 algorithms
- [x] Compare Mode and Race Mode
- [x] BFS and DFS Pathfinding Lab
- [x] Algorithm guide pages
- [x] AI Tutor interface with voice input
- [ ] Dijkstra's Algorithm and A* Search
- [ ] Maze generation and weighted grids
- [ ] More sorts: Counting, Radix, Bucket, Timsort
- [ ] Secure backend for the AI Tutor
- [ ] Text-to-speech for tutor answers
- [ ] User accounts and learning progress
- [ ] Tree and graph visualizations

---

## 🤝 Contributing

The easiest contribution is a new algorithm:

1. Add a step generator in `sorting.js` (or `pathfinding.js`) that returns a list of states
2. Register its name, complexity and presets in `data.js`
3. Add a guide entry in `algorithm.js`
4. Open a pull request with a short GIF of it running

Ideas and bug reports are welcome in [Issues](../../issues).

---



**Supervisor:** Prof. Name, Department, Institution

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

<div align="center">

**DSA Genie AI** — algorithms you can watch, pause, and finally understand.

⭐ If this project helped you learn, give it a star!

</div>
