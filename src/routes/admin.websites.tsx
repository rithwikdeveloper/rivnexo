import { createFileRoute } from "@tanstack/react-router";
import { AppsTable } from "@/components/admin/apps-table";

export const Route = createFileRoute("/admin/websites")({
  component: () => <AppsTable kind="website" title="Website management" />,
});
