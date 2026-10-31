import {
  ALGORITHM_KEYS,
  DEFAULT_ALGORITHM,
  DEFAULT_PRESET,
  DEFAULT_SIZE,
  DEFAULT_SPEED,
  META,
  PRESET_OPTIONS,
  createArray,
  getComplexityClass,
  getPresetLabel,
} from "./data.js";
import { buildSteps } from "./sorting.js";

const COMPARE_LABELS = {
  comparisons: "Comparisons",
  writes: "Writes",
  steps: "Steps",
};

const state = {
  algorithm: getRequestedAlgorithm(),
  preset: DEFAULT_PRESET,
  size: DEFAULT_SIZE,
  speed: DEFAULT_SPEED,
  viewMode: "visualizer",
  compareMetric: "comparisons",
  baseArray: [],
  steps: [],
  stepHistory: [],
  compareResults: [],
  raceAlgorithms: ["bubble", "merge", "heap"],
  raceRunners: [],
  racePlaying: false,
  raceTimerId: null,
  raceFinishOrder: [],
  stepIndex: 0,
  playing: false,
  timerId: null,
  tutorMessages: [],
};

function getRequestedAlgorithm() {
  const requestedAlgorithm = new URLSearchParams(window.location.search).get(
    "algorithm",
  );
  return requestedAlgorithm && META[requestedAlgorithm]
    ? requestedAlgorithm
    : DEFAULT_ALGORITHM;
}

const elements = {
  labSection: document.getElementById("lab-section"),
  algoTabs: document.getElementById("algo-tabs"),
  viewMode: document.getElementById("view-mode"),
  vizCard: document.getElementById("viz-card"),
  compareCard: document.getElementById("compare-card"),
  raceCard: document.getElementById("race-card"),
  racePicker: document.getElementById("race-picker"),
  raceError: document.getElementById("race-error"),
  raceResult: document.getElementById("race-result"),
  raceGrid: document.getElementById("race-grid"),
  racePlayButton: document.getElementById("btn-race-play"),
  raceRestartButton: document.getElementById("btn-race-restart"),
  compareMetric: document.getElementById("compare-metric"),
  compareSummary: document.getElementById("compare-summary"),
  compareGrid: document.getElementById("compare-grid"),
  preset: document.getElementById("array-preset"),
  customArrayField: document.getElementById("custom-array-field"),
  customArray: document.getElementById("custom-array"),
  customArrayError: document.getElementById("custom-array-error"),
  speed: document.getElementById("speed"),
  size: document.getElementById("size"),
  speedValue: document.getElementById("speed-val"),
  sizeValue: document.getElementById("size-val"),
  playButton: document.getElementById("btn-play"),
  stepButton: document.getElementById("btn-step"),
  resetButton: document.getElementById("btn-reset"),
  restartButton: document.getElementById("btn-restart"),
  barArea: document.getElementById("bar-area"),
  progressFill: document.getElementById("progress-fill"),
  logLine: document.getElementById("log-line"),
  stepExplanationTitle: document.getElementById("step-explanation-title"),
  stepCurrent: document.getElementById("step-current"),
  stepHistory: document.getElementById("step-history"),
  stepComparisons: document.getElementById("step-cmp"),
  stepSwaps: document.getElementById("step-swp"),
  status: document.getElementById("st-status"),
  comparisons: document.getElementById("st-cmp"),
  writes: document.getElementById("st-wrt"),
  stepCount: document.getElementById("st-step"),
  totalSteps: document.getElementById("st-total"),
  complexityCard: document.getElementById("complexity-card"),
  algoDesc: document.getElementById("algo-desc"),
  algoSteps: document.getElementById("algo-steps"),
  algoTags: document.getElementById("algo-tags"),
  activeAlgoLabel: document.getElementById("active-algo-label"),
  inputSummary: document.getElementById("input-summary"),
  tutorLauncher: document.getElementById("tutor-launcher"),
  tutorPanel: document.getElementById("tutor-panel"),
  tutorClose: document.getElementById("tutor-close"),
  tutorMessages: document.getElementById("tutor-messages"),
  tutorPrompts: document.getElementById("tutor-prompts"),
  tutorForm: document.getElementById("tutor-form"),
  tutorInput: document.getElementById("tutor-input"),
  tutorMic: document.getElementById("tutor-mic"),
  tutorSend: document.getElementById("tutor-send"),
};

let barPool = [];
let speechRecognition = null;

init();

function init() {
  renderAlgorithmTabs();
  renderPresetOptions();
  renderRacePicker();
  syncControls();
  renderMeta();
  syncViewMode();
  attachEventListeners();
  regenerateArray("New array generated. Press Play or Step to begin.");
}

