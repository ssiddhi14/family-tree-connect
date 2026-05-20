import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-navy text-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="h-8 w-8 rounded-full bg-pink grid place-items-center text-navy font-bold"
          >
            N
          </motion.div>
          <span className="font-bold tracking-tight text-lg">Node_Family</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-white/80 hover:text-pink transition-colors"
              activeProps={{ className: "text-pink" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {signedIn ? (
            <Link
              to="/dashboard"
              className="rounded-full bg-pink text-navy px-5 py-2 text-sm font-semibold hover:scale-105 transition-transform"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/90 hover:text-pink transition">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-pink text-navy px-5 py-2 text-sm font-semibold hover:scale-105 transition-transform"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10"
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-white/10 px-5 py-4 space-y-3"
        >
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block text-sm text-white/90 hover:text-pink"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {signedIn ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-full bg-pink text-navy text-center px-5 py-2 text-sm font-semibold">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-white/90">Log in</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="rounded-full bg-pink text-navy text-center px-5 py-2 text-sm font-semibold">
                  Get started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}