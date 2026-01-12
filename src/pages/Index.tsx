import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  Zap, 
  BookOpen, 
  Users,
  BarChart3,
  Search,
  Network,
  TreeDeciduous,
  Layers,
  List,
  Link as LinkIcon
} from 'lucide-react';

const features = [
  {
    icon: Play,
    title: 'Step-by-Step Visualization',
    description: 'Watch algorithms execute with clear, animated steps',
  },
  {
    icon: Zap,
    title: 'Speed Control',
    description: 'Adjust animation speed from slow learning to fast overview',
  },
  {
    icon: BookOpen,
    title: 'Interactive Learning',
    description: 'Learn by doing with hands-on algorithm exploration',
  },
  {
    icon: Users,
    title: 'Beginner Friendly',
    description: 'Perfect for students starting their DSA journey',
  },
];

const algorithms = [
  {
    icon: BarChart3,
    title: 'Sorting',
    description: 'Bubble, Selection, Insertion, Merge, Quick, Heap Sort',
    path: '/sorting',
    color: 'from-primary to-secondary',
  },
  {
    icon: Search,
    title: 'Searching',
    description: 'Linear Search, Binary Search algorithms',
    path: '/searching',
    color: 'from-secondary to-accent',
  },
  {
    icon: Network,
    title: 'Graph',
    description: 'BFS, DFS, Dijkstra, Prim, Kruskal algorithms',
    path: '/graph',
    color: 'from-accent to-primary',
  },
  {
    icon: TreeDeciduous,
    title: 'Tree',
    description: 'Binary Tree, BST, Tree Traversals',
    path: '/tree',
    color: 'from-success to-primary',
  },
  {
    icon: Layers,
    title: 'Stack',
    description: 'Push, Pop, Peek - LIFO operations',
    path: '/stack',
    color: 'from-warning to-destructive',
  },
  {
    icon: List,
    title: 'Queue',
    description: 'Enqueue, Dequeue - FIFO operations',
    path: '/queue',
    color: 'from-destructive to-accent',
  },
  {
    icon: LinkIcon,
    title: 'Linked List',
    description: 'Insert, Delete, Traverse operations',
    path: '/linked-list',
    color: 'from-primary to-success',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Visualize{' '}
              <span className="gradient-text">Data Structures</span>
              <br />
              <span className="gradient-text">&</span> Algorithms
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Master algorithms through interactive visualizations. See how sorting, searching, 
              and graph algorithms work step-by-step with beautiful animations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sorting">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="control-btn-primary text-lg px-8 py-4 flex items-center gap-2"
                >
                  <Play size={20} />
                  Start Visualizing
                </motion.button>
              </Link>
              <a href="#algorithms">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="control-btn-secondary text-lg px-8 py-4 flex items-center gap-2"
                >
                  Explore Algorithms
                  <ArrowRight size={20} />
                </motion.button>
              </a>
            </div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 flex justify-center gap-1 md:gap-2"
          >
            {[40, 70, 55, 85, 30, 60, 75, 45, 90, 35, 65, 80, 50, 95, 25].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}px` }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                className="w-3 md:w-6 bar-default rounded-t-sm"
                style={{ maxHeight: '120px' }}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Why DSA Visualizer?</h2>
            <p className="section-subtitle">
              Learning algorithms doesn't have to be boring. Visualize, interact, and understand.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="feature-icon mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithms Grid */}
      <section id="algorithms" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Explore Algorithms</h2>
            <p className="section-subtitle">
              Choose a category to start visualizing algorithms in action.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {algorithms.map((algo, i) => (
              <motion.div
                key={algo.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={algo.path}>
                  <div className="algo-card h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${algo.color} flex items-center justify-center mb-4`}>
                      <algo.icon size={24} className="text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{algo.title}</h3>
                    <p className="text-muted-foreground text-sm">{algo.description}</p>
                    <div className="mt-4 flex items-center text-primary text-sm font-medium">
                      Visualize
                      <ArrowRight size={16} className="ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 DSA Visualizer. Built for learning algorithms visually.</p>
        </div>
      </footer>
    </div>
  );
}