function renderAlgorithmTabs() {
  const markup = ALGORITHM_KEYS.map((key) => {
    const selected = key === state.algorithm;
    return `
      <button
        class="algo-tab${selected ? " active" : ""}"
        data-algo="${key}"
        type="button"
        role="tab"
        aria-selected="${selected}"
      >
        ${META[key].name}
      </button>
    `;
  }).join("");

  elements.algoTabs.innerHTML = markup;
}

function renderPresetOptions() {
  elements.preset.innerHTML = PRESET_OPTIONS.map(
    (option) => `
      <option value="${option.value}"${option.value === state.preset ? " selected" : ""}>
        ${option.label}
      </option>
    `,
  ).join("");
}

function attachEventListeners() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-open-workspace]");
    if (!target) {
      return;
    }

    openWorkspace(target.dataset.openWorkspace);
  });

  elements.algoTabs.addEventListener("click", (event) => {
    const target = event.target.closest(".algo-tab");
    if (!target) {
      return;
    }

    switchAlgorithm(target.dataset.algo);
  });

  elements.viewMode.addEventListener("click", (event) => {
    const target = event.target.closest(".mode-tab");
    if (!target) {
      return;
    }

    setViewMode(target.dataset.mode);
  });

  elements.compareMetric.addEventListener("change", () => {
    state.compareMetric = elements.compareMetric.value;
    renderCompareMode();
  });

  elements.compareGrid.addEventListener("click", (event) => {
    const target = event.target.closest("[data-open-algo]");
    if (!target) {
      return;
    }

    openAlgorithmFromCompare(target.dataset.openAlgo);
  });

  elements.racePicker.addEventListener("change", (event) => {
    const target = event.target.closest("[data-race-algo]");
    if (!target) {
      return;
    }

    updateRaceSelection(target.dataset.raceAlgo, target.checked);
  });

  elements.racePlayButton.addEventListener("click", () => {
    if (state.racePlaying) {
      stopRace("Paused");
      return;
    }

    startRace();
  });

  elements.raceRestartButton.addEventListener("click", () => {
    resetRace("Race restarted from the same input array.");
  });

  elements.preset.addEventListener("change", () => {
    state.preset = elements.preset.value;
    syncCustomArrayControls();

    if (state.preset === "custom") {
      applyCustomArray();
      return;
    }

    clearCustomArrayError();
    regenerateArray(
      `Generated a ${getPresetLabel(state.preset).toLowerCase()} input array.`,
    );
  });

  elements.customArray.addEventListener("input", () => {
    if (state.preset === "custom") {
      applyCustomArray();
    }
  });

  elements.speed.addEventListener("input", () => {
    state.speed = Number.parseInt(elements.speed.value, 10);
    syncControls();
  });

  elements.size.addEventListener("input", () => {
    state.size = Number.parseInt(elements.size.value, 10);
    syncControls();
  });

  elements.size.addEventListener("change", () => {
    regenerateArray(`Generated a ${state.size}-bar input array.`);
  });

  elements.playButton.addEventListener("click", () => {
    if (state.playing) {
      stopPlayback("Paused");
      return;
    }

    startPlayback();
  });

  elements.stepButton.addEventListener("click", () => {
    if (state.playing) {
      stopPlayback("Paused");
    }

    runStep();
  });

  elements.resetButton.addEventListener("click", () => {
    if (state.preset === "custom") {
      applyCustomArray();
      return;
    }

    regenerateArray("Fresh input generated for the current algorithm.");
  });

  elements.restartButton.addEventListener("click", () => {
    stopPlayback();
    rebuildSelectedSteps();
    resetPlaybackState("Restarted from the same input array.");
  });

  window.addEventListener("beforeunload", () => {
    clearTimeout(state.timerId);
    clearTimeout(state.raceTimerId);
  });

  elements.tutorLauncher.addEventListener("click", () => {
    setTutorOpen(elements.tutorPanel.classList.contains("is-hidden"));
  });

  elements.tutorClose.addEventListener("click", () => {
    setTutorOpen(false);
  });

  elements.tutorPrompts.addEventListener("click", (event) => {
    const target = event.target.closest("[data-tutor-prompt]");
    if (!target) {
      return;
    }

    elements.tutorInput.value = target.dataset.tutorPrompt;
    elements.tutorInput.focus();
  });

  elements.tutorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    askTutor(elements.tutorInput.value);
  });

  setupTutorSpeech();
}

