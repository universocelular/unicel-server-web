import { Header } from "@/components/layout/header";
import { PricingDisplay } from "@/components/model/pricing-display";
import { getModelById } from "@/lib/actions/models";
import { getServiceById } from "@/lib/actions/services";
import { notFound } from 'next/navigation';
import { PopupDisplay } from "@/components/popups/popup-display";
import { GlobalSearch } from "@/components/search/global-search";

export const revalidate = 3600; // Revalidate every hour

export default async function PricingPage({ 
    params,
    searchParams 
}: { 
    params: { id: string, serviceId: string };
    searchParams: { subServiceId?: string; carrierId?: string };
}) {
  const modelId = params.id;
  const serviceId = params.serviceId;
  const subServiceId = searchParams.subServiceId;

  // Data is fetched on the server and passed to the client component.
  const model = await getModelById(modelId);
  const service = await getServiceById(serviceId);
  
  if (!model || !service) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <GlobalSearch />
        <PricingDisplay 
            model={model} 
            service={service} 
            subServiceId={subServiceId}
            carrierId={searchParams.carrierId}
        />
      </main>
      <PopupDisplay model={model} serviceId={serviceId} subServiceId={subServiceId} />
    </div>
  );
}
