import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Users, ShieldCheck, Share2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Node_Family — Grow your circle, beautifully" },
      { name: "description", content: "A soft, premium invite-based network for your family and trusted circle." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full bg-pink-soft text-navy px-4 py-1.5 text-xs font-medium mb-6"
        >
          <Sparkles size={14} /> Invite-only · soft & premium
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
          className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight max-w-3xl mx-auto"
        >
          Grow your circle,<br />
          <span className="text-pink">beautifully.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Node_Family is a gentle, invite-based network for the people you trust most.
          One invite at a time — watch your tree blossom.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/signup" className="rounded-full bg-pink text-navy px-7 py-3 text-sm font-semibold shadow-md hover:scale-105 transition-transform">
            Get started — it's free
          </Link>
          <Link to="/about" className="rounded-full bg-white text-navy px-7 py-3 text-sm font-semibold shadow-sm hover:bg-pink-soft transition">
            Learn more
          </Link>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Made for the people who matter.</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Soft on the eyes, serious about your network.</p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Users, title: "Invite gently", desc: "Send a beautiful invite via email. No noise, no spam." },
            { icon: Share2, title: "Watch it grow", desc: "Every accepted invite becomes a node on your tree." },
            { icon: ShieldCheck, title: "Quietly secure", desc: "Your data is private. Always encrypted, never sold." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <motion.div whileHover={{ y: -6 }} className="card-soft p-7 h-full">
                <div className="h-12 w-12 rounded-2xl bg-pink-soft text-navy grid place-items-center mb-4">
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24">
        <Reveal>
          <div className="rounded-3xl bg-navy text-white p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-pink/30 blur-3xl" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to plant the first seed?</h2>
            <p className="mt-3 text-white/70 max-w-md mx-auto">Create your account in seconds. Your family tree starts with you.</p>
            <Link to="/signup" className="mt-7 inline-block rounded-full bg-pink text-navy px-7 py-3 text-sm font-semibold hover:scale-105 transition-transform">
              Join Node_Family
            </Link>
          </div>
        </Reveal>
      </section>
    </Layout>
  );
}
