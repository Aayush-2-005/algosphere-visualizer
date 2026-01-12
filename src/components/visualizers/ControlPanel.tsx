import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Shuffle,
  Gauge,
  Scaling
} from 'lucide-react';
import { AlgorithmType, VisualizerStatus } from '@/store/VisualizerContext';
import { algorithmInfo } from '@/algorithms/algorithmInfo';

interface ControlPanelProps {
  arraySize: number;
  speed: number;
  algorithm: AlgorithmType;
  status: VisualizerStatus;
  onArraySizeChange: (size: number) => void;
  onSpeedChange: (speed: number) => void;
  onAlgorithmChange: (algo: AlgorithmType) => void;
  onGenerateArray: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

const algorithms: AlgorithmType[] = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'];

export function ControlPanel({
  arraySize,
  speed,
  algorithm,
  status,
  onArraySizeChange,
  onSpeedChange,
  onAlgorithmChange,
  onGenerateArray,
  onStart,
  onPause,
  onResume,
  onReset,
}: ControlPanelProps) {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isCompleted = status === 'completed';
  const isIdle = status === 'idle';

  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      {/* Algorithm Selection */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          Select Algorithm
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {algorithms.map((algo) => (
            <motion.button
              key={algo}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAlgorithmChange(algo)}
              disabled={isRunning || isPaused}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                algorithm === algo
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {algorithmInfo[algo].name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Array Size */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <Scaling size={16} />
            Array Size: {arraySize}
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={arraySize}
            onChange={(e) => onArraySizeChange(Number(e.target.value))}
            disabled={isRunning || isPaused}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>5</span>
            <span>100</span>
          </div>
        </div>

        {/* Speed */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <Gauge size={16} />
            Speed: {speed}ms
          </label>
          <input
            type="range"
            min="1"
            max="500"
            value={501 - speed}
            onChange={(e) => onSpeedChange(501 - Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGenerateArray}
          disabled={isRunning || isPaused}
          className="control-btn-secondary flex items-center gap-2"
        >
          <Shuffle size={18} />
          Generate Array
        </motion.button>

        {isIdle && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="control-btn-primary flex items-center gap-2"
          >
            <Play size={18} />
            Start
          </motion.button>
        )}

        {isRunning && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPause}
            className="control-btn-secondary flex items-center gap-2"
          >
            <Pause size={18} />
            Pause
          </motion.button>
        )}

        {isPaused && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResume}
            className="control-btn-primary flex items-center gap-2"
          >
            <Play size={18} />
            Resume
          </motion.button>
        )}

        {(isRunning || isPaused || isCompleted) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="control-btn-destructive flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset
          </motion.button>
        )}
      </div>
    </div>
  );
}
