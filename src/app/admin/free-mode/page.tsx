
import { getSettings } from "@/lib/actions/settings";
import { FreeModeClient } from "@/components/admin/free-mode-client";

export default async function FreeModePage() {
  // Only fetch settings. Brands, models, services are from context.
  const settings = await getSettings();

  return (
    <FreeModeClient
      initialSettings={settings}
    />
  );
}
