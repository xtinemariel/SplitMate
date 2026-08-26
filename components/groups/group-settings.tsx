"use client";

import { startTransition, useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteGroup,
  renameGroup,
  type GroupFormState,
} from "@/lib/groups/actions";

const initialState: GroupFormState = {};

export function GroupSettings({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(groupName);
  const [renameState, renameAction, renamePending] = useActionState(
    renameGroup,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteGroup,
    initialState,
  );

  useEffect(() => {
    setName(groupName);
  }, [groupName]);

  useEffect(() => {
    if (renameState.success) {
      setIsEditing(false);
    }
  }, [renameState.success]);

  function handleRenameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (renamePending) {
      return;
    }

    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("name", name.trim());

    startTransition(() => {
      renameAction(formData);
    });
  }

  function handleDeleteSubmit(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "Delete this group? All expenses, balances, and members will be removed. This cannot be undone.",
    );

    if (!confirmed || deletePending) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const formData = new FormData();
    formData.set("groupId", groupId);

    startTransition(() => {
      deleteAction(formData);
    });
  }

  return (
    <div className="space-y-4">
      {isEditing ? (
        <form className="space-y-3" onSubmit={handleRenameSubmit}>
          <div className="space-y-2">
            <Label htmlFor="groupName">Group name</Label>
            <Input
              id="groupName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              placeholder="Group name"
              autoComplete="off"
              required
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={renamePending || name.trim().length === 0}
              className="h-9 w-auto px-3 text-xs"
            >
              {renamePending ? "Saving..." : "Save name"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setName(groupName);
                setIsEditing(false);
              }}
              className="h-9 w-auto px-3 text-xs"
            >
              Cancel
            </Button>
          </div>
          {renameState.error ? (
            <p className="text-xs text-[#8A6A00]">{renameState.error}</p>
          ) : null}
          {renameState.success ? (
            <p className="text-xs text-[#2E6B51]">{renameState.success}</p>
          ) : null}
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setName(groupName);
              setIsEditing(true);
            }}
            className="h-9 w-auto px-3 text-xs"
          >
            Edit name
          </Button>
          <form onSubmit={handleDeleteSubmit}>
            <Button
              type="submit"
              variant="secondary"
              disabled={deletePending}
              className="h-9 w-auto px-3 text-xs text-[#A46A78] hover:text-[#8E5964]"
            >
              {deletePending ? "Deleting..." : "Delete group"}
            </Button>
          </form>
        </div>
      )}

      {deleteState.error ? (
        <p className="text-xs text-[#8A6A00]">{deleteState.error}</p>
      ) : null}

      {!isEditing ? (
        <p className="text-xs text-muted-foreground">
          Deleting removes expenses, payments, and members in this group.
        </p>
      ) : null}
    </div>
  );
}
