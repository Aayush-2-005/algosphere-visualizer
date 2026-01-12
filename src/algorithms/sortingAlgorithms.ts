export interface SortingStep {
  type: 'compare' | 'swap' | 'sorted' | 'set';
  indices: number[];
  values?: number[];
  description: string;
}

export function* bubbleSort(arr: number[]): Generator<SortingStep> {
  const n = arr.length;
  const array = [...arr];
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield {
        type: 'compare',
        indices: [j, j + 1],
        description: `Comparing elements at index ${j} and ${j + 1}`,
      };
      
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        yield {
          type: 'swap',
          indices: [j, j + 1],
          description: `Swapping ${array[j + 1]} and ${array[j]}`,
        };
      }
    }
    yield {
      type: 'sorted',
      indices: [n - i - 1],
      description: `Element at index ${n - i - 1} is now sorted`,
    };
  }
  yield {
    type: 'sorted',
    indices: [0],
    description: 'Array is fully sorted!',
  };
}

export function* selectionSort(arr: number[]): Generator<SortingStep> {
  const n = arr.length;
  const array = [...arr];
  
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    
    for (let j = i + 1; j < n; j++) {
      yield {
        type: 'compare',
        indices: [minIdx, j],
        description: `Comparing minimum (${array[minIdx]}) with element at index ${j} (${array[j]})`,
      };
      
      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }
    
    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      yield {
        type: 'swap',
        indices: [i, minIdx],
        description: `Swapping ${array[minIdx]} with ${array[i]}`,
      };
    }
    
    yield {
      type: 'sorted',
      indices: [i],
      description: `Element at index ${i} is now in its final position`,
    };
  }
  yield {
    type: 'sorted',
    indices: [n - 1],
    description: 'Array is fully sorted!',
  };
}

export function* insertionSort(arr: number[]): Generator<SortingStep> {
  const n = arr.length;
  const array = [...arr];
  
  yield {
    type: 'sorted',
    indices: [0],
    description: 'First element is considered sorted',
  };
  
  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;
    
    yield {
      type: 'compare',
      indices: [i],
      description: `Selecting element ${key} to insert into sorted portion`,
    };
    
    while (j >= 0 && array[j] > key) {
      yield {
        type: 'compare',
        indices: [j, j + 1],
        description: `Comparing ${array[j]} with ${key}`,
      };
      
      array[j + 1] = array[j];
      yield {
        type: 'swap',
        indices: [j, j + 1],
        description: `Moving ${array[j]} to the right`,
      };
      j--;
    }
    
    array[j + 1] = key;
    yield {
      type: 'sorted',
      indices: [j + 1],
      description: `Inserted ${key} at index ${j + 1}`,
    };
  }
}

export function* mergeSort(arr: number[]): Generator<SortingStep> {
  const array = [...arr];
  
  function* mergeSortHelper(low: number, high: number): Generator<SortingStep> {
    if (low < high) {
      const mid = Math.floor((low + high) / 2);
      
      yield {
        type: 'compare',
        indices: Array.from({ length: mid - low + 1 }, (_, i) => low + i),
        description: `Dividing left half: indices ${low} to ${mid}`,
      };
      
      yield* mergeSortHelper(low, mid);
      
      yield {
        type: 'compare',
        indices: Array.from({ length: high - mid }, (_, i) => mid + 1 + i),
        description: `Dividing right half: indices ${mid + 1} to ${high}`,
      };
      
      yield* mergeSortHelper(mid + 1, high);
      yield* merge(low, mid, high);
    }
  }
  
  function* merge(low: number, mid: number, high: number): Generator<SortingStep> {
    const left = array.slice(low, mid + 1);
    const right = array.slice(mid + 1, high + 1);
    
    let i = 0, j = 0, k = low;
    
    while (i < left.length && j < right.length) {
      yield {
        type: 'compare',
        indices: [low + i, mid + 1 + j],
        description: `Comparing ${left[i]} and ${right[j]}`,
      };
      
      if (left[i] <= right[j]) {
        array[k] = left[i];
        i++;
      } else {
        array[k] = right[j];
        j++;
      }
      
      yield {
        type: 'set',
        indices: [k],
        values: [array[k]],
        description: `Placing ${array[k]} at index ${k}`,
      };
      k++;
    }
    
    while (i < left.length) {
      array[k] = left[i];
      yield {
        type: 'set',
        indices: [k],
        values: [array[k]],
        description: `Placing remaining element ${left[i]} at index ${k}`,
      };
      i++;
      k++;
    }
    
    while (j < right.length) {
      array[k] = right[j];
      yield {
        type: 'set',
        indices: [k],
        values: [array[k]],
        description: `Placing remaining element ${right[j]} at index ${k}`,
      };
      j++;
      k++;
    }
    
    for (let idx = low; idx <= high; idx++) {
      yield {
        type: 'sorted',
        indices: [idx],
        description: `Merged section ${low} to ${high}`,
      };
    }
  }
  
  yield* mergeSortHelper(0, array.length - 1);
}

