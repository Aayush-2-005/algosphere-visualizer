import { AlgorithmType } from '@/store/VisualizerContext';

export interface AlgorithmInfo {
  name: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  description: string;
  pseudocode: string[];
}

export const algorithmInfo: Record<AlgorithmType, AlgorithmInfo> = {
  bubble: {
    name: 'Bubble Sort',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    pseudocode: [
      'for i = 0 to n-1',
      '  for j = 0 to n-i-1',
      '    if arr[j] > arr[j+1]',
      '      swap(arr[j], arr[j+1])',
    ],
  },
  selection: {
    name: 'Selection Sort',
    timeComplexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    description: 'Divides the input into sorted and unsorted regions, repeatedly selects the smallest element from unsorted region.',
    pseudocode: [
      'for i = 0 to n-1',
      '  min_idx = i',
      '  for j = i+1 to n',
      '    if arr[j] < arr[min_idx]',
      '      min_idx = j',
      '  swap(arr[i], arr[min_idx])',
    ],
  },
  insertion: {
    name: 'Insertion Sort',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    description: 'Builds the sorted array one item at a time by inserting each element into its correct position.',
    pseudocode: [
      'for i = 1 to n-1',
      '  key = arr[i]',
      '  j = i - 1',
      '  while j >= 0 and arr[j] > key',
      '    arr[j+1] = arr[j]',
      '    j = j - 1',
      '  arr[j+1] = key',
    ],
  },
  merge: {
    name: 'Merge Sort',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(n)',
    description: 'Divides array into halves, recursively sorts them, then merges the sorted halves.',
    pseudocode: [
      'mergeSort(arr, l, r):',
      '  if l < r',
      '    mid = (l + r) / 2',
      '    mergeSort(arr, l, mid)',
      '    mergeSort(arr, mid+1, r)',
      '    merge(arr, l, mid, r)',
    ],
  },
  quick: {
    name: 'Quick Sort',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(log n)',
    description: 'Selects a pivot element, partitions array around pivot, recursively sorts sub-arrays.',
    pseudocode: [
      'quickSort(arr, low, high):',
      '  if low < high',
      '    pi = partition(arr, low, high)',
      '    quickSort(arr, low, pi-1)',
      '    quickSort(arr, pi+1, high)',
    ],
  },
  heap: {
    name: 'Heap Sort',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(1)',
    description: 'Builds a max heap, repeatedly extracts the maximum element and rebuilds the heap.',
    pseudocode: [
      'heapSort(arr):',
      '  buildMaxHeap(arr)',
      '  for i = n-1 to 1',
      '    swap(arr[0], arr[i])',
      '    heapify(arr, 0, i)',
    ],
  },
};
