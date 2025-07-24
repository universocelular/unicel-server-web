import { Header } from "@/components/layout/header";
import { SubServiceSelection } from "@/components/model/subservice-selection";
import { getModelById } from "@/lib/actions/models";
import { getServiceById } from "@/lib/actions/services";
import { notFound } from 'next/navigation';
import { PopupDisplay } from "@/components/popups/popup-display";
import { GlobalSearch } from "@/components/search/global-search";

export const revalidate = 3600; // Revalidate every hour

export default async function SubServicePage({ params }: { params: { id: string, serviceId: string } }) {
  const modelId = params.id;
  const serviceId = params.serviceId;
  
  const model = await getModelById(modelId);
  const service = await getServiceById(serviceId);

  if (!model || !service || !service.subServices) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <GlobalSearch />
        <SubServiceSelection model={model} service={service} />
      </main>
      <PopupDisplay model={model} serviceId={serviceId} />
    </div>
  );
}
