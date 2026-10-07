import { createFileRoute } from "@tanstack/react-router";
import { AppsTable } from "@/components/admin/apps-table";

export const Route = createFileRoute("/admin/apps/")({
  component: () => <AppsTable title="All applications" />,
});
