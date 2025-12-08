import Button from "../library/Button";
import Grid from "../library/grid/Grid";
import GridItem from "../library/grid/GridItem";
import Table from "../library/Table";
import PurchaseOrderItemsTable from "./PurchaseOrderItemsTable";
import { deletePurchaseOrder } from "@/scripts/services/purchaseOrderService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { confirm } from "@/scripts/config/tauri";
import { useNavState } from "@/hooks/useNavState";
import { usePrintQue } from "@/hooks/usePrintQue";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";

interface Props {
  poData: PO
  handleReceiveItem: () => void
  setIsEditing: (value: boolean) => void
  handleToggleIsItemReceived: (id: number, isReceived: boolean) => Promise<void>
}


export default function PurchaseOrderDetails({ poData, handleReceiveItem, setIsEditing, handleToggleIsItemReceived }: Props) {
  const { closeDetailsBtn, push } = useNavState();
  const { addToQue, printQue } = usePrintQue();
  const [user] = useAtom<User>(userAtom);

  const handleDelete = async () => {
    if (!poData?.id || user.accessLevel <= 1 || prompt('Type "confirm" to adelete this purchase order') !== 'confirm') return;
    await deletePurchaseOrder(poData.id);
    await push('Purchase Orders', '/purchase-orders');
  };

  const handlePrint = async () => {
    if (!await confirm('Print purchase order?')) return;
    const args = {
      id: poData?.id,
      vendor: poData?.purchasedFrom ?? '',
      address: poData?.vendorAddress ?? '',
      city: poData?.vendorCity ?? '',
      state: poData?.vendorState ?? '',
      zip: poData?.vendorZip?.toString() ?? '',
      phone: poData?.vendorPhone ?? '',
      fax: poData?.vendorFax ?? '',
      paymentTerms: poData?.paymentTerms ?? '',
      purchasedFor: poData?.purchasedFor ?? '',
      specialInstructions: poData?.specialInstructions ?? '',
      comments: poData?.comments ?? '',
      date: formatDate(poData?.date) ?? '',
      orderedBy: poData?.orderedBy ?? '',
      items: poData?.poItems.map((item) => {
        return {
          qty: item.qty ?? '',
          desc: item.desc ?? '',
          price: formatCurrency(item.unitPrice) || '$0.00',
          total: formatCurrency((item.unitPrice ?? 0) * (item.qty ?? 0)) || '$0.00'
        };
      }) || []
    };
    addToQue('po', 'print_po', args, '816px', '1090px');
    printQue();
  };


  return (
    <>
      <div className="purchase-order-details__header">
        <div>
          <h2>{ poData.poNum } Purchase Order</h2>
          <div className="purchase-order-details__top-bar">
            <Button onClick={handlePrint}>Print</Button>
            <Button onClick={handleReceiveItem}>{ poData.isItemReceived ? 'Unmark' : 'Mark' } as Closed</Button>
          </div>
        </div>

        <div className="header__btn-container">
          <Button
            variant={['blue']}
            className="purchase-order-details__edit-btn"
            onClick={() => setIsEditing(true)}
            data-testid="edit-btn"
          >
            Edit
          </Button>
          <Button
            className="purchase-order-details__close-btn"
            onClick={async () => await closeDetailsBtn()}
          >
            Back
          </Button>
          <Button
            variant={['danger']}
            onClick={handleDelete}
            data-testid="delete-btn"
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
                  <td data-testid="purchased-for">{ poData.purchasedFor }</td>
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
            className="purchase-order-items-table--details-page"
            handleToggleIsItemReceived={handleToggleIsItemReceived}
          />
        </GridItem>
      </Grid>
    </>
  );
}
