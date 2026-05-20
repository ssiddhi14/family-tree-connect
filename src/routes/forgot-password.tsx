import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { FormField } from "@/components/FormField";
import { AnimatedButton } from "@/components/AnimatedButton";
import { forgotSchema } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Node_Family" }] }),
  component: Forgot,
});

function Forgot() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(forgotSchema), mode: "onChange",
  });

  const onSubmit = async (data: { email: string }) => {
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Reset link sent — check your inbox.");
  };

  return (
    <Layout>
      <section className="mx-auto max-w-md px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-soft p-8">
          <h1 className="text-2xl font-bold text-center">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">We'll email you a link to set a new one.</p>
          {sent ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-xl bg-pink-soft text-navy p-4 text-sm text-center">
              If that email exists, a reset link is on its way.
            </motion.p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
              <FormField label="Email" type="email" error={errors.email?.message} {...register("email")} />
              <AnimatedButton type="submit" disabled={submitting} className="w-full">
                {submitting ? "Sending…" : "Send reset link"}
              </AnimatedButton>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-navy font-semibold hover:text-pink transition">Back to log in</Link>
          </p>
        </motion.div>
      </section>
    </Layout>
  );
}