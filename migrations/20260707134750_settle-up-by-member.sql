-- Move settlements to group-member references so every member can be settled.

ALTER TABLE public.settlements DROP CONSTRAINT IF EXISTS settlements_from_user_id_fkey;
ALTER TABLE public.settlements DROP CONSTRAINT IF EXISTS settlements_to_user_id_fkey;

ALTER TABLE public.settlements
  RENAME COLUMN from_user_id TO from_group_member_id;

ALTER TABLE public.settlements
  RENAME COLUMN to_user_id TO to_group_member_id;

ALTER TABLE public.settlements
  ADD CONSTRAINT settlements_from_group_member_id_fkey
  FOREIGN KEY (from_group_member_id)
  REFERENCES public.group_members(id)
  ON DELETE RESTRICT;

ALTER TABLE public.settlements
  ADD CONSTRAINT settlements_to_group_member_id_fkey
  FOREIGN KEY (to_group_member_id)
  REFERENCES public.group_members(id)
  ON DELETE RESTRICT;

DROP POLICY IF EXISTS settlements_select_member ON public.settlements;
DROP POLICY IF EXISTS settlements_insert_member ON public.settlements;
DROP POLICY IF EXISTS settlements_update_member ON public.settlements;
DROP POLICY IF EXISTS settlements_delete_member ON public.settlements;

CREATE POLICY settlements_select_member
  ON public.settlements
  FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_id));

CREATE POLICY settlements_insert_member
  ON public.settlements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_group_member(group_id)
    AND created_by = (SELECT auth.uid())
    AND public.is_group_member_in_group(from_group_member_id, group_id)
    AND public.is_group_member_in_group(to_group_member_id, group_id)
  );

CREATE POLICY settlements_update_member
  ON public.settlements
  FOR UPDATE
  TO authenticated
  USING (public.is_group_member(group_id))
  WITH CHECK (
    public.is_group_member(group_id)
    AND public.is_group_member_in_group(from_group_member_id, group_id)
    AND public.is_group_member_in_group(to_group_member_id, group_id)
  );

CREATE POLICY settlements_delete_member
  ON public.settlements
  FOR DELETE
  TO authenticated
  USING (public.is_group_member(group_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.settlements TO authenticated;
