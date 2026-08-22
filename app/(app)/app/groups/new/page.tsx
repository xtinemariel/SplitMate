import { AppHeader } from "@/components/app/app-header";
import { CreateGroupForm } from "@/components/groups/create-group-form";
import { surfaceCardClass } from "@/components/ui/surface";

export default function NewGroupPage() {
  return (
    <>
      <AppHeader backHref="/app" title="New group" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <div className="space-y-4">
          <div className={surfaceCardClass("peach", "p-4") }>
            <p className="text-sm font-medium text-foreground">Create a shared space</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Give the group a clear name so it stands out from the rest.
            </p>
          </div>

          <div className={surfaceCardClass("blue", "p-4") }>
            <CreateGroupForm />
          </div>
        </div>
      </main>
    </>
  );
}
