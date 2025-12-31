"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import "@/styles/globals.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // aktifkan animasi setelah hydration
    setReady(true);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 flex relative">
      <motion.div
        initial={{ opacity: 0, y: 8 }}          // SSR & Client sama
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 8 }}
        transition={{ duration: 0.35 }}
        className="flex-1 w-full h-full"
        >
        {children}
      </motion.div>
    </div>
  );
}
