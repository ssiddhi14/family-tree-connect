import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
import { AnimatedButton } from "@/components/AnimatedButton";
import { supabase } from "@/integrations/supabase/client";
import { rememberRef, tryAcceptPendingInvite } from "@/lib/invites";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/$code")({
  head: () => ({ meta: [{ title: "You're invited — Node_Family" }] }),
  component: InvitePage,
});

function InvitePage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    rememberRef(code);
    (async () => {
      const { data } = await supabase.auth.getSession();
      const isIn = !!data.session;
      setSignedIn(isIn);
      setChecking(false);
      if (isIn) {
        const res = await tryAcceptPendingInvite();
        if (res?.accepted) {
          toast.success("Invite accepted! Welcome to the tree 🌸");
          navigate({ to: "/dashboard" });
        } else if (res && !res.accepted) {
          toast.error(res.reason ?? "Invite could not be accepted");
        }
      }
    })();
  }, [code, navigate]);

  return (
    <Layout>
      <section className="mx-auto max-w-md px-5 py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-soft p-8 text-center"
        >
          <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-pink-soft grid place-items-center">
            <Sparkles className="text-navy" size={22} />
          </div>
          <h1 className="text-2xl font-bold">You've been invited</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the Node_Family tree with invite code
          </p>
          <p className="mt-3 font-mono text-lg font-bold text-navy tracking-widest">{code}</p>

          {checking ? (
            <div className="mt-6 h-10 rounded-full bg-pink-soft/50 animate-pulse" />
          ) : signedIn ? (
            <p className="mt-6 text-sm text-muted-foreground">Accepting your invite…</p>
          ) : (
            <div className="mt-7 space-y-3">
              <Link to="/signup" className="block">
                <AnimatedButton className="w-full">Create account &amp; accept</AnimatedButton>
              </Link>
              <Link to="/login" className="block text-sm text-navy hover:text-pink transition">
                Already have an account? Log in
              </Link>
            </div>
          )}
        </motion.div>
      </section>
    </Layout>
  );
}