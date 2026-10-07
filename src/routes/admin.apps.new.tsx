import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppForm } from "@/components/admin/app-form";

export const Route = createFileRoute("/admin/apps/new")({
  validateSearch: z.object({ kind: z.enum(["website", "apk"]).optional() }),
  component: () => {
    const { kind } = Route.useSearch();
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold">Add application</h1>
        <AppForm defaultKind={kind} />
      </div>
    );
  },
});
