import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { FormField } from "@/components/FormField";
import { AnimatedButton } from "@/components/AnimatedButton";
import { signupSchema, type SignupInput, passwordChecks } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Node_Family" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, dirtyFields } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema), mode: "onChange",
  });
  const pw = watch("password") ?? "";
  const checks = passwordChecks(pw);

  const onSubmit = async (data: SignupInput) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: data.email, password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.toLowerCase().includes("registered") ? "That email is already registered." : error.message);
      return;
    }
    toast.success("Account created! Check your email to confirm.");
    navigate({ to: "/login" });
  };

  return (
    <Layout>
      <section className="mx-auto max-w-md px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-soft p-8">
          <h1 className="text-2xl font-bold text-center">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">Start your tree in seconds.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <FormField label="Email" type="email" autoComplete="email" placeholder="you@email.com"
              error={errors.email?.message} success={!!dirtyFields.email && !errors.email} {...register("email")} />
            <FormField label="Password" type="password" autoComplete="new-password" placeholder="••••••••"
              error={errors.password?.message} success={!!dirtyFields.password && !errors.password} {...register("password")} />
            <ul className="grid grid-cols-2 gap-1.5 pt-1">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5 text-xs">
                  {c.ok ? <Check size={12} className="text-pink" /> : <X size={12} className="text-muted-foreground/50" />}
                  <span className={c.ok ? "text-navy" : "text-muted-foreground"}>{c.label}</span>
                </li>
              ))}
            </ul>
            <AnimatedButton type="submit" disabled={submitting} className="w-full mt-2">
              {submitting ? "Creating…" : "Create account"}
            </AnimatedButton>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-navy font-semibold hover:text-pink transition">Log in</Link>
          </p>
        </motion.div>
      </section>
    </Layout>
  );
}