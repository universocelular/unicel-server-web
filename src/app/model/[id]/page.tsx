import { Header } from "@/components/layout/header";
import { ServiceSelection } from "@/components/model/service-selection";
import { getModelById } from "@/lib/actions/models";
import { getServices } from "@/lib/actions/services";
import { notFound } from 'next/navigation';
import { PopupDisplay } from "@/components/popups/popup-display";
import { GlobalSearch } from "@/components/search/global-search";

export const revalidate = 3600; // Revalidate every hour

export default async function ModelPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [model, allServices] = await Promise.all([
    getModelById(id),
    getServices()
  ]);

  if (!model) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <GlobalSearch />
        <ServiceSelection model={model} allServices={allServices} />
      </main>
      <PopupDisplay model={model} />
    </div>
  );
}
