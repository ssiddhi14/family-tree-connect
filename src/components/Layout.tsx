import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Blobs } from "./Blobs";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      <Blobs />
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 relative z-10"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}