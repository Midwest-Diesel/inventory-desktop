import { Layout } from "@/components/Layout";
import Loading from "@/components/library/Loading";
import EditPurchaseOrderDetails from "@/components/purchaseOrders/EditPurchaseOrderDetails";
import { getPurchaseOrderByPoNum, togglePurchaseOrderItemReceived, togglePurchaseOrderReceived } from "@/scripts/services/purchaseOrderService";
import { setTitle } from "@/scripts/tools/utils";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PurchaseOrderDetails from "@/components/purchaseOrders/PurchaseOrderDetails";
import { ask, confirm } from "@/scripts/config/tauri";


export default function PurchaseOrder() {
  const params = useParams();
  const [poData, setPoData] = useState<PO | null>(null);
  const [poItems, setPoItems] = useState<POItem[]>([]);
  const [poItemsReceived, setPoItemsReceived] = useState<POReceivedItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      setLoading(true);
      const res = await getPurchaseOrderByPoNum(params.po?.toString() ?? '');
      setTitle(`${res?.purchasedFrom} PO`);
      setPoData(res);
      setPoItems(res?.poItems ?? []);
      setPoItemsReceived(res?.poReceivedItems ?? []);
      setLoading(false);
    };
    fetchData();
  }, [params]);

  if (!poData) return null;

  const handleReceiveItem = async () => {
    if (!poData?.id || !await ask('Are you sure you want to do this?')) return;
    await togglePurchaseOrderReceived(poData.id, !poData.isItemReceived);
    const res = await getPurchaseOrderByPoNum(params.po?.toString() ?? '');
    setPoData(res);
  };

  const handleToggleIsItemReceived = async (id: number, isReceived: boolean) => {
    if (!await confirm(`Mark item as ${isReceived ? 'received' : 'not received'}?`)) return;
    await togglePurchaseOrderItemReceived(id, isReceived);
    setPoItems(poItems.map((item) => {
      if (item.id === id) return { ...item, isReceived };
      return item;
    }));
  };


  return (
    <Layout title="PO Details">
      <div className="purchase-order-details">
        {isEditing ?
          <EditPurchaseOrderDetails
            poData={poData}
            setPo={setPoData}
            setIsEditing={setIsEditing}
            poItems={poItems}
            poItemsReceived={poItemsReceived}
            setPoItems={setPoItems}
            setPoItemsReceived={setPoItemsReceived}
          />
          :
          <PurchaseOrderDetails
            poData={poData}
            handleReceiveItem={handleReceiveItem}
            setIsEditing={setIsEditing}
            handleToggleIsItemReceived={handleToggleIsItemReceived}
          />
        }
        { loading && <Loading /> }
      </div>
    </Layout>
  );
};
