import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Construction size={40} className="text-primary-foreground" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">
          <span className="gradient-text">{title}</span>
        </h1>
        
        <p className="text-muted-foreground mb-8">
          {description}
        </p>

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="control-btn-secondary flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Back to Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
