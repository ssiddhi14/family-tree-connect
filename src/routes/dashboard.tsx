import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Lock, LogOut, Upload, Send, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { FormField } from "@/components/FormField";
import { AnimatedButton } from "@/components/AnimatedButton";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  completion_percentage: number;
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Node_Family" }] }),
  component: Dashboard,
});

function calcCompletion(p: Partial<Profile>) {
  const fields = [p.full_name, p.phone, p.address, p.avatar_url];
  const filled = fields.filter((v) => v && String(v).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

function Dashboard() {
  const router = useRouter();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors, dirtyFields } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema), mode: "onChange",
  });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (error) toast.error(error.message);
      else if (data) {
        setProfile(data as Profile);
        reset({ full_name: data.full_name ?? "", phone: data.phone ?? "", address: data.address ?? "" });
      }
      setLoading(false);
    })();
  }, [navigate, reset]);

  const watched = watch();
  const liveCompletion = profile ? calcCompletion({ ...profile, ...watched }) : 0;

  const onSubmit = async (data: ProfileInput) => {
    if (!profile) return;
    setSaving(true);
    const completion = calcCompletion({ ...profile, ...data });
    const { error } = await supabase.from("profiles").update({ ...data, completion_percentage: completion }).eq("id", profile.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setProfile({ ...profile, ...data, completion_percentage: completion });
    toast.success("Profile saved");
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) { toast.error("Only JPG or PNG, please."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2 MB."); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${pub.publicUrl}?t=${Date.now()}`;
    const completion = calcCompletion({ ...profile, avatar_url: url });
    const { error } = await supabase.from("profiles").update({ avatar_url: url, completion_percentage: completion }).eq("id", profile.id);
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    setProfile({ ...profile, avatar_url: url, completion_percentage: completion });
    toast.success("Photo updated");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-5 py-16 space-y-4">
          <div className="h-32 rounded-3xl bg-white/60 animate-pulse" />
          <div className="h-64 rounded-3xl bg-white/60 animate-pulse" />
        </div>
      </Layout>
    );
  }
  if (!profile) return null;

  const isComplete = liveCompletion === 100;

  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-5 py-12 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-soft p-7 flex items-center gap-5">
          <div className="relative h-20 w-20 rounded-full bg-pink-soft grid place-items-center overflow-hidden shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-navy font-bold text-2xl">{profile.email[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{profile.full_name || "Welcome 👋"}</h1>
            <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Profile completion</span>
                <span className="font-semibold text-navy">{liveCompletion}%</span>
              </div>
              <div className="h-2 rounded-full bg-pink-soft overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${liveCompletion}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }} className="h-full bg-pink" />
              </div>
            </div>
          </div>
          <button onClick={logout} className="text-muted-foreground hover:text-navy transition" aria-label="Log out">
            <LogOut size={18} />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`card-soft p-6 flex items-center gap-4 ${isComplete ? "" : "opacity-70"}`}>
          <div className={`h-12 w-12 rounded-2xl grid place-items-center ${isComplete ? "bg-pink text-navy" : "bg-muted text-muted-foreground"}`}>
            {isComplete ? <Send size={20} /> : <Lock size={20} />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-navy">Invite your circle</h3>
            <p className="text-sm text-muted-foreground">
              {isComplete ? "Ready to send your first invite!" : "Unlocks once your profile is 100% complete."}
            </p>
          </div>
          <AnimatedButton disabled={!isComplete} variant={isComplete ? "primary" : "ghost"}>
            {isComplete ? "Coming next" : "Locked"}
          </AnimatedButton>
        </motion.div>

        <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="card-soft p-7 space-y-5">
          <div>
            <h2 className="text-lg font-bold">Complete your profile</h2>
            <p className="text-sm text-muted-foreground">A little detail goes a long way.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-2">Profile photo</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-pink-soft grid place-items-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="text-navy/50" size={20} />
                )}
              </div>
              <label className="cursor-pointer rounded-full bg-pink-soft text-navy px-5 py-2.5 text-sm font-semibold hover:scale-105 transition-transform inline-flex items-center gap-2">
                <Upload size={14} />
                {uploading ? "Uploading…" : profile.avatar_url ? "Replace" : "Upload"}
                <input type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={onAvatar} disabled={uploading} />
              </label>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">JPG or PNG · max 2 MB</p>
          </div>
          <FormField label="Full name" placeholder="Jane Doe" error={errors.full_name?.message}
            success={!!dirtyFields.full_name && !errors.full_name} {...register("full_name")} />
          <FormField label="Phone number" placeholder="+1 555 123 4567" error={errors.phone?.message}
            success={!!dirtyFields.phone && !errors.phone} {...register("phone")} />
          <FormField label="Address" placeholder="123 Soft St., Cozytown" error={errors.address?.message}
            success={!!dirtyFields.address && !errors.address} {...register("address")} />
          <AnimatedButton type="submit" disabled={saving} className="w-full">
            {saving ? "Saving…" : "Save profile"}
          </AnimatedButton>
          <AnimatePresence>
            {isComplete && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-xl bg-pink-soft text-navy p-3 text-sm font-medium">
                <CheckCircle2 size={16} className="text-pink" />
                Your profile is complete — invites unlock soon!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </section>
    </Layout>
  );
}