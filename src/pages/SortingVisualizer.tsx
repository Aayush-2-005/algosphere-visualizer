import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VisualizerCanvas } from '@/components/visualizers/VisualizerCanvas';
import { ControlPanel } from '@/components/visualizers/ControlPanel';
import { InfoPanel } from '@/components/visualizers/InfoPanel';
import { 
  ArrayBar, 
  AlgorithmType, 
  VisualizerStatus 
} from '@/store/VisualizerContext';
import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  SortingStep,
} from '@/algorithms/sortingAlgorithms';

function generateRandomArray(size: number): ArrayBar[] {
  return Array.from({ length: size }, () => ({
    value: Math.floor(Math.random() * 95) + 5,
    state: 'default' as const,
  }));
}

export default function SortingVisualizer() {
  const [array, setArray] = useState<ArrayBar[]>([]);
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bubble');
  const [status, setStatus] = useState<VisualizerStatus>('idle');
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [description, setDescription] = useState('Generate an array to begin');

  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const generatorRef = useRef<Generator<SortingStep> | null>(null);
  const originalArrayRef = useRef<number[]>([]);

  const generateArray = useCallback(() => {
    const newArray = generateRandomArray(arraySize);
    setArray(newArray);
    originalArrayRef.current = newArray.map((bar) => bar.value);
    setStatus('idle');
    setComparisons(0);
    setSwaps(0);
    setDescription('Click "Start" to begin sorting');
  }, [arraySize]);

  useEffect(() => {
    generateArray();
  }, []);

  const getAlgorithmGenerator = (arr: number[]): Generator<SortingStep> => {
    switch (algorithm) {
      case 'bubble':
        return bubbleSort(arr);
      case 'selection':
        return selectionSort(arr);
      case 'insertion':
        return insertionSort(arr);
      case 'merge':
        return mergeSort(arr);
      case 'quick':
        return quickSort(arr);
      case 'heap':
        return heapSort(arr);
      default:
        return bubbleSort(arr);
    }
  };

  const processStep = useCallback((step: SortingStep) => {
    setDescription(step.description);

    setArray((prev) => {
      const newArray = [...prev];

      // Reset all non-sorted bars to default
      newArray.forEach((bar, idx) => {
        if (bar.state !== 'sorted') {
          newArray[idx] = { ...bar, state: 'default' };
        }
      });

      switch (step.type) {
        case 'compare':
          setComparisons((c) => c + 1);
          step.indices.forEach((idx) => {
            if (idx >= 0 && idx < newArray.length) {
              newArray[idx] = { ...newArray[idx], state: 'comparing' };
            }
          });
          break;

        case 'swap':
          setSwaps((s) => s + 1);
          if (step.indices.length >= 2) {
            const [i, j] = step.indices;
            if (i >= 0 && i < newArray.length && j >= 0 && j < newArray.length) {
              [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
              newArray[i] = { ...newArray[i], state: 'swapping' };
              newArray[j] = { ...newArray[j], state: 'swapping' };
            }
          }
          break;

        case 'set':
          if (step.values && step.indices.length > 0) {
            step.indices.forEach((idx, i) => {
              if (idx >= 0 && idx < newArray.length && step.values && step.values[i] !== undefined) {
                newArray[idx] = { value: step.values[i], state: 'comparing' };
              }
            });
          }
          break;

        case 'sorted':
          step.indices.forEach((idx) => {
            if (idx >= 0 && idx < newArray.length) {
              newArray[idx] = { ...newArray[idx], state: 'sorted' };
            }
          });
          break;
      }

      return newArray;
    });
  }, []);

  const runAnimation = useCallback(() => {
    if (isPausedRef.current || !generatorRef.current) return;

    const result = generatorRef.current.next();

    if (result.done) {
      setArray((prev) => prev.map((bar) => ({ ...bar, state: 'sorted' })));
      setStatus('completed');
      setDescription('Sorting complete!');
      return;
    }

    processStep(result.value);

    animationRef.current = window.setTimeout(() => {
      runAnimation();
    }, speed);
  }, [speed, processStep]);

  const handleStart = useCallback(() => {
    const values = array.map((bar) => bar.value);
    generatorRef.current = getAlgorithmGenerator(values);
    isPausedRef.current = false;
    setStatus('running');
    setComparisons(0);
    setSwaps(0);
    runAnimation();
  }, [array, algorithm, runAnimation]);

  const handlePause = useCallback(() => {
    isPausedRef.current = true;
    setStatus('paused');
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  const handleResume = useCallback(() => {
    isPausedRef.current = false;
    setStatus('running');
    runAnimation();
  }, [runAnimation]);

  const handleReset = useCallback(() => {
    isPausedRef.current = true;
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    generatorRef.current = null;
    
    if (originalArrayRef.current.length > 0) {
      setArray(originalArrayRef.current.map((value) => ({ value, state: 'default' as const })));
    }
    
    setStatus('idle');
    setComparisons(0);
    setSwaps(0);
    setDescription('Click "Start" to begin sorting');
  }, []);

  const handleArraySizeChange = useCallback((size: number) => {
    setArraySize(size);
    const newArray = generateRandomArray(size);
    setArray(newArray);
    originalArrayRef.current = newArray.map((bar) => bar.value);
    setStatus('idle');
    setComparisons(0);
    setSwaps(0);
    setDescription('Click "Start" to begin sorting');
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Sorting</span> Visualizer
          </h1>
          <p className="text-muted-foreground">
            Watch sorting algorithms in action with step-by-step animations
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Control Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ControlPanel
              arraySize={arraySize}
              speed={speed}
              algorithm={algorithm}
              status={status}
              onArraySizeChange={handleArraySizeChange}
              onSpeedChange={setSpeed}
              onAlgorithmChange={setAlgorithm}
              onGenerateArray={generateArray}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onReset={handleReset}
            />
          </motion.div>

          {/* Visualizer Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <VisualizerCanvas array={array} />
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bar-default rounded-sm" />
              <span className="text-muted-foreground">Unsorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bar-comparing rounded-sm" />
              <span className="text-muted-foreground">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bar-swapping rounded-sm" />
              <span className="text-muted-foreground">Swapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bar-sorted rounded-sm" />
              <span className="text-muted-foreground">Sorted</span>
            </div>
          </motion.div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <InfoPanel
              algorithm={algorithm}
              comparisons={comparisons}
              swaps={swaps}
              currentDescription={description}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
