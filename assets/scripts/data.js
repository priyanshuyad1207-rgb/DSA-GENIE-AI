export const DEFAULT_ALGORITHM = 'bubble';
export const DEFAULT_PRESET = 'random';
export const DEFAULT_SIZE = 30;
export const DEFAULT_SPEED = 5;

export const ALGORITHM_KEYS = [
  'bubble',
  'selection',
  'insertion',
  'shell',
  'merge',
  'quick',
  'heap'
];

export const META = {
  bubble: {
    name: 'Bubble Sort',
    desc: 'Bubble Sort repeatedly compares neighboring values and swaps them when they are out of order. After every pass, the largest remaining value settles at the end.',
    steps: [
      'Walk through the array from left to right.',
      'Compare each pair of neighbors.',
      'Swap neighbors when the left value is larger.',
      'After each pass, the biggest unsorted value is fixed at the end.',
      'Stop early if a full pass finishes without any swap.'
    ],
    best: 'O(n)',
    avg: 'O(n^2)',
    worst: 'O(n^2)',
    space: 'O(1)',
    stable: 'Yes',
    tags: ['Small arrays', 'Learning fundamentals', 'Nearly sorted input']
  },
  selection: {
    name: 'Selection Sort',
    desc: 'Selection Sort scans the unsorted region to find the minimum value, then places that value at the next open spot in the sorted region.',
    steps: [
      'Treat the left side as the sorted region.',
      'Search the unsorted region for the smallest value.',
      'Remember the current minimum while scanning.',
      'Swap the minimum into the first unsorted position.',
      'Grow the sorted region by one item.'
    ],
    best: 'O(n^2)',
    avg: 'O(n^2)',
    worst: 'O(n^2)',
    space: 'O(1)',
    stable: 'No',
    tags: ['Minimal extra memory', 'Small arrays', 'Low swap count']
  },
  insertion: {
    name: 'Insertion Sort',
    desc: 'Insertion Sort builds a sorted prefix one value at a time. It takes the next value, shifts larger values to the right, and inserts the key where it belongs.',
    steps: [
      'Start with the first value as a sorted prefix.',
      'Pick the next value as the key.',
      'Move left through the sorted prefix.',
      'Shift larger values one slot to the right.',
      'Insert the key into the gap that remains.'
    ],
    best: 'O(n)',
    avg: 'O(n^2)',
    worst: 'O(n^2)',
    space: 'O(1)',
    stable: 'Yes',
    tags: ['Nearly sorted input', 'Online insertion', 'Small collections']
  },
  shell: {
    name: 'Shell Sort',
    desc: 'Shell Sort improves insertion sort by comparing values far apart first. As the gap shrinks, the array becomes more ordered before a final insertion-style pass.',
    steps: [
      'Choose a gap and compare values that far apart.',
      'Run a gapped insertion sort for that gap.',
      'Shrink the gap and repeat.',
      'Use the final gap of 1 to finish with insertion sort behavior.'
    ],
    best: 'O(n log n)',
    avg: '~O(n^1.5)',
    worst: 'O(n^2)',
    space: 'O(1)',
    stable: 'No',
    tags: ['Medium-sized arrays', 'In-place sorting', 'Gap-based optimization']
  },
  merge: {
    name: 'Merge Sort',
    desc: 'Merge Sort splits the array into halves, sorts each half recursively, and then merges the sorted halves into one ordered result.',
    steps: [
      'Split the array into two halves.',
      'Sort the left half recursively.',
      'Sort the right half recursively.',
      'Compare the front values of both halves.',
      'Write the smaller value into the merged output.'
    ],
    best: 'O(n log n)',
    avg: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    stable: 'Yes',
    tags: ['Reliable performance', 'Large datasets', 'Stable sorting']
  },
  quick: {
    name: 'Quick Sort',
    desc: 'Quick Sort chooses a pivot, partitions values around it, and then recursively sorts the smaller left and right partitions.',
    steps: [
      'Choose a pivot value.',
      'Partition values so smaller ones move left.',
      'Place the pivot into its final sorted index.',
      'Recursively sort the left partition.',
      'Recursively sort the right partition.'
    ],
    best: 'O(n log n)',
    avg: 'O(n log n)',
    worst: 'O(n^2)',
    space: 'O(log n)',
    stable: 'No',
    tags: ['General purpose', 'In-place partitioning', 'Fast average case']
  },
  heap: {
    name: 'Heap Sort',
    desc: 'Heap Sort first builds a max heap so the largest value stays at the root. It then repeatedly moves that root to the end and restores the heap on the remaining values.',
    steps: [
      'Build a max heap from the input array.',
      'Swap the heap root with the last unsorted value.',
      'Shrink the heap boundary by one.',
      'Heapify the root again to restore max-heap order.',
      'Repeat until only one value remains.'
    ],
    best: 'O(n log n)',
    avg: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(1)',
    stable: 'No',
    tags: ['Predictable performance', 'In-place sorting', 'Heap-based selection']
  }
};

export const PRESET_OPTIONS = [
  { value: 'random', label: 'Random' },
  { value: 'nearly-sorted', label: 'Nearly sorted' },
  { value: 'reversed', label: 'Reversed' },
  { value: 'few-unique', label: 'Few unique values' },
  { value: 'custom', label: 'Custom Array' }
];

const MIN_VALUE = 14;
const MAX_VALUE = 96;

export function createArray(size, preset) {
  switch (preset) {
    case 'nearly-sorted':
      return createNearlySortedArray(size);
    case 'reversed':
      return createDistributedArray(size).reverse();
    case 'few-unique':
      return createFewUniqueArray(size);
    case 'random':
    default:
      return createRandomArray(size);
  }
}

export function getComplexityClass(value) {
  if (value.includes('n^2')) {
    return 'bad';
  }

  if (value.includes('n log') || value.includes('n^1.')) {
    return 'avg';
  }

  if (value === 'O(n)' || value === 'O(1)' || value === 'O(log n)') {
    return 'good';
  }

  return 'info';
}

export function getPresetLabel(value) {
  return PRESET_OPTIONS.find((option) => option.value === value)?.label ?? 'Random';
}

function createRandomArray(size) {
  return Array.from({ length: size }, () => randomInt(MIN_VALUE, MAX_VALUE));
}

function createNearlySortedArray(size) {
  const array = createDistributedArray(size);
  const swapCount = Math.max(1, Math.floor(size / 7));

  for (let index = 0; index < swapCount; index += 1) {
    const left = randomInt(0, size - 1);
    const right = randomInt(0, size - 1);
    [array[left], array[right]] = [array[right], array[left]];
  }

  return array;
}

function createFewUniqueArray(size) {
  const pool = [18, 30, 42, 54, 66, 78, 90];
  return Array.from({ length: size }, () => pool[randomInt(0, pool.length - 1)]);
}

function createDistributedArray(size) {
  if (size <= 1) {
    return [MAX_VALUE];
  }

  return Array.from({ length: size }, (_, index) => {
    const progress = index / (size - 1);
    return Math.round(MIN_VALUE + progress * (MAX_VALUE - MIN_VALUE));
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
