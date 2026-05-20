import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

export function AnimatedButton({ variant = "primary", className, children, ...rest }: Props) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-shadow disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-pink text-navy shadow-md hover:shadow-lg",
    secondary: "bg-navy text-white shadow-md hover:shadow-lg",
    ghost: "bg-transparent text-navy hover:bg-pink-soft",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cn(base, variants[variant], className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}