"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createExpense, type ExpenseFormState } from "@/lib/expenses/actions";
import type { GroupMemberWithLabel } from "@/lib/groups/queries";

const initialState: ExpenseFormState = {};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

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
  const defaultPayer =
    members.find((member) => member.user_id === currentUserId)?.id ??
    members[0]?.id ??
    "";
  const [paidByGroupMemberId, setPaidByGroupMemberId] = useState(defaultPayer);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    () => members.map((member) => member.id),
  );

  const allSelected = selectedParticipants.length === members.length;

  useEffect(() => {
    setPaidByGroupMemberId(defaultPayer);
  }, [defaultPayer]);

  useEffect(() => {
    if (state.success) {
      setSelectedParticipants(members.map((member) => member.id));
      setPaidByGroupMemberId(defaultPayer);
    }
  }, [state.success, members, defaultPayer]);

  function toggleParticipant(memberId: string) {
    setSelectedParticipants((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  }

  function toggleAllParticipants() {
    setSelectedParticipants(
      allSelected ? [] : members.map((member) => member.id),
    );
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        Add at least one member to record expenses.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="groupId" value={groupId} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expenseDate">Date</Label>
          <Input
            id="expenseDate"
            name="expenseDate"
            type="date"
            defaultValue={todayInputValue()}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Groceries, dinner, Uber..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paidByGroupMemberId">Paid by</Label>
        <select
          id="paidByGroupMemberId"
          name="paidByGroupMemberId"
          value={paidByGroupMemberId}
          onChange={(event) => setPaidByGroupMemberId(event.target.value)}
          className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400"
          required
        >
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label>Split between</Label>
          <button
            type="button"
            onClick={toggleAllParticipants}
            className="text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
        </div>

        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200">
          {members.map((member) => {
            const checked = selectedParticipants.includes(member.id);

            return (
              <li key={member.id}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    name="participants"
                    value={member.id}
                    checked={checked}
                    onChange={() => toggleParticipant(member.id)}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <span className="text-sm text-zinc-900">{member.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-zinc-500">
          Split equally among selected members.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={pending || selectedParticipants.length === 0}>
        {pending ? "Saving..." : "Add expense"}
      </Button>
    </form>
  );
}
