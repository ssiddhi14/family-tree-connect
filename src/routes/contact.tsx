import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Node_Family" }, { name: "description", content: "Get in touch with us." }] }),
  component: Contact,
});

function Contact() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-12 text-center">
        <Reveal>
          <h1 className="text-4xl md:text-5xl font-bold">Say hello.</h1>
          <p className="mt-4 text-muted-foreground text-lg">
            We'd love to hear from you. Feedback, partnership, or just a friendly hi.
          </p>
        </Reveal>
      </section>
      <section className="mx-auto max-w-4xl px-5 pb-20 grid gap-5 md:grid-cols-3">
        {[
          { icon: Mail, title: "Email", value: "hello@nodefamily.app" },
          { icon: MessageCircle, title: "Chat", value: "Mon–Fri, 9–17 CET" },
          { icon: MapPin, title: "Based in", value: "Everywhere kind" },
        ].map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08}>
            <div className="card-soft p-7 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-pink-soft text-navy grid place-items-center mb-4">
                <c.icon size={22} />
              </div>
              <h3 className="text-base font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.value}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </Layout>
  );
}