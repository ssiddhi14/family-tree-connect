import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { FormField } from "@/components/FormField";
import { AnimatedButton } from "@/components/AnimatedButton";
import { resetSchema, passwordChecks } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "New password — Node_Family" }] }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<{ password: string }>({
    resolver: zodResolver(resetSchema), mode: "onChange",
  });
  const pw = watch("password") ?? "";
  const checks = passwordChecks(pw);

  const onSubmit = async (data: { password: string }) => {
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: data.password });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated.");
    navigate({ to: "/dashboard" });
  };

  return (
    <Layout>
      <section className="mx-auto max-w-md px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-soft p-8">
          <h1 className="text-2xl font-bold text-center">Set a new password</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <FormField label="New password" type="password" autoComplete="new-password"
              error={errors.password?.message} {...register("password")} />
            <ul className="grid grid-cols-2 gap-1.5">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5 text-xs">
                  {c.ok ? <Check size={12} className="text-pink" /> : <X size={12} className="text-muted-foreground/50" />}
                  <span className={c.ok ? "text-navy" : "text-muted-foreground"}>{c.label}</span>
                </li>
              ))}
            </ul>
            <AnimatedButton type="submit" disabled={submitting} className="w-full">
              {submitting ? "Saving…" : "Update password"}
            </AnimatedButton>
          </form>
        </motion.div>
      </section>
    </Layout>
  );
}