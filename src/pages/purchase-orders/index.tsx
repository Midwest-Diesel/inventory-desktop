import { Layout } from "@/components/Layout";
import PurchaseOrdersContainer from "@/containers/PurchaseOrders/PurchaseOrdersContainer";


export default function PurchaseOrders() {
  return (
    <Layout title="Purchase Orders">
      <PurchaseOrdersContainer />
    </Layout>
  );
}
