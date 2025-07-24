
import { PricesClient } from "@/components/admin/prices-client";

// This page now relies on the AdminDataProvider in the layout for its data.
// It's a simple server component that renders the client component.
export default function PricesPage() {
  return <PricesClient />;
}
