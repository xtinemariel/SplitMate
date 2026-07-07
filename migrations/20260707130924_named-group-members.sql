-- Allow group members without SplitMate accounts (name-only placeholders).

ALTER TABLE public.group_members
  ADD COLUMN display_name TEXT;

ALTER TABLE public.group_members
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.group_members
  DROP CONSTRAINT IF EXISTS group_members_group_id_user_id_key;

CREATE UNIQUE INDEX group_members_group_user_unique
  ON public.group_members (group_id, user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.group_members
  ADD CONSTRAINT group_members_user_or_name_chk
  CHECK (
    user_id IS NOT NULL
    OR (
      display_name IS NOT NULL
      AND char_length(trim(display_name)) > 0
    )
  );

CREATE OR REPLACE FUNCTION public.add_group_member_by_name(
  p_group_id UUID,
  p_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, pg_temp
AS $$
DECLARE
  v_member_id UUID;
  v_name TEXT;
BEGIN
  v_name := trim(p_name);

  IF v_name IS NULL OR v_name = '' THEN
    RAISE EXCEPTION 'Member name is required';
  END IF;

  IF NOT public.is_group_member(p_group_id) THEN
    RAISE EXCEPTION 'You must be a group member to add others';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = p_group_id
      AND gm.user_id IS NULL
      AND lower(gm.display_name) = lower(v_name)
  ) THEN
    RAISE EXCEPTION 'This name is already in the group';
  END IF;

  INSERT INTO public.group_members (group_id, user_id, display_name, role)
  VALUES (p_group_id, NULL, v_name, 'member')
  RETURNING id INTO v_member_id;

  RETURN jsonb_build_object(
    'member_id', v_member_id,
    'display_name', v_name
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_group_member_by_name(UUID, TEXT) TO authenticated;

DROP FUNCTION IF EXISTS public.invite_group_member_by_email(UUID, TEXT);