export function* quickSort(arr: number[]): Generator<SortingStep> {
  const array = [...arr];
  
  function* quickSortHelper(low: number, high: number): Generator<SortingStep> {
    if (low < high) {
      const pivotResult = yield* partition(low, high);
      yield* quickSortHelper(low, pivotResult - 1);
      yield* quickSortHelper(pivotResult + 1, high);
    } else if (low === high) {
      yield {
        type: 'sorted',
        indices: [low],
        description: `Element at index ${low} is sorted`,
      };
    }
  }
  
  function* partition(low: number, high: number): Generator<SortingStep, number> {
    const pivot = array[high];
    
    yield {
      type: 'compare',
      indices: [high],
      description: `Selecting pivot: ${pivot} at index ${high}`,
    };
    
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      yield {
        type: 'compare',
        indices: [j, high],
        description: `Comparing ${array[j]} with pivot ${pivot}`,
      };
      
      if (array[j] < pivot) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        if (i !== j) {
          yield {
            type: 'swap',
            indices: [i, j],
            description: `Swapping ${array[j]} and ${array[i]}`,
          };
        }
      }
    }
    
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    yield {
      type: 'swap',
      indices: [i + 1, high],
      description: `Placing pivot ${pivot} in its correct position`,
    };
    
    yield {
      type: 'sorted',
      indices: [i + 1],
      description: `Pivot ${pivot} is now in its final position at index ${i + 1}`,
    };
    
    return i + 1;
  }
  
  yield* quickSortHelper(0, array.length - 1);
}

export function* heapSort(arr: number[]): Generator<SortingStep> {
  const array = [...arr];
  const n = array.length;
  
  function* heapify(size: number, root: number): Generator<SortingStep> {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    
    if (left < size) {
      yield {
        type: 'compare',
        indices: [largest, left],
        description: `Comparing ${array[largest]} with left child ${array[left]}`,
      };
      if (array[left] > array[largest]) {
        largest = left;
      }
    }
    
    if (right < size) {
      yield {
        type: 'compare',
        indices: [largest, right],
        description: `Comparing ${array[largest]} with right child ${array[right]}`,
      };
      if (array[right] > array[largest]) {
        largest = right;
      }
    }
    
    if (largest !== root) {
      [array[root], array[largest]] = [array[largest], array[root]];
      yield {
        type: 'swap',
        indices: [root, largest],
        description: `Swapping ${array[largest]} with ${array[root]}`,
      };
      yield* heapify(size, largest);
    }
  }
  
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }
  
  yield {
    type: 'compare',
    indices: Array.from({ length: n }, (_, i) => i),
    description: 'Max heap built successfully',
  };
  
  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    yield {
      type: 'swap',
      indices: [0, i],
      description: `Moving max element ${array[i]} to end`,
    };
    
    yield {
      type: 'sorted',
      indices: [i],
      description: `Element at index ${i} is now sorted`,
    };
    
    yield* heapify(i, 0);
  }
  
  yield {
    type: 'sorted',
    indices: [0],
    description: 'Array is fully sorted!',
  };
}
