
-- Referrer link on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_parent ON public.profiles(parent_id);

-- Invite status enum
DO $$ BEGIN
  CREATE TYPE public.invite_status AS ENUM ('pending','accepted','revoked','expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Invites table
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  inviter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_email text,
  status public.invite_status NOT NULL DEFAULT 'pending',
  accepted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invites_inviter ON public.invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invites_code ON public.invites(code);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inviter views own invites" ON public.invites;
CREATE POLICY "Inviter views own invites" ON public.invites
  FOR SELECT TO authenticated USING (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "Admins view all invites" ON public.invites;
CREATE POLICY "Admins view all invites" ON public.invites
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Profile-complete users create invites" ON public.invites;
CREATE POLICY "Profile-complete users create invites" ON public.invites
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = inviter_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.completion_percentage >= 100
    )
  );

DROP POLICY IF EXISTS "Inviter revokes own invites" ON public.invites;
CREATE POLICY "Inviter revokes own invites" ON public.invites
  FOR UPDATE TO authenticated
  USING (auth.uid() = inviter_id) WITH CHECK (auth.uid() = inviter_id);

CREATE TRIGGER trg_invites_updated
  BEFORE UPDATE ON public.invites
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Generate a short uppercase invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, 1 + floor(random()*length(chars))::int, 1);
  END LOOP;
  RETURN result;
END $$;

-- Accept an invite atomically (called after signup)
CREATE OR REPLACE FUNCTION public.accept_invite(_code text, _user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv record;
BEGIN
  SELECT * INTO inv FROM public.invites
   WHERE code = _code FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid invite code');
  END IF;

  IF inv.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invite already used or revoked');
  END IF;

  IF inv.expires_at < now() THEN
    UPDATE public.invites SET status='expired' WHERE id = inv.id;
    RETURN jsonb_build_object('ok', false, 'error', 'Invite has expired');
  END IF;

  IF inv.inviter_id = _user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'You cannot accept your own invite');
  END IF;

  -- Set referrer if not already set
  UPDATE public.profiles SET parent_id = inv.inviter_id
   WHERE id = _user_id AND parent_id IS NULL;

  UPDATE public.invites
     SET status='accepted', accepted_by=_user_id, accepted_at=now()
   WHERE id = inv.id;

  -- Notify the inviter
  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (inv.inviter_id, 'invite_accepted', 'Someone joined your tree!',
          'A new member just accepted your invite.');

  RETURN jsonb_build_object('ok', true, 'inviter_id', inv.inviter_id);
END $$;

GRANT EXECUTE ON FUNCTION public.accept_invite(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_invite_code() TO authenticated;

-- Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
