import { motion } from 'framer-motion';

export function Layout({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-7xl mx-auto px-4 py-6"
    >
      {children}
    </motion.main>
  );
}