function setupTutorSpeech() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    elements.tutorMic.title = "Voice input is not supported in this browser";
    elements.tutorMic.addEventListener("click", () => {
      appendTutorMessage("status", "Voice input is not supported in this browser. You can type your question instead.");
    });
    return;
  }

  speechRecognition = new Recognition();
  speechRecognition.continuous = false;
  speechRecognition.interimResults = true;
  speechRecognition.lang = "en-US";

  speechRecognition.onstart = () => {
    elements.tutorMic.classList.add("is-listening");
    elements.tutorMic.setAttribute("aria-pressed", "true");
    elements.tutorMic.textContent = "■";
    elements.tutorMic.title = "Stop listening";
    appendTutorMessage("status", "Listening... ask your DSA question.");
  };

  speechRecognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");
    elements.tutorInput.value = transcript;
  };

  speechRecognition.onerror = (event) => {
    removeTutorStatus();
    const message = event.error === "not-allowed"
      ? "Microphone permission was denied. Allow microphone access or type your question."
      : "I could not hear that clearly. Please try again or type your question.";
    appendTutorMessage("status", message);
  };

  speechRecognition.onend = () => {
    elements.tutorMic.classList.remove("is-listening");
    elements.tutorMic.setAttribute("aria-pressed", "false");
    elements.tutorMic.textContent = "🎙";
    elements.tutorMic.title = "Ask by voice";
    removeTutorStatus();
    if (elements.tutorInput.value.trim()) {
      elements.tutorInput.focus();
    }
  };

  elements.tutorMic.addEventListener("click", () => {
    if (elements.tutorMic.classList.contains("is-listening")) {
      speechRecognition.stop();
      return;
    }

    removeTutorStatus();
    try {
      speechRecognition.start();
    } catch (error) {
      appendTutorMessage("status", "Voice input is already starting. Please try again.");
    }
  });
}

function setTutorOpen(open) {
  elements.tutorPanel.classList.toggle("is-hidden", !open);
  elements.tutorLauncher.setAttribute("aria-expanded", String(open));
  if (open) {
    elements.tutorInput.focus();
  }
}

async function askTutor(question) {
  const trimmedQuestion = question.trim();
  if (!trimmedQuestion || elements.tutorSend.disabled) {
    return;
  }

  elements.tutorInput.value = "";
  appendTutorMessage("user", trimmedQuestion);
  elements.tutorSend.disabled = true;
  appendTutorMessage("status", "Thinking...");

  try {
    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: trimmedQuestion,
        context: getTutorContext(),
        history: state.tutorMessages.filter(
          (message) => message.role !== "status",
        ),
      }),
    });

    if (!response.ok) {
      if ([401, 403, 404, 501].includes(response.status)) {
        throw new Error(
          "AI Tutor not configured — add your API key in the server settings.",
        );
      }
      throw new Error(
        "The tutor could not answer right now. Please try again.",
      );
    }

    const payload = await response.json();
    const answer =
      typeof payload.answer === "string"
        ? payload.answer
        : typeof payload.text === "string"
          ? payload.text
          : "";

    if (!answer.trim()) {
      throw new Error("The tutor returned an empty answer. Please try again.");
    }

    removeTutorStatus();
    appendTutorMessage("assistant", answer);
  } catch (error) {
    removeTutorStatus();
    appendTutorMessage(
      "status",
      error instanceof TypeError
        ? "AI Tutor not configured — add your API key in the server settings."
        : error.message,
    );
  } finally {
    elements.tutorSend.disabled = false;
    elements.tutorInput.focus();
  }
}

function getTutorContext() {
  const meta = META[state.algorithm];
  return {
    algorithm: meta.name,
    complexity: {
      best: meta.best,
      average: meta.avg,
      worst: meta.worst,
      space: meta.space,
      stable: meta.stable,
    },
    howItWorks: meta.steps,
    currentStep: elements.stepCurrent.textContent,
    stepNumber: state.stepIndex,
    totalSteps: state.steps.length,
    input: state.baseArray,
    systemPrompt: `You are a friendly DSA tutor. Explain ${meta.name} using only the supplied on-screen context when possible. Be concise, accurate, and educational.`,
  };
}

function appendTutorMessage(role, text) {
  const message = { role, content: text };
  state.tutorMessages.push(message);
  const messageElement = document.createElement("p");
  messageElement.className = `tutor-message tutor-message--${role}`;
  messageElement.textContent = text;
  elements.tutorMessages.appendChild(messageElement);
  elements.tutorMessages.querySelector(".tutor-empty")?.remove();
  elements.tutorMessages.scrollTop = elements.tutorMessages.scrollHeight;
}

