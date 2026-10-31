import { META } from './data.js';

const DETAILS = {
  bubble: {
    what: 'Bubble Sort repeatedly compares neighboring values. If they are in the wrong order, it swaps them. Large values gradually move, or “bubble,” toward the end.',
    use: ['Teaching the basic idea of sorting', 'Very small or nearly sorted arrays', 'Situations where simple code is more important than speed'],
    example: 'For [5, 2, 4], compare 5 and 2 and swap them. Then compare 5 and 4 and swap them. The largest value, 5, has reached the end.',
    figure: [['5', '2', '4'], ['2', '5', '4'], ['2', '4', '5']],
    note: 'It is easy to understand, but usually not efficient for large arrays.'
  },
  selection: {
    what: 'Selection Sort divides the array into sorted and unsorted regions. It finds the smallest unsorted value and places it at the next sorted position.',
    use: ['Small arrays', 'When minimizing swaps matters', 'Learning how a selection process works'],
    example: 'For [5, 2, 4], find the smallest value 2 and place it first. Then find 4 in the remaining values and place it second.',
    figure: [['5', '2', '4'], ['2', '5', '4'], ['2', '4', '5']],
    note: 'It performs few swaps, but still makes many comparisons.'
  },
  insertion: {
    what: 'Insertion Sort builds a sorted section one value at a time. Each new value is shifted left until it reaches its correct position.',
    use: ['Small arrays', 'Nearly sorted data', 'Online data where values arrive one by one'],
    example: 'Start with [5] as sorted. Insert 2 before 5, then insert 4 between 2 and 5 to produce [2, 4, 5].',
    figure: [['5', '2', '4'], ['2', '5', '4'], ['2', '4', '5']],
    note: 'It can be very fast when the input is already close to sorted.'
  },
  shell: {
    what: 'Shell Sort is an improved form of insertion sort. It first compares values separated by a gap, then reduces the gap until it finishes with gap 1.',
    use: ['Medium-sized arrays', 'In-place sorting with limited memory', 'Improving insertion sort for less ordered data'],
    example: 'With a gap of 2, compare values that are two positions apart. Smaller gaps gradually bring values closer to their final positions.',
    figure: [['8', '3', '7', '4'], ['7', '3', '8', '4'], ['3', '4', '7', '8']],
    note: 'Its exact performance depends on the chosen gap sequence.'
  },
  merge: {
    what: 'Merge Sort divides the array into smaller halves, sorts those halves, and merges them back together in order.',
    use: ['Large datasets', 'Predictable O(n log n) performance', 'Stable sorting when equal values must keep their order'],
    example: 'Split [5, 2, 4, 1] into [5, 2] and [4, 1]. Sort each half, then merge [2, 5] and [1, 4] into [1, 2, 4, 5].',
    figure: [['5', '2', '4', '1'], ['2', '5', '1', '4'], ['1', '2', '4', '5']],
    note: 'It needs extra memory for the temporary arrays used during merging.'
  },
  quick: {
    what: 'Quick Sort chooses a pivot and partitions the array so smaller values move to one side and larger values move to the other. It then sorts each partition.',
    use: ['General-purpose in-memory sorting', 'Fast average performance', 'In-place partitioning'],
    example: 'Choose 4 as a pivot in [5, 2, 4]. Move 2 before it and 5 after it, then recursively sort the smaller partitions.',
    figure: [['5', '2', '4'], ['2', '4', '5'], ['2', '4', '5']],
    note: 'A poor pivot choice can create the O(n²) worst case.'
  },
  heap: {
    what: 'Heap Sort builds a max heap, where the largest value is at the root. It repeatedly moves that root to the end and restores the heap.',
    use: ['Predictable O(n log n) performance', 'In-place sorting', 'When extra memory should stay small'],
    example: 'Build a max heap from [5, 2, 4]. Move the largest root to the end, shrink the heap, and repeat until sorted.',
    figure: [['5', '2', '4'], ['4', '2', '5'], ['2', '4', '5']],
    note: 'It has reliable performance, but is usually less cache-friendly than Quick Sort.'
  }
};

const algorithm = new URLSearchParams(window.location.search).get('algorithm');
const key = META[algorithm] && DETAILS[algorithm] ? algorithm : 'bubble';
const meta = META[key];
const detail = DETAILS[key];

document.title = `DSA Genie AI | ${meta.name}`;
document.getElementById('algorithm-title').textContent = meta.name;
document.getElementById('algorithm-intro').textContent = meta.desc;
document.getElementById('what-title').textContent = meta.name;
document.getElementById('what-text').textContent = detail.what;
document.getElementById('use-list').innerHTML = detail.use.map((item) => `<li>${item}</li>`).join('');
document.getElementById('example-text').textContent = detail.example;
document.getElementById('example-label').textContent = `${meta.name} example`;
document.getElementById('how-list').innerHTML = meta.steps.map((step, index) => `<li><span class="step-num">${index + 1}</span><span>${step}</span></li>`).join('');
document.getElementById('best-note').textContent = detail.note;
document.getElementById('visualize-link').href = `lab.html?algorithm=${key}`;
document.getElementById('algorithm-badges').innerHTML = [
  ['Best', meta.best],
  ['Average', meta.avg],
  ['Worst', meta.worst],
  ['Space', meta.space],
  ['Stable', meta.stable]
].map(([label, value]) => `<div class="algorithm-badge"><span>${label}</span><strong>${value}</strong></div>`).join('');
document.getElementById('complexity').innerHTML = [
  ['Best case', meta.best],
  ['Average case', meta.avg],
  ['Worst case', meta.worst],
  ['Space', meta.space],
  ['Stable', meta.stable]
].map(([label, value]) => `<div class="comp-row"><span class="comp-label">${label}</span><span class="comp-val info">${value}</span></div>`).join('');
document.getElementById('example-figure').innerHTML = detail.figure.map((row, rowIndex) => `
  <div class="example-step">
    <span class="example-step-label">Step ${rowIndex + 1}</span>
    <div class="example-values">${row.map((value, index) => `<span class="example-value${rowIndex === detail.figure.length - 1 ? ' final' : ''}" style="height:${28 + Number(value) * 7}px">${value}</span>`).join('')}</div>
    ${rowIndex < detail.figure.length - 1 ? '<span class="example-arrow" aria-hidden="true">→</span>' : ''}
  </div>
`).join('');
