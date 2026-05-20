import { createFileRoute } from "@tanstack/react-router";
import { Heart, Sprout, Lock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Node_Family" }, { name: "description", content: "Why we built Node_Family." }] }),
  component: About,
});

function About() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-12 text-center">
        <Reveal>
          <h1 className="text-4xl md:text-5xl font-bold">About Node_Family</h1>
          <p className="mt-5 text-muted-foreground text-lg">
            We believe the strongest networks are the smallest — the people who actually show up.
            Node_Family is a quiet little space to invite, connect, and grow with those you trust.
          </p>
        </Reveal>
      </section>
      <section className="mx-auto max-w-5xl px-5 pb-20 grid gap-5 md:grid-cols-3">
        {[
          { icon: Heart, title: "Thoughtful", desc: "Every interaction designed to feel warm." },
          { icon: Sprout, title: "Organic", desc: "Your network grows naturally, one invite at a time." },
          { icon: Lock, title: "Private", desc: "Your tree is yours. We protect it." },
        ].map((v, i) => (
          <Reveal key={v.title} delay={i * 0.08}>
            <div className="card-soft p-7 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-pink-soft text-navy grid place-items-center mb-4">
                <v.icon size={22} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </Layout>
  );
}