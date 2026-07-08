"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseAmountToCents } from "@/lib/expenses/money";
import { createExpense, type ExpenseFormState } from "@/lib/expenses/actions";
import type { GroupMemberWithLabel } from "@/lib/groups/queries";

const initialState: ExpenseFormState = {};

type ExpenseFormValues = {
  amount: string;
  description: string;
  paidByGroupMemberId: string;
  expenseDate: string;
  selectedParticipants: string[];
};

type ExpenseFormTouched = {
  amount: boolean;
  description: boolean;
  paidByGroupMemberId: boolean;
  expenseDate: boolean;
  participants: boolean;
};

type ExpenseFormErrors = Partial<Record<keyof ExpenseFormTouched, string>>;

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function todayInputValue() {
  return toDateInputValue(new Date());
}

function oneYearAgoInputValue() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return toDateInputValue(date);
}

function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function validateAmount(value: string): string | null {
  if (value !== value.trim()) {
    return "Amount cannot have leading or trailing spaces.";
  }

  if (!value.trim()) {
    return "Amount is required.";
  }

  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return "Enter a numeric amount with up to 2 decimals.";
  }

  const cents = parseAmountToCents(value);
  if (cents === null || cents <= 0) {
    return "Amount must be greater than 0.";
  }

  return null;
}

function validateDescription(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Description is required.";
  }

  if (trimmed.length < 3) {
    return "Description must be at least 3 characters.";
  }

  if (trimmed.length > 100) {
    return "Description must be 100 characters or less.";
  }

  return null;
}

function validatePaidBy(
  value: string,
  memberIds: Set<string>,
): string | null {
  if (!value) {
    return "Select who paid.";
  }

  if (!memberIds.has(value)) {
    return "Select a valid group member.";
  }

  return null;
}

function validateExpenseDate(value: string): string | null {
  if (!value) {
    return "Date is required.";
  }

  const parsed = parseDateInput(value);
  if (!parsed) {
    return "Enter a valid date.";
  }

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const minDate = new Date(todayStart);
  minDate.setFullYear(minDate.getFullYear() - 1);

  if (parsed > todayStart) {
    return "Date cannot be in the future.";
  }

  if (parsed < minDate) {
    return "Date cannot be more than 1 year in the past.";
  }

  return null;
}

function validateParticipants(ids: string[]): string | null {
  if (ids.length === 0) {
    return "Select at least one participant.";
  }

  return null;
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
    <ExpenseFormFields
      key={`${membersKey}-${state.submissionId ?? "initial"}`}
      groupId={groupId}
      members={members}
      currentUserId={currentUserId}
      pending={pending}
      state={state}
      formAction={formAction}
    />
  );
}

