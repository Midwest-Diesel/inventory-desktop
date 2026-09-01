import { FormEvent, useState } from "react";
import Button from "../library/Button";
import Grid from "../library/grid/Grid";
import GridItem from "../library/grid/GridItem";
import Input from "../library/Input";
import Table from "../library/Table";
import { formatCurrency, parseDateInputValue } from "@/scripts/tools/stringUtils";
import { addPurchaseOrderItem, deletePurchaseOrderItem, deletePurchaseOrderReceivedItem, editPurchaseOrder, editPurchaseOrderItem, editPurchaseOrderReceivedItem, getPurchaseOrderById } from "@/scripts/services/purchaseOrderService";
import { usePreventNavigation } from "../../hooks/usePreventNavigation";
import Checkbox from "../library/Checkbox";
import { ask, invoke } from "@/scripts/config/tauri";
import TextArea from "../library/TextArea";
import Select from "../library/select/Select";
import { getVendorByName } from "@/scripts/services/vendorsService";
import { getUserById } from "@/scripts/services/accountService";
import VendorDropdown from "../library/dropdown/VendorDropdown";

interface Props {
  poData: PO
  setPo: (poData: PO) => void
  setIsEditing: (value: boolean) => void
  poItems: POItem[]
  poItemsReceived: POReceivedItem[]
  setPoItems: (items: POItem[]) => void
  setPoItemsReceived: (items: POReceivedItem[]) => void
}


