"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Car } from "lucide-react";

export const PageTransition = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 800); // durasi animasi 0.8 detik
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          key={pathname}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 dark:bg-slate-900/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ x: [0, 100, 0] }}
            transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
            className="text-blue-600 dark:text-blue-400"
          >
            <Car size={48} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
