
import { getPaymentMethods } from "@/lib/actions/payment-methods";
import { PaymentMethodsClient } from "@/components/admin/payment-methods-client";

export default async function PaymentMethodsPage() {
  const paymentMethods = await getPaymentMethods();

  return <PaymentMethodsClient initialPaymentMethods={paymentMethods} />;
}
