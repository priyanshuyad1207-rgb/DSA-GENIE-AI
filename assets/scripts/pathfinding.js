const ROWS = 20;
const COLS = 30;
const DEFAULT_START = { row: 9, col: 5 };
const DEFAULT_END = { row: 9, col: 24 };
const META = {
  bfs: {
    name: 'Breadth-First Search',
    time: 'O(V + E)',
    space: 'O(V)',
    description: 'BFS explores the grid level by level with a queue, so the first path it finds is shortest when every move has equal cost.',
    steps: ['Start with the source cell in a queue.', 'Remove the next cell from the front.', 'Add each unvisited open neighbor to the queue.', 'Stop when the target is reached, then trace parent links back.'],
    tags: ['Shortest unweighted path', 'Level-order exploration', 'Maze solving']
  },
  dfs: {
    name: 'Depth-First Search',
    time: 'O(V + E)',
    space: 'O(V)',
    description: 'DFS follows one branch as deeply as possible with a stack before backtracking to another branch.',
    steps: ['Start with the source cell in a stack.', 'Remove the most recent cell from the top.', 'Add each unvisited open neighbor to the stack.', 'Stop at the target, then trace parent links back.'],
    tags: ['Maze exploration', 'Connectivity checks', 'Deep traversal']
  }
};

const state = {
  algorithm: 'bfs',
  start: { ...DEFAULT_START },
  end: { ...DEFAULT_END },
  walls: new Set(),
  mode: 'wall',
  steps: [],
  stepIndex: 0,
  playing: false,
  timerId: null
};

const elements = {
  grid: document.getElementById('path-grid'),
  algorithm: document.getElementById('path-algorithm'),
  speed: document.getElementById('path-speed'),
  speedValue: document.getElementById('path-speed-value'),
  play: document.getElementById('path-play'),
  step: document.getElementById('path-step'),
  restart: document.getElementById('path-restart'),
  clearWalls: document.getElementById('clear-walls'),
  clearBoard: document.getElementById('clear-board'),
  toolWall: document.getElementById('tool-wall'),
  toolStart: document.getElementById('tool-start'),
  toolEnd: document.getElementById('tool-end'),
  title: document.getElementById('path-status-title'),
  summary: document.getElementById('path-summary'),
  visited: document.getElementById('path-visited'),
  frontier: document.getElementById('path-frontier'),
  stepCount: document.getElementById('path-step-count'),
  total: document.getElementById('path-total'),
  status: document.getElementById('path-run-status'),
  progress: document.getElementById('path-progress'),
  explanationTitle: document.getElementById('path-explanation-title'),
  explanation: document.getElementById('path-explanation'),
  complexity: document.getElementById('path-complexity'),
  description: document.getElementById('path-description'),
  steps: document.getElementById('path-steps'),
  tags: document.getElementById('path-tags')
};

let dragging = false;

init();

function init() {
  renderGrid();
  renderMeta();
  rebuildSteps();
  renderStep(null);
  attachEvents();
}

function attachEvents() {
  elements.algorithm.addEventListener('change', () => {
    state.algorithm = elements.algorithm.value;
    resetRun();
    renderMeta();
  });
  elements.speed.addEventListener('input', () => {
    elements.speedValue.textContent = `${elements.speed.value}x`;
  });
  elements.play.addEventListener('click', () => state.playing ? stopRun('Paused') : startRun());
  elements.step.addEventListener('click', () => { stopRun(); runStep(); });
  elements.restart.addEventListener('click', () => resetRun());
  elements.clearWalls.addEventListener('click', () => { state.walls.clear(); resetRun(); });
  elements.clearBoard.addEventListener('click', () => { state.walls.clear(); state.start = { ...DEFAULT_START }; state.end = { ...DEFAULT_END }; resetRun(); renderGrid(); });
  [elements.toolWall, elements.toolStart, elements.toolEnd].forEach((button) => button.addEventListener('click', () => {
    state.mode = button.id.replace('tool-', '');
    updateTools();
  }));
  elements.grid.addEventListener('pointerdown', (event) => {
    const cell = event.target.closest('[data-cell]');
    if (!cell) return;
    event.preventDefault();
    dragging = true;
    editCell(cell);
  });
  elements.grid.addEventListener('pointerover', (event) => {
    if (!dragging || state.mode !== 'wall') return;
    const cell = event.target.closest('[data-cell]');
    if (cell) editCell(cell);
  });
  window.addEventListener('pointerup', () => { dragging = false; });
}

