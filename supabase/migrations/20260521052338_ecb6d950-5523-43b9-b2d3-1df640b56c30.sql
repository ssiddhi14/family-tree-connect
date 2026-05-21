
CREATE OR REPLACE FUNCTION public.accept_invite(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv record;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO inv FROM public.invites WHERE code = _code FOR UPDATE;
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
  IF inv.inviter_id = uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'You cannot accept your own invite');
  END IF;

  UPDATE public.profiles SET parent_id = inv.inviter_id
   WHERE id = uid AND parent_id IS NULL;

  UPDATE public.invites
     SET status='accepted', accepted_by=uid, accepted_at=now()
   WHERE id = inv.id;

  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (inv.inviter_id, 'invite_accepted', 'Someone joined your tree!',
          'A new member just accepted your invite.');

  RETURN jsonb_build_object('ok', true, 'inviter_id', inv.inviter_id);
END $$;

DROP FUNCTION IF EXISTS public.accept_invite(text, uuid);

GRANT EXECUTE ON FUNCTION public.accept_invite(text) TO authenticated;
