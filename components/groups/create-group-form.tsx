"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createGroup,
  type GroupFormState,
} from "@/lib/groups/actions";

const initialState: GroupFormState = {};

export function CreateGroupForm() {
  const [state, formAction, pending] = useActionState(
    createGroup,
    initialState,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          New group
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Roommates, trips, dinners — keep it simple.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Group name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Weekend trip"
            autoComplete="off"
            required
          />
        </div>

        {state.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create group"}
        </Button>
      </form>

      <Link
        href="/app"
        className="inline-block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Cancel
      </Link>
    </div>
  );
}
