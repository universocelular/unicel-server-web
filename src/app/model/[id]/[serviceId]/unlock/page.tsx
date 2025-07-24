import { Header } from "@/components/layout/header";
import { CarrierSelection } from "@/components/model/carrier-selection";
import { getModelById } from "@/lib/actions/models";
import { getServiceById } from "@/lib/actions/services";
import { notFound } from 'next/navigation';
import { GlobalSearch } from "@/components/search/global-search";

export default async function UnlockPage({ params }: { params: { id: string, serviceId: string } }) {
  const modelId = params.id;
  const serviceId = params.serviceId;
  
  const model = await getModelById(modelId);
  const service = await getServiceById(serviceId);

  if (!model || !service) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <GlobalSearch />
        <CarrierSelection model={model} service={service} />
      </main>
    </div>
  );
}
