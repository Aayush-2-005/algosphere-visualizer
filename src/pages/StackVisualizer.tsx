import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StackElement {
  id: number;
  value: number;
  state: 'default' | 'pushing' | 'popping' | 'peeking';
}

export default function StackVisualizer() {
  const [stack, setStack] = useState<StackElement[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('Stack is empty. Push some elements!');
  const [poppedValue, setPoppedValue] = useState<number | null>(null);
  const [peekValue, setPeekValue] = useState<number | null>(null);
  const [idCounter, setIdCounter] = useState(0);

  const push = useCallback(() => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage('Please enter a valid number');
      return;
    }

    if (stack.length >= 10) {
      setMessage('Stack overflow! Maximum 10 elements allowed.');
      return;
    }

    const newElement: StackElement = {
      id: idCounter,
      value,
      state: 'pushing',
    };

    setIdCounter(c => c + 1);
    setStack(prev => [...prev, newElement]);
    setInputValue('');
    setPoppedValue(null);
    setPeekValue(null);
    setMessage(`Pushed ${value} onto the stack`);

    setTimeout(() => {
      setStack(prev => 
        prev.map(el => 
          el.id === newElement.id ? { ...el, state: 'default' } : el
        )
      );
    }, 300);
  }, [inputValue, stack.length, idCounter]);

  const pop = useCallback(() => {
    if (stack.length === 0) {
      setMessage('Stack underflow! Cannot pop from empty stack.');
      return;
    }

    const topElement = stack[stack.length - 1];
    setStack(prev => 
      prev.map((el, idx) => 
        idx === prev.length - 1 ? { ...el, state: 'popping' } : el
      )
    );
    setPeekValue(null);
    setMessage(`Popping ${topElement.value} from the stack...`);

    setTimeout(() => {
      setStack(prev => prev.slice(0, -1));
      setPoppedValue(topElement.value);
      setMessage(`Popped ${topElement.value} from the stack`);
    }, 300);
  }, [stack]);

  const peek = useCallback(() => {
    if (stack.length === 0) {
      setMessage('Cannot peek! Stack is empty.');
      return;
    }

    const topElement = stack[stack.length - 1];
    setStack(prev => 
      prev.map((el, idx) => 
        idx === prev.length - 1 ? { ...el, state: 'peeking' } : el
      )
    );
    setPeekValue(topElement.value);
    setPoppedValue(null);
    setMessage(`Top element is ${topElement.value}`);

    setTimeout(() => {
      setStack(prev => 
        prev.map(el => ({ ...el, state: 'default' }))
      );
    }, 1000);
  }, [stack]);

  const clear = useCallback(() => {
    setStack([]);
    setPoppedValue(null);
    setPeekValue(null);
    setMessage('Stack cleared!');
  }, []);

  const getElementStyle = (state: StackElement['state'], isTop: boolean) => {
    const base = 'w-full h-14 flex items-center justify-center rounded-lg font-mono text-lg font-bold transition-all duration-300';
    
    if (state === 'pushing') {
      return `${base} bg-success text-success-foreground scale-105 shadow-lg`;
    }
    if (state === 'popping') {
      return `${base} bg-destructive text-destructive-foreground scale-95 opacity-50`;
    }
    if (state === 'peeking') {
      return `${base} bg-warning text-warning-foreground scale-105 shadow-lg`;
    }
    if (isTop) {
      return `${base} bg-primary text-primary-foreground`;
    }
    return `${base} bg-secondary text-secondary-foreground`;
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Stack</span> Visualizer
          </h1>
          <p className="text-muted-foreground">
            Visualize LIFO (Last In, First Out) operations with Push, Pop, and Peek
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="font-semibold mb-4">Operations</h3>
            
            <div className="space-y-4">
              {/* Push Input */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter value..."
                  className="bg-muted/50"
                  onKeyDown={(e) => e.key === 'Enter' && push()}
                />
                <Button onClick={push} className="control-btn-primary">
                  <Plus className="w-4 h-4 mr-1" />
                  Push
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={pop} variant="secondary" className="flex-1">
                  <Minus className="w-4 h-4 mr-1" />
                  Pop
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

              {/* Message */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-center text-muted-foreground">{message}</p>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Last Popped</p>
                  <p className="text-2xl font-mono font-bold text-destructive">
                    {poppedValue !== null ? poppedValue : '-'}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Peek Value</p>
                  <p className="text-2xl font-mono font-bold text-warning">
                    {peekValue !== null ? peekValue : '-'}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-mono text-primary">{stack.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Is Empty:</span>
                  <span className="font-mono text-primary">{stack.length === 0 ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Complexity:</span>
                  <span className="font-mono text-primary">O(1)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stack Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Stack</h3>
              <span className="text-sm text-muted-foreground">← Top</span>
            </div>

            <div className="relative min-h-[400px] flex flex-col justify-end">
              {/* Stack Container */}
              <div className="border-l-4 border-r-4 border-b-4 border-primary/30 rounded-b-lg p-2 min-h-[350px] flex flex-col justify-end">
                <AnimatePresence mode="popLayout">
                  {stack.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-muted-foreground py-8"
                    >
                      Stack is empty
                    </motion.div>
                  ) : (
                    stack.map((element, idx) => (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ opacity: 0, y: -50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className={`${getElementStyle(element.state, idx === stack.length - 1)} mb-2`}
                      >
                        <span>{element.value}</span>
                        {idx === stack.length - 1 && (
                          <span className="ml-2 text-xs opacity-70">(TOP)</span>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Stack Label */}
              <div className="text-center mt-4 text-sm text-muted-foreground">
                LIFO - Last In, First Out
              </div>
            </div>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-wrap justify-center gap-6 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded" />
            <span className="text-muted-foreground">Top Element</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-secondary rounded" />
            <span className="text-muted-foreground">Other Elements</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success rounded" />
            <span className="text-muted-foreground">Pushing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning rounded" />
            <span className="text-muted-foreground">Peeking</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