function removeTutorStatus() {
  const status = elements.tutorMessages.querySelector(
    ".tutor-message--status:last-child",
  );
  status?.remove();
  if (status) {
    state.tutorMessages.pop();
  }
}

function setViewMode(mode) {
  if (!["visualizer", "compare", "race"].includes(mode)) {
    return;
  }

  if (state.viewMode === mode) {
    updateControlState();
    return;
  }

  stopPlayback();
  stopRace();
  state.viewMode = mode;
  syncViewMode();
  updateControlState();
}

function syncViewMode() {
  elements.viewMode.querySelectorAll(".mode-tab").forEach((button) => {
    const active = button.dataset.mode === state.viewMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  elements.vizCard.classList.toggle(
    "is-hidden",
    state.viewMode !== "visualizer",
  );
  elements.compareCard.classList.toggle(
    "is-hidden",
    state.viewMode !== "compare",
  );
  elements.raceCard.classList.toggle("is-hidden", state.viewMode !== "race");
  if (state.viewMode === "race") {
    renderRace();
  }
}

function switchAlgorithm(nextAlgorithm) {
  if (!META[nextAlgorithm] || nextAlgorithm === state.algorithm) {
    return;
  }

  stopPlayback();
  state.algorithm = nextAlgorithm;
  renderAlgorithmTabs();
  renderMeta();
  rebuildSelectedSteps();
  renderCompareMode();
  resetPlaybackState(
    `Switched to ${META[nextAlgorithm].name}. The same input array was kept.`,
  );
}

function openWorkspace(mode) {
  setViewMode(mode === "compare" || mode === "race" ? mode : "visualizer");

  if (elements.labSection) {
    elements.labSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function regenerateArray(message) {
  loadArray(createArray(state.size, state.preset), message);
}

function loadArray(array, message) {
  stopPlayback();
  stopRace();
  state.baseArray = [...array];
  rebuildCompareResults();
  rebuildSelectedSteps();
  resetRace();
  renderCompareMode();
  resetPlaybackState(message);
}

function applyCustomArray() {
  const result = parseCustomArray(elements.customArray.value);

  if (!result.valid) {
    showCustomArrayError(result.message);
    return;
  }

  clearCustomArrayError();
  loadArray(
    result.values,
    `Loaded your custom input array with ${result.values.length} values.`,
  );
}

function parseCustomArray(input) {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      valid: false,
      message: "Enter a comma-separated list of numbers to use a custom array.",
    };
  }

  const values = trimmedInput.split(",").map((value) => value.trim());

  if (values.some((value) => !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value))) {
    return {
      valid: false,
      message: "Use only numbers separated by commas, for example: 45, 12, 89.",
    };
  }

  if (values.length < 2 || values.length > 50) {
    return {
      valid: false,
      message: "A custom array must contain between 2 and 50 numbers.",
    };
  }

  const parsedValues = values.map(Number);

  if (parsedValues.some((value) => !Number.isFinite(value))) {
    return {
      valid: false,
      message: "Each custom array value must be a valid finite number.",
    };
  }

  return { valid: true, values: parsedValues };
}

function syncCustomArrayControls() {
  const customMode = state.preset === "custom";
  elements.customArrayField.classList.toggle("is-hidden", !customMode);
  elements.size.disabled = customMode;
  elements.size
    .closest(".range-field")
    .classList.toggle("is-disabled", customMode);
}

function showCustomArrayError(message) {
  elements.customArrayError.textContent = message;
  elements.customArray.setAttribute("aria-invalid", "true");
}

function clearCustomArrayError() {
  elements.customArrayError.textContent = "";
  elements.customArray.removeAttribute("aria-invalid");
}

function rebuildSelectedSteps() {
  state.steps = buildSteps(state.baseArray, state.algorithm);
}

function rebuildCompareResults() {
  state.compareResults = ALGORITHM_KEYS.map((algorithm) => {
    const steps = buildSteps(state.baseArray, algorithm);
    const finalStep =
      steps.length > 0
        ? steps[steps.length - 1]
        : { comparisons: 0, writes: 0 };

    return {
      algorithm,
      name: META[algorithm].name,
      avg: META[algorithm].avg,
      stable: META[algorithm].stable,
      comparisons: finalStep.comparisons ?? 0,
      writes: finalStep.writes ?? 0,
      steps: steps.length,
    };
  });
}

function resetPlaybackState(message) {
  state.stepIndex = 0;
  state.stepHistory = [];
  renderBars({ array: state.baseArray });
  updateStats();
  updateSummary();
  renderStepExplanation();
  setStatus("ready");
  elements.logLine.textContent = message;
  elements.progressFill.style.width = "0%";
  updateControlState();
}

function renderRacePicker() {
  elements.racePicker.innerHTML = ALGORITHM_KEYS.map(
    (algorithm) => `
      <label class="race-option">
        <input
          type="checkbox"
          data-race-algo="${algorithm}"
          ${state.raceAlgorithms.includes(algorithm) ? "checked" : ""}
        />
        <span>${META[algorithm].name}</span>
      </label>
    `,
  ).join("");
}

function updateRaceSelection(algorithm, selected) {
  const nextSelection = selected
    ? [...new Set([...state.raceAlgorithms, algorithm])]
    : state.raceAlgorithms.filter((item) => item !== algorithm);

  if (nextSelection.length > 4) {
    elements.raceError.textContent = "Choose no more than four algorithms.";
    renderRacePicker();
    return;
  }

  state.raceAlgorithms = nextSelection;
  elements.raceError.textContent = "";
  resetRace("Race selection updated.");
}

function resetRace(message = "") {
  stopRace();
  state.raceFinishOrder = [];
  state.raceRunners = state.raceAlgorithms.map((algorithm) => ({
    algorithm,
    steps: buildSteps(state.baseArray, algorithm),
    stepIndex: 0,
    currentStep: {
      array: [...state.baseArray],
      comparisons: 0,
      writes: 0,
      swaps: 0,
    },
    finished: false,
    place: null,
  }));
  renderRace();
  if (message) {
    elements.raceResult.textContent = message;
  }
}

function startRace() {
  if (state.raceRunners.length < 2) {
    elements.raceError.textContent =
      "Choose at least two algorithms to start a race.";
    return;
  }

  if (state.raceRunners.every((runner) => runner.finished)) {
    resetRace();
  }

  elements.raceError.textContent = "";
  state.racePlaying = true;
  elements.racePlayButton.textContent = "Pause Race";
  runRaceTick();
}

function stopRace(status = "") {
  state.racePlaying = false;
  clearTimeout(state.raceTimerId);
  state.raceTimerId = null;
  if (status) {
    elements.raceResult.textContent = status;
  }
  if (elements.racePlayButton) {
    elements.racePlayButton.textContent =
      state.raceFinishOrder.length === state.raceRunners.length
        ? "Replay Race"
        : "Start Race";
  }
}

function runRaceTick() {
  if (!state.racePlaying) {
    return;
  }

  state.raceRunners.forEach((runner) => {
    if (runner.finished) {
      return;
    }

    const step = runner.steps[runner.stepIndex];
    if (!step) {
      finishRaceRunner(runner);
      return;
    }

    runner.currentStep = step;
    runner.stepIndex += 1;
    if (runner.stepIndex >= runner.steps.length) {
      finishRaceRunner(runner);
    }
  });

  renderRace();

  if (state.raceFinishOrder.length === state.raceRunners.length) {
    stopRace();
    return;
  }

  state.raceTimerId = setTimeout(runRaceTick, getDelay());
}

function finishRaceRunner(runner) {
  if (runner.finished) {
    return;
  }

  runner.finished = true;
  state.raceFinishOrder.push(runner.algorithm);
  runner.place = state.raceFinishOrder.length;
}

function renderRace() {
  if (!elements.raceGrid) {
    return;
  }

  if (state.raceRunners.length < 2) {
    elements.raceGrid.innerHTML = "";
    elements.raceResult.textContent =
      "Choose at least two algorithms to compare in a live race.";
    return;
  }

  const winner = state.raceRunners
    .filter((runner) => runner.finished)
    .sort((left, right) => left.steps.length - right.steps.length)[0];

  elements.raceResult.textContent =
    winner && state.raceFinishOrder.length === state.raceRunners.length
      ? `Winner: ${META[winner.algorithm].name} with the fewest recorded steps (${formatMetric(winner.steps.length)}).`
      : `Racing ${state.raceRunners.length} algorithms. Winner is decided by fewest recorded steps.`;

  elements.raceGrid.innerHTML = state.raceRunners
    .map((runner) => {
      const step = runner.currentStep;
      const placeLabel = runner.place
        ? `Finished — ${runner.place}${getOrdinalSuffix(runner.place)} place`
        : "Racing";
      const bars = renderRaceBars(step);
      return `
      <article class="race-panel${winner?.algorithm === runner.algorithm && state.raceFinishOrder.length === state.raceRunners.length ? " winner" : ""}${runner.finished ? " finished" : ""}">
        <div class="race-panel-head">
          <div>
            <p class="compare-rank">${placeLabel}</p>
            <h3>${META[runner.algorithm].name}</h3>
          </div>
          <span class="status-pill ${runner.finished ? "done" : state.racePlaying ? "running" : "ready"}">${runner.finished ? "Done" : state.racePlaying ? "Running" : "Ready"}</span>
        </div>
        <div class="race-bar-area" aria-label="${META[runner.algorithm].name} race chart">${bars}</div>
        <div class="race-metrics">
          <div><span>Comparisons</span><strong>${formatMetric(step.comparisons ?? 0)}</strong></div>
          <div><span>Swaps</span><strong>${formatMetric(step.swaps ?? 0)}</strong></div>
          <div><span>Steps</span><strong>${formatMetric(runner.stepIndex)} / ${formatMetric(runner.steps.length)}</strong></div>
        </div>
      </article>
    `;
    })
    .join("");
}

function renderRaceBars(step) {
  const array = step.array ?? state.baseArray;
  const minValue = Math.min(...array);
  const maxValue = Math.max(...array);
  const valueRange = maxValue - minValue;
  const comparing = new Set(step.comparing ?? []);
  const writing = new Set(step.writing ?? []);
  const sorted = new Set(step.sorted ?? []);
  const pivot = step.pivot ?? -1;
  const minIndex = step.minIndex ?? -1;

  return array
    .map((value, index) => {
      const height =
        valueRange === 0
          ? 55
          : Math.max(6, Math.round(((value - minValue) / valueRange) * 94) + 6);
      let className = "bar default";
      if (sorted.has(index)) className = "bar sorted";
      else if (writing.has(index)) className = "bar writing";
      else if (comparing.has(index)) className = "bar comparing";
      else if (index === pivot) className = "bar pivot";
      else if (index === minIndex) className = "bar min";
      return `<span class="${className}" style="height:${height}%" aria-label="Index ${index}, value ${value}"></span>`;
    })
    .join("");
}

function getOrdinalSuffix(place) {
  if (place % 100 >= 11 && place % 100 <= 13) return "th";
  return { 1: "st", 2: "nd", 3: "rd" }[place % 10] ?? "th";
}

function renderMeta() {
  const meta = META[state.algorithm];

  elements.activeAlgoLabel.textContent = meta.name;
  elements.complexityCard.innerHTML = `
    <h3>${meta.name}</h3>
    <div class="comp-row">
      <span class="comp-label">Best case</span>
      <span class="comp-val ${getComplexityClass(meta.best)}">${meta.best}</span>
    </div>
    <div class="comp-row">
      <span class="comp-label">Average case</span>
      <span class="comp-val ${getComplexityClass(meta.avg)}">${meta.avg}</span>
    </div>
    <div class="comp-row">
      <span class="comp-label">Worst case</span>
      <span class="comp-val ${getComplexityClass(meta.worst)}">${meta.worst}</span>
    </div>
    <div class="comp-row">
      <span class="comp-label">Space</span>
      <span class="comp-val ${getComplexityClass(meta.space)}">${meta.space}</span>
    </div>
    <div class="comp-row">
      <span class="comp-label">Stable</span>
      <span class="comp-val info">${meta.stable}</span>
    </div>
  `;

  elements.algoDesc.textContent = meta.desc;
  elements.algoSteps.innerHTML = meta.steps
    .map(
      (step, index) => `
        <li>
          <span class="step-num">${index + 1}</span>
          <span>${step}</span>
        </li>
      `,
    )
    .join("");

  elements.algoTags.innerHTML = meta.tags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");
}

function renderBars(step) {
  const array = step.array;
  const minValue = Math.min(...array);
  const maxValue = Math.max(...array);
  const valueRange = maxValue - minValue;
  const comparing = new Set(step.comparing ?? []);
  const writing = new Set(step.writing ?? []);
  const sorted = new Set(step.sorted ?? []);
  const pivot = step.pivot ?? -1;
  const minIndex = step.minIndex ?? -1;

  syncBarPool(array.length);

  array.forEach((value, index) => {
    const bar = barPool[index];
    const height =
      valueRange === 0
        ? 55
        : Math.max(6, Math.round(((value - minValue) / valueRange) * 94) + 6);
    let className = "bar default";

    if (sorted.has(index)) {
      className = "bar sorted";
    } else if (writing.has(index)) {
      className = "bar writing";
    } else if (comparing.has(index)) {
      className = "bar comparing";
    } else if (index === pivot) {
      className = "bar pivot";
    } else if (index === minIndex) {
      className = "bar min";
    }

    bar.className = className;
    bar.style.height = `${height}%`;
    bar.setAttribute("aria-label", `Index ${index}, value ${value}`);
  });
}

function syncBarPool(size) {
  if (barPool.length === size) {
    return;
  }

  barPool = [];
  elements.barArea.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < size; index += 1) {
    const bar = document.createElement("div");
    bar.className = "bar default";
    fragment.appendChild(bar);
    barPool.push(bar);
  }

  elements.barArea.appendChild(fragment);
}

