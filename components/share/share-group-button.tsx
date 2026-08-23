"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { GroupExpenseSummary } from "@/components/groups/group-summary";
import type { BalanceLine } from "@/lib/balances/queries";
import type { ExpenseWithMeta } from "@/lib/expenses/queries";
import {
  formatExpenseBreakdownShare,
  formatFullSummaryShare,
  formatSettlementShare,
} from "@/lib/share/format";
import { cn } from "@/lib/utils";

type ShareOption = "settlement" | "expenses" | "full";

const shareOptions: Array<{
  id: ShareOption;
  emoji: string;
  title: string;
  description: string;
}> = [
  {
    id: "settlement",
    emoji: "💸",
    title: "Settlement",
    description: "Who needs to pay whom",
  },
  {
    id: "expenses",
    emoji: "🧾",
    title: "Expense breakdown",
    description: "What the group spent",
  },
  {
    id: "full",
    emoji: "📋",
    title: "Full summary",
    description: "Expenses + who paid + settlement",
  },
];

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function ShareGroupButton({
  groupName,
  summary,
  expenses,
  balances,
}: {
  groupName: string;
  summary: GroupExpenseSummary;
  expenses: ExpenseWithMeta[];
  balances: BalanceLine[];
}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function buildShareText(option: ShareOption) {
    switch (option) {
      case "settlement":
        return formatSettlementShare(balances);
      case "expenses":
        return formatExpenseBreakdownShare(expenses, summary.totalCents);
      case "full":
        return formatFullSummaryShare({
          groupName,
          summary,
          expenses,
          balances,
        });
    }
  }

  async function handleShare(option: ShareOption) {
    setCopyError(false);

    try {
      await copyText(buildShareText(option));
      setOpen(false);
      setCopied(true);

      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2200);
    } catch {
      setCopyError(true);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setCopyError(false);
          setOpen(true);
        }}
        className="h-8 w-auto shrink-0 px-3 text-xs"
      >
        Share
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Close share options"
            className="absolute inset-0 bg-[#2F3140]/35"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-lg rounded-t-[24px] bg-[#FFFDF8] px-4 pb-6 pt-4 shadow-[0_-12px_40px_rgba(106,109,130,0.18)] sm:mx-4 sm:rounded-[24px] sm:shadow-[0_16px_40px_rgba(106,109,130,0.16)]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E6E8F2] sm:hidden" />

            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  id={titleId}
                  className="text-base font-semibold text-foreground"
                >
                  Share to group
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose what you&apos;d like to copy
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Close
              </button>
            </div>

            <ul className="space-y-2">
              {shareOptions.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => {
                      void handleShare(option.id);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-[18px] bg-[#F4F1FF] px-4 py-3 text-left transition-colors",
                      "hover:bg-[#ECE8FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <span className="text-lg leading-none" aria-hidden="true">
                      {option.emoji}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {copyError ? (
              <p className="mt-3 rounded-[18px] bg-[#FFF8DB] px-3 py-2 text-sm text-[#8A6A00]">
                Couldn&apos;t copy. Please try again.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {copied ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <p className="rounded-full bg-[#2F3140] px-4 py-2 text-sm font-medium text-white shadow-[0_12px_28px_rgba(47,49,64,0.24)]">
            Copied to clipboard!
          </p>
        </div>
      ) : null}
    </>
  );
}
