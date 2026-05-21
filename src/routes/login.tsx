import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { FormField } from "@/components/FormField";
import { AnimatedButton } from "@/components/AnimatedButton";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";
import { tryAcceptPendingInvite } from "@/lib/invites";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Node_Family" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors, dirtyFields } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema), mode: "onChange",
  });

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(data);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    const ref = await tryAcceptPendingInvite();
    if (ref?.accepted) toast.success("Invite accepted 🌸");
    else if (ref && !ref.accepted && ref.reason) toast.error(ref.reason);
    navigate({ to: "/dashboard" });
  };

  return (
    <Layout>
      <section className="mx-auto max-w-md px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-soft p-8">
          <h1 className="text-2xl font-bold text-center">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">Log in to your tree.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <FormField label="Email" type="email" autoComplete="email"
              error={errors.email?.message} success={!!dirtyFields.email && !errors.email} {...register("email")} />
            <FormField label="Password" type="password" autoComplete="current-password"
              error={errors.password?.message} {...register("password")} />
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-navy hover:text-pink transition">Forgot password?</Link>
            </div>
            <AnimatedButton type="submit" disabled={submitting} className="w-full">
              {submitting ? "Logging in…" : "Log in"}
            </AnimatedButton>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-navy font-semibold hover:text-pink transition">Create account</Link>
          </p>
        </motion.div>
      </section>
    </Layout>
  );
}