"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteMember,
  editMemberName,
  type MemberFormState,
} from "@/lib/groups/actions";
import type { GroupMemberWithLabel } from "@/lib/groups/queries";

const initialState: MemberFormState = {};

export function MemberRow({
  member,
  currentUserId,
  groupId,
}: {
  member: GroupMemberWithLabel;
  currentUserId: string;
  groupId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(member.label);
  const [editState, editAction, editPending] = useActionState(
    editMemberName,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteMember,
    initialState,
  );

  function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editPending) {
      return;
    }

    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("memberId", member.id);
    formData.set("name", name.trim());

    void editAction(formData);
  }

  function handleDeleteSubmit(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member? This action cannot be undone.",
    );

    if (!confirmed || deletePending) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("memberId", member.id);

    void deleteAction(formData);
  }

  return (
    <li className="px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <form className="space-y-2" onSubmit={handleEditSubmit}>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={50}
                placeholder="Member name"
                aria-label="Member name"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={editPending || name.trim().length === 0}
                  className="h-8 w-auto px-3 text-xs"
                >
                  {editPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setName(member.label);
                    setIsEditing(false);
                  }}
                  className="h-8 w-auto px-3 text-xs"
                >
                  Cancel
                </Button>
              </div>
              {editState.error ? (
                <p className="text-xs text-red-700">{editState.error}</p>
              ) : null}
            </form>
          ) : (
            <p className="truncate font-medium text-zinc-900">
              {member.label}
              {member.user_id && member.user_id === currentUserId ? (
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  (you)
                </span>
              ) : null}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-600">
            {member.role}
          </span>
          {!isEditing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setName(member.label);
                  setIsEditing(true);
                }}
                className="h-8 w-auto px-3 text-xs"
              >
                Edit
              </Button>
              <form onSubmit={handleDeleteSubmit}>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={deletePending}
                  className="h-8 w-auto px-3 text-xs text-red-700 hover:text-red-800"
                >
                  {deletePending ? "Removing..." : "Delete"}
                </Button>
              </form>
            </>
          ) : null}
        </div>
      </div>

      {deleteState.error ? (
        <p className="mt-2 text-xs text-red-700">{deleteState.error}</p>
      ) : null}
    </li>
  );
}
