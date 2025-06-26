import { Layout } from "@/components/Layout";
import PurchaseOrderDetailsContainer from "@/containers/PurchaseOrderDetailsContainer";


export default function PurchaseOrder() {
  return (
    <Layout title="PO Details">
      <PurchaseOrderDetailsContainer />
    </Layout>
  );
}
