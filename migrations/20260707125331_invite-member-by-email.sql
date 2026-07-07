CREATE OR REPLACE FUNCTION public.invite_group_member_by_email(
  p_group_id UUID,
  p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_member_id UUID;
  v_email TEXT;
BEGIN
  v_email := lower(trim(p_email));

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF NOT public.is_group_member(p_group_id) THEN
    RAISE EXCEPTION 'You must be a group member to invite others';
  END IF;

  SELECT u.id
  INTO v_user_id
  FROM auth.users u
  WHERE lower(u.email) = v_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No SplitMate account found for this email';
  END IF;

  IF v_user_id = (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'You are already in this group';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = p_group_id
      AND gm.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'This person is already in the group';
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (p_group_id, v_user_id, 'member')
  RETURNING id INTO v_member_id;

  INSERT INTO public.profiles (id)
  VALUES (v_user_id)
  ON CONFLICT (id) DO NOTHING;

  RETURN jsonb_build_object(
    'member_id', v_member_id,
    'user_id', v_user_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.invite_group_member_by_email(UUID, TEXT) TO authenticated;
