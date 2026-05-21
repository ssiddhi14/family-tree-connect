import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "node_family_pending_ref";

export function rememberRef(code: string | null) {
  if (typeof window === "undefined") return;
  if (code) localStorage.setItem(STORAGE_KEY, code.toUpperCase());
  else localStorage.removeItem(STORAGE_KEY);
}

export function getPendingRef(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function inviteLink(code: string) {
  if (typeof window === "undefined") return `/invite/${code}`;
  return `${window.location.origin}/invite/${code}`;
}

export async function createInvite(inviterId: string, inviteeEmail?: string) {
  const { data: codeRow, error: codeErr } = await supabase.rpc("generate_invite_code");
  if (codeErr) throw codeErr;
  const code = (codeRow as unknown as string) ?? "";
  const { data, error } = await (supabase.from as any)("invites").insert({
    code,
    inviter_id: inviterId,
    invitee_email: inviteeEmail || null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function listInvites(inviterId: string) {
  const { data, error } = await (supabase.from as any)("invites")
    .select("*")
    .eq("inviter_id", inviterId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function revokeInvite(id: string) {
  const { error } = await (supabase.from as any)("invites")
    .update({ status: "revoked" })
    .eq("id", id);
  if (error) throw error;
}

export async function tryAcceptPendingInvite(): Promise<
  { accepted: true } | { accepted: false; reason?: string } | null
> {
  const code = getPendingRef();
  if (!code) return null;
  const { data, error } = await supabase.rpc("accept_invite", { _code: code });
  if (error) {
    return { accepted: false, reason: error.message };
  }
  const result = data as { ok: boolean; error?: string } | null;
  rememberRef(null);
  if (result?.ok) return { accepted: true };
  return { accepted: false, reason: result?.error };
}

export type InviteRow = {
  id: string;
  code: string;
  inviter_id: string;
  invitee_email: string | null;
  status: "pending" | "accepted" | "revoked" | "expired";
  accepted_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
};