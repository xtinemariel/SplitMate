-- Add member edit/delete support without breaking historical data.

CREATE UNIQUE INDEX IF NOT EXISTS group_members_group_name_unique
  ON public.group_members (group_id, lower(trim(display_name)))
  WHERE display_name IS NOT NULL;

CREATE OR REPLACE FUNCTION public.update_group_member_name(
  p_group_member_id UUID,
  p_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_member RECORD;
  v_name TEXT;
BEGIN
  SELECT *
  INTO v_member
  FROM public.group_members gm
  WHERE gm.id = p_group_member_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  IF NOT public.is_group_member(v_member.group_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  v_name := trim(p_name);

  IF v_name IS NULL OR v_name = '' THEN
    RAISE EXCEPTION 'Member name is required';
  END IF;

  IF char_length(v_name) > 50 THEN
    RAISE EXCEPTION 'Member name must be 50 characters or less';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = v_member.group_id
      AND gm.id <> p_group_member_id
      AND gm.display_name IS NOT NULL
      AND lower(trim(gm.display_name)) = lower(v_name)
  ) THEN
    RAISE EXCEPTION 'A member with this name already exists in the group';
  END IF;

  UPDATE public.group_members
  SET display_name = v_name
  WHERE id = p_group_member_id;

  RETURN jsonb_build_object(
    'member_id', p_group_member_id,
    'display_name', v_name
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_group_member(
  p_group_member_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_member RECORD;
BEGIN
  SELECT *
  INTO v_member
  FROM public.group_members gm
  WHERE gm.id = p_group_member_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  IF NOT public.is_group_member(v_member.group_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.expenses e
    WHERE e.group_id = v_member.group_id
      AND e.paid_by_group_member_id = p_group_member_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.expense_participants ep
    JOIN public.expenses e ON e.id = ep.expense_id
    WHERE e.group_id = v_member.group_id
      AND ep.group_member_id = p_group_member_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.settlements s
    WHERE s.group_id = v_member.group_id
      AND (s.from_group_member_id = p_group_member_id OR s.to_group_member_id = p_group_member_id)
  ) THEN
    RAISE EXCEPTION 'This member cannot be removed because they are part of existing expenses. Remove or update those expenses first.';
  END IF;

  DELETE FROM public.group_members
  WHERE id = p_group_member_id;

  RETURN jsonb_build_object('member_id', p_group_member_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_group_member_name(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_group_member(UUID) TO authenticated;
