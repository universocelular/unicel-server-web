import { getModels } from "@/lib/actions/models";
import { SearchComponent } from "@/components/home/search-section";

export async function GlobalSearch() {
  const allModels = await getModels();
  
  return (
    <div className="w-full max-w-xl mx-auto mt-8 mb-4 px-4">
        <SearchComponent allModels={allModels} />
    </div>
  );
}
