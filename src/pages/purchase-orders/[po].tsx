import EditPurchaseOrderDetails from "@/components/EditPurchaseOrderDetails";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import PurchaseOrderItemsTable from "@/components/PurchaseOrderItemsTable";
import { userAtom } from "@/scripts/atoms/state";
import { deletePurchaseOrder, getPurchaseOrderByPoNum, togglePurchaseOrderReceived } from "@/scripts/controllers/purchaseOrderController";
import { formatDate } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import { useAtom } from "jotai";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { confirm } from '@tauri-apps/api/dialog';


export default function PurchaseOrder() {
  const router = useRouter();
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [poData, setPoData] = useState<PO>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      const res = await getPurchaseOrderByPoNum(Number(params.po));
      setTitle(`${res.purchasedFrom} PO`);
      setPoData(res);
    };
    fetchData();
  }, [params]);

  const handleDelete = async () => {
    if (user.accessLevel <= 1 || prompt('Type "confirm" to delete this purchase order') !== 'confirm') return;
    await deletePurchaseOrder(poData.id);
    router.replace('/purchase-orders');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReceivedItem = async () => {
    if (!await confirm('Are you sure you want to do this?')) return;
    await togglePurchaseOrderReceived(poData.id, !poData.isItemReceived);
    const res = await getPurchaseOrderByPoNum(Number(params.po));
    setPoData(res);
  };


  return (
    <Layout title="PO Details">
      <div className="purchase-order-details">
        {poData ? isEditing ?
          <EditPurchaseOrderDetails poData={poData} setPo={setPoData} setIsEditing={setIsEditing} />
          :
          <>
            <div className="purchase-order-details__header">
              <div>
                <h2>{ poData.poNum } Purchase Order</h2>
                <div className="purchase-order-details__top-bar">
                  <Button onClick={handlePrint}>Print Report</Button>
                  <Button onClick={handleReceivedItem}>{ poData.isItemReceived ? 'Unmark' : 'Mark' } as Closed</Button>
                </div>
              </div>

              <div className="header__btn-container">
                <Button
                  variant={['blue']}
                  className="purchase-order-details__edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  className="purchase-order-details__close-btn"
                  onClick={() => window.history.back()}
                >
                  Close
                </Button>
                <Button
                  variant={['danger']}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>

            <Grid rows={1} cols={12} gap={1}>
              <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Date</th>
                      <td>{ formatDate(poData.date) }</td>
                    </tr>
                    <tr>
                      <th>Ordered By</th>
                      <td>{ poData.orderedBy }</td>
                    </tr>
                    <tr>
                      <th>Vendor</th>
                      <td>{ poData.purchasedFrom }</td>
                    </tr>
                    <tr>
                      <th>Vendor Contact</th>
                      <td>{ poData.vendorContact }</td>
                    </tr>
                    <tr>
                      <th>Vendor Address</th>
                      <td>{ poData.vendorAddress }</td>
                    </tr>
                    <tr>
                      <th>Vendor City</th>
                      <td>{ poData.vendorCity }</td>
                    </tr>
                    <tr>
                      <th>Vendor State</th>
                      <td>{ poData.vendorState }</td>
                    </tr>
                    <tr>
                      <th>Vendor Zip</th>
                      <td>{ poData.vendorZip }</td>
                    </tr>
                    <tr>
                      <th>Vendor Phone</th>
                      <td>{ poData.vendorPhone }</td>
                    </tr>
                    <tr>
                      <th>Vendor Fax</th>
                      <td>{ poData.vendorFax }</td>
                    </tr>
                    <tr>
                      <th>Payment Terms</th>
                      <td>{ poData.paymentTerms }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={6} colEnd={11} variant={['no-style']}>
                <GridItem colStart={6} colEnd={11} variant={['low-opacity-bg']}>
                  <Table variant={['plain', 'row-details']}>
                    <tbody>
                      <tr>
                        <th>Ship To Company</th>
                        <td>{ poData.shipToCompany }</td>
                      </tr>
                      <tr>
                        <th>Ship To Address</th>
                        <td>{ poData.shipToAddress }</td>
                      </tr>
                      <tr>
                        <th>Ship To City</th>
                        <td>{ poData.shipToCity }</td>
                      </tr>
                      <tr>
                        <th>Ship To State</th>
                        <td>{ poData.shipToState }</td>
                      </tr>
                      <tr>
                        <th>Ship To Zip</th>
                        <td>{ poData.shipToZip }</td>
                      </tr>
                      <tr>
                        <th>Ship To Phone</th>
                        <td>{ poData.shipToPhone }</td>
                      </tr>
                      <tr>
                        <th>Ship To Fax</th>
                        <td>{ poData.shipToFax }</td>
                      </tr>
                      <tr>
                        <th>Shipping Method</th>
                        <td>{ poData.shippingMethod }</td>
                      </tr>
                    </tbody>
                  </Table>
                </GridItem>

                <br />
                <GridItem colStart={6} colEnd={11} variant={['low-opacity-bg']}>
                  <Table variant={['plain', 'row-details']}>
                    <tbody>
                      <tr>
                        <th>Purchased For</th>
                        <td>{ poData.purchasedFor }</td>
                      </tr>
                    </tbody>
                  </Table>
                </GridItem>
              </GridItem>

              <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr style={{ height: '4rem' }}>
                      <th>Special Instructions</th>
                      <td>{ poData.specialInstructions }</td>
                    </tr>
                    <tr style={{ height: '4rem' }}>
                      <th>Comments</th>
                      <td>{ poData.comments }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem variant={['no-style']} colStart={1} colEnd={12}>
                <PurchaseOrderItemsTable
                  poItems={poData.poItems}
                  poReceivedItems={poData.poReceivedItems}
                  setPoItems={setPoData}
                  po={poData}
                  className="purchase-order-items-table--details-page"
                />
              </GridItem>
            </Grid>
          </>
          :
          <Loading />
        }
      </div>
    </Layout>
  );
}