function startPlayback() {
  if (state.viewMode !== "visualizer") {
    return;
  }

  if (state.stepIndex >= state.steps.length) {
    state.stepIndex = 0;
    state.stepHistory = [];
    renderStepExplanation();
  }

  state.playing = true;
  setStatus("running");
  updateControlState();

  const tick = () => {
    if (!state.playing) {
      return;
    }

    runStep();

    if (state.playing && state.stepIndex < state.steps.length) {
      state.timerId = setTimeout(tick, getDelay());
    }
  };

  tick();
}

function stopPlayback(status) {
  state.playing = false;
  clearTimeout(state.timerId);
  state.timerId = null;

  if (status) {
    setStatus(status.toLowerCase());
  } else if (state.stepIndex === 0) {
    setStatus("ready");
  } else if (state.stepIndex >= state.steps.length) {
    setStatus("done");
  } else {
    setStatus("paused");
  }

  updateControlState();
}

function runStep() {
  if (state.viewMode !== "visualizer") {
    return;
  }

  if (state.stepIndex >= state.steps.length) {
    stopPlayback("done");
    return;
  }

  const step = state.steps[state.stepIndex];
  state.stepIndex += 1;

  renderBars(step);
  elements.logLine.textContent = step.log;
  updateStats(step);
  renderStepExplanation(step);

  if (state.stepIndex >= state.steps.length) {
    stopPlayback("done");
  } else {
    setStatus("running");
    updateControlState();
  }
}

