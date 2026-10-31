export function buildSteps(baseArray, algorithm) {
  const workingArray = [...baseArray];
  const recorder = createRecorder();

  const algorithmMap = {
    bubble: runBubble,
    selection: runSelection,
    insertion: runInsertion,
    shell: runShell,
    merge: runMerge,
    quick: runQuick,
    heap: runHeap
  };

  const sorter = algorithmMap[algorithm] ?? runBubble;
  sorter(workingArray, recorder);

  recorder.push(workingArray, {
    sorted: allIndices(workingArray.length),
    log: 'Sorting complete.'
  });

  return recorder.steps;
}

function createRecorder() {
  const steps = [];
  let comparisons = 0;
  let writes = 0;
  let swaps = 0;

  return {
    steps,
    compare(amount = 1) {
      comparisons += amount;
    },
    write(amount = 1) {
      writes += amount;
    },
    swap() {
      swaps += 1;
    },
    push(array, details = {}) {
      steps.push({
        array: [...array],
        comparing: details.comparing ?? [],
        writing: details.writing ?? [],
        sorted: details.sorted ?? [],
        pivot: details.pivot ?? -1,
        minIndex: details.minIndex ?? -1,
        log: details.log ?? '',
        comparisons,
        writes,
        swaps
      });
    }
  };
}

function runBubble(array, recorder) {
  const sorted = new Set();
  const total = array.length;

  for (let pass = 0; pass < total - 1; pass += 1) {
    let swapped = false;

    for (let index = 0; index < total - pass - 1; index += 1) {
      recorder.compare();
      recorder.push(array, {
        comparing: [index, index + 1],
        sorted: toSortedArray(sorted),
        log: `Compare ${array[index]} and ${array[index + 1]}.`
      });

      if (array[index] > array[index + 1]) {
        [array[index], array[index + 1]] = [array[index + 1], array[index]];
        recorder.write(2);
        recorder.swap();
        swapped = true;

        recorder.push(array, {
          writing: [index, index + 1],
          sorted: toSortedArray(sorted),
          log: `Swap them so ${array[index]} moves left and ${array[index + 1]} moves right.`
        });
      }
    }

    sorted.add(total - pass - 1);

    if (!swapped) {
      recorder.push(array, {
        sorted: allIndices(total),
        log: 'No swap happened in this pass, so the array is already sorted.'
      });
      return;
    }
  }
}

function runSelection(array, recorder) {
  const sorted = new Set();

  for (let start = 0; start < array.length - 1; start += 1) {
    let minIndex = start;

    recorder.push(array, {
      minIndex,
      sorted: toSortedArray(sorted),
      log: `Start a new scan at index ${start}.`
    });

    for (let scan = start + 1; scan < array.length; scan += 1) {
      recorder.compare();
      recorder.push(array, {
        comparing: [minIndex, scan],
        minIndex,
        sorted: toSortedArray(sorted),
        log: `Check whether ${array[scan]} is smaller than the current minimum ${array[minIndex]}.`
      });

      if (array[scan] < array[minIndex]) {
        minIndex = scan;
        recorder.push(array, {
          minIndex,
          sorted: toSortedArray(sorted),
          log: `New minimum found at index ${minIndex}.`
        });
      }
    }

    if (minIndex !== start) {
      [array[start], array[minIndex]] = [array[minIndex], array[start]];
      recorder.write(2);
      recorder.swap();

      recorder.push(array, {
        writing: [start, minIndex],
        sorted: toSortedArray(sorted),
        log: `Place the minimum value ${array[start]} into index ${start}.`
      });
    } else {
      recorder.push(array, {
        minIndex: start,
        sorted: toSortedArray(sorted),
        log: `Index ${start} already holds the smallest remaining value.`
      });
    }

    sorted.add(start);
  }
}

