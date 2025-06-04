import { FormEvent, useState } from "react";
import Button from "./Library/Button";
import Grid from "./Library/Grid/Grid";
import GridItem from "./Library/Grid/GridItem";
import Input from "./Library/Input";
import Table from "./Library/Table";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { addPurchaseOrderItem, deletePurchaseOrderItem, editPurchaseOrder, editPurchaseOrderItem, getPurchaseOrderById } from "@/scripts/services/purchaseOrderService";
import VendorDropdown from "./Library/Dropdown/VendorDropdown";
import { PreventNavigation } from "./PreventNavigation";
import { confirm } from "@/scripts/config/tauri";
import Checkbox from "./Library/Checkbox";
import { ask } from "@tauri-apps/api/dialog";

interface Props {
  poData: PO
  setPo: (poData: PO) => void
  setIsEditing: (value: boolean) => void
}


export default function EditPoDetails({ poData, setPo, setIsEditing }: Props) {
  const [date, setDate] = useState<Date | null>(poData.date);
  const [purchasedFrom, setPurchasedFrom] = useState<string>(poData.purchasedFrom ?? '');
  const [vendorAddress, setVendorAddress] = useState<string>(poData.vendorAddress ?? '');
  const [vendorCity, setVendorCity] = useState<string>(poData.vendorCity ?? '');
  const [vendorState, setVendorState] = useState<string>(poData.vendorState ?? '');
  const [vendorZip, setVendorZip] = useState<string>(poData.vendorZip ?? '');
  const [vendorPhone, setVendorPhone] = useState<string>(poData.vendorPhone ?? '');
  const [vendorFax, setVendorFax] = useState<string>(poData.vendorFax ?? '');
  const [shipToCompany, setShipToCompany] = useState<string>(poData.shipToCompany ?? '');
  const [shipToAddress, setShipToAddress] = useState<string>(poData.shipToAddress ?? '');
  const [shipToCity, setShipToCity] = useState<string>(poData.shipToCity ?? '');
  const [shipToState, setShipToState] = useState<string>(poData.shipToState ?? '');
  const [shipToZip, setShipToZip] = useState<string>(poData.shipToZip ?? '');
  const [shipToPhone, setShipToPhone] = useState<string>(poData.shipToPhone ?? '');
  const [shipToFax, setShipToFax] = useState<string>(poData.shipToFax ?? '');
  const [paymentTerms, setPaymentTerms] = useState<string>(poData.paymentTerms ?? '');
  const [specialInstructions, setSpecialInstructions] = useState<string>(poData.specialInstructions ?? '');
  const [comments, setComments] = useState<string>(poData.comments ?? '');
  const [purchasedFor, setPurchasedFor] = useState<string>(poData.purchasedFor ?? '');
  const [isItemReceived, setIsItemReceived] = useState<boolean>(poData.isItemReceived);
  const [orderedBy, setOrderedBy] = useState<string>(poData.orderedBy ?? '');
  const [vendorContact, setVendorContact] = useState<string>(poData.vendorContact ?? '');
  const [shippingMethod, setShippingMethod] = useState<string>(poData.shippingMethod ?? '');
  const [poItems, setPoItems] = useState<POItem[]>(poData.poItems);
  const [changesSaved, setChangesSaved] = useState(true);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!changesSaved && !await ask('Are you sure you want to save these changes?')) return;
    setChangesSaved(false);
    const newPo = {
      id: poData.id,
      date,
      purchasedFrom,
      vendorAddress,
      vendorCity,
      vendorState,
      vendorZip,
      vendorPhone,
      vendorFax,
      shipToCompany,
      shipToAddress,
      shipToCity,
      shipToState,
      shipToZip,
      shipToPhone,
      shipToFax,
      paymentTerms,
      specialInstructions,
      comments,
      purchasedFor,
      isItemReceived,
      vendorContact,
      shippingMethod,
    } as PO;
    await editPurchaseOrder(newPo);
    if (JSON.stringify(poItems) !== JSON.stringify(poData.poItems)) {
      for (let i = 0; i < poItems.length; i++) {
        const item: any = poItems[i];
        const newItem = {
          id: item.id,
          ...item
        } as POItem;
        await editPurchaseOrderItem(newItem);
      }
    }
    setPo(await getPurchaseOrderById(poData.id));
    setIsEditing(false);
  };

  const handleEditItem = async (item: POItem, i: number) => {
    const newItems = [...poItems];
    newItems[i] = item;
    setPoItems(newItems);
  };

  const handleDeleteItem = async (id: number) => {
    if (!await ask('Are you sure you want to delete this item?')) return;
    const newItems = poItems.filter((i: POItem) => i.id !== id);
    await deletePurchaseOrderItem(id);
    setPoItems(newItems);
  };

  const handleNewItem = async () => {
    const newItem = {
      purchaseOrderId: poData.id,
      poNum: poData.poNum,
      desc: '',
      qty: 1,
      unitPrice: 0,
      totalPrice: 0,
      isReceived: false
    } as any;
    const id = await addPurchaseOrderItem(newItem);
    setPoItems([...poItems, { ...newItem, id }]);
  };

  const handleChangeVendor = async (vendor: Vendor) => {
    setPurchasedFrom(vendor.name ?? '');
  };


  return (
    <>
      <PreventNavigation shouldPrevent={!changesSaved} text="Leave without saving changes?" />

      {poData &&
        <form className="edit-purchase-order-details" onSubmit={(e) => saveChanges(e)} onChange={() => setChangesSaved(false)}>
          <div className="edit-purchase-order-details__header">
            <h2>{ poData.id }</h2>
          
            <div className="header__btn-container">
              <Button
                variant={['save']}
                className="edit-purchase-order-details__save-btn"
                type="submit"
              >
                Save
              </Button>
              <Button
                className="edit-purchase-order-details__close-btn"
                type="button"
                onClick={() => setIsEditing(false)}
              >
                Stop Editing
              </Button>
            </div>
          </div>

          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Date</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={parseDateInputValue(date)}
                        type="date"
                        onChange={(e: any) => setDate(new Date(e.target.value))}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Ordered By</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={orderedBy}
                        onChange={(e: any) => setOrderedBy(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Vendor</th>
                    <td>
                      <VendorDropdown
                        variant={['label-full-width', 'no-margin', 'label-full-height', 'fill']}
                        value={purchasedFrom}
                        onChange={(vendor: Vendor) => handleChangeVendor(vendor)}
                        maxHeight="14rem"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Vendor Contact</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={vendorContact}
                        onChange={(e: any) => setVendorContact(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Vendor Address</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={vendorAddress}
                        onChange={(e: any) => setVendorAddress(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Vendor City</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={vendorCity}
                        onChange={(e: any) => setVendorCity(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Vendor State</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={vendorState}
                        onChange={(e: any) => setVendorState(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Vendor Zip</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={vendorZip}
                        onChange={(e: any) => setVendorZip(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Vendor Phone</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={vendorPhone}
                        onChange={(e: any) => setVendorPhone(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Vendor Fax</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={vendorFax}
                        onChange={(e: any) => setVendorFax(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Payment Terms</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={paymentTerms}
                        onChange={(e: any) => setPaymentTerms(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={6} colEnd={11} variant={['no-style']}>
              <GridItem colStart={6} colEnd={11} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Ship To Company</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={shipToCompany}
                          onChange={(e: any) => setShipToCompany(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Ship To Address</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={shipToAddress}
                          onChange={(e: any) => setShipToAddress(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Ship To City</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={shipToCity}
                          onChange={(e: any) => setShipToCity(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Ship To State</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={shipToState}
                          onChange={(e: any) => setShipToState(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Ship To Zip</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={shipToZip}
                          onChange={(e: any) => setShipToZip(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Ship To Phone</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={shipToPhone}
                          onChange={(e: any) => setShipToPhone(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Ship To Fax</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={shipToFax}
                          onChange={(e: any) => setShipToFax(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Shipping Method</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={shippingMethod}
                          onChange={(e: any) => setShippingMethod(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <br />
              <GridItem colStart={6} colEnd={11} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Purchased For</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={purchasedFor}
                          onChange={(e: any) => setPurchasedFor(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>
            </GridItem>

            <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr style={{ height: '4rem' }}>
                    <th>Special Instructions</th>
                    <td>
                      <Input
                        variant={['label-stack', 'label-bold', 'text-area']}
                        rows={3}
                        cols={100}
                        value={specialInstructions}
                        onChange={(e: any) => setSpecialInstructions(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr style={{ height: '4rem' }}>
                    <th>Comments</th>
                    <td>
                      <Input
                        variant={['label-stack', 'label-bold', 'text-area']}
                        rows={3}
                        cols={100}
                        value={comments}
                        onChange={(e: any) => setComments(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={1} colEnd={12} variant={['no-style']} style={{ marginTop: '1rem' }}>
              <h3>PO Items</h3>
              <Table>
                <thead>
                  <tr>
                    <th>Qty</th>
                    <th>Description</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                    <th>Received</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {poItems.map((item: POItem, i: number) => { 
                    return (
                      <tr key={i}>
                        <td>
                          <Input
                            value={item.qty ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, qty: e.target.value }, i)}
                            type="number"
                            required
                          />
                        </td>
                        <td>
                          <Input
                            value={item.desc ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, desc: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.unitPrice ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, unitPrice: e.target.value }, i)}
                            type="number"
                            required
                          />
                        </td>
                        <td>
                          <Input
                            value={item.totalPrice ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, totalPrice: e.target.value }, i)}
                            type="number"
                            required
                          />
                        </td>
                        <td className="cbx-td">
                          <Checkbox
                            checked={item.isReceived}
                            onChange={(e: any) => handleEditItem({ ...item, isReceived: e.target.checked }, i)}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Button
                            variant={['danger', 'center']}
                            onClick={() => handleDeleteItem(item.id)}
                            type="button"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <Button type="button" onClick={handleNewItem}>Add</Button>
            </GridItem>
          </Grid>
        </form>
      }
    </>
  );
}
