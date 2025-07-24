import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/home/hero-section";
import { getModels } from "@/lib/actions/models";
import { PopupDisplay } from "@/components/popups/popup-display";

export default async function Home() {
  const allModels = await getModels();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection allModels={allModels} />
      </main>
      <PopupDisplay />
    </div>
  );
}
