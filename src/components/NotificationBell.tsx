import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { listNotifications, markAllRead, type NotificationRow } from "@/lib/notifications";

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);

  const load = async () => {
    try {
      setItems(await listNotifications(userId));
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const unread = items.filter((n) => !n.read).length;

  const toggle = async () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      await markAllRead(userId);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative p-2 rounded-full text-navy hover:bg-pink-soft transition"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-pink" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto card-soft p-2 z-50"
          >
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Notifications
            </div>
            {items.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                You're all caught up ✨
              </div>
            ) : (
              <ul className="space-y-1">
                {items.map((n) => (
                  <li key={n.id} className="px-3 py-2.5 rounded-xl hover:bg-pink-soft/40 transition">
                    <p className="text-sm font-semibold text-navy">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}