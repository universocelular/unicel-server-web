
import { getSettings } from "@/lib/actions/settings";
import { DiscountModeClient } from "@/components/admin/discount-mode-client";

export default async function DiscountModePage() {
  // Only fetch settings, as other data comes from context.
  const settings = await getSettings();

  return (
    <DiscountModeClient
      initialSettings={settings}
    />
  );
}
