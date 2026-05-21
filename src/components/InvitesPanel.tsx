import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Copy, Plus, Trash2, Check } from "lucide-react";
import { AnimatedButton } from "@/components/AnimatedButton";
import {
  createInvite,
  inviteLink,
  listInvites,
  revokeInvite,
  type InviteRow,
} from "@/lib/invites";

export function InvitesPanel({ userId }: { userId: string }) {
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setInvites(await listInvites(userId));
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load invites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onCreate = async () => {
    setCreating(true);
    try {
      const inv = await createInvite(userId);
      setInvites((prev) => [inv as InviteRow, ...prev]);
      toast.success("Invite created");
    } catch (e: any) {
      toast.error(e.message ?? "Could not create invite");
    } finally {
      setCreating(false);
    }
  };

  const copy = async (inv: InviteRow) => {
    await navigator.clipboard.writeText(inviteLink(inv.code));
    setCopiedId(inv.id);
    toast.success("Link copied");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const onRevoke = async (inv: InviteRow) => {
    try {
      await revokeInvite(inv.id);
      setInvites((prev) => prev.map((p) => (p.id === inv.id ? { ...p, status: "revoked" } : p)));
      toast.success("Invite revoked");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to revoke");
    }
  };

  const statusBadge = (s: InviteRow["status"]) => {
    const map: Record<InviteRow["status"], string> = {
      pending: "bg-pink-soft text-navy",
      accepted: "bg-pink text-navy",
      revoked: "bg-muted text-muted-foreground line-through",
      expired: "bg-muted text-muted-foreground",
    };
    return (
      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${map[s]}`}>
        {s}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="card-soft p-6 space-y-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Your invites</h2>
          <p className="text-sm text-muted-foreground">Share a link to grow your tree.</p>
        </div>
        <AnimatedButton onClick={onCreate} disabled={creating}>
          <Plus size={14} className="inline mr-1.5" />
          {creating ? "Creating…" : "New invite"}
        </AnimatedButton>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-14 rounded-xl bg-pink-soft/40 animate-pulse" />
          <div className="h-14 rounded-xl bg-pink-soft/40 animate-pulse" />
        </div>
      ) : invites.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          No invites yet — create your first one ✨
        </div>
      ) : (
        <ul className="space-y-2">
          {invites.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center gap-3 p-3 rounded-2xl border border-pink-soft/60 bg-white"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm font-bold text-navy">{inv.code}</code>
                  {statusBadge(inv.status)}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {inviteLink(inv.code)}
                </p>
              </div>
              <button
                onClick={() => copy(inv)}
                disabled={inv.status !== "pending"}
                className="p-2 rounded-lg text-navy hover:bg-pink-soft transition disabled:opacity-30"
                aria-label="Copy link"
              >
                {copiedId === inv.id ? <Check size={16} /> : <Copy size={16} />}
              </button>
              {inv.status === "pending" && (
                <button
                  onClick={() => onRevoke(inv)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-pink-soft transition"
                  aria-label="Revoke invite"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}