function ExpenseFormFields({
  groupId,
  members,
  currentUserId,
  pending,
  state,
  formAction,
}: {
  groupId: string;
  members: GroupMemberWithLabel[];
  currentUserId: string;
  pending: boolean;
  state: ExpenseFormState;
  formAction: (formData: FormData) => void;
}) {
  const memberIds = useMemo(() => new Set(members.map((member) => member.id)), [members]);
  const defaultPayer =
    members.find((member) => member.user_id === currentUserId)?.id ??
    members[0]?.id ??
    "";
  const defaultExpenseDate = useMemo(() => todayInputValue(), []);

  const [values, setValues] = useState<ExpenseFormValues>(() => ({
    amount: "",
    description: "",
    paidByGroupMemberId: defaultPayer,
    expenseDate: defaultExpenseDate,
    selectedParticipants: members.map((member) => member.id),
  }));
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [touched, setTouched] = useState<ExpenseFormTouched>({
    amount: false,
    description: false,
    paidByGroupMemberId: false,
    expenseDate: false,
    participants: false,
  });

  const allSelected = values.selectedParticipants.length === members.length;

  function updateField<K extends keyof ExpenseFormValues>(
    key: K,
    value: ExpenseFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function markTouched(key: keyof ExpenseFormTouched) {
    setTouched((current) => ({ ...current, [key]: true }));
  }

  function toggleParticipant(memberId: string) {
    setTouched((current) => ({ ...current, participants: true }));
    setValues((current) => {
      const nextSelected = current.selectedParticipants.includes(memberId)
        ? current.selectedParticipants.filter((id) => id !== memberId)
        : [...current.selectedParticipants, memberId];

      setErrors((currentErrors) => ({
        ...currentErrors,
        participants: validateParticipants(nextSelected) ?? undefined,
      }));

      return {
        ...current,
        selectedParticipants: nextSelected,
      };
    });
  }

  function toggleAllParticipants() {
    setTouched((current) => ({ ...current, participants: true }));
    setValues((current) => {
      const nextSelected = allSelected ? [] : members.map((member) => member.id);

      setErrors((currentErrors) => ({
        ...currentErrors,
        participants: validateParticipants(nextSelected) ?? undefined,
      }));

      return {
        ...current,
        selectedParticipants: nextSelected,
      };
    });
  }

  function handleAmountChange(value: string) {
    updateField("amount", value);

    if (touched.amount) {
      setErrors((current) => ({
        ...current,
        amount: validateAmount(value) ?? undefined,
      }));
    }
  }

  function handleDescriptionChange(value: string) {
    updateField("description", value);

    if (touched.description) {
      setErrors((current) => ({
        ...current,
        description: validateDescription(value) ?? undefined,
      }));
    }
  }

  function handlePaidByChange(value: string) {
    updateField("paidByGroupMemberId", value);

    if (touched.paidByGroupMemberId) {
      setErrors((current) => ({
        ...current,
        paidByGroupMemberId: validatePaidBy(value, memberIds) ?? undefined,
      }));
    }
  }

  function handleDateChange(value: string) {
    updateField("expenseDate", value);

    if (touched.expenseDate) {
      setErrors((current) => ({
        ...current,
        expenseDate: validateExpenseDate(value) ?? undefined,
      }));
    }
  }

  function handleAmountBlur() {
    markTouched("amount");
    setErrors((current) => ({
      ...current,
      amount: validateAmount(values.amount) ?? undefined,
    }));
  }

  function handleDescriptionBlur() {
    markTouched("description");
    const trimmed = values.description.trim();
    updateField("description", trimmed);
    setErrors((current) => ({
      ...current,
      description: validateDescription(trimmed) ?? undefined,
    }));
  }

  function handlePaidByBlur() {
    markTouched("paidByGroupMemberId");
    setErrors((current) => ({
      ...current,
      paidByGroupMemberId: validatePaidBy(values.paidByGroupMemberId, memberIds) ?? undefined,
    }));
  }

  function handleDateBlur() {
    markTouched("expenseDate");
    setErrors((current) => ({
      ...current,
      expenseDate: validateExpenseDate(values.expenseDate) ?? undefined,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) {
      return;
    }

    const nextTouched: ExpenseFormTouched = {
      amount: true,
      description: true,
      paidByGroupMemberId: true,
      expenseDate: true,
      participants: true,
    };

    const trimmedDescription = values.description.trim();
    const nextErrors: ExpenseFormErrors = {
      amount: validateAmount(values.amount) ?? undefined,
      description: validateDescription(trimmedDescription) ?? undefined,
      paidByGroupMemberId:
        validatePaidBy(values.paidByGroupMemberId, memberIds) ?? undefined,
      expenseDate: validateExpenseDate(values.expenseDate) ?? undefined,
      participants:
        validateParticipants(values.selectedParticipants) ?? undefined,
    };

    setTouched(nextTouched);
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("amount", values.amount);
    formData.set("description", trimmedDescription);
    formData.set("paidByGroupMemberId", values.paidByGroupMemberId);
    formData.set("expenseDate", values.expenseDate);
    for (const participantId of values.selectedParticipants) {
      formData.append("participants", participantId);
    }

    void formAction(formData);
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit}>
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
            value={values.amount}
            onChange={(event) => handleAmountChange(event.target.value)}
            onBlur={handleAmountBlur}
            required
          />
          {touched.amount && errors.amount ? (
            <p className="text-xs text-red-700">{errors.amount}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="expenseDate">Date</Label>
          <Input
            id="expenseDate"
            name="expenseDate"
            type="date"
            min={oneYearAgoInputValue()}
            max={todayInputValue()}
            value={values.expenseDate}
            onChange={(event) => handleDateChange(event.target.value)}
            onBlur={handleDateBlur}
            required
          />
          {touched.expenseDate && errors.expenseDate ? (
            <p className="text-xs text-red-700">{errors.expenseDate}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Groceries, dinner, Uber..."
          value={values.description}
          onChange={(event) => handleDescriptionChange(event.target.value)}
          onBlur={handleDescriptionBlur}
          minLength={3}
          maxLength={100}
          required
        />
        {touched.description && errors.description ? (
          <p className="text-xs text-red-700">{errors.description}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paidByGroupMemberId">Paid by</Label>
        <select
          id="paidByGroupMemberId"
          name="paidByGroupMemberId"
          value={values.paidByGroupMemberId}
          onChange={(event) => handlePaidByChange(event.target.value)}
          onBlur={handlePaidByBlur}
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          required
        >
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.label}
            </option>
          ))}
        </select>
        {touched.paidByGroupMemberId && errors.paidByGroupMemberId ? (
          <p className="text-xs text-red-700">{errors.paidByGroupMemberId}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label>Split between</Label>
          <button
            type="button"
            onClick={toggleAllParticipants}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-accent hover:text-accent-foreground"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
        </div>

        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {members.map((member) => {
            const checked = values.selectedParticipants.includes(member.id);

            return (
              <li key={member.id}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent has-[:checked]:bg-accent has-[:checked]:text-accent-foreground">
                  <input
                    type="checkbox"
                    name="participants"
                    value={member.id}
                    checked={checked}
                    onChange={() => toggleParticipant(member.id)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-foreground">{member.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted-foreground">
          Split equally among selected members.
        </p>
        {touched.participants && errors.participants ? (
          <p className="text-xs text-red-700">{errors.participants}</p>
        ) : null}
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

      <Button
        type="submit"
        disabled={pending || values.selectedParticipants.length === 0}
      >
        {pending ? "Saving..." : "Add expense"}
      </Button>
    </form>
  );
}
