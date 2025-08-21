import POSearchDialog from "@/components/Dialogs/POSearchDialog";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import PurchaseOrderItemsTable from "@/components/PurchaseOrders/PurchaseOrderItemsTable";
import { POSearchAtom } from "@/scripts/atoms/state";
import { addBlankPurchaseOrder, getSomePurchaseOrders, searchPurchaseOrders } from "@/scripts/services/purchaseOrderService";
import { formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import Link from "@/components/Library/Link";
import { useState } from "react";
import { useArrowSelector } from "@/hooks/useArrowSelector";
import { useQuery } from "@tanstack/react-query";

const LIMIT = 26;


export default function PurchaseOrdersContainer() {
  const [searchData] = useAtom(POSearchAtom);
  const [focusedPurchaseOrder, setFocusedPurchaseOrder] = useState<PO | null>(null);
  const [showIncomming, setShowIncomming] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: purchaseOrders, isFetching, refetch } = useQuery<PORes>({
    queryKey: ['purchaseOrders', currentPage, searchData, showIncomming],
    queryFn: async () => {
      const hasValidSearchCriteria = (
        searchData.poNum ||
        searchData.date ||
        (searchData.purchasedFrom && searchData.purchasedFrom !== '*') ||
        (searchData.purchasedFor && searchData.purchasedFor !== '*') ||
        searchData.isItemReceived ||
        (searchData.orderedBy && searchData.orderedBy !== '*')
      );

      if (hasValidSearchCriteria) {
        return await searchPurchaseOrders({ ...searchData, offset: (currentPage - 1) * LIMIT, showIncomming });
      } else {
        return await getSomePurchaseOrders(currentPage, LIMIT, showIncomming);
      }
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  useArrowSelector(purchaseOrders?.rows ?? [], focusedPurchaseOrder, setFocusedPurchaseOrder);

  const handleChangePage = async (_: any, page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
  };

  const handleNewPurchaseOrder = async () => {
    const poNum = prompt('Enter PO Number');
    if (!poNum) return;
    await addBlankPurchaseOrder(Number(poNum));
    await refetch();
  };


  return (
    <>
      <POSearchDialog open={showSearchDialog} setOpen={setShowSearchDialog} limit={LIMIT} page={currentPage} />

      <div className="purchase-orders-page__container">
        <div className="purchase-orders-page">
          <h1>Purchase Orders</h1>
          <div className="purchase-orders-page__top-buttons">
            <Button onClick={() => setShowSearchDialog(true)}>Search</Button>
            <Button onClick={handleNewPurchaseOrder}>New</Button>
            <Button onClick={() => setShowIncomming(!showIncomming)}>{showIncomming ? 'Show All' : 'Show Incomming'}</Button>
          </div>
          
          { isFetching && <Loading /> }
          
          {purchaseOrders &&
            <>
              <div className="purchase-orders-page__table-container">
                <Table>
                  <thead>
                    <tr>
                      <th>PO Number</th>
                      <th>Date</th>
                      <th>Purchased From</th>
                      <th>Purchased For</th>
                      <th>Closed</th>
                      <th>Ordered By</th>
                      <th>Shipping</th>
                      <th>Special Instructions</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.rows.map((po: PO) => {
                      return (
                        <tr key={po.id} onClick={() => setFocusedPurchaseOrder(po)} style={ focusedPurchaseOrder && po.id === focusedPurchaseOrder.id ? { border: 'solid 3px var(--yellow-2)' } : {} }>
                          <td><Link href={`/purchase-orders/${po.poNum}`}>{ po.poNum }</Link></td>
                          <td>{ formatDate(po.date) }</td>
                          <td>{ po.purchasedFrom }</td>
                          <td>{ po.purchasedFor }</td>
                          <td className="cbx-td">
                            <Checkbox
                              checked={po.isItemReceived}
                              disabled
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
              </div>
              <Pagination
                data={purchaseOrders.rows}
                setData={handleChangePage}
                pageCount={purchaseOrders.pageCount}
                pageSize={LIMIT}
              />
            </>
          }
        </div>

        {focusedPurchaseOrder &&
          <PurchaseOrderItemsTable
            poItems={focusedPurchaseOrder.poItems}
            poReceivedItems={focusedPurchaseOrder.poReceivedItems}
            handleToggleIsItemReceived={async () => {}}
          />
        }
      </div>
    </>
  );
}
