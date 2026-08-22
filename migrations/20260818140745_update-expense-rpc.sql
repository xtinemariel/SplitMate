-- Add update/delete expense RPCs so group members can correct splits.

CREATE OR REPLACE FUNCTION public.update_expense(
  p_expense_id UUID,
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
  v_group_id UUID;
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

  SELECT e.group_id
  INTO v_group_id
  FROM public.expenses e
  WHERE e.id = p_expense_id;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Expense not found';
  END IF;

  IF NOT public.is_group_member(v_group_id) THEN
    RAISE EXCEPTION 'You must be a group member to edit expenses';
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

  IF NOT public.is_group_member_in_group(p_paid_by_group_member_id, v_group_id) THEN
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
    IF NOT public.is_group_member_in_group(v_participant_id, v_group_id) THEN
      RAISE EXCEPTION 'All participants must belong to the group';
    END IF;
  END LOOP;

  UPDATE public.expenses
  SET
    paid_by_group_member_id = p_paid_by_group_member_id,
    amount_cents = p_amount_cents,
    description = v_description,
    expense_date = p_expense_date
  WHERE id = p_expense_id;

  DELETE FROM public.expense_participants
  WHERE expense_id = p_expense_id;

  FOREACH v_participant_id IN ARRAY p_participant_group_member_ids
  LOOP
    v_share := v_base + CASE WHEN v_index < v_remainder THEN 1 ELSE 0 END;

    INSERT INTO public.expense_participants (
      expense_id,
      group_member_id,
      amount_cents
    )
    VALUES (
      p_expense_id,
      v_participant_id,
      v_share
    );

    v_index := v_index + 1;
  END LOOP;

  RETURN jsonb_build_object('id', p_expense_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_expense(
  p_expense_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT e.group_id
  INTO v_group_id
  FROM public.expenses e
  WHERE e.id = p_expense_id;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Expense not found';
  END IF;

  IF NOT public.is_group_member(v_group_id) THEN
    RAISE EXCEPTION 'You must be a group member to delete expenses';
  END IF;

  DELETE FROM public.expenses
  WHERE id = p_expense_id;

  RETURN jsonb_build_object('id', p_expense_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_expense(UUID, UUID, BIGINT, TEXT, DATE, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_expense(UUID) TO authenticated;
