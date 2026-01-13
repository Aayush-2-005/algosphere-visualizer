export interface SearchStep {
  type: 'check' | 'found' | 'not-found' | 'eliminate' | 'jump';
  index: number;
  low?: number;
  high?: number;
  mid?: number;
  jumpTo?: number;
  description: string;
}

export function* linearSearch(arr: number[], target: number): Generator<SearchStep> {
  for (let i = 0; i < arr.length; i++) {
    yield {
      type: 'check',
      index: i,
      description: `Checking index ${i}: Is ${arr[i]} equal to ${target}?`,
    };

    if (arr[i] === target) {
      yield {
        type: 'found',
        index: i,
        description: `Found ${target} at index ${i}!`,
      };
      return;
    }
  }

  yield {
    type: 'not-found',
    index: -1,
    description: `${target} was not found in the array.`,
  };
}

export function* binarySearch(arr: number[], target: number): Generator<SearchStep> {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    yield {
      type: 'check',
      index: mid,
      low,
      high,
      mid,
      description: `Checking middle index ${mid}: Is ${arr[mid]} equal to ${target}?`,
    };

    if (arr[mid] === target) {
      yield {
        type: 'found',
        index: mid,
        low,
        high,
        mid,
        description: `Found ${target} at index ${mid}!`,
      };
      return;
    } else if (arr[mid] < target) {
      yield {
        type: 'eliminate',
        index: mid,
        low,
        high,
        mid,
        description: `${arr[mid]} < ${target}, eliminating left half. New range: [${mid + 1}, ${high}]`,
      };
      low = mid + 1;
    } else {
      yield {
        type: 'eliminate',
        index: mid,
        low,
        high,
        mid,
        description: `${arr[mid]} > ${target}, eliminating right half. New range: [${low}, ${mid - 1}]`,
      };
      high = mid - 1;
    }
  }

  yield {
    type: 'not-found',
    index: -1,
    description: `${target} was not found in the array.`,
  };
}

export function* jumpSearch(arr: number[], target: number): Generator<SearchStep> {
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  let prev = 0;

  // Finding the block where element is present
  while (arr[Math.min(step, n) - 1] < target) {
    yield {
      type: 'jump',
      index: Math.min(step, n) - 1,
      jumpTo: prev,
      description: `Jumping: ${arr[Math.min(step, n) - 1]} < ${target}, jump to next block`,
    };
    prev = step;
    if (prev >= n) {
      yield {
        type: 'not-found',
        index: -1,
        description: `${target} was not found in the array.`,
      };
      return;
    }
  }

  // Linear search in the block
  while (arr[prev] < target) {
    yield {
      type: 'check',
      index: prev,
      description: `Linear search in block: checking index ${prev}, ${arr[prev]} < ${target}`,
    };
    prev++;
    if (prev === Math.min(step, n)) {
      yield {
        type: 'not-found',
        index: -1,
        description: `${target} was not found in the array.`,
      };
      return;
    }
  }

  yield {
    type: 'check',
    index: prev,
    description: `Checking index ${prev}: Is ${arr[prev]} equal to ${target}?`,
  };

  if (arr[prev] === target) {
    yield {
      type: 'found',
      index: prev,
      description: `Found ${target} at index ${prev}!`,
    };
  } else {
    yield {
      type: 'not-found',
      index: -1,
      description: `${target} was not found in the array.`,
    };
  }
}

export function* exponentialSearch(arr: number[], target: number): Generator<SearchStep> {
  const n = arr.length;

  if (arr[0] === target) {
    yield {
      type: 'found',
      index: 0,
      description: `Found ${target} at index 0!`,
    };
    return;
  }

  let i = 1;
  while (i < n && arr[i] <= target) {
    yield {
      type: 'jump',
      index: i,
      description: `Exponential jump: checking index ${i}, value ${arr[i]}`,
    };
    i *= 2;
  }

  // Binary search in the found range
  let low = Math.floor(i / 2);
  let high = Math.min(i, n - 1);

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    yield {
      type: 'check',
      index: mid,
      low,
      high,
      mid,
      description: `Binary search: checking middle index ${mid}`,
    };

    if (arr[mid] === target) {
      yield {
        type: 'found',
        index: mid,
        description: `Found ${target} at index ${mid}!`,
      };
      return;
    } else if (arr[mid] < target) {
      yield {
        type: 'eliminate',
        index: mid,
        low,
        high,
        description: `${arr[mid]} < ${target}, search right half`,
      };
      low = mid + 1;
    } else {
      yield {
        type: 'eliminate',
        index: mid,
        low,
        high,
        description: `${arr[mid]} > ${target}, search left half`,
      };
      high = mid - 1;
    }
  }

  yield {
    type: 'not-found',
    index: -1,
    description: `${target} was not found in the array.`,
  };
}

export function* ternarySearch(arr: number[], target: number): Generator<SearchStep> {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid1 = low + Math.floor((high - low) / 3);
    const mid2 = high - Math.floor((high - low) / 3);

    yield {
      type: 'check',
      index: mid1,
      low,
      high,
      mid: mid1,
      description: `Checking first third at index ${mid1}: ${arr[mid1]}`,
    };

    if (arr[mid1] === target) {
      yield {
        type: 'found',
        index: mid1,
        description: `Found ${target} at index ${mid1}!`,
      };
      return;
    }

    yield {
      type: 'check',
      index: mid2,
      low,
      high,
      mid: mid2,
      description: `Checking second third at index ${mid2}: ${arr[mid2]}`,
    };

    if (arr[mid2] === target) {
      yield {
        type: 'found',
        index: mid2,
        description: `Found ${target} at index ${mid2}!`,
      };
      return;
    }

    if (target < arr[mid1]) {
      yield {
        type: 'eliminate',
        index: mid1,
        low,
        high,
        description: `Target ${target} < ${arr[mid1]}, search first third [${low}, ${mid1 - 1}]`,
      };
      high = mid1 - 1;
    } else if (target > arr[mid2]) {
      yield {
        type: 'eliminate',
        index: mid2,
        low,
        high,
        description: `Target ${target} > ${arr[mid2]}, search third third [${mid2 + 1}, ${high}]`,
      };
      low = mid2 + 1;
    } else {
      yield {
        type: 'eliminate',
        index: mid1,
        low,
        high,
        description: `Target in middle third [${mid1 + 1}, ${mid2 - 1}]`,
      };
      low = mid1 + 1;
      high = mid2 - 1;
    }
  }

  yield {
    type: 'not-found',
    index: -1,
    description: `${target} was not found in the array.`,
  };
}
