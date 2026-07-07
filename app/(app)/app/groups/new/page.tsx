import { AppHeader } from "@/components/app/app-header";
import { CreateGroupForm } from "@/components/groups/create-group-form";

export default function NewGroupPage() {
  return (
    <>
      <AppHeader backHref="/app" title="New group" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <CreateGroupForm />
      </main>
    </>
  );
}
