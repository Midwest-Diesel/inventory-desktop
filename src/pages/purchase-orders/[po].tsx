import { Layout } from "@/components/Layout";
import PurchaseOrderDetailsContainer from "@/containers/PurchaseOrders/PurchaseOrderDetailsContainer";


export default function PurchaseOrder() {
  return (
    <Layout title="PO Details">
      <PurchaseOrderDetailsContainer />
    </Layout>
  );
}
