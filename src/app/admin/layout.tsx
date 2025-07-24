
import type { ReactNode } from "react";
import { AdminDataProvider } from "@/contexts/admin-data-context";
import { getBrands } from "@/lib/actions/brands";
import { getModels } from "@/lib/actions/models";
import { getServices } from "@/lib/actions/services";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Fetch data once here and provide it to all admin pages via context.
  const [brands, models, services] = await Promise.all([
    getBrands(),
    getModels(),
    getServices(),
  ]);

  return (
    <AdminDataProvider initialBrands={brands} initialModels={models} initialServices={services}>
        <AdminShell>
            {children}
        </AdminShell>
    </AdminDataProvider>
  );
}
