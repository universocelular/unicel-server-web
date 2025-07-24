import { getServices } from "@/lib/actions/services";
import { ServicesClient } from "@/components/admin/services-client";

export default async function ServicesPage() {
  // Fetch initial data on the server
  const services = await getServices();

  return <ServicesClient initialServices={services} />;
}