function runInsertion(array, recorder) {
  for (let index = 1; index < array.length; index += 1) {
    const key = array[index];
    let position = index - 1;
    const sortedPrefix = indexRange(0, index - 1);

    recorder.push(array, {
      comparing: [index],
      sorted: sortedPrefix,
      log: `Pick ${key} as the next key to insert.`
    });

    while (position >= 0) {
      recorder.compare();
      recorder.push(array, {
        comparing: [position, position + 1],
        sorted: sortedPrefix,
        log: `Compare key ${key} with ${array[position]}.`
      });

      if (array[position] <= key) {
        recorder.push(array, {
          comparing: [position],
          sorted: sortedPrefix,
          log: `${array[position]} is not greater than ${key}, so insertion can stop here.`
        });
        break;
      }

      array[position + 1] = array[position];
      recorder.write();

      recorder.push(array, {
        writing: [position, position + 1],
        sorted: sortedPrefix,
        log: `Shift ${array[position + 1]} one slot to the right.`
      });

      position -= 1;
    }

    if (position + 1 !== index) {
      array[position + 1] = key;
      recorder.write();

      recorder.push(array, {
        writing: [position + 1],
        sorted: indexRange(0, index),
        log: `Insert ${key} at index ${position + 1}.`
      });
    } else {
      recorder.push(array, {
        sorted: indexRange(0, index),
        log: `${key} was already in the correct position.`
      });
    }
  }
}

function runShell(array, recorder) {
  const total = array.length;

  for (let gap = Math.floor(total / 2); gap > 0; gap = Math.floor(gap / 2)) {
    recorder.push(array, {
      log: `Start a Shell Sort pass with gap ${gap}.`
    });

    for (let index = gap; index < total; index += 1) {
      const value = array[index];
      let position = index;

      recorder.push(array, {
        comparing: [index],
        log: `Take ${value} from index ${index} and compare it using gap ${gap}.`
      });

      while (position >= gap) {
        recorder.compare();
        recorder.push(array, {
          comparing: [position - gap, position],
          log: `Compare ${array[position - gap]} with gapped value ${value}.`
        });

        if (array[position - gap] <= value) {
          break;
        }

        array[position] = array[position - gap];
        recorder.write();

        recorder.push(array, {
          writing: [position - gap, position],
          log: `Shift ${array[position]} from index ${position - gap} to index ${position}.`
        });

        position -= gap;
      }

      if (position !== index) {
        array[position] = value;
        recorder.write();

        recorder.push(array, {
          writing: [position],
          log: `Insert ${value} into index ${position} for gap ${gap}.`
        });
      } else {
        recorder.push(array, {
          log: `${value} stays in place for the current gap ${gap}.`
        });
      }
    }
  }
}

function runMerge(array, recorder) {
  mergeSort(array, 0, array.length - 1, recorder);
}

function mergeSort(array, left, right, recorder) {
  if (left >= right) {
    return;
  }

  const middle = Math.floor((left + right) / 2);

  recorder.push(array, {
    comparing: [left, right],
    log: `Split range ${left}-${right} around middle index ${middle}.`
  });

  mergeSort(array, left, middle, recorder);
  mergeSort(array, middle + 1, right, recorder);
  merge(array, left, middle, right, recorder);
}

function merge(array, left, middle, right, recorder) {
  const leftHalf = array.slice(left, middle + 1);
  const rightHalf = array.slice(middle + 1, right + 1);
  let leftIndex = 0;
  let rightIndex = 0;
  let writeIndex = left;

  while (leftIndex < leftHalf.length && rightIndex < rightHalf.length) {
    recorder.compare();
    recorder.push(array, {
      comparing: [writeIndex],
      log: `Compare ${leftHalf[leftIndex]} from the left half with ${rightHalf[rightIndex]} from the right half.`
    });

    if (leftHalf[leftIndex] <= rightHalf[rightIndex]) {
      array[writeIndex] = leftHalf[leftIndex];
      leftIndex += 1;
    } else {
      array[writeIndex] = rightHalf[rightIndex];
      rightIndex += 1;
    }

    recorder.write();
    recorder.push(array, {
      writing: [writeIndex],
      log: `Write ${array[writeIndex]} into index ${writeIndex}.`
    });

    writeIndex += 1;
  }

  while (leftIndex < leftHalf.length) {
    array[writeIndex] = leftHalf[leftIndex];
    leftIndex += 1;
    recorder.write();

    recorder.push(array, {
      writing: [writeIndex],
      log: `Copy leftover value ${array[writeIndex]} from the left half into index ${writeIndex}.`
    });

    writeIndex += 1;
  }

  while (rightIndex < rightHalf.length) {
    array[writeIndex] = rightHalf[rightIndex];
    rightIndex += 1;
    recorder.write();

    recorder.push(array, {
      writing: [writeIndex],
      log: `Copy leftover value ${array[writeIndex]} from the right half into index ${writeIndex}.`
    });

    writeIndex += 1;
  }
}

