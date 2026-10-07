import { createFileRoute } from "@tanstack/react-router";
import { AppsTable } from "@/components/admin/apps-table";

export const Route = createFileRoute("/admin/apks")({
  component: () => <AppsTable kind="apk" title="APK management" />,
});
