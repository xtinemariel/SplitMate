-- Replace ON CONFLICT with an idempotent insert that works with the current
-- partial unique index on group_members.

CREATE OR REPLACE FUNCTION public.add_group_creator_as_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  SELECT NEW.id, NEW.created_by, 'admin'
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = NEW.id
      AND gm.user_id = NEW.created_by
  );

  RETURN NEW;
END;
$$;
