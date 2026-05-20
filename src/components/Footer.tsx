import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-pink grid place-items-center text-navy font-bold">N</div>
            <span className="font-bold text-navy">Node_Family</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Grow your family network through gentle, beautiful invites.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="text-navy font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/" className="hover:text-pink transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-pink transition">About</Link></li>
            <li><Link to="/contact" className="hover:text-pink transition">Contact</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="text-navy font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/login" className="hover:text-pink transition">Log in</Link></li>
            <li><Link to="/signup" className="hover:text-pink transition">Sign up</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
        Made with <Heart size={12} className="text-pink fill-pink" /> · © {new Date().getFullYear()} Node_Family
      </div>
    </footer>
  );
}