import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Eye, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QueueElement {
  id: number;
  value: number;
  state: 'default' | 'enqueuing' | 'dequeuing' | 'peeking';
}

export default function QueueVisualizer() {
  const [queue, setQueue] = useState<QueueElement[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('Queue is empty. Enqueue some elements!');
  const [dequeuedValue, setDequeuedValue] = useState<number | null>(null);
  const [peekValue, setPeekValue] = useState<number | null>(null);
  const [idCounter, setIdCounter] = useState(0);

  const enqueue = useCallback(() => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage('Please enter a valid number');
      return;
    }

    if (queue.length >= 10) {
      setMessage('Queue is full! Maximum 10 elements allowed.');
      return;
    }

    const newElement: QueueElement = {
      id: idCounter,
      value,
      state: 'enqueuing',
    };

    setIdCounter(c => c + 1);
    setQueue(prev => [...prev, newElement]);
    setInputValue('');
    setDequeuedValue(null);
    setPeekValue(null);
    setMessage(`Enqueued ${value} at the rear`);

    setTimeout(() => {
      setQueue(prev =>
        prev.map(el =>
          el.id === newElement.id ? { ...el, state: 'default' } : el
        )
      );
    }, 300);
  }, [inputValue, queue.length, idCounter]);

  const dequeue = useCallback(() => {
    if (queue.length === 0) {
      setMessage('Queue is empty! Cannot dequeue.');
      return;
    }

    const frontElement = queue[0];
    setQueue(prev =>
      prev.map((el, idx) =>
        idx === 0 ? { ...el, state: 'dequeuing' } : el
      )
    );
    setPeekValue(null);
    setMessage(`Dequeuing ${frontElement.value} from the front...`);

    setTimeout(() => {
      setQueue(prev => prev.slice(1));
      setDequeuedValue(frontElement.value);
      setMessage(`Dequeued ${frontElement.value} from the front`);
    }, 300);
  }, [queue]);

  const peek = useCallback(() => {
    if (queue.length === 0) {
      setMessage('Cannot peek! Queue is empty.');
      return;
    }

    const frontElement = queue[0];
    setQueue(prev =>
      prev.map((el, idx) =>
        idx === 0 ? { ...el, state: 'peeking' } : el
      )
    );
    setPeekValue(frontElement.value);
    setDequeuedValue(null);
    setMessage(`Front element is ${frontElement.value}`);

    setTimeout(() => {
      setQueue(prev =>
        prev.map(el => ({ ...el, state: 'default' }))
      );
    }, 1000);
  }, [queue]);

  const clear = useCallback(() => {
    setQueue([]);
    setDequeuedValue(null);
    setPeekValue(null);
    setMessage('Queue cleared!');
  }, []);

  const getElementStyle = (state: QueueElement['state'], isFront: boolean, isRear: boolean) => {
    const base = 'w-16 h-16 flex flex-col items-center justify-center rounded-lg font-mono font-bold transition-all duration-300';

    if (state === 'enqueuing') {
      return `${base} bg-success text-success-foreground scale-110 shadow-lg`;
    }
    if (state === 'dequeuing') {
      return `${base} bg-destructive text-destructive-foreground scale-90 opacity-50`;
    }
    if (state === 'peeking') {
      return `${base} bg-warning text-warning-foreground scale-110 shadow-lg`;
    }
    if (isFront) {
      return `${base} bg-primary text-primary-foreground`;
    }
    if (isRear) {
      return `${base} bg-accent text-accent-foreground`;
    }
    return `${base} bg-secondary text-secondary-foreground`;
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Queue</span> Visualizer
          </h1>
          <p className="text-muted-foreground">
            Visualize FIFO (First In, First Out) operations with Enqueue and Dequeue
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Operations</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter value..."
                  className="bg-muted/50"
                  onKeyDown={(e) => e.key === 'Enter' && enqueue()}
                />
                <Button onClick={enqueue} className="control-btn-primary">
                  <Plus className="w-4 h-4 mr-1" />
                  Enqueue
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={dequeue} variant="secondary" className="flex-1">
                  <Minus className="w-4 h-4 mr-1" />
                  Dequeue
                </Button>
                <Button onClick={peek} variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  Peek
                </Button>
                <Button onClick={clear} variant="destructive" className="flex-1">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-center text-muted-foreground">{message}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Size</p>
                  <p className="text-xl font-mono font-bold text-primary">{queue.length}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Dequeued</p>
                  <p className="text-xl font-mono font-bold text-destructive">
                    {dequeuedValue !== null ? dequeuedValue : '-'}
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Peek</p>
                  <p className="text-xl font-mono font-bold text-warning">
                    {peekValue !== null ? peekValue : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Queue Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground font-medium">Front (Dequeue)</span>
            <span className="text-sm text-muted-foreground font-medium">Rear (Enqueue)</span>
          </div>

          <div className="relative min-h-[150px] flex items-center">
            {/* Queue Container */}
            <div className="w-full border-t-4 border-b-4 border-primary/30 py-4 flex items-center overflow-x-auto">
              <AnimatePresence mode="popLayout">
                {queue.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full text-center text-muted-foreground py-4"
                  >
                    Queue is empty
                  </motion.div>
                ) : (
                  queue.map((element, idx) => (
                    <motion.div
                      key={element.id}
                      layout
                      initial={{ opacity: 0, x: 50, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex items-center"
                    >
                      <div
                        className={getElementStyle(
                          element.state,
                          idx === 0,
                          idx === queue.length - 1
                        )}
                      >
                        <span className="text-lg">{element.value}</span>
                        <span className="text-xs opacity-70">
                          {idx === 0 && 'F'}
                          {idx === queue.length - 1 && idx !== 0 && 'R'}
                          {idx === 0 && idx === queue.length - 1 && 'F/R'}
                        </span>
                      </div>
                      {idx < queue.length - 1 && (
                        <ArrowRight className="w-6 h-6 mx-2 text-muted-foreground" />
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="text-center mt-4 text-sm text-muted-foreground">
            FIFO - First In, First Out
          </div>
        </motion.div>

        {/* Legend & Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded" />
              <span className="text-muted-foreground">Front</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent rounded" />
              <span className="text-muted-foreground">Rear</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success rounded" />
              <span className="text-muted-foreground">Enqueuing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning rounded" />
              <span className="text-muted-foreground">Peeking</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enqueue:</span>
                <span className="font-mono text-primary">O(1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dequeue:</span>
                <span className="font-mono text-primary">O(1)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
