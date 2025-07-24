import { BrandsAndModels } from "@/components/admin/brands-and-models";

// This page now relies on the context provided by the layout for its data.
// It's a simple server component that renders the client component.
export default function BrandsPage() {
  return <BrandsAndModels />;
}
