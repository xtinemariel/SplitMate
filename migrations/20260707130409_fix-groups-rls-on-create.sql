-- Fix group creation: INSERT ... RETURNING must pass SELECT policy, and creators
-- should be able to read groups they created even before membership is visible.

DROP POLICY IF EXISTS groups_select_member ON public.groups;

CREATE POLICY groups_select_member_or_creator
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (
    public.is_group_member(id)
    OR created_by = (SELECT auth.uid())
  );

CREATE OR REPLACE FUNCTION public.create_group(p_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_name TEXT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_name := trim(p_name);

  IF v_name IS NULL OR v_name = '' THEN
    RAISE EXCEPTION 'Group name is required';
  END IF;

  INSERT INTO public.groups (name, created_by)
  VALUES (v_name, v_user_id)
  RETURNING id INTO v_group_id;

  RETURN jsonb_build_object('id', v_group_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_group(TEXT) TO authenticated;
