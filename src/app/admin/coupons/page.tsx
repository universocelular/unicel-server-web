
import { getCoupons } from "@/lib/actions/coupons";
import { CouponsClient } from "@/components/admin/coupons-client";

export default async function CouponsPage() {
  // Only fetch data specific to this page.
  // Brands, models, and services will come from the context.
  const coupons = await getCoupons();

  return (
    <CouponsClient
      initialCoupons={coupons}
    />
  );
}
