CREATE OR REPLACE FUNCTION public.create_expense(
  p_group_id UUID,
  p_paid_by UUID,
  p_amount_cents BIGINT,
  p_description TEXT,
  p_expense_date DATE,
  p_participant_user_ids UUID[]
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

  IF NOT public.is_group_member_user(p_group_id, p_paid_by) THEN
    RAISE EXCEPTION 'Payer must be a group member with an account';
  END IF;

  IF p_participant_user_ids IS NULL OR array_length(p_participant_user_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'Select at least one participant';
  END IF;

  v_participant_count := array_length(p_participant_user_ids, 1);
  v_base := p_amount_cents / v_participant_count;
  v_remainder := p_amount_cents % v_participant_count;

  FOREACH v_participant_id IN ARRAY p_participant_user_ids
  LOOP
    IF NOT public.is_group_member_user(p_group_id, v_participant_id) THEN
      RAISE EXCEPTION 'All participants must be group members with an account';
    END IF;
  END LOOP;

  INSERT INTO public.expenses (
    group_id,
    paid_by,
    amount_cents,
    description,
    expense_date,
    created_by
  )
  VALUES (
    p_group_id,
    p_paid_by,
    p_amount_cents,
    v_description,
    p_expense_date,
    v_user_id
  )
  RETURNING id INTO v_expense_id;

  FOREACH v_participant_id IN ARRAY p_participant_user_ids
  LOOP
    v_share := v_base + CASE WHEN v_index < v_remainder THEN 1 ELSE 0 END;

    INSERT INTO public.expense_participants (
      expense_id,
      user_id,
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

GRANT EXECUTE ON FUNCTION public.create_expense(UUID, UUID, BIGINT, TEXT, DATE, UUID[]) TO authenticated;
