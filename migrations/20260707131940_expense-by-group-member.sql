-- Make expenses member-based so name-only members can be selected.

ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_paid_by_fkey;
ALTER TABLE public.expense_participants DROP CONSTRAINT IF EXISTS expense_participants_user_id_fkey;

ALTER TABLE public.expenses
  RENAME COLUMN paid_by TO paid_by_group_member_id;

ALTER TABLE public.expense_participants
  RENAME COLUMN user_id TO group_member_id;

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_paid_by_group_member_id_fkey
  FOREIGN KEY (paid_by_group_member_id)
  REFERENCES public.group_members(id)
  ON DELETE RESTRICT;

ALTER TABLE public.expense_participants
  ADD CONSTRAINT expense_participants_group_member_id_fkey
  FOREIGN KEY (group_member_id)
  REFERENCES public.group_members(id)
  ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.is_group_member_in_group(
  p_group_member_id UUID,
  p_group_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.id = p_group_member_id
      AND gm.group_id = p_group_id
  );
$$;

DROP POLICY IF EXISTS expenses_select_member ON public.expenses;
DROP POLICY IF EXISTS expenses_insert_member ON public.expenses;
DROP POLICY IF EXISTS expenses_update_member ON public.expenses;
DROP POLICY IF EXISTS expenses_delete_member ON public.expenses;
DROP POLICY IF EXISTS expense_participants_select_member ON public.expense_participants;
DROP POLICY IF EXISTS expense_participants_insert_member ON public.expense_participants;
DROP POLICY IF EXISTS expense_participants_update_member ON public.expense_participants;
DROP POLICY IF EXISTS expense_participants_delete_member ON public.expense_participants;

CREATE POLICY expenses_select_member
  ON public.expenses
  FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_id));

CREATE POLICY expenses_insert_member
  ON public.expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_group_member(group_id)
    AND created_by = (SELECT auth.uid())
    AND public.is_group_member_in_group(paid_by_group_member_id, group_id)
  );

CREATE POLICY expenses_update_member
  ON public.expenses
  FOR UPDATE
  TO authenticated
  USING (public.is_group_member(group_id))
  WITH CHECK (
    public.is_group_member(group_id)
    AND public.is_group_member_in_group(paid_by_group_member_id, group_id)
  );

CREATE POLICY expenses_delete_member
  ON public.expenses
  FOR DELETE
  TO authenticated
  USING (public.is_group_member(group_id));

CREATE POLICY expense_participants_select_member
  ON public.expense_participants
  FOR SELECT
  TO authenticated
  USING (public.is_expense_group_member(expense_id));

CREATE POLICY expense_participants_insert_member
  ON public.expense_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_expense_group_member(expense_id)
    AND EXISTS (
      SELECT 1
      FROM public.expenses e
      WHERE e.id = expense_id
        AND public.is_group_member_in_group(group_member_id, e.group_id)
    )
  );

CREATE POLICY expense_participants_update_member
  ON public.expense_participants
  FOR UPDATE
  TO authenticated
  USING (public.is_expense_group_member(expense_id))
  WITH CHECK (
    public.is_expense_group_member(expense_id)
    AND EXISTS (
      SELECT 1
      FROM public.expenses e
      WHERE e.id = expense_id
        AND public.is_group_member_in_group(group_member_id, e.group_id)
    )
  );

CREATE POLICY expense_participants_delete_member
  ON public.expense_participants
  FOR DELETE
  TO authenticated
  USING (public.is_expense_group_member(expense_id));

DROP FUNCTION IF EXISTS public.create_expense(UUID, UUID, BIGINT, TEXT, DATE, UUID[]);

CREATE OR REPLACE FUNCTION public.create_expense(
  p_group_id UUID,
  p_paid_by_group_member_id UUID,
  p_amount_cents BIGINT,
  p_description TEXT,
  p_expense_date DATE,
  p_participant_group_member_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_expense_id UUID;
  v_description TEXT;
  v_participant_id UUID;
  v_share BIGINT;
  v_index INTEGER := 0;
  v_participant_count INTEGER;
  v_base BIGINT;
  v_remainder BIGINT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_group_member(p_group_id) THEN
    RAISE EXCEPTION 'You must be a group member to add expenses';
  END IF;

  v_description := trim(p_description);

  IF v_description IS NULL OR v_description = '' THEN
    RAISE EXCEPTION 'Description is required';
  END IF;

  IF p_amount_cents IS NULL OR p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  IF p_expense_date IS NULL THEN
    RAISE EXCEPTION 'Date is required';
  END IF;

  IF NOT public.is_group_member_in_group(p_paid_by_group_member_id, p_group_id) THEN
    RAISE EXCEPTION 'Payer must be a group member';
  END IF;

  IF p_participant_group_member_ids IS NULL OR array_length(p_participant_group_member_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'Select at least one participant';
  END IF;

  v_participant_count := array_length(p_participant_group_member_ids, 1);
  v_base := p_amount_cents / v_participant_count;
  v_remainder := p_amount_cents % v_participant_count;

  FOREACH v_participant_id IN ARRAY p_participant_group_member_ids
  LOOP
    IF NOT public.is_group_member_in_group(v_participant_id, p_group_id) THEN
      RAISE EXCEPTION 'All participants must belong to the group';
    END IF;
  END LOOP;

  INSERT INTO public.expenses (
    group_id,
    paid_by_group_member_id,
    amount_cents,
    description,
    expense_date,
    created_by
  )
  VALUES (
    p_group_id,
    p_paid_by_group_member_id,
    p_amount_cents,
    v_description,
    p_expense_date,
    v_user_id
  )
  RETURNING id INTO v_expense_id;

  FOREACH v_participant_id IN ARRAY p_participant_group_member_ids
  LOOP
    v_share := v_base + CASE WHEN v_index < v_remainder THEN 1 ELSE 0 END;

    INSERT INTO public.expense_participants (
      expense_id,
      group_member_id,
      amount_cents
    )
    VALUES (
      v_expense_id,
      v_participant_id,
      v_share
    );

    v_index := v_index + 1;
  END LOOP;

  RETURN jsonb_build_object('id', v_expense_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_group_member_in_group(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_expense(UUID, UUID, BIGINT, TEXT, DATE, UUID[]) TO authenticated;
