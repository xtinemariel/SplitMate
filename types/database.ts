export type Profile = {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type GroupMemberRole = "admin" | "member";

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string | null;
  display_name: string | null;
  role: GroupMemberRole;
  joined_at: string;
};

export type Expense = {
  id: string;
  group_id: string;
  paid_by_group_member_id: string;
  amount_cents: number;
  description: string;
  expense_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ExpenseParticipant = {
  id: string;
  expense_id: string;
  group_member_id: string;
  amount_cents: number;
};

export type Settlement = {
  id: string;
  group_id: string;
  from_group_member_id: string;
  to_group_member_id: string;
  amount_cents: number;
  note: string | null;
  settled_at: string;
  created_by: string;
  created_at: string;
};

export type Database = {
  profiles: Profile;
  groups: Group;
  group_members: GroupMember;
  expenses: Expense;
  expense_participants: ExpenseParticipant;
  settlements: Settlement;
};
