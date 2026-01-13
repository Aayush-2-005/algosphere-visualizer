import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TreeNode {
  id: number;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  state: 'default' | 'inserting' | 'found' | 'traversing' | 'comparing';
  x: number;
  y: number;
}

type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

export default function TreeVisualizer() {
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [message, setMessage] = useState('Binary Search Tree is empty. Insert some values!');
  const [isAnimating, setIsAnimating] = useState(false);
  const [traversalResult, setTraversalResult] = useState<number[]>([]);
  const idCounter = useRef(0);

  const calculatePositions = useCallback((node: TreeNode | null, x: number, y: number, spread: number): TreeNode | null => {
    if (!node) return null;
    return {
      ...node,
      x,
      y,
      left: calculatePositions(node.left, x - spread, y + 80, spread / 2),
      right: calculatePositions(node.right, x + spread, y + 80, spread / 2),
    };
  }, []);

  const insertNode = useCallback((node: TreeNode | null, value: number): TreeNode => {
    if (!node) {
      return {
        id: idCounter.current++,
        value,
        left: null,
        right: null,
        state: 'inserting',
        x: 0,
        y: 0,
      };
    }

    if (value < node.value) {
      return { ...node, left: insertNode(node.left, value) };
    } else if (value > node.value) {
      return { ...node, right: insertNode(node.right, value) };
    }
    return node;
  }, []);

  const insert = useCallback(() => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage('Please enter a valid number');
      return;
    }

    const newRoot = insertNode(root, value);
    const positionedRoot = calculatePositions(newRoot, 400, 40, 150);
    setRoot(positionedRoot);
    setInputValue('');
    setMessage(`Inserted ${value} into the BST`);

    setTimeout(() => {
      const resetState = (node: TreeNode | null): TreeNode | null => {
        if (!node) return null;
        return {
          ...node,
          state: 'default',
          left: resetState(node.left),
          right: resetState(node.right),
        };
      };
      setRoot(prev => resetState(prev));
    }, 500);
  }, [inputValue, root, insertNode, calculatePositions]);

  const searchNode = useCallback(async () => {
    const value = parseInt(searchValue);
    if (isNaN(value)) {
      setMessage('Please enter a valid number to search');
      return;
    }

    if (!root) {
      setMessage('Tree is empty!');
      return;
    }

    setIsAnimating(true);
    setMessage(`Searching for ${value}...`);

    let current = root;
    const path: TreeNode[] = [];

    while (current) {
      path.push(current);

      const updateState = (node: TreeNode | null, targetId: number, state: TreeNode['state']): TreeNode | null => {
        if (!node) return null;
        if (node.id === targetId) {
          return { ...node, state };
        }
        return {
          ...node,
          left: updateState(node.left, targetId, state),
          right: updateState(node.right, targetId, state),
        };
      };

      setRoot(prev => updateState(prev, current.id, 'comparing'));
      await new Promise(resolve => setTimeout(resolve, 600));

      if (current.value === value) {
        setRoot(prev => updateState(prev, current.id, 'found'));
        setMessage(`Found ${value}!`);
        setIsAnimating(false);

        setTimeout(() => {
          const resetState = (node: TreeNode | null): TreeNode | null => {
            if (!node) return null;
            return { ...node, state: 'default', left: resetState(node.left), right: resetState(node.right) };
          };
          setRoot(prev => resetState(prev));
        }, 2000);
        return;
      }

      setRoot(prev => updateState(prev, current.id, 'default'));

      if (value < current.value) {
        current = current.left!;
      } else {
        current = current.right!;
      }
    }

    setMessage(`${value} not found in the BST`);
    setIsAnimating(false);
  }, [searchValue, root]);

  const traverseTree = useCallback(async (type: TraversalType) => {
    if (!root) {
      setMessage('Tree is empty!');
      return;
    }

    setIsAnimating(true);
    setTraversalResult([]);
    const result: number[] = [];

    const updateState = (node: TreeNode | null, targetId: number, state: TreeNode['state']): TreeNode | null => {
      if (!node) return null;
      if (node.id === targetId) {
        return { ...node, state };
      }
      return {
        ...node,
        left: updateState(node.left, targetId, state),
        right: updateState(node.right, targetId, state),
      };
    };

    const visit = async (node: TreeNode) => {
      setRoot(prev => updateState(prev, node.id, 'traversing'));
      result.push(node.value);
      setTraversalResult([...result]);
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoot(prev => updateState(prev, node.id, 'default'));
    };

    const inorder = async (node: TreeNode | null) => {
      if (!node) return;
      await inorder(node.left);
      await visit(node);
      await inorder(node.right);
    };

    const preorder = async (node: TreeNode | null) => {
      if (!node) return;
      await visit(node);
      await preorder(node.left);
      await preorder(node.right);
    };

    const postorder = async (node: TreeNode | null) => {
      if (!node) return;
      await postorder(node.left);
      await postorder(node.right);
      await visit(node);
    };

    const levelorder = async (node: TreeNode | null) => {
      if (!node) return;
      const queue: TreeNode[] = [node];
      while (queue.length > 0) {
        const current = queue.shift()!;
        await visit(current);
        if (current.left) queue.push(current.left);
        if (current.right) queue.push(current.right);
      }
    };

    setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} traversal...`);

    switch (type) {
      case 'inorder':
        await inorder(root);
        break;
      case 'preorder':
        await preorder(root);
        break;
      case 'postorder':
        await postorder(root);
        break;
      case 'levelorder':
        await levelorder(root);
        break;
    }

    setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} traversal complete!`);
    setIsAnimating(false);
  }, [root]);

  const clear = useCallback(() => {
    setRoot(null);
    setTraversalResult([]);
    setMessage('Binary Search Tree cleared!');
  }, []);

  const renderTree = (node: TreeNode | null): JSX.Element | null => {
    if (!node) return null;

    const getNodeStyle = () => {
      const base = 'w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all duration-300';
      switch (node.state) {
        case 'inserting':
          return `${base} bg-success text-success-foreground scale-125 shadow-lg`;
        case 'found':
          return `${base} bg-success text-success-foreground scale-125 shadow-xl`;
        case 'comparing':
          return `${base} bg-warning text-warning-foreground scale-110 shadow-lg`;
        case 'traversing':
          return `${base} bg-primary text-primary-foreground scale-110 shadow-lg`;
        default:
          return `${base} bg-secondary text-secondary-foreground`;
      }
    };

    return (
      <>
        {node.left && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            opacity="0.5"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            opacity="0.5"
          />
        )}
        {renderTree(node.left)}
        {renderTree(node.right)}
        <foreignObject x={node.x - 24} y={node.y - 24} width="48" height="48">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={getNodeStyle()}
          >
            {node.value}
          </motion.div>
        </foreignObject>
      </>
    );
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
            <span className="gradient-text">Binary Search Tree</span> Visualizer
          </h1>
          <p className="text-muted-foreground">
            Visualize BST operations with insert, search, and tree traversals
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Insert */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Insert Node</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Value..."
                  className="bg-muted/50"
                  disabled={isAnimating}
                  onKeyDown={(e) => e.key === 'Enter' && insert()}
                />
                <Button onClick={insert} disabled={isAnimating}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Search Node</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search..."
                  className="bg-muted/50"
                  disabled={isAnimating}
                />
                <Button onClick={searchNode} disabled={isAnimating} variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Clear */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Actions</h3>
              <Button onClick={clear} disabled={isAnimating} variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Tree
              </Button>
            </div>
          </div>

          {/* Traversals */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-3">Tree Traversals</h3>
            <div className="flex flex-wrap gap-2">
              {(['inorder', 'preorder', 'postorder', 'levelorder'] as TraversalType[]).map((type) => (
                <Button
                  key={type}
                  onClick={() => traverseTree(type)}
                  disabled={isAnimating || !root}
                  variant="outline"
                  size="sm"
                >
                  <Play className="w-3 h-3 mr-1" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Message & Result */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            {traversalResult.length > 0 && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Traversal Result:</p>
                <p className="font-mono text-sm text-primary">[{traversalResult.join(', ')}]</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tree Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="min-h-[400px] flex items-center justify-center overflow-auto">
            {!root ? (
              <p className="text-muted-foreground">Tree is empty. Insert some values!</p>
            ) : (
              <svg width="800" height="400" className="overflow-visible">
                {renderTree(root)}
              </svg>
            )}
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
              <div className="w-4 h-4 bg-secondary rounded-full" />
              <span className="text-muted-foreground">Default</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded-full" />
              <span className="text-muted-foreground">Traversing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning rounded-full" />
              <span className="text-muted-foreground">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success rounded-full" />
              <span className="text-muted-foreground">Found</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insert:</span>
                <span className="font-mono text-primary">O(log n)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Search:</span>
                <span className="font-mono text-primary">O(log n)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
