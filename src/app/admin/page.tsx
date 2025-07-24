
import { getBrands } from "@/lib/actions/brands";
import { getModels } from "@/lib/actions/models";
import { getServices } from "@/lib/actions/services";
import { getCoupons } from "@/lib/actions/coupons";
import { getSettings } from "@/lib/actions/settings";
import { DashboardClient } from "@/components/admin/dashboard-client";

export default async function AdminDashboard() {
  // The seed operation should be run manually or during a build step,
  // not on every dashboard visit, to improve performance.
  // await seedDatabase();

  // Fetch all data for the dashboard
  const [brandsData, modelsData, servicesData, couponsData, settingsData] = await Promise.all([
    getBrands(),
    getModels(),
    getServices(),
    getCoupons(),
    getSettings(),
  ]);

  return (
    <DashboardClient
      initialBrands={brandsData}
      initialModels={modelsData}
      initialServices={servicesData}
      initialCoupons={couponsData}
      initialSettings={settingsData}
    />
  );
}
