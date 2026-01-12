import { motion } from 'framer-motion';
import { Clock, Cpu, ArrowLeftRight, Scale } from 'lucide-react';
import { AlgorithmType } from '@/store/VisualizerContext';
import { algorithmInfo } from '@/algorithms/algorithmInfo';

interface InfoPanelProps {
  algorithm: AlgorithmType;
  comparisons: number;
  swaps: number;
  currentDescription: string;
  currentStep?: number;
}

export function InfoPanel({ 
  algorithm, 
  comparisons, 
  swaps, 
  currentDescription,
}: InfoPanelProps) {
  const info = algorithmInfo[algorithm];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Step & Stats */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Cpu size={20} className="text-primary" />
          Current Status
        </h3>
        
        <div className="space-y-4">
          {/* Current Description */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-foreground font-medium">
              {currentDescription}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <ArrowLeftRight size={14} />
                Comparisons
              </div>
              <motion.p
                key={comparisons}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary"
              >
                {comparisons}
              </motion.p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Scale size={14} />
                Swaps
              </div>
              <motion.p
                key={swaps}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-accent"
              >
                {swaps}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Info */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          {info.name}
        </h3>

        <div className="space-y-4">
          {/* Complexity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-success/10 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Best</p>
              <p className="text-sm font-mono font-semibold text-success">{info.timeComplexity.best}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Average</p>
              <p className="text-sm font-mono font-semibold text-warning">{info.timeComplexity.average}</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Worst</p>
              <p className="text-sm font-mono font-semibold text-destructive">{info.timeComplexity.worst}</p>
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Space Complexity</p>
            <p className="text-sm font-mono font-semibold">{info.spaceComplexity}</p>
          </div>

          {/* Pseudocode */}
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-2">Pseudocode</p>
            <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
              {info.pseudocode.map((line, i) => (
                <div key={i} className="py-0.5">{line}</div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
