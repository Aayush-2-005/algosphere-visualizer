import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  linearSearch,
  binarySearch,
  SearchStep,
} from '@/algorithms/searchingAlgorithms';

type SearchAlgorithm = 'linear' | 'binary';
type SearchStatus = 'idle' | 'running' | 'paused' | 'found' | 'not-found';

interface ArrayElement {
  value: number;
  state: 'default' | 'checking' | 'eliminated' | 'found' | 'in-range';
}

function generateSortedArray(size: number): number[] {
  const arr: number[] = [];
  let current = Math.floor(Math.random() * 10) + 1;
  for (let i = 0; i < size; i++) {
    arr.push(current);
    current += Math.floor(Math.random() * 10) + 1;
  }
  return arr;
}

function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
}

export default function SearchingVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [arraySize, setArraySize] = useState(15);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState<SearchAlgorithm>('linear');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('Enter a target value and click Search');
  const [comparisons, setComparisons] = useState(0);

  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const generatorRef = useRef<Generator<SearchStep> | null>(null);
  const rawArrayRef = useRef<number[]>([]);

  const generateArray = useCallback(() => {
    const newArray = algorithm === 'binary' 
      ? generateSortedArray(arraySize)
      : generateRandomArray(arraySize);
    rawArrayRef.current = newArray;
    setArray(newArray.map(value => ({ value, state: 'default' })));
    setStatus('idle');
    setComparisons(0);
    setDescription('Enter a target value and click Search');
  }, [arraySize, algorithm]);

  useEffect(() => {
    generateArray();
  }, [algorithm]);

  useEffect(() => {
    generateArray();
  }, []);

  const processStep = useCallback((step: SearchStep) => {
    setDescription(step.description);
    setComparisons(c => c + 1);

    setArray(prev => {
      const newArray = prev.map((el, idx) => {
        if (step.type === 'found' && idx === step.index) {
          return { ...el, state: 'found' as const };
        }
        if (step.type === 'check' && idx === step.index) {
          return { ...el, state: 'checking' as const };
        }
        if (step.type === 'eliminate') {
          if (step.low !== undefined && step.high !== undefined) {
            if (idx < step.low || idx > step.high) {
              return { ...el, state: 'eliminated' as const };
            }
            if (idx === step.mid) {
              return { ...el, state: 'checking' as const };
            }
            return { ...el, state: 'in-range' as const };
          }
        }
        if (el.state === 'eliminated') return el;
        if (el.state === 'found') return el;
        return { ...el, state: 'default' as const };
      });
      return newArray;
    });
  }, []);

  const runAnimation = useCallback(() => {
    if (isPausedRef.current || !generatorRef.current) return;

    const result = generatorRef.current.next();

    if (result.done) {
      return;
    }

    const step = result.value;
    processStep(step);

    if (step.type === 'found') {
      setStatus('found');
      return;
    }

    if (step.type === 'not-found') {
      setStatus('not-found');
      return;
    }

    animationRef.current = window.setTimeout(() => {
      runAnimation();
    }, 150 - speed);
  }, [speed, processStep]);

  const handleSearch = useCallback(() => {
    const targetNum = parseInt(target);
    if (isNaN(targetNum)) {
      setDescription('Please enter a valid number');
      return;
    }

    setArray(prev => prev.map(el => ({ ...el, state: 'default' })));
    setComparisons(0);

    const arr = rawArrayRef.current;
    generatorRef.current = algorithm === 'binary'
      ? binarySearch(arr, targetNum)
      : linearSearch(arr, targetNum);
    
    isPausedRef.current = false;
    setStatus('running');
    runAnimation();
  }, [target, algorithm, runAnimation]);

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
    setArray(rawArrayRef.current.map(value => ({ value, state: 'default' })));
    setStatus('idle');
    setComparisons(0);
    setDescription('Enter a target value and click Search');
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const getElementClass = (state: ArrayElement['state']) => {
    switch (state) {
      case 'checking':
        return 'bg-warning text-warning-foreground scale-110 shadow-lg';
      case 'found':
        return 'bg-success text-success-foreground scale-125 shadow-xl';
      case 'eliminated':
        return 'bg-muted/30 text-muted-foreground opacity-40';
      case 'in-range':
        return 'bg-secondary/50 text-secondary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const isRunning = status === 'running';
  const isCompleted = status === 'found' || status === 'not-found';

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Searching</span> Visualizer
          </h1>
          <p className="text-muted-foreground">
            Watch searching algorithms find elements step-by-step
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Algorithm Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Algorithm
              </label>
              <div className="flex gap-2">
                <Button
                  variant={algorithm === 'linear' ? 'default' : 'outline'}
                  onClick={() => setAlgorithm('linear')}
                  disabled={isRunning}
                  className="flex-1"
                >
                  Linear
                </Button>
                <Button
                  variant={algorithm === 'binary' ? 'default' : 'outline'}
                  onClick={() => setAlgorithm('binary')}
                  disabled={isRunning}
                  className="flex-1"
                >
                  Binary
                </Button>
              </div>
            </div>

            {/* Target Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Target Value
              </label>
              <Input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter number..."
                disabled={isRunning}
                className="bg-muted/50"
              />
            </div>

            {/* Array Size */}
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Array Size: {arraySize}
              </label>
              <Slider
                value={[arraySize]}
                onValueChange={([v]) => setArraySize(v)}
                min={5}
                max={20}
                step={1}
                disabled={isRunning}
              />
            </div>

            {/* Speed */}
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Speed
              </label>
              <Slider
                value={[speed]}
                onValueChange={([v]) => setSpeed(v)}
                min={10}
                max={140}
                step={10}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button onClick={generateArray} disabled={isRunning} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Array
            </Button>

            {status === 'idle' && (
              <Button onClick={handleSearch} className="control-btn-primary">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            )}

            {status === 'running' && (
              <Button onClick={handlePause} variant="secondary">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}

            {status === 'paused' && (
              <Button onClick={handleResume} className="control-btn-primary">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}

            {(status === 'paused' || isCompleted) && (
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </motion.div>

        {/* Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-8 mb-6"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {array.map((el, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                className={`
                  w-14 h-14 flex flex-col items-center justify-center rounded-lg font-mono
                  transition-all duration-200 ${getElementClass(el.state)}
                `}
              >
                <span className="text-lg font-bold">{el.value}</span>
                <span className="text-xs opacity-70">[{idx}]</span>
              </motion.div>
            ))}
          </div>

          {/* Description */}
          <div className="mt-8 text-center">
            <p className={`text-lg font-medium ${
              status === 'found' ? 'text-success' : 
              status === 'not-found' ? 'text-destructive' : 
              'text-muted-foreground'
            }`}>
              {description}
            </p>
          </div>
        </motion.div>

        {/* Legend & Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Legend */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Legend</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary rounded" />
                <span className="text-muted-foreground">Default</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-warning rounded" />
                <span className="text-muted-foreground">Checking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-success rounded" />
                <span className="text-muted-foreground">Found</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted/30 rounded" />
                <span className="text-muted-foreground">Eliminated</span>
              </div>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Algorithm Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comparisons:</span>
                <span className="font-mono text-primary">{comparisons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Complexity:</span>
                <span className="font-mono text-primary">
                  {algorithm === 'binary' ? 'O(log n)' : 'O(n)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Space Complexity:</span>
                <span className="font-mono text-primary">O(1)</span>
              </div>
              {algorithm === 'binary' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Binary search requires a sorted array
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
