"use client";

import { useActionState } from "react";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { Button } from "@/components/ui/button";
import {
  deleteExpense,
  updateExpense,
  type ExpenseFormState,
} from "@/lib/expenses/actions";
import { formatCentsAsAmountInput } from "@/lib/expenses/money";
import type { ExpenseForEdit } from "@/lib/expenses/queries";
import type { GroupMemberWithLabel } from "@/lib/groups/queries";

const initialState: ExpenseFormState = {};

export function EditExpenseForm({
  groupId,
  members,
  currentUserId,
  expense,
}: {
  groupId: string;
  members: GroupMemberWithLabel[];
  currentUserId: string;
  expense: ExpenseForEdit;
}) {
  const [state, formAction, pending] = useActionState(
    updateExpense,
    initialState,
  );
  const memberIds = new Set(members.map((member) => member.id));
  const selectedParticipants = expense.participant_member_ids.filter((id) =>
    memberIds.has(id),
  );
  const paidByGroupMemberId = memberIds.has(expense.paid_by_group_member_id)
    ? expense.paid_by_group_member_id
    : (members.find((member) => member.user_id === currentUserId)?.id ??
      members[0]?.id ??
      "");

  return (
    <div className="space-y-6">
      <ExpenseForm
        groupId={groupId}
        members={members}
        currentUserId={currentUserId}
        pending={pending}
        state={state}
        formAction={formAction}
        submitLabel="Save changes"
        expenseId={expense.id}
        existingExpenseDate={expense.expense_date}
        initialValues={{
          amount: formatCentsAsAmountInput(expense.amount_cents),
          description: expense.description,
          paidByGroupMemberId,
          expenseDate: expense.expense_date,
          selectedParticipants,
        }}
      />
      <DeleteExpenseForm groupId={groupId} expenseId={expense.id} />
    </div>
  );
}

function DeleteExpenseForm({
  groupId,
  expenseId,
}: {
  groupId: string;
  expenseId: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteExpense,
    initialState,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense? This will update group balances.",
    );

    if (!confirmed || pending) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("expenseId", expenseId);

    void formAction(formData);
  }

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <Button
        type="submit"
        variant="secondary"
        disabled={pending}
        className="text-[#A46A78] hover:text-[#8E5964]"
      >
        {pending ? "Deleting..." : "Delete expense"}
      </Button>
      {state.error ? (
        <p className="text-xs text-[#8A6A00]">{state.error}</p>
      ) : null}
    </form>
  );
}