function updateStats(step) {
  const activeStep = step ?? { comparisons: 0, writes: 0 };

  elements.comparisons.textContent = formatMetric(activeStep.comparisons ?? 0);
  elements.writes.textContent = formatMetric(activeStep.writes ?? 0);
  elements.stepCount.textContent = formatMetric(state.stepIndex);
  elements.totalSteps.textContent = formatMetric(state.steps.length);

  const progress =
    state.steps.length === 0
      ? 0
      : Math.round((state.stepIndex / state.steps.length) * 100);

  elements.progressFill.style.width = `${progress}%`;
}

function updateSummary() {
  const inputLabel =
    state.preset === "custom"
      ? "Custom input"
      : `${getPresetLabel(state.preset)} input`;

  elements.inputSummary.textContent = `${inputLabel} · ${state.baseArray.length} bars`;
  elements.totalSteps.textContent = formatMetric(state.steps.length);
}

function renderStepExplanation(step) {
  const activeStep = step ?? { comparisons: 0, swaps: 0 };

  elements.stepComparisons.textContent = formatMetric(
    activeStep.comparisons ?? 0,
  );
  elements.stepSwaps.textContent = formatMetric(activeStep.swaps ?? 0);

  if (!step) {
    elements.stepExplanationTitle.textContent = "Waiting for a step";
    elements.stepCurrent.textContent = "Press Play or Step to begin.";
    elements.stepHistory.innerHTML = "";
    return;
  }

  const explanation = describeStep(step, state.stepIndex);
  elements.stepExplanationTitle.textContent = `Step ${state.stepIndex} of ${state.steps.length}`;
  elements.stepCurrent.textContent = explanation;
  state.stepHistory.push({ stepNumber: state.stepIndex, explanation });

  if (state.stepHistory.length > 10) {
    state.stepHistory.shift();
  }

  elements.stepHistory.innerHTML = state.stepHistory
    .map(
      (entry) =>
        `<li><span>${entry.stepNumber}</span><p>${entry.explanation.replace(/^Step \d+: /, "")}</p></li>`,
    )
    .join("");

  elements.stepHistory.scrollTop = elements.stepHistory.scrollHeight;
}

