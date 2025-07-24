import { getServiceById } from "@/lib/actions/services";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/admin/service-detail-client";

// This is now a Server Component responsible for data fetching.
export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const serviceId = params.id;
  const service = await getServiceById(serviceId);

  if (!service) {
    notFound();
  }

  // We pass the fetched data to a Client Component that handles interaction.
  return <ServiceDetailClient initialService={service} />;
}