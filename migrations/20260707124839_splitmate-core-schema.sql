-- SplitMate core schema: profiles, groups, members, expenses, participants, settlements

-- ---------------------------------------------------------------------------
-- Profiles (app-level user data; identity lives in auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- ---------------------------------------------------------------------------
-- Groups
-- ---------------------------------------------------------------------------

CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_groups_created_by ON public.groups(created_by);

CREATE TRIGGER groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- ---------------------------------------------------------------------------
-- Group members
-- ---------------------------------------------------------------------------

CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);

-- ---------------------------------------------------------------------------
-- Expenses
-- ---------------------------------------------------------------------------

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  paid_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  description TEXT NOT NULL CHECK (char_length(trim(description)) > 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_group_id ON public.expenses(group_id);
CREATE INDEX idx_expenses_paid_by ON public.expenses(paid_by);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date DESC);

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- ---------------------------------------------------------------------------
-- Expense participants (who shares each expense and for how much)
-- ---------------------------------------------------------------------------

CREATE TABLE public.expense_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
  UNIQUE (expense_id, user_id)
);

CREATE INDEX idx_expense_participants_expense_id ON public.expense_participants(expense_id);
CREATE INDEX idx_expense_participants_user_id ON public.expense_participants(user_id);

-- ---------------------------------------------------------------------------
-- Settlements (recorded payments between members)
-- ---------------------------------------------------------------------------

CREATE TABLE public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  note TEXT,
  settled_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_user_id <> to_user_id)
);

CREATE INDEX idx_settlements_group_id ON public.settlements(group_id);
CREATE INDEX idx_settlements_from_user_id ON public.settlements(from_user_id);
CREATE INDEX idx_settlements_to_user_id ON public.settlements(to_user_id);

-- ---------------------------------------------------------------------------
-- Lifecycle triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.add_group_creator_as_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER groups_add_creator_member
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.add_group_creator_as_admin();

-- ---------------------------------------------------------------------------
-- RLS helper functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = p_group_id
      AND gm.user_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = p_group_id
      AND gm.user_id = (SELECT auth.uid())
      AND gm.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_member_user(
  p_group_id UUID,
  p_user_id UUID
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
    WHERE gm.group_id = p_group_id
      AND gm.user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.shares_group_with(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm_self
    JOIN public.group_members gm_other
      ON gm_other.group_id = gm_self.group_id
    WHERE gm_self.user_id = (SELECT auth.uid())
      AND gm_other.user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.expense_belongs_to_group(
  p_expense_id UUID,
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
    FROM public.expenses e
    WHERE e.id = p_expense_id
      AND e.group_id = p_group_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_expense_group_member(p_expense_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.expenses e
    WHERE e.id = p_expense_id
      AND public.is_group_member(e.group_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Profiles policies
-- ---------------------------------------------------------------------------

CREATE POLICY profiles_select_own_or_shared
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR public.shares_group_with(id)
  );

CREATE POLICY profiles_insert_own
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- Groups policies
-- ---------------------------------------------------------------------------

CREATE POLICY groups_select_member
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (public.is_group_member(id));

CREATE POLICY groups_insert_authenticated
  ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY groups_update_admin
  ON public.groups
  FOR UPDATE
  TO authenticated
  USING (public.is_group_admin(id))
  WITH CHECK (public.is_group_admin(id));

CREATE POLICY groups_delete_admin
  ON public.groups
  FOR DELETE
  TO authenticated
  USING (public.is_group_admin(id));

-- ---------------------------------------------------------------------------
-- Group members policies
-- ---------------------------------------------------------------------------

CREATE POLICY group_members_select_member
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_id));

CREATE POLICY group_members_insert_member
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_group_member(group_id)
    OR (
      user_id = (SELECT auth.uid())
      AND EXISTS (
        SELECT 1
        FROM public.groups g
        WHERE g.id = group_id
          AND g.created_by = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY group_members_delete_admin_or_self
  ON public.group_members
  FOR DELETE
  TO authenticated
  USING (
    public.is_group_admin(group_id)
    OR user_id = (SELECT auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Expenses policies
-- ---------------------------------------------------------------------------

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
    AND public.is_group_member_user(group_id, paid_by)
  );

CREATE POLICY expenses_update_member
  ON public.expenses
  FOR UPDATE
  TO authenticated
  USING (public.is_group_member(group_id))
  WITH CHECK (
    public.is_group_member(group_id)
    AND public.is_group_member_user(group_id, paid_by)
  );

CREATE POLICY expenses_delete_member
  ON public.expenses
  FOR DELETE
  TO authenticated
  USING (public.is_group_member(group_id));

-- ---------------------------------------------------------------------------
-- Expense participants policies
-- ---------------------------------------------------------------------------

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
        AND public.is_group_member_user(e.group_id, user_id)
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
        AND public.is_group_member_user(e.group_id, user_id)
    )
  );

CREATE POLICY expense_participants_delete_member
  ON public.expense_participants
  FOR DELETE
  TO authenticated
  USING (public.is_expense_group_member(expense_id));

-- ---------------------------------------------------------------------------
-- Settlements policies
-- ---------------------------------------------------------------------------

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
    AND public.is_group_member_user(group_id, from_user_id)
    AND public.is_group_member_user(group_id, to_user_id)
  );

CREATE POLICY settlements_update_member
  ON public.settlements
  FOR UPDATE
  TO authenticated
  USING (public.is_group_member(group_id))
  WITH CHECK (
    public.is_group_member(group_id)
    AND public.is_group_member_user(group_id, from_user_id)
    AND public.is_group_member_user(group_id, to_user_id)
  );

CREATE POLICY settlements_delete_member
  ON public.settlements
  FOR DELETE
  TO authenticated
  USING (public.is_group_member(group_id));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.group_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settlements TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_group_with(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expense_belongs_to_group(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_expense_group_member(UUID) TO authenticated;