export default function EditPoDetails({ poData, setPo, setIsEditing, poItems, poItemsReceived, setPoItems, setPoItemsReceived }: Props) {
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
  const [orderedBy, setOrderedBy] = useState<string>(poData.orderedBy ?? '');
  const [vendorContact, setVendorContact] = useState<string>(poData.vendorContact ?? '');
  const [shippingMethod, setShippingMethod] = useState<string>(poData.shippingMethod ?? '');
  const [changesSaved, setChangesSaved] = useState(true);
  usePreventNavigation(!changesSaved, 'Leave without saving changes?');

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!paymentTerms) {
      alert('Select an option for payment terms');
      return;
    }
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
      isItemReceived: poData.isItemReceived,
      vendorContact,
      shippingMethod
    } as PO;
    await editPurchaseOrder(newPo);
    // Edit PO items
    if (JSON.stringify(poItems) !== JSON.stringify(poData.poItems)) {
      for (let i = 0; i < poItems.length; i++) {
        const item = poItems[i];
        const newItem = { ...item } as POItem;
        await editPurchaseOrderItem(newItem);
      }

      const filteredItems = poItems
        .filter((item, i) => item.isReceived && !poData.poItems[i].isReceived)
        .map((item) => item.desc ?? '');

      if (filteredItems.length > 0) {
        const user = await getUserById(Number(poData.salesmanId));
        if (user) await invoke('email_po_received', { args: {
          po_num: poData.poNum,
          purchased_from: poData.purchasedFrom,
          items: filteredItems,
          email: user.email
        }});
      }
    }
    // Edit PO received items
    if (JSON.stringify(poItemsReceived) !== JSON.stringify(poData.poReceivedItems)) {
      for (let i = 0; i < poItemsReceived.length; i++) {
        const item = poItemsReceived[i];
        const newItem = { ...item } as POReceivedItem;
        await editPurchaseOrderReceivedItem(newItem);
      }
    }

    const res = await getPurchaseOrderById(poData.id);
    if (res) setPo(res);
    setIsEditing(false);
  };

  const stopEditing = async () => {
    if (changesSaved) {
      setIsEditing(false);
    } else if (await ask('Do you want to leave without saving?')) {
      setIsEditing(false);
    }
  };

  const handleEditItem = async (item: POItem, i: number) => {
    const newItems = [...poItems];
    newItems[i] = item;
    setPoItems(newItems);
  };

  const handleEditReceivedItem = async (item: POReceivedItem, i: number) => {
    const newItems = [...poItemsReceived];
    newItems[i] = item;
    setPoItemsReceived(newItems);
  };

  const handleDeleteItem = async (id: number) => {
    if (!await ask('Are you sure you want to delete this item?')) return;
    const newItems = poItems.filter((i: POItem) => i.id !== id);
    await deletePurchaseOrderItem(id);
    setPoItems(newItems);
  };

  const handleDeleteReceivedItem = async (id: number) => {
    if (!await ask('Are you sure you want to delete this item?')) return;
    const newItems = poItemsReceived.filter((i: POReceivedItem) => i.id !== id);
    await deletePurchaseOrderReceivedItem(id);
    setPoItemsReceived(newItems);
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

  const handleChangeVendor = async (vendor: string) => {
    setPurchasedFrom(vendor);
    const res = await getVendorByName(vendor);
    if (!res) return;
    setVendorAddress(res.vendorAddress ?? '');
    setVendorCity(res.vendorCity ?? '');
    setVendorState(res.vendorState ?? '');
    setVendorZip(res.vendorZip ?? '');
    setVendorPhone(res.vendorPhone ?? '');
    setVendorFax(res.vendorFax ?? '');
    setVendorContact(res.vendorContact ?? '');
  };


  if (!poData) return null;

  return (
    <form className="edit-purchase-order-details" onSubmit={(e) => saveChanges(e)} onChange={() => setChangesSaved(false)}>
      <div className="edit-purchase-order-details__header">
        <h2>{ poData.poNum } Purchase Order</h2>
      
        <div className="header__btn-container">
          <Button
            variant={['save']}
            className="edit-purchase-order-details__save-btn"
            type="submit"
            data-testid="save-btn"
          >
            Save
          </Button>
          <Button
            className="edit-purchase-order-details__close-btn"
            type="button"
            onClick={stopEditing}
          >
            Cancel Editing
          </Button>
        </div>
      </div>

      <Grid>
        <GridItem colSpan={6} variant={['low-opacity-bg']}>
          <Table variant={['plain', 'edit-row-details']}>
            <tbody>
              <tr>
                <th>Date</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={parseDateInputValue(date)}
                    type="date"
                    onChange={(e) => setDate(new Date(e.target.value))}
                  />
                </td>
              </tr>
              <tr>
                <th>Ordered By</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={orderedBy}
                    onChange={(e) => setOrderedBy(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Vendor</th>
                <td>
                  <VendorDropdown
                    variant={['label-full-width']}
                    value={purchasedFrom}
                    onChange={(value) => handleChangeVendor(value)}
                    maxHeight="40rem"
                  />
                </td>
              </tr>
              <tr>
                <th>Vendor Contact</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={vendorContact}
                    onChange={(e) => setVendorContact(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Vendor Address</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Vendor City</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={vendorCity}
                    onChange={(e) => setVendorCity(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Vendor State</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={vendorState}
                    onChange={(e) => setVendorState(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Vendor Zip</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={vendorZip}
                    onChange={(e) => setVendorZip(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Vendor Phone</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Vendor Fax</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={vendorFax}
                    onChange={(e) => setVendorFax(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Payment Terms</th>
                <td>
                  <Select
                    variant={['label-space-between', 'label-full-width', 'label-bold']}
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    required
                    data-testid="payment-terms"
                  >
                    <option>-- SELECT PAYMENT TERMS --</option>
                    <option>On Account</option>
                    <option>Credit Card</option>
                    <option>Wire Transfer</option>
                    <option>Check</option>
                  </Select>
                </td>
              </tr>
            </tbody>
          </Table>
        </GridItem>

        <GridItem colSpan={6} variant={['no-style']}>
          <GridItem variant={['low-opacity-bg']}>
            <Table variant={['plain', 'edit-row-details']}>
              <tbody>
                <tr>
                  <th>Ship To Company</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={shipToCompany}
                      onChange={(e) => setShipToCompany(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Ship To Address</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={shipToAddress}
                      onChange={(e) => setShipToAddress(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Ship To City</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={shipToCity}
                      onChange={(e) => setShipToCity(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Ship To State</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={shipToState}
                      onChange={(e) => setShipToState(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Ship To Zip</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={shipToZip}
                      onChange={(e) => setShipToZip(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Ship To Phone</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={shipToPhone}
                      onChange={(e) => setShipToPhone(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Ship To Fax</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={shipToFax}
                      onChange={(e) => setShipToFax(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Shipping Method</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </GridItem>

          <br />
          <GridItem variant={['low-opacity-bg']}>
            <Table variant={['plain', 'edit-row-details']}>
              <tbody>
                <tr>
                  <th>Purchased For</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={purchasedFor}
                      onChange={(e) => setPurchasedFor(e.target.value)}
                      required
                      data-testid="purchased-for"
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </GridItem>
        </GridItem>

        <GridItem colSpan={6} variant={['low-opacity-bg']}>
          <Table variant={['plain', 'edit-row-details']}>
            <tbody>
              <tr style={{ height: '4rem' }}>
                <th>Special Instructions</th>
                <td>
                  <TextArea
                    variant={['label-stack', 'label-bold']}
                    rows={3}
                    cols={100}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </td>
              </tr>
              <tr style={{ height: '4rem' }}>
                <th>Comments</th>
                <td>
                  <TextArea
                    variant={['label-stack', 'label-bold']}
                    rows={3}
                    cols={100}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </GridItem>

        <GridItem colSpan={12} variant={['no-style']} style={{ marginTop: '1rem' }}>
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
                        onChange={(e) => handleEditItem({ ...item, qty: e.target.value ? Number(e.target.value) : null }, i)}
                        type="number"
                        required
                      />
                    </td>
                    <td>
                      <Input
                        value={item.desc ?? ''}
                        onChange={(e) => handleEditItem({ ...item, desc: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.unitPrice ?? ''}
                        onChange={(e) => handleEditItem({ ...item, unitPrice: e.target.value ? Number(e.target.value) : null }, i)}
                        type="number"
                        step="any"
                        required
                      />
                    </td>
                    <td>
                      <p>{ formatCurrency(Number(item.qty) * Number(item.unitPrice)) }</p>
                    </td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={item.isReceived}
                        onChange={(e) => handleEditItem({ ...item, isReceived: e.target.checked }, i)}
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

        <GridItem colSpan={12} variant={['no-style']} style={{ marginTop: '1rem' }}>
          <h3>PO Items Received</h3>
          <Table>
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Stock Number</th>
                <th>Description</th>
                <th>Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {poItemsReceived.map((item: POReceivedItem, i: number) => { 
                return (
                  <tr key={i}>
                    <td>
                      <Input
                        value={item.partNum ?? ''}
                        onChange={(e) => handleEditReceivedItem({ ...item, partNum: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.stockNum ?? ''}
                        onChange={(e) => handleEditReceivedItem({ ...item, stockNum: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.desc ?? ''}
                        onChange={(e) => handleEditReceivedItem({ ...item, desc: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.cost ?? ''}
                        onChange={(e) => handleEditReceivedItem({ ...item, cost: e.target.value ? Number(e.target.value) : null }, i)}
                        type="number"
                        step="any"
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Button
                        variant={['danger', 'center']}
                        onClick={() => handleDeleteReceivedItem(item.id)}
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
        </GridItem>
      </Grid>
    </form>
  );
}
