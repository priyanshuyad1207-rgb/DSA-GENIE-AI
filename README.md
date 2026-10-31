# DSA Sorting Visualizer

An interactive sorting visualizer built with plain HTML, CSS, and JavaScript.

## Folder structure

```text
C:\dsa visuvalizer
|-- index.html
|-- lab.html
|-- README.md
`-- assets
    |-- scripts
    |   |-- app.js
    |   |-- data.js
    |   `-- sorting.js
    `-- styles
        |-- main.css
        `-- pages.css
```

## Why this structure works well

- `index.html` is now the project front page and overview.
- `lab.html` keeps the interactive sorting workspace separate from the homepage.
- `assets/styles/main.css` owns the visual system and responsive layout.
- `assets/styles/pages.css` adds page-specific styling for the homepage and lab split.
- `assets/scripts/app.js` manages DOM updates, controls, and playback state.
- `assets/scripts/data.js` stores algorithm metadata and array preset builders.
- `assets/scripts/sorting.js` focuses only on step generation and algorithm logic.

## If you expand the project later

Good next folders to add are:

- `assets/images/` for screenshots, logos, or illustrations
- `assets/scripts/components/` if the UI grows into reusable widgets
- `assets/scripts/utils/` for shared helpers
- `docs/` for notes, diagrams, or algorithm references

## Current improvements

- The project now has a separate landing page and a dedicated lab page.
- Same input is preserved when switching algorithms.
- Compare mode ranks every algorithm on identical input.
- Heap Sort and Shell Sort have been added.
- Metrics now track `comparisons` and `writes` more consistently.
- Merge sort visualizes leftover writes that were previously skipped.
- The layout now adapts much better to tablet and mobile screens.

## AI Tutor endpoint

The Sorting Lab includes a session-only AI Tutor panel. It sends `POST /api/tutor` requests
to a same-origin backend or proxy so an LLM API key is never exposed in browser code.

The request body contains the user's `question`, the current algorithm metadata and step
context, the current input array, and the session chat `history`. The endpoint should return
JSON with an `answer` or `text` string. If the endpoint is missing, unauthorized, or
unavailable, the UI shows an inline configuration message instead of breaking the lab.

### Running the Anthropic Tutor locally

The repository includes an optional Node.js backend for the Tutor:

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Add your Anthropic key to `.env` as `ANTHROPIC_API_KEY`.
5. Run `npm start`.
6. Open `http://localhost:3000/lab.html`.

The key is read only by [server.mjs](./server.mjs) and is never sent to the browser.
Never commit `.env` or paste the key into frontend JavaScript.
