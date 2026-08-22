"use client";

import { useActionState, useMemo } from "react";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { createExpense, type ExpenseFormState } from "@/lib/expenses/actions";
import type { GroupMemberWithLabel } from "@/lib/groups/queries";

const initialState: ExpenseFormState = {};

export function CreateExpenseForm({
  groupId,
  members,
  currentUserId,
}: {
  groupId: string;
  members: GroupMemberWithLabel[];
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState(
    createExpense,
    initialState,
  );
  const membersKey = useMemo(
    () => members.map((member) => member.id).join("|"),
    [members],
  );

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add at least one member to record expenses.
      </p>
    );
  }

  return (
    <ExpenseForm
      key={`${membersKey}-${state.submissionId ?? "initial"}`}
      groupId={groupId}
      members={members}
      currentUserId={currentUserId}
      pending={pending}
      state={state}
      formAction={formAction}
      submitLabel="Add expense"
    />
  );
}
