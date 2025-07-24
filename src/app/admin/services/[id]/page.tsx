import { getServiceById } from "@/lib/actions/services";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/admin/service-detail-client";

interface ServiceDetailPageProps {
  params: { id: string };
}

// This is now a Server Component responsible for data fetching.
export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const serviceId = params.id;
  const service = await getServiceById(serviceId);

  if (!service) {
    notFound();
  }

  // We pass the fetched data to a Client Component that handles interaction.
  return <ServiceDetailClient initialService={service} />;
}