function describeStep(step, stepNumber) {
  const compared = step.comparing ?? [];
  const written = step.writing ?? [];

  if (compared.length >= 2) {
    const [left, right] = compared;
    return `Step ${stepNumber}: Comparing index ${left} (${step.array[left]}) and index ${right} (${step.array[right]}). ${step.log}`;
  }

  if (written.length >= 2) {
    const [left, right] = written;
    return `Step ${stepNumber}: Swapping index ${left} (${step.array[left]}) and index ${right} (${step.array[right]}). ${step.log}`;
  }

  return `Step ${stepNumber}: ${step.log}`;
}

function renderCompareMode() {
  if (!state.compareResults.length) {
    elements.compareSummary.innerHTML = "";
    elements.compareGrid.innerHTML = "";
    return;
  }

  const leaders = ["comparisons", "writes", "steps"]
    .map((metric) => ({ metric, result: getLeader(metric) }))
    .filter((item) => item.result);

  elements.compareSummary.innerHTML = leaders
    .map(
      ({ metric, result }) => `
        <article class="compare-callout">
          <span class="compare-callout-label">Lowest ${COMPARE_LABELS[metric]}</span>
          <strong>${result.name}</strong>
          <span>${formatMetric(result[metric])} ${COMPARE_LABELS[metric].toLowerCase()}</span>
        </article>
      `,
    )
    .join("");

  const ordered = [...state.compareResults].sort(compareByMetric);

  elements.compareGrid.innerHTML = ordered
    .map((result, index) => {
      const selected = result.algorithm === state.algorithm;
      const leader = index === 0;

      return `
        <article class="compare-item${selected ? " selected" : ""}${leader ? " leader" : ""}">
          <div class="compare-top">
            <div>
              <p class="compare-rank">#${index + 1} by ${COMPARE_LABELS[state.compareMetric].toLowerCase()}</p>
              <h3>${result.name}</h3>
            </div>
            <div class="compare-badge-row">
              <span class="compare-badge ${getComplexityClass(result.avg)}">${result.avg}</span>
              <span class="compare-badge plain">Stable: ${result.stable}</span>
            </div>
          </div>

          <div class="compare-metrics">
            <div class="compare-metric">
              <span>Comparisons</span>
              <strong>${formatMetric(result.comparisons)}</strong>
            </div>
            <div class="compare-metric">
              <span>Writes</span>
              <strong>${formatMetric(result.writes)}</strong>
            </div>
            <div class="compare-metric">
              <span>Steps</span>
              <strong>${formatMetric(result.steps)}</strong>
            </div>
          </div>

          <button class="mini-btn" type="button" data-open-algo="${result.algorithm}">
            ${selected ? "Open Current Algorithm" : "Open in Visualizer"}
          </button>
        </article>
      `;
    })
    .join("");
}

