import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search, Trash2, ArrowRight, ChevronFirst, ChevronLast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ListNode {
  id: number;
  value: number;
  state: 'default' | 'inserting' | 'deleting' | 'found' | 'traversing' | 'head' | 'tail';
}

export default function LinkedListVisualizer() {
  const [list, setList] = useState<ListNode[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [message, setMessage] = useState('Linked list is empty. Add some nodes!');
  const [isAnimating, setIsAnimating] = useState(false);
  const idCounter = useRef(0);

  const insertAtHead = useCallback(() => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage('Please enter a valid number');
      return;
    }

    const newNode: ListNode = {
      id: idCounter.current++,
      value,
      state: 'inserting',
    };

    setList(prev => [newNode, ...prev]);
    setInputValue('');
    setMessage(`Inserted ${value} at head`);

    setTimeout(() => {
      setList(prev =>
        prev.map(node =>
          node.id === newNode.id ? { ...node, state: 'default' } : node
        )
      );
    }, 300);
  }, [inputValue]);

  const insertAtTail = useCallback(() => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage('Please enter a valid number');
      return;
    }

    const newNode: ListNode = {
      id: idCounter.current++,
      value,
      state: 'inserting',
    };

    setList(prev => [...prev, newNode]);
    setInputValue('');
    setMessage(`Inserted ${value} at tail`);

    setTimeout(() => {
      setList(prev =>
        prev.map(node =>
          node.id === newNode.id ? { ...node, state: 'default' } : node
        )
      );
    }, 300);
  }, [inputValue]);

  const deleteAtHead = useCallback(() => {
    if (list.length === 0) {
      setMessage('List is empty! Cannot delete.');
      return;
    }

    setList(prev =>
      prev.map((node, idx) =>
        idx === 0 ? { ...node, state: 'deleting' } : node
      )
    );
    setMessage(`Deleting ${list[0].value} from head...`);

    setTimeout(() => {
      setList(prev => prev.slice(1));
      setMessage(`Deleted from head`);
    }, 300);
  }, [list]);

  const deleteAtTail = useCallback(() => {
    if (list.length === 0) {
      setMessage('List is empty! Cannot delete.');
      return;
    }

    setList(prev =>
      prev.map((node, idx) =>
        idx === prev.length - 1 ? { ...node, state: 'deleting' } : node
      )
    );
    setMessage(`Deleting ${list[list.length - 1].value} from tail...`);

    setTimeout(() => {
      setList(prev => prev.slice(0, -1));
      setMessage(`Deleted from tail`);
    }, 300);
  }, [list]);

  const search = useCallback(async () => {
    const value = parseInt(searchValue);
    if (isNaN(value)) {
      setMessage('Please enter a valid number to search');
      return;
    }

    if (list.length === 0) {
      setMessage('List is empty!');
      return;
    }

    setIsAnimating(true);
    setMessage(`Searching for ${value}...`);

    for (let i = 0; i < list.length; i++) {
      setList(prev =>
        prev.map((node, idx) => ({
          ...node,
          state: idx === i ? 'traversing' : idx < i ? 'default' : node.state,
        }))
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      if (list[i].value === value) {
        setList(prev =>
          prev.map((node, idx) => ({
            ...node,
            state: idx === i ? 'found' : 'default',
          }))
        );
        setMessage(`Found ${value} at index ${i}!`);
        setIsAnimating(false);

        setTimeout(() => {
          setList(prev => prev.map(node => ({ ...node, state: 'default' })));
        }, 2000);
        return;
      }
    }

    setList(prev => prev.map(node => ({ ...node, state: 'default' })));
    setMessage(`${value} not found in the list`);
    setIsAnimating(false);
  }, [searchValue, list]);

  const traverse = useCallback(async () => {
    if (list.length === 0) {
      setMessage('List is empty!');
      return;
    }

    setIsAnimating(true);
    setMessage('Traversing linked list...');

    for (let i = 0; i < list.length; i++) {
      setList(prev =>
        prev.map((node, idx) => ({
          ...node,
          state: idx === i ? 'traversing' : idx < i ? 'default' : node.state,
        }))
      );
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setList(prev => prev.map(node => ({ ...node, state: 'default' })));
    setMessage('Traversal complete!');
    setIsAnimating(false);
  }, [list]);

  const clear = useCallback(() => {
    setList([]);
    setMessage('Linked list cleared!');
  }, []);

  const getNodeStyle = (state: ListNode['state'], isHead: boolean, isTail: boolean) => {
    const base = 'w-16 h-16 flex flex-col items-center justify-center rounded-lg font-mono font-bold transition-all duration-300';

    if (state === 'inserting') {
      return `${base} bg-success text-success-foreground scale-110 shadow-lg`;
    }
    if (state === 'deleting') {
      return `${base} bg-destructive text-destructive-foreground scale-90 opacity-50`;
    }
    if (state === 'found') {
      return `${base} bg-success text-success-foreground scale-110 shadow-xl`;
    }
    if (state === 'traversing') {
      return `${base} bg-warning text-warning-foreground scale-105 shadow-lg`;
    }
    if (isHead) {
      return `${base} bg-primary text-primary-foreground`;
    }
    if (isTail) {
      return `${base} bg-accent text-accent-foreground`;
    }
    return `${base} bg-secondary text-secondary-foreground`;
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Linked List</span> Visualizer
          </h1>
          <p className="text-muted-foreground">
            Visualize singly linked list operations with insert, delete, and search
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Insert Controls */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Insert</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Value..."
                  className="bg-muted/50"
                  disabled={isAnimating}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={insertAtHead}
                  disabled={isAnimating}
                  size="sm"
                  className="flex-1"
                >
                  <ChevronFirst className="w-4 h-4 mr-1" />
                  Head
                </Button>
                <Button
                  onClick={insertAtTail}
                  disabled={isAnimating}
                  size="sm"
                  className="flex-1"
                >
                  <ChevronLast className="w-4 h-4 mr-1" />
                  Tail
                </Button>
              </div>
            </div>

            {/* Delete Controls */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Delete</h3>
              <div className="flex gap-2">
                <Button
                  onClick={deleteAtHead}
                  disabled={isAnimating || list.length === 0}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-1" />
                  Head
                </Button>
                <Button
                  onClick={deleteAtTail}
                  disabled={isAnimating || list.length === 0}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-1" />
                  Tail
                </Button>
              </div>
              <Button
                onClick={clear}
                disabled={isAnimating}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>

            {/* Search & Traverse */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Search & Traverse</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search..."
                  className="bg-muted/50"
                  disabled={isAnimating}
                />
                <Button
                  onClick={search}
                  disabled={isAnimating}
                  variant="outline"
                  size="sm"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={traverse}
                disabled={isAnimating || list.length === 0}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Traverse List
              </Button>
            </div>
          </div>

          {/* Message */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">{message}</p>
          </div>
        </motion.div>

        {/* Linked List Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground font-medium">Head</span>
            <span className="text-sm text-muted-foreground font-medium">Tail → NULL</span>
          </div>

          <div className="min-h-[120px] flex items-center overflow-x-auto py-4">
            <AnimatePresence mode="popLayout">
              {list.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full text-center text-muted-foreground py-4"
                >
                  Linked list is empty. Add some nodes!
                </motion.div>
              ) : (
                <>
                  {list.map((node, idx) => (
                    <motion.div
                      key={node.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex items-center"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={getNodeStyle(
                            node.state,
                            idx === 0,
                            idx === list.length - 1
                          )}
                        >
                          <span className="text-lg">{node.value}</span>
                          <span className="text-xs opacity-70">
                            {idx === 0 && idx === list.length - 1 ? 'H/T' : idx === 0 ? 'H' : idx === list.length - 1 ? 'T' : ''}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">[{idx}]</div>
                      </div>
                      {idx < list.length - 1 && (
                        <ArrowRight className="w-8 h-8 mx-2 text-primary/60" />
                      )}
                    </motion.div>
                  ))}
                  <ArrowRight className="w-8 h-8 mx-2 text-muted-foreground/40" />
                  <div className="px-3 py-2 bg-muted/30 rounded text-sm text-muted-foreground">
                    NULL
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Legend & Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded" />
              <span className="text-muted-foreground">Head</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent rounded" />
              <span className="text-muted-foreground">Tail</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning rounded" />
              <span className="text-muted-foreground">Traversing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success rounded" />
              <span className="text-muted-foreground">Found/Inserted</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insert (Head/Tail):</span>
                <span className="font-mono text-primary">O(1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delete Head:</span>
                <span className="font-mono text-primary">O(1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Search:</span>
                <span className="font-mono text-primary">O(n)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-mono text-primary">{list.length}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
