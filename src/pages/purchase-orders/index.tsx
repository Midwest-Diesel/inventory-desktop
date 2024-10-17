import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import PurchaseOrderItemsTable from "@/components/PurchaseOrderItemsTable";
import { addBlankPurchaseOrder, getPurchaseOrdersCount, getSomePurchaseOrders, togglePurchaseOrderReceived } from "@/scripts/controllers/purchaseOrderController";
import { formatDate } from "@/scripts/tools/stringUtils";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";


export default function PurchaseOrders() {
  const [purchaseOrdersData, setPurchaseOrdersData] = useState<PO[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PO[]>([]);
  const [purchaseOrderCount, setPurchaseOrderCount] = useState<number[]>([]);
  const [focusedPurchaseOrder, setFocusedPurchaseOrder] = useState<PO>(null);
  const [showIncomming, setShowIncomming] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getSomePurchaseOrders(1, 26, showIncomming);
      setPurchaseOrdersData(res);
      setPurchaseOrders(res);
      const count = await getPurchaseOrdersCount(showIncomming);
      setPurchaseOrderCount(count);
      setLoading(false);
    };
    fetchData();
  }, [showIncomming]);

  const handleChangePage = async (data: any, page: number) => {
    if (page === currentPage) return;
    setLoading(true);
    const res = await getSomePurchaseOrders(page, 26, showIncomming);
    setPurchaseOrders(res);
    setCurrentPage(page);
    setLoading(false);
  };

  const handleReceivedItem = async (id: number, e: ChangeEvent<HTMLInputElement>) => {
    await togglePurchaseOrderReceived(id, e.target.checked);
    const res = await getSomePurchaseOrders(currentPage, 26, showIncomming);
    setPurchaseOrdersData(res);
    setPurchaseOrders(res);
  };

  const handleNewPurchaseOrder = async () => {
    await addBlankPurchaseOrder();
    location.reload();
  };


  return (
    <Layout title="Purchase Orders">
      <div className="purchase-orders-page__container">
        <div className="purchase-orders-page">
          <h1>Purchase Orders</h1>
          <div className="purchase-orders-page__top-buttons">
            <Button>Search</Button>
            <Button onClick={handleNewPurchaseOrder}>New</Button>
            <Button onClick={() => setShowIncomming(!showIncomming)}>{showIncomming ? 'Show All' : 'Show Incomming'}</Button>
          </div>
          
          {loading && <Loading />}
          {purchaseOrders &&
            <div className="purchase-orders-page__table-container">
              <Table>
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Date</th>
                    <th>Purchased From</th>
                    <th>Purchased For</th>
                    <th>Item Received</th>
                    <th>Ordered By</th>
                    <th>Shipping</th>
                    <th>Special Instructions</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po: PO) => {
                    return (
                      <tr key={po.id} onClick={() => setFocusedPurchaseOrder(po)} style={ focusedPurchaseOrder && po.id === focusedPurchaseOrder.id ? { border: 'solid 3px var(--yellow-2)' } : {} }>
                        <td><a href={`/purchase-orders/${po.id}`}>{ po.id }</a></td>
                        <td>{ formatDate(po.date) }</td>
                        <td>{ po.purchasedFrom }</td>
                        <td>{ po.purchasedFor }</td>
                        <td className="cbx-td">
                          <Checkbox
                            checked={po.isItemReceived}
                            onChange={(e: any) => handleReceivedItem(po.id, e)}
                          />
                        </td>
                        <td>{ po.orderedBy }</td>
                        <td>{ po.shippingMethod }</td>
                        <td>{ po.specialInstructions }</td>
                        <td>{ po.comments }</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <Pagination
                data={purchaseOrdersData}
                setData={handleChangePage}
                minData={purchaseOrderCount}
                pageSize={26}
              />
            </div>
          }
        </div>

        { focusedPurchaseOrder && <PurchaseOrderItemsTable poItems={focusedPurchaseOrder.poItems} /> }
      </div>
    </Layout>
  );
}