function runQuick(array, recorder) {
  const locked = new Set();
  quickSort(array, 0, array.length - 1, recorder, locked);
}

function quickSort(array, low, high, recorder, locked) {
  if (low > high) {
    return;
  }

  if (low === high) {
    locked.add(low);
    return;
  }

  const pivotIndex = partition(array, low, high, recorder, locked);
  locked.add(pivotIndex);
  quickSort(array, low, pivotIndex - 1, recorder, locked);
  quickSort(array, pivotIndex + 1, high, recorder, locked);
}

function partition(array, low, high, recorder, locked) {
  const pivotValue = array[high];
  let boundary = low;

  recorder.push(array, {
    pivot: high,
    sorted: toSortedArray(locked),
    log: `Choose ${pivotValue} as the pivot.`
  });

  for (let index = low; index < high; index += 1) {
    recorder.compare();
    recorder.push(array, {
      comparing: [index, high],
      pivot: high,
      sorted: toSortedArray(locked),
      log: `Check whether ${array[index]} belongs on the left side of pivot ${pivotValue}.`
    });

    if (array[index] <= pivotValue) {
      if (boundary !== index) {
        [array[boundary], array[index]] = [array[index], array[boundary]];
        recorder.write(2);
        recorder.swap();

        recorder.push(array, {
          writing: [boundary, index],
          pivot: high,
          sorted: toSortedArray(locked),
          log: `Move ${array[boundary]} into the left partition.`
        });
      } else {
        recorder.push(array, {
          comparing: [index],
          pivot: high,
          sorted: toSortedArray(locked),
          log: `${array[index]} is already in the left partition.`
        });
      }

      boundary += 1;
    }
  }

  if (boundary !== high) {
    [array[boundary], array[high]] = [array[high], array[boundary]];
    recorder.write(2);
    recorder.swap();

    recorder.push(array, {
      writing: [boundary, high],
      sorted: toSortedArray(locked),
      log: `Place pivot ${pivotValue} into its final index ${boundary}.`
    });
  } else {
    recorder.push(array, {
      pivot: boundary,
      sorted: toSortedArray(locked),
      log: `Pivot ${pivotValue} is already in the correct final position.`
    });
  }

  return boundary;
}

function runHeap(array, recorder) {
  const sorted = new Set();
  const total = array.length;

  recorder.push(array, {
    log: 'Build a max heap from the input array.'
  });

  for (let root = Math.floor(total / 2) - 1; root >= 0; root -= 1) {
    heapify(array, total, root, recorder, sorted);
  }

  for (let end = total - 1; end > 0; end -= 1) {
    [array[0], array[end]] = [array[end], array[0]];
    recorder.write(2);
    recorder.swap();
    sorted.add(end);

    recorder.push(array, {
      writing: [0, end],
      sorted: toSortedArray(sorted),
      log: `Move the current maximum ${array[end]} to sorted index ${end}.`
    });

    heapify(array, end, 0, recorder, sorted);
  }
}

function heapify(array, heapSize, root, recorder, sorted) {
  let current = root;

  while (true) {
    let largest = current;
    const left = current * 2 + 1;
    const right = left + 1;

    if (left < heapSize) {
      recorder.compare();
      recorder.push(array, {
        comparing: [largest, left],
        sorted: toSortedArray(sorted),
        log: `Compare parent ${array[largest]} with left child ${array[left]}.`
      });

      if (array[left] > array[largest]) {
        largest = left;
      }
    }

    if (right < heapSize) {
      recorder.compare();
      recorder.push(array, {
        comparing: [largest, right],
        sorted: toSortedArray(sorted),
        log: `Compare current largest ${array[largest]} with right child ${array[right]}.`
      });

      if (array[right] > array[largest]) {
        largest = right;
      }
    }

    if (largest === current) {
      break;
    }

    [array[current], array[largest]] = [array[largest], array[current]];
    recorder.write(2);
    recorder.swap();

    recorder.push(array, {
      writing: [current, largest],
      sorted: toSortedArray(sorted),
      log: `Swap indices ${current} and ${largest} to restore max-heap order.`
    });

    current = largest;
  }
}

function allIndices(length) {
  return Array.from({ length }, (_, index) => index);
}

function indexRange(start, end) {
  if (end < start) {
    return [];
  }

  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
}

function toSortedArray(indexSet) {
  return [...indexSet].sort((left, right) => left - right);
}
