export interface SearchStep {
  type: 'check' | 'found' | 'not-found' | 'eliminate';
  index: number;
  low?: number;
  high?: number;
  mid?: number;
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
