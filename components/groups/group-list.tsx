import Link from "next/link";

import type { GroupSummary } from "@/lib/groups/queries";
import {
  surfaceCardClass,
  surfaceListDivideClass,
} from "@/components/ui/surface";
import { cn } from "@/lib/utils";

function memberLabel(count: number) {
  return count === 1 ? "1 member" : `${count} members`;
}

export function GroupList({ groups }: { groups: GroupSummary[] }) {
  if (groups.length === 0) {
    return (
      <div className={surfaceCardClass("neutral", "px-6 py-10 text-center")}>
        <p className="text-sm font-medium text-foreground">No groups yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a group and we&apos;ll keep the receipts tidy.
        </p>
        <Link
          href="/app/groups/new"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-[#455C4D]"
        >
          Create group
        </Link>
      </div>
    );
  }

  return (
    <ul
      className={surfaceCardClass(
        "neutral",
        cn("overflow-hidden", surfaceListDivideClass),
      )}
    >
      {groups.map((group) => (
        <li key={group.id}>
          <Link
            href={`/app/groups/${group.id}`}
            className="group flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[#F0EBE3]"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{group.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {memberLabel(group.member_count)}
              </p>
            </div>
            <span className="text-muted-foreground" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
