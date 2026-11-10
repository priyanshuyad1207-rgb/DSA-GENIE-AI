<div align="center">

# 🧞 DSA Genie AI

### Interactive Algorithm Visualizer — *see* how algorithms think

Learn sorting and pathfinding algorithms through animated, step-by-step visualizations, side-by-side comparisons, and an AI Tutor interface.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

[Live Demo](#) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

<!-- Replace with a real GIF of the Sorting Lab in action -->
![DSA Genie AI demo](assets/demo.gif)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Algorithms Covered](#-algorithms-covered)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [AI Tutor Setup](#-ai-tutor-setup)
- [Limitations](#-limitations)
- [Roadmap](#-roadmap)
- [Team](#-team)
- [License](#-license)

---

## 📌 About

Data Structures and Algorithms are hard to understand from text or code alone. **DSA Genie AI** turns them into something you can watch, pause, step through, and experiment with.

Change the input, control the playback, compare algorithms on the *same* data, draw your own obstacles on a grid, and read a clear explanation of what is happening at every step.

---

## ✨ Features

### 🔢 Sorting Lab
- **7 sorting algorithms** shown as animated bar charts
- **Playback controls:** play, pause, step, and restart
- **Input patterns** or a **custom array** of your own
- **Live metrics:** comparisons, writes, swaps, and step progress
- Step-by-step explanations as the algorithm runs

### ⚖️ Compare Mode
Run several algorithms on identical input and rank them by comparisons, writes, or steps.

### 🏁 Race Mode
Race **2 to 4** algorithms in parallel. The winner is the one with the **fewest recorded visualization steps** (not wall-clock time).

### 🗺️ Pathfinding Lab
- Editable grid: **draw walls**, move the **start** and **end** points
- Visualize **BFS** and **DFS**, step by step or automatically
- See visited cells, the frontier, and the final path

### 📚 Algorithm Guides
A dedicated page per sorting algorithm with a description, complexity, use cases, and a worked example.

### 🤖 AI Tutor (interface)
- Chat panel that sends your question plus the current algorithm context to a same-origin `/api/tutor` endpoint
- 🎤 Voice input through the browser Speech Recognition API (where supported)
- Generated answers require a backend you configure (see [AI Tutor Setup](#-ai-tutor-setup))

---

## 🖼️ Screenshots

> Add your screenshots to an `assets/` folder and update the paths below.

| Homepage | Sorting Lab |
|---|---|
| ![Home]( <img width="1564" height="798" alt="WhatsApp Image 2026-11-10 at 15 16 51 (1)" src="https://github.com/user-attachments/assets/69d61d85-06da-4d68-8481-882b21846000" />
) | ![Sorting Lab](<img width="1550" height="806" alt="WhatsApp Image 2026-11-10 at 15 16 51" src="https://github.com/user-attachments/assets/a3f58d38-2d4d-4a0a-9d01-1a317e83703f" />
) |

| Compare / Race Mode | 
|---|---|
| ![Compare](<img width="1560" height="802" alt="WhatsApp Image 2026-11-10 at 15 16 50" src="https://github.com/user-attachments/assets/6a575ed5-6ea7-4ef7-ac85-8f2da35dc5cb" />
) | 

---

## 🧠 Algorithms Covered

### Sorting

| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Shell Sort | O(n log n) | depends on gap sequence | O(n²) | O(1) | ❌ |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |

### Pathfinding

| Algorithm | Data structure | Shortest path (unweighted)? | Time | Space |
|---|---|---|---|---|
| BFS | Queue | ✅ Yes | O(V + E) | O(V) |
| DFS | Stack | ❌ Not guaranteed | O(V + E) | O(V) |

*V = number of cells (vertices), E = number of connections (edges).*

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (theme, responsive layout, animations) |
| Logic | JavaScript ES modules + DOM manipulation |
| Voice input | Browser Speech Recognition API |
| AI requests | Fetch API → `/api/tutor` |
| Typography | Google Fonts (Inter) |
| Local dev server | Python `http.server` (development only, not the app backend) |

---

## 🚀 Getting Started

### Prerequisites
- A modern browser (Chrome or Edge recommended for voice input)
- Python 3 **or** Node.js, for a simple local server

### Run locally

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Start a local server (ES modules need http://, not file://)
python -m http.server 3000
# or
npx serve -l 3000
```

Then open **http://127.0.0.1:3000** in your browser.

> ⚠️ Opening `index.html` directly from the file system will not work, because browsers block JavaScript modules over `file://`.

---

## 📁 Project Structure

```
├── index.html          # Project overview and navigation
├── lab.html            # Sorting Lab, Race Mode, AI Tutor interface
├── algorithm.html      # Sorting algorithm learning pages
├── pathfinding.html    # BFS / DFS grid visualizer
├── app.js              # Controls, playback, compare, race, tutor, speech input
├── sorting.js          # Sorting algorithm step generation
├── data.js             # Algorithm metadata and input presets
├── pathfinding.js      # BFS and DFS search steps
├── algorithm.js        # Algorithm guide content
├── main.css            # Shared theme and components
├── pages.css           # Page-specific styles
└── assets/             # Screenshots and demo GIF
```

> Adjust this tree to match your actual folder layout.

### How it works

Each algorithm **generates a sequence of states** rather than manipulating the screen directly. The UI then plays those states back as animated bars or grid cells and updates counters and explanations. Algorithm logic and interface code live in separate modules, which makes it easy to add new algorithms.

---

## 🤖 AI Tutor Setup

The AI Tutor front end is included, but **generated answers need a backend**.

1. Create a backend service that exposes `POST /api/tutor` on the same origin as the site.
2. The request carries the user's question and the current algorithm context.
3. Connect the backend to an LLM API of your choice and keep the API key **server-side only**, never in front-end code.
4. Without a backend, the tutor shows a friendly "not configured" message and everything else works normally.

> The project does **not** train or host its own machine-learning model.

---

## ⚠️ Limitations

- The AI Tutor needs a configured backend and LLM API to return answers.
- Speech recognition support varies by browser, and microphone permission is required.
- Only BFS and DFS are implemented for pathfinding right now.
- Race Mode compares **visualization steps**, not real execution time.

---

## 🗺️ Roadmap

- [x] Sorting Lab with 7 algorithms
- [x] Compare Mode and Race Mode
- [x] BFS and DFS Pathfinding Lab
- [x] Algorithm guide pages
- [x] AI Tutor interface with voice input
- [ ] Dijkstra's Algorithm and A\* Search
- [ ] Maze generation and weighted grids
- [ ] More sorts: Counting, Radix, Bucket, Timsort
- [ ] Secure backend for the AI Tutor
- [ ] Text-to-speech for tutor answers
- [ ] User accounts and learning progress
- [ ] Tree and graph visualizations

---

## 👥 Team

| Name | Role | GitHub |
|---|---|---|
| **Your Name** | Developer | [@username](https://github.com/username) |
| **Teammate Name** | Developer | [@username](https://github.com/username) |

**Supervisor:** Prof. Name, Department, Institution

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

<div align="center">

⭐ If this project helped you learn, give it a star!

</div>
