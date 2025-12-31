"use client";

import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

export const LoadingCarAnimation = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        animate={{ x: [0, 100, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-blue-600 dark:text-blue-400"
      >
        <Car size={48} />
      </motion.div>
    </div>
  );
};
