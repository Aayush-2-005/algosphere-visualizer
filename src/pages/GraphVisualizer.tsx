import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Trash2, MousePointer, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GraphNode {
  id: string;
  x: number;
  y: number;
  state: 'default' | 'visiting' | 'visited' | 'current' | 'path' | 'start' | 'end';
  distance?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  state: 'default' | 'traversing' | 'path' | 'considering';
}

type Algorithm = 'bfs' | 'dfs' | 'dijkstra';

export default function GraphVisualizer() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeLabel, setNodeLabel] = useState('');
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [edgeWeight, setEdgeWeight] = useState('1');
  const [message, setMessage] = useState('Click on the canvas to add nodes, then connect them');
  const [isAnimating, setIsAnimating] = useState(false);
  const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
  const [isAddingEdge, setIsAddingEdge] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const addNode = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isAnimating || isAddingEdge) return;
    
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const label = nodeLabel || String.fromCharCode(65 + nodes.length);
    
    if (nodes.find(n => n.id === label)) {
      setMessage(`Node ${label} already exists!`);
      return;
    }

    const newNode: GraphNode = {
      id: label,
      x,
      y,
      state: 'default',
    };

    setNodes(prev => [...prev, newNode]);
    setNodeLabel('');
    setMessage(`Added node ${label}. Click another node while in "Add Edge" mode to connect.`);
  }, [nodes, nodeLabel, isAnimating, isAddingEdge]);

  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isAnimating) return;

    if (isAddingEdge) {
      if (selectedNode && selectedNode !== nodeId) {
        const edgeExists = edges.some(
          edge => (edge.from === selectedNode && edge.to === nodeId) ||
                  (edge.from === nodeId && edge.to === selectedNode)
        );

        if (!edgeExists) {
          const weight = parseInt(edgeWeight) || 1;
          setEdges(prev => [...prev, { from: selectedNode, to: nodeId, weight, state: 'default' }]);
          setMessage(`Connected ${selectedNode} to ${nodeId} (weight: ${weight})`);
        }
        setSelectedNode(null);
        setIsAddingEdge(false);
      } else {
        setSelectedNode(nodeId);
        setMessage(`Selected ${nodeId}. Click another node to create an edge.`);
      }
    } else {
      setSelectedNode(nodeId);
      setStartNode(nodeId);
      setMessage(`Selected ${nodeId} as start node`);
    }
  }, [selectedNode, edges, isAddingEdge, isAnimating, edgeWeight]);

  const getAdjacencyList = useCallback(() => {
    const adj: Map<string, { node: string; weight: number }[]> = new Map();
    nodes.forEach(node => adj.set(node.id, []));
    edges.forEach(edge => {
      adj.get(edge.from)?.push({ node: edge.to, weight: edge.weight });
      adj.get(edge.to)?.push({ node: edge.from, weight: edge.weight });
    });
    return adj;
  }, [nodes, edges]);

  const runAlgorithm = useCallback(async (algorithm: Algorithm) => {
    if (!startNode || !nodes.find(n => n.id === startNode)) {
      setMessage('Please select a valid start node');
      return;
    }

    setIsAnimating(true);
    setTraversalOrder([]);
    
    const resetStates = () => {
      setNodes(prev => prev.map(n => ({ ...n, state: 'default', distance: undefined })));
      setEdges(prev => prev.map(e => ({ ...e, state: 'default' })));
    };
    resetStates();

    const adj = getAdjacencyList();
    const visited = new Set<string>();
    const order: string[] = [];

    const updateNodeState = (id: string, state: GraphNode['state'], distance?: number) => {
      setNodes(prev => prev.map(n => n.id === id ? { ...n, state, distance } : n));
    };

    const updateEdgeState = (from: string, to: string, state: GraphEdge['state']) => {
      setEdges(prev => prev.map(e => 
        ((e.from === from && e.to === to) || (e.from === to && e.to === from))
          ? { ...e, state }
          : e
      ));
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    if (algorithm === 'bfs') {
      setMessage('Running BFS...');
      const queue: string[] = [startNode];
      visited.add(startNode);

      while (queue.length > 0) {
        const current = queue.shift()!;
        updateNodeState(current, 'current');
        order.push(current);
        setTraversalOrder([...order]);
        await delay(600);

        const neighbors = adj.get(current) || [];
        for (const { node: neighbor } of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            updateEdgeState(current, neighbor, 'traversing');
            updateNodeState(neighbor, 'visiting');
            await delay(300);
            queue.push(neighbor);
          }
        }

        updateNodeState(current, 'visited');
      }
    } else if (algorithm === 'dfs') {
      setMessage('Running DFS...');
      const stack: string[] = [startNode];

      while (stack.length > 0) {
        const current = stack.pop()!;
        
        if (visited.has(current)) continue;
        visited.add(current);

        updateNodeState(current, 'current');
        order.push(current);
        setTraversalOrder([...order]);
        await delay(600);

        const neighbors = adj.get(current) || [];
        for (const { node: neighbor } of [...neighbors].reverse()) {
          if (!visited.has(neighbor)) {
            updateEdgeState(current, neighbor, 'traversing');
            updateNodeState(neighbor, 'visiting');
            await delay(200);
            stack.push(neighbor);
          }
        }

        updateNodeState(current, 'visited');
      }
    } else if (algorithm === 'dijkstra') {
      setMessage('Running Dijkstra\'s Algorithm...');
      
      const distances: Map<string, number> = new Map();
      const previous: Map<string, string | null> = new Map();
      const unvisited = new Set<string>();

      nodes.forEach(node => {
        distances.set(node.id, node.id === startNode ? 0 : Infinity);
        previous.set(node.id, null);
        unvisited.add(node.id);
      });

      updateNodeState(startNode, 'start', 0);

      while (unvisited.size > 0) {
        let minNode: string | null = null;
        let minDist = Infinity;

        for (const nodeId of unvisited) {
          const dist = distances.get(nodeId) || Infinity;
          if (dist < minDist) {
            minDist = dist;
            minNode = nodeId;
          }
        }

        if (minNode === null || minDist === Infinity) break;

        updateNodeState(minNode, 'current', minDist);
        order.push(minNode);
        setTraversalOrder([...order]);
        await delay(600);

        unvisited.delete(minNode);

        const neighbors = adj.get(minNode) || [];
        for (const { node: neighbor, weight } of neighbors) {
          if (unvisited.has(neighbor)) {
            updateEdgeState(minNode, neighbor, 'considering');
            await delay(200);

            const newDist = (distances.get(minNode) || 0) + weight;
            if (newDist < (distances.get(neighbor) || Infinity)) {
              distances.set(neighbor, newDist);
              previous.set(neighbor, minNode);
              updateNodeState(neighbor, 'visiting', newDist);
            }
          }
        }

        if (minNode !== startNode) {
          updateNodeState(minNode, 'visited', minDist);
        }
      }

      // Highlight shortest path if end node is set
      if (endNode && previous.has(endNode)) {
        let current: string | null = endNode;
        while (current) {
          updateNodeState(current, 'path', distances.get(current));
          const prev = previous.get(current);
          if (prev) {
            updateEdgeState(prev, current, 'path');
          }
          current = prev;
          await delay(300);
        }
        setMessage(`Shortest path to ${endNode}: ${distances.get(endNode)}`);
      }
    }

    if (algorithm !== 'dijkstra') {
      setMessage(`${algorithm.toUpperCase()} complete! Order: ${order.join(' → ')}`);
    }
    setIsAnimating(false);
  }, [startNode, endNode, nodes, getAdjacencyList]);

  const clear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setStartNode('');
    setEndNode('');
    setTraversalOrder([]);
    setMessage('Graph cleared. Click on the canvas to add nodes.');
  }, []);

  const getNodeStyle = (state: GraphNode['state']) => {
    const base = 'w-10 h-10 rounded-full flex flex-col items-center justify-center font-mono font-bold text-xs transition-all duration-300 cursor-pointer';
    switch (state) {
      case 'current':
        return `${base} bg-warning text-warning-foreground scale-125 shadow-lg`;
      case 'visiting':
        return `${base} bg-primary/50 text-primary-foreground scale-110`;
      case 'visited':
        return `${base} bg-success text-success-foreground`;
      case 'path':
        return `${base} bg-accent text-accent-foreground scale-125 shadow-xl`;
      case 'start':
        return `${base} bg-primary text-primary-foreground scale-110`;
      case 'end':
        return `${base} bg-destructive text-destructive-foreground scale-110`;
      default:
        return `${base} bg-secondary text-secondary-foreground hover:scale-110`;
    }
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
            <span className="gradient-text">Graph</span> Visualizer
          </h1>
          <p className="text-muted-foreground">
            Create graphs and visualize BFS, DFS & Dijkstra's algorithms
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Node Label</label>
              <Input
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value.toUpperCase())}
                placeholder="A, B, C..."
                maxLength={2}
                className="bg-muted/50"
                disabled={isAnimating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Node</label>
              <Input
                value={startNode}
                onChange={(e) => setStartNode(e.target.value.toUpperCase())}
                placeholder="Start..."
                className="bg-muted/50"
                disabled={isAnimating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Node (Dijkstra)</label>
              <Input
                value={endNode}
                onChange={(e) => setEndNode(e.target.value.toUpperCase())}
                placeholder="End..."
                className="bg-muted/50"
                disabled={isAnimating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Edge Weight</label>
              <Input
                type="number"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(e.target.value)}
                placeholder="Weight..."
                min="1"
                className="bg-muted/50"
                disabled={isAnimating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <Button
                onClick={() => {
                  setIsAddingEdge(!isAddingEdge);
                  setSelectedNode(null);
                  setMessage(isAddingEdge ? 'Edge mode off' : 'Click two nodes to connect them');
                }}
                variant={isAddingEdge ? 'default' : 'outline'}
                className="w-full"
                disabled={isAnimating}
              >
                <MousePointer className="w-4 h-4 mr-2" />
                {isAddingEdge ? 'Adding Edge...' : 'Add Edge'}
              </Button>
            </div>
          </div>

          {/* Algorithm Buttons */}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={() => runAlgorithm('bfs')}
              disabled={isAnimating || nodes.length === 0}
              className="control-btn-primary"
            >
              <Play className="w-4 h-4 mr-2" />
              Run BFS
            </Button>
            <Button
              onClick={() => runAlgorithm('dfs')}
              disabled={isAnimating || nodes.length === 0}
              variant="secondary"
            >
              <Play className="w-4 h-4 mr-2" />
              Run DFS
            </Button>
            <Button
              onClick={() => runAlgorithm('dijkstra')}
              disabled={isAnimating || nodes.length === 0}
              variant="outline"
            >
              <Route className="w-4 h-4 mr-2" />
              Dijkstra's
            </Button>
            <Button onClick={clear} variant="destructive" disabled={isAnimating}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Message & Result */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            {traversalOrder.length > 0 && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Traversal Order:</p>
                <p className="font-mono text-sm text-primary">{traversalOrder.join(' → ')}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Graph Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4"
        >
          <svg
            ref={svgRef}
            width="100%"
            height="400"
            className="cursor-crosshair bg-muted/20 rounded-lg"
            onClick={addNode}
          >
            {/* Edges */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const strokeColor = edge.state === 'traversing' 
                ? 'hsl(var(--warning))' 
                : edge.state === 'path' 
                ? 'hsl(var(--accent))' 
                : edge.state === 'considering'
                ? 'hsl(var(--primary))'
                : 'hsl(var(--muted-foreground))';

              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={strokeColor}
                    strokeWidth={edge.state === 'default' ? 2 : 4}
                    opacity={edge.state === 'default' ? 0.5 : 1}
                    className="transition-all duration-300"
                  />
                  {edge.weight > 1 && (
                    <text
                      x={midX}
                      y={midY - 8}
                      textAnchor="middle"
                      fill="hsl(var(--foreground))"
                      className="text-xs font-mono font-bold"
                    >
                      {edge.weight}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <foreignObject
                key={node.id}
                x={node.x - 20}
                y={node.y - 20}
                width="40"
                height="40"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`${getNodeStyle(node.state)} ${
                    selectedNode === node.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                  }`}
                  onClick={(e) => handleNodeClick(node.id, e)}
                >
                  <span>{node.id}</span>
                  {node.distance !== undefined && (
                    <span className="text-[10px] opacity-80">{node.distance === Infinity ? '∞' : node.distance}</span>
                  )}
                </motion.div>
              </foreignObject>
            ))}

            {/* Empty State */}
            {nodes.length === 0 && (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                className="text-sm"
              >
                Click anywhere to add nodes
              </text>
            )}
          </svg>
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
              <span className="text-muted-foreground">Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning rounded-full" />
              <span className="text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/50 rounded-full" />
              <span className="text-muted-foreground">In Queue/Stack</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success rounded-full" />
              <span className="text-muted-foreground">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent rounded-full" />
              <span className="text-muted-foreground">Shortest Path</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">BFS/DFS:</span>
                <span className="font-mono text-primary">O(V + E)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dijkstra:</span>
                <span className="font-mono text-primary">O(V² or V log V)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nodes:</span>
                <span className="font-mono text-primary">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Edges:</span>
                <span className="font-mono text-primary">{edges.length}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
