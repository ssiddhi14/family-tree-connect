import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  success?: boolean;
};

export const FormField = forwardRef<HTMLInputElement, Props>(
  ({ label, error, success, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-navy">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-white px-4 py-3 text-sm text-foreground outline-none transition-all",
              "focus:ring-2 focus:ring-pink focus:border-pink",
              error ? "border-destructive focus:ring-destructive focus:border-destructive" : "border-border",
              className,
            )}
            {...rest}
          />
          {success && !error && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-pink grid place-items-center"
            >
              <Check size={14} className="text-navy" />
            </motion.div>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-destructive"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
FormField.displayName = "FormField";