function openAlgorithmFromCompare(algorithm) {
  if (!META[algorithm]) {
    return;
  }

  if (algorithm !== state.algorithm) {
    switchAlgorithm(algorithm);
    elements.logLine.textContent = `Loaded ${META[algorithm].name} in the visualizer with the same input array.`;
  } else {
    resetPlaybackState(
      `Loaded ${META[algorithm].name} in the visualizer with the same input array.`,
    );
  }

  setViewMode("visualizer");
}

function getLeader(metric) {
  return [...state.compareResults].sort((left, right) =>
    compareByMetric(left, right, metric),
  )[0];
}

function compareByMetric(left, right, metricOverride) {
  const metric = metricOverride ?? state.compareMetric;

  if (left[metric] !== right[metric]) {
    return left[metric] - right[metric];
  }

  if (left.steps !== right.steps) {
    return left.steps - right.steps;
  }

  if (left.comparisons !== right.comparisons) {
    return left.comparisons - right.comparisons;
  }

  if (left.writes !== right.writes) {
    return left.writes - right.writes;
  }

  return left.name.localeCompare(right.name);
}

function setStatus(status) {
  const labels = {
    ready: "Ready",
    running: "Running",
    paused: "Paused",
    done: "Done",
  };

  elements.status.textContent = labels[status] ?? "Ready";
  elements.status.className = `status-pill ${status}`;
}

function updateControlState() {
  const playbackComplete =
    state.stepIndex >= state.steps.length && state.steps.length > 0;
  const visualizerDisabled = state.viewMode !== "visualizer";

  elements.playButton.textContent = state.playing
    ? "Pause"
    : playbackComplete
      ? "Replay"
      : "Play";

  elements.playButton.disabled = visualizerDisabled || state.steps.length === 0;
  elements.playButton.setAttribute("aria-pressed", String(state.playing));
  elements.stepButton.disabled =
    visualizerDisabled ||
    state.playing ||
    playbackComplete ||
    state.steps.length === 0;
  elements.restartButton.disabled =
    visualizerDisabled || state.steps.length === 0;
}

function syncControls() {
  elements.speed.value = String(state.speed);
  elements.size.value = String(state.size);
  elements.speedValue.textContent = `${state.speed}x`;
  elements.sizeValue.textContent = `${state.size} bars`;
  elements.compareMetric.value = state.compareMetric;
  syncCustomArrayControls();
}

function getDelay() {
  return Math.max(80, 860 - state.speed * 75);
}

function formatMetric(value) {
  return Number(value).toLocaleString("en-US");
}
