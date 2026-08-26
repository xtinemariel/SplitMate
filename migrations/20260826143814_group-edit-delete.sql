-- Allow group admins to rename or delete groups.

CREATE OR REPLACE FUNCTION public.update_group_name(
  p_group_id UUID,
  p_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_name TEXT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = p_group_id
  ) THEN
    RAISE EXCEPTION 'Group not found';
  END IF;

  IF NOT public.is_group_admin(p_group_id) THEN
    RAISE EXCEPTION 'Only group admins can rename this group';
  END IF;

  v_name := trim(p_name);

  IF v_name IS NULL OR v_name = '' THEN
    RAISE EXCEPTION 'Group name is required';
  END IF;

  IF char_length(v_name) > 80 THEN
    RAISE EXCEPTION 'Group name must be 80 characters or less';
  END IF;

  UPDATE public.groups
  SET name = v_name
  WHERE id = p_group_id;

  RETURN jsonb_build_object(
    'id', p_group_id,
    'name', v_name
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_group(
  p_group_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = p_group_id
  ) THEN
    RAISE EXCEPTION 'Group not found';
  END IF;

  IF NOT public.is_group_admin(p_group_id) THEN
    RAISE EXCEPTION 'Only group admins can delete this group';
  END IF;

  DELETE FROM public.groups
  WHERE id = p_group_id;

  RETURN jsonb_build_object('id', p_group_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_group_name(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_group(UUID) TO authenticated;