function editCell(cell) {
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const key = keyOf(row, col);
  if (state.mode === 'start') {
    if (key !== keyOf(state.end.row, state.end.col)) state.start = { row, col };
  } else if (state.mode === 'end') {
    if (key !== keyOf(state.start.row, state.start.col)) state.end = { row, col };
  } else if (key !== keyOf(state.start.row, state.start.col) && key !== keyOf(state.end.row, state.end.col)) {
    state.walls.has(key) ? state.walls.delete(key) : state.walls.add(key);
  }
  resetRun();
  renderGrid();
}

function rebuildSteps() {
  state.steps = buildSearchSteps();
  state.stepIndex = 0;
}

function buildSearchSteps() {
  const startKey = keyOf(state.start.row, state.start.col);
  const endKey = keyOf(state.end.row, state.end.col);
  const frontier = [startKey];
  const visited = new Set([startKey]);
  const parents = new Map();
  const events = [];
  let found = false;
  while (frontier.length) {
    const current = state.algorithm === 'bfs' ? frontier.shift() : frontier.pop();
    const currentPoint = pointOf(current);
    const neighbors = getNeighbors(currentPoint.row, currentPoint.col);
    let added = [];
    if (current === endKey) { found = true; events.push(makeEvent(visited, frontier, [], current, 'Reached the End node.')); break; }
    neighbors.forEach((neighbor) => {
      const next = keyOf(neighbor.row, neighbor.col);
      if (!visited.has(next) && !state.walls.has(next)) {
        visited.add(next);
        parents.set(next, current);
        frontier.push(next);
        added.push(next);
      }
    });
    events.push(makeEvent(visited, frontier, added, current, `${state.algorithm === 'bfs' ? 'Added' : 'Pushed'} ${added.length} neighbor${added.length === 1 ? '' : 's'} to the ${state.algorithm === 'bfs' ? 'queue' : 'stack'}.`));
  }
  if (found) {
    const path = [];
    let current = endKey;
    while (current) { path.unshift(current); current = parents.get(current); }
    events.push(makeEvent(visited, [], [], endKey, `Tracing back a path of ${path.length} cells.`, path));
  } else {
    events.push(makeEvent(visited, [], [], null, 'No path could be found on this board.'));
  }
  return events;
}

function makeEvent(visited, frontier, added, current, log, path = []) {
  return { visited: [...visited], frontier: [...frontier], added, current, path, log };
}

function runStep() {
  if (state.stepIndex >= state.steps.length) { stopRun('Done'); return; }
  state.stepIndex += 1;
  renderStep(state.steps[state.stepIndex - 1]);
  if (state.stepIndex >= state.steps.length) stopRun('Done');
}

function startRun() {
  if (!state.steps.length) rebuildSteps();
  state.playing = true;
  updateStatus('running');
  elements.play.textContent = 'Pause';
  const tick = () => {
    if (!state.playing) return;
    runStep();
    if (state.playing) state.timerId = setTimeout(tick, Math.max(80, 860 - Number(elements.speed.value) * 75));
  };
  tick();
}

function stopRun(status = '') {
  state.playing = false;
  clearTimeout(state.timerId);
  state.timerId = null;
  elements.play.textContent = state.stepIndex >= state.steps.length && state.steps.length ? 'Replay' : 'Play';
  if (status) updateStatus(status.toLowerCase());
}

