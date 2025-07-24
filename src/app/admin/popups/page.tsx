
import { getPopups } from "@/lib/actions/popups";
import { getServices } from "@/lib/actions/services";
import { getBrands } from "@/lib/actions/brands";
import { PopupsClient } from "@/components/admin/popups-client";

// This page fetches data on the server and passes it to the client component.
export default async function PopupsPage() {
  const [popups, services, brands] = await Promise.all([
    getPopups(),
    getServices(),
    getBrands(),
  ]);

  return <PopupsClient initialPopups={popups} initialServices={services} initialBrands={brands} />;
}