function resetRun() {
  stopRun();
  rebuildSteps();
  renderStep(null);
  updateStatus('ready');
}

function renderGrid() {
  const fragment = document.createDocumentFragment();
  elements.grid.innerHTML = '';
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'path-cell';
      cell.dataset.cell = '';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute('role', 'gridcell');
      fragment.appendChild(cell);
    }
  }
  elements.grid.appendChild(fragment);
  renderStep(state.stepIndex ? state.steps[state.stepIndex - 1] : null);
}

function renderStep(step) {
  const visited = new Set(step?.visited ?? []);
  const frontier = new Set(step?.frontier ?? []);
  const path = new Set(step?.path ?? []);
  const current = step?.current;
  elements.grid.querySelectorAll('[data-cell]').forEach((cell) => {
    const key = keyOf(Number(cell.dataset.row), Number(cell.dataset.col));
    cell.className = 'path-cell';
    if (state.walls.has(key)) cell.classList.add('wall');
    if (visited.has(key)) cell.classList.add('visited');
    if (frontier.has(key)) cell.classList.add('frontier');
    if (path.has(key)) cell.classList.add('path');
    if (key === current) cell.classList.add('current');
    if (key === keyOf(state.start.row, state.start.col)) cell.className = 'path-cell start';
    if (key === keyOf(state.end.row, state.end.col)) cell.className = 'path-cell end';
    cell.setAttribute('aria-label', `${cell.dataset.row}, ${cell.dataset.col}`);
  });
  const visitedCount = step?.visited?.length ?? 0;
  elements.visited.textContent = visitedCount;
  elements.frontier.textContent = step?.frontier?.length ?? 0;
  elements.stepCount.textContent = state.stepIndex;
  elements.total.textContent = state.steps.length;
  elements.progress.style.width = `${state.steps.length ? Math.round((state.stepIndex / state.steps.length) * 100) : 0}%`;
  elements.explanationTitle.textContent = step ? `Step ${state.stepIndex} of ${state.steps.length}` : 'Waiting for a step';
  elements.explanation.textContent = step ? `Step ${state.stepIndex}: ${step.log}` : 'Press Play or Step to begin.';
  elements.title.textContent = step?.path?.length ? 'Path found' : 'Ready to explore';
}

function renderMeta() {
  const meta = META[state.algorithm];
  elements.summary.textContent = `${state.algorithm.toUpperCase()} · 20 × 30 grid`;
  elements.complexity.innerHTML = `<div class="comp-row"><span class="comp-label">Time</span><span class="comp-val avg">${meta.time}</span></div><div class="comp-row"><span class="comp-label">Space</span><span class="comp-val info">${meta.space}</span></div>`;
  elements.description.textContent = meta.description;
  elements.steps.innerHTML = meta.steps.map((step, index) => `<li><span class="step-num">${index + 1}</span><span>${step}</span></li>`).join('');
  elements.tags.innerHTML = meta.tags.map((tag) => `<span class="tag">${tag}</span>`).join('');
}

function updateStatus(status) {
  const labels = { ready: 'Ready', running: 'Running', paused: 'Paused', done: 'Done' };
  elements.status.textContent = labels[status] ?? 'Ready';
  elements.status.className = `status-pill ${status}`;
}

function updateTools() {
  [elements.toolWall, elements.toolStart, elements.toolEnd].forEach((button) => button.classList.toggle('active', button.id === `tool-${state.mode}`));
}

function getNeighbors(row, col) {
  return [[row - 1, col], [row, col + 1], [row + 1, col], [row, col - 1]]
    .filter(([nextRow, nextCol]) => nextRow >= 0 && nextRow < ROWS && nextCol >= 0 && nextCol < COLS)
    .map(([nextRow, nextCol]) => ({ row: nextRow, col: nextCol }));
}
function keyOf(row, col) { return `${row},${col}`; }
function pointOf(key) { const [row, col] = key.split(',').map(Number); return { row, col }; }
