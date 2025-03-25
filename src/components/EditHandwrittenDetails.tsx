import { sourcesAtom } from "@/scripts/atoms/state";
import { addAltShipAddress, addHandwrittenItem, deleteHandwrittenItem, editHandwritten, editHandwrittenItems, editHandwrittenTaxable, getHandwrittenById } from "@/scripts/controllers/handwrittensController";
import { useAtom } from "jotai";
import { FormEvent, Fragment, useEffect, useState } from "react";
import GridItem from "./Library/Grid/GridItem";
import Input from "./Library/Input";
import Grid from "./Library/Grid/Grid";
import Select from "./Library/Select/Select";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Button from "./Library/Button";
import Table from "./Library/Table";
import CustomerSelect from "./Library/Select/CustomerSelect";
import { getCustomerByName } from "@/scripts/controllers/customerController";
import { getAllSources } from "@/scripts/controllers/sourcesController";
import { deleteCoreByItemId, editCoreCustomer } from "@/scripts/controllers/coresController";
import { confirm } from "@/scripts/config/tauri";
import ShippingListDialog from "./Dialogs/handwrittens/ShippingListDialog";
import Checkbox from "./Library/Checkbox";
import { PreventNavigation } from "./PreventNavigation";
import ChangeCustomerInfoDialog from "./Dialogs/handwrittens/ChangeCustomerInfoDialog";
import { addTrackingNumber, deleteTrackingNumber, editTrackingNumber } from "@/scripts/controllers/trackingNumbersController";
import FreightCarrierSelect from "./Library/Select/FreightCarrierSelect";
import { getFreightCarrierById } from "@/scripts/controllers/freightCarriersController";
import { getAllUsers } from "@/scripts/controllers/userController";

interface Props {
  handwritten: Handwritten
  setHandwritten: (handwritten: Handwritten) => void
  setIsEditing: (value: boolean) => void
}


export default function EditHandwrittenDetails({ handwritten, setHandwritten, setIsEditing }: Props) {
  const [sourcesData, setSourcesData] = useAtom<string[]>(sourcesAtom);
  const [date, setDate] = useState<Date>(handwritten.date);
  const [poNum, setPoNum] = useState<string>(handwritten.poNum);
  const [company, setCompany] = useState<string>(handwritten.customer.company);
  const [source, setSource] = useState<string>(handwritten.source);
  const [billToCompany, setBillToCompany] = useState<string>(handwritten.billToCompany);
  const [billToAddress, setBillToAddress] = useState<string>(handwritten.billToAddress);
  const [billToAddress2, setBillToAddress2] = useState<string>(handwritten.billToAddress2);
  const [billToCity, setBillToCity] = useState<string>(handwritten.billToCity);
  const [billToState, setBillToState] = useState<string>(handwritten.billToState);
  const [billToZip, setBillToZip] = useState<string>(handwritten.billToZip);
  const [billToPhone, setBillToPhone] = useState<string>(handwritten.billToPhone);
  const [shipToAddress, setShipToAddress] = useState<string>(handwritten.shipToAddress);
  const [shipToAddress2, setShipToAddress2] = useState<string>(handwritten.shipToAddress2);
  const [shipToCity, setShipToCity] = useState<string>(handwritten.shipToCity);
  const [shipToState, setShipToState] = useState<string>(handwritten.shipToState);
  const [shipToZip, setShipToZip] = useState<string>(handwritten.shipToZip);
  const [shipToCompany, setShipToCompany] = useState<string>(handwritten.shipToCompany);
  const [shipViaId, setShipViaId] = useState<number>(handwritten.shipVia && handwritten.shipVia.id);
  const [payment, setPayment] = useState<string>(handwritten.payment);
  const [shipToContact, setShipToContact] = useState<string>(handwritten.shipToContact);
  const [contact, setContact] = useState<string>(handwritten.contactName);
  const [contactPhone, setContactPhone] = useState<string>(handwritten.phone);
  const [contactCell, setContactCell] = useState<string>(handwritten.cell);
  const [contactFax, setContactFax] = useState<string>(handwritten.fax);
  const [contactEmail, setContactEmail] = useState<string>(handwritten.email);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>(handwritten.invoiceStatus);
  const [accountingStatus, setAccountingStatus] = useState<AccountingStatus>(handwritten.accountingStatus);
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus>(handwritten.shippingStatus);
  const [handwrittenItems, setHandwrittenItems] = useState<HandwrittenItem[]>(handwritten.handwrittenItems);
  const [orderNotes, setOrderNotes] = useState<string>(handwritten.orderNotes);
  const [shippingNotes, setShippingNotes] = useState<string>(handwritten.shippingNotes);
  const [mp, setMp] = useState<number>(handwritten.mp);
  const [cap, setCap] = useState<number>(handwritten.cap);
  const [br, setBr] = useState<number>(handwritten.br);
  const [fl, setFl] = useState<number>(handwritten.fl);
  const [trackingNumbers, setTrackingNumbers] = useState<TrackingNumber[]>(handwritten.trackingNumbers);
  const [blankTrackingNumber, setBlankTrackingNumber] = useState('');
  const [shippingListDialogOpen, setShippingListDialogOpen] = useState(false);
  const [newShippingListRow, setNewShippingListRow] = useState<Handwritten>(null);
  const [isTaxable, setIsTaxable] = useState<boolean>(handwritten.isTaxable);
  const [isBlindShipment, setIsBlind] = useState<boolean>(handwritten.isBlindShipment);
  const [isThirdParty, setIsThirdParty] = useState<boolean>(handwritten.isThirdParty);
  const [isNoPriceInvoice, setIsNoPriceInvoice] = useState<boolean>(handwritten.isNoPriceInvoice);
  const [isCollect, setIsCollect] = useState<boolean>(handwritten.isCollect);
  const [isSetup, setIsSetup] = useState<boolean>(handwritten.isSetup);
  const [isEndOfDay, setIsEndOfDay] = useState<boolean>(handwritten.isEndOfDay);
  const [thirdPartyAccount, setThirdPartyAccount] = useState<string>(handwritten.thirdPartyAccount);
  const [soldBy, setSoldBy] = useState<number>(handwritten.soldById);
  const [changesSaved, setChangesSaved] = useState(true);
  const [changeCustomerDialogOpen, setChangeCustomerDialogOpen] = useState(false);
  const [changeCustomerDialogData, setChangeCustomerDialogData] = useState<Handwritten>(null);
  const [taxTotal, setTaxTotal] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const TAX_RATE = 0.08375;

  useEffect(() => {
    const fetchData = async () => {
      if (sourcesData.length === 0) setSourcesData(await getAllSources());
      setUsers(await getAllUsers());
    };
    fetchData();
  }, []);

  useEffect(() => {
    setHandwrittenItems(handwritten.handwrittenItems);
  }, [handwritten]);

  useEffect(() => {
    const taxItemsAmount = handwrittenItems.map((item) => item.qty * item.unitPrice).reduce((acc, cur) => acc + cur, 0);
    setTaxTotal(Number((taxItemsAmount * TAX_RATE).toFixed(2)));
  }, [handwrittenItems]);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!await confirm('Are you sure you want to save these changes?')) return;
    setChangesSaved(true);
    await handleAltShip();
    const newCustomer = await getCustomerByName(company);
    const newInvoice = {
      id: handwritten.id,
      shipViaId: Number(shipViaId),
      handwrittenItems: handwrittenItems,
      customer: newCustomer,
      date,
      poNum,
      billToCompany,
      billToAddress,
      billToAddress2,
      billToCity,
      billToState,
      billToZip,
      billToPhone,
      fax: contactFax,
      shipToAddress,
      shipToAddress2,
      shipToCity,
      shipToState,
      shipToZip,
      shipToCompany,
      source,
      payment,
      phone: contactPhone,
      cell: contactCell,
      email: contactEmail,
      contactName: contact,
      shipToContact,
      invoiceStatus,
      accountingStatus,
      shippingStatus,
      cores: handwritten.cores,
      coreReturns: handwritten.coreReturns,
      orderNotes,
      shippingNotes,
      mp: Number(mp),
      cap: Number(cap),
      br: Number(br),
      fl: Number(fl),
      isTaxable,
      isBlindShipment,
      isNoPriceInvoice,
      isThirdParty,
      isCollect,
      isSetup,
      isEndOfDay,
      thirdPartyAccount,
      soldBy
    } as any;
    setNewShippingListRow(newInvoice);
    await editHandwritten(newInvoice);
    await editCoreCustomer(handwritten.id, newCustomer.id);
    if (JSON.stringify(handwrittenItems) !== JSON.stringify(handwritten.handwrittenItems)) {
      for (let i = 0; i < handwrittenItems.length; i++) {
        const item = handwrittenItems[i];
        const newItem = {
          id: item.id,
          handwrittenId: handwritten.id,
          stockNum: item.stockNum,
          location: item.location,
          cost: item.cost,
          qty: item.qty,
          partNum: item.partNum,
          desc: item.desc,
          unitPrice: item.unitPrice,
          date: item.date,
        } as HandwrittenItem;
        await editHandwrittenItems(newItem);
      }
    }

    if (invoiceStatus === 'SENT TO ACCOUNTING' && handwritten.invoiceStatus !== 'SENT TO ACCOUNTING') {
      if (await confirm('Add this to shipping list?')) {
        setShippingListDialogOpen(true);
      }
    }

    // Tracking numbers
    let deletedNumbers = [];
    for (let i = 0; i < handwritten.trackingNumbers.length; i++) {
      const id = handwritten.trackingNumbers[i].id;
      if (!trackingNumbers.some((num) => num.id === id)) {
        await deleteTrackingNumber(id);
        deletedNumbers.push(id);
      }
    }

    for (let i = 0; i < trackingNumbers.length; i++) {
      if (deletedNumbers.some((num) => num.id === deletedNumbers)) continue;
      if (!handwritten.trackingNumbers.some((num) => num.id === trackingNumbers[i].id)) {
        await addTrackingNumber(handwritten.id, trackingNumbers[i].trackingNumber);
      } else if (trackingNumbers[i].trackingNumber !== handwritten.trackingNumbers[i].trackingNumber) {
        await editTrackingNumber(trackingNumbers[i].id, trackingNumbers[i].trackingNumber);
      }
    }

    // Prompt to change customer info if data has changed
    const handwrittenBillTo = JSON.stringify({
      billToCompany: newInvoice.billToCompany || '',
      billToAddress: newInvoice.billToAddress || '',
      billToAddress2: newInvoice.billToAddress2 || '',
      billToCity: newInvoice.billToCity || '',
      billToState: newInvoice.billToState || '',
      billToZip: newInvoice.billToZip || '',
      billToPhone: newInvoice.billToPhone || ''
    });
    const customerBillTo = JSON.stringify({
      billToCompany: newInvoice.customer.company || '',
      billToAddress: newInvoice.customer.billToAddress || '',
      billToAddress2: newInvoice.customer.billToAddress2 || '',
      billToCity: newInvoice.customer.billToCity || '',
      billToState: newInvoice.customer.billToState || '',
      billToZip: newInvoice.customer.billToZip || '',
      billToPhone: newInvoice.customer.billToPhone || ''
    });

    if (handwrittenBillTo !== customerBillTo) {
      setChangeCustomerDialogData(newInvoice);
      setChangeCustomerDialogOpen(true);
    } else if (invoiceStatus !== 'SENT TO ACCOUNTING' || handwritten.invoiceStatus === 'SENT TO ACCOUNTING') {
      setIsEditing(false);
    }
  };

  const handleAltShip = async () => {
    if (!isShipToDataChanged()) return;
    await addAltShipAddress({
      handwrittenId: handwritten.id,
      shipToAddress: shipToAddress,
      shipToAddress2: shipToAddress2,
      shipToCity: shipToCity,
      shipToState: shipToState,
      shipToZip: shipToZip,
      shipToContact: contact,
      shipToCompany: shipToCompany,
    });
  };

  const isShipToDataChanged = () => {
    return handwritten.shipToAddress !== shipToAddress ||
      handwritten.shipToAddress2 !== shipToAddress2 ||
      handwritten.shipToCity !== shipToCity ||
      handwritten.shipToState !== shipToState ||
      handwritten.shipToZip !== shipToZip || 
      handwritten.shipToCompany !== shipToCompany;
  };

  const editHandwrittenItem = (item: HandwrittenItem, i: number) => {
    const newItems = [...handwrittenItems];
    newItems[i] = item;
    setHandwrittenItems(newItems);
  };

  const handleDeleteItem = async (item: HandwrittenItem) => {
    if (!await confirm('Are you sure you want to delete this item?')) return;
    const newItems = handwrittenItems.filter((i: HandwrittenItem) => i.id !== item.id);
    await deleteHandwrittenItem(item.id);
    if (item.location && item.location.includes('CORE DEPOSIT')) await deleteCoreByItemId(item.id);
    setHandwrittenItems(newItems);
  };

  const editTrackingNumbers = (trackingNumber: string, index: number) => {
    setTrackingNumbers(trackingNumbers.map((num, i) => {
      if (i === index) return { ...num, trackingNumber };
      return num;
    }));
  };

  const handleAddTrackingNumber = () => {
    if (!blankTrackingNumber) return;
    setTrackingNumbers([...trackingNumbers, { id: 0, handwrittenId: handwritten.id, trackingNumber: blankTrackingNumber }]);
    setBlankTrackingNumber('');
  };

  const handleDeleteTrackingNumber = (id: number) => {
    setTrackingNumbers(trackingNumbers.filter((num) => num.id !== id));
  };

  const toggleTaxable = async (value: boolean) => {
    if (!await confirm(`${value ? 'Make this' : 'Remove this as'} taxable?`)) return;
    setIsTaxable(value);
    await editHandwrittenTaxable(handwritten.id, value);
    if (value) {
      const item = {
        handwrittenId: handwritten.id,
        date: new Date(),
        desc: 'TAX',
        partNum: 'TAX',
        stockNum: '',
        unitPrice: taxTotal,
        qty: 1,
        cost: 0,
        location: '',
        partId: null,
        invoiceItemChildren: []
      } as any;
      const id = await addHandwrittenItem(item);
      setHandwrittenItems([...handwrittenItems, { id, ...item }]);
    } else {
      const item = handwrittenItems.find((item) => item.partNum === 'TAX');
      if (item) await deleteHandwrittenItem(item.id);
      setHandwrittenItems(handwrittenItems.filter((i) => i.id !== item.id));
    }
  };

  const handleEditShipVia = async (id: number) => {
    setShipViaId(id);
    const shipVia = await getFreightCarrierById(id);
    const row = handwrittenItems.find((item) => item.partNum === 'FREIGHT');
    const item = {
      id: row && row.id,
      handwrittenId: handwritten.id,
      date: new Date(),
      desc: shipVia.name,
      partNum: 'FREIGHT',
      stockNum: '',
      unitPrice: 0,
      qty: 1,
      cost: 0,
      location: '',
      partId: null,
      invoiceItemChildren: []
    } as any;

    if (row === null || row === undefined) {
      const id = await addHandwrittenItem(item);
      setHandwrittenItems([...handwrittenItems, { id, ...item }]);
    } else {
      await editHandwrittenItems(item);
    }
  };


  return (
    <>
      <PreventNavigation shouldPrevent={!changesSaved} text="Leave without saving changes?" />

      {changeCustomerDialogOpen &&
        <ChangeCustomerInfoDialog
          open={changeCustomerDialogOpen}
          setOpen={setChangeCustomerDialogOpen}
          customer={handwritten.customer}
          handwritten={changeCustomerDialogData}
          setIsEditing={setIsEditing}
        />
      }

      {shippingListDialogOpen &&
        <ShippingListDialog
          open={shippingListDialogOpen}
          setOpen={setShippingListDialogOpen}
          handwrittenItems={handwrittenItems}
          newShippingListRow={newShippingListRow}
          setIsEditing={setIsEditing}
        />
      }

      {handwritten &&
        <form className="edit-handwritten-details" onSubmit={(e) => saveChanges(e)} onChange={() => setChangesSaved(false)}>
          <div className="edit-handwritten-details__header">
            <h2>Handwritten { handwritten.id }</h2>
          
            <div className="header__btn-container">
              <Button
                variant={['save']}
                className="edit-handwritten-details__save-btn"
                type="submit"
                data-id="save-btn"
              >
                Save
              </Button>
              <Button
                className="edit-handwritten-details__close-btn"
                type="button"
                onClick={() => setIsEditing(false)}
                data-id="stop-edit-btn"
              >
                Stop Editing
              </Button>
            </div>
          </div>

          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={4} breakpoints={[{ width: 1600, colStart: 1, colEnd: 8 }]} variant={['low-opacity-bg']}>
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
                    <th>Customer</th>
                    <td>
                      <CustomerSelect
                        variant={['fill', 'label-full-width', 'label-full-height', 'no-margin']}
                        value={company}
                        onChange={(value: any) => setCompany(value)}
                        maxHeight="15rem"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>PO Number</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={poNum}
                        onChange={(e: any) => setPoNum(e.target.value)}
                        data-id="po-num"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Source</th>
                    <td>
                      <Select
                        variant={['label-space-between']}
                        value={source}
                        onChange={(e: any) => setSource(e.target.value)}
                      >
                        <option value="">-- SELECT A SOURCE --</option>
                        {sourcesData.map((source: string, i) => {
                          return <option key={i} value={source}>{source}</option>;
                        })}
                      </Select>
                    </td>
                  </tr>
                  <tr>
                    <th>Sold By</th>
                    <td>
                      <Select
                        variant={['label-space-between']}
                        value={soldBy}
                        onChange={(e: any) => setSoldBy(Number(e.target.value))}
                      >
                        {users.map((user: User) => {
                          if (user.subtype === 'sales') return <option key={user.id} value={user.id}>{ user.initials }</option>;
                        })}
                      </Select>
                    </td>
                  </tr>
                  <tr>
                    <th>Contact</th>
                    <td>
                      <Select
                        variant={['label-space-between']}
                        value={contact}
                        onChange={(e: any) => setContact(e.target.value)}
                      >
                        <option value="">-- SELECT CONTACT --</option>
                        {handwritten.customer.contacts && handwritten.customer.contacts.map((contact: Contact) => {
                          return <option key={contact.id} value={contact.name}>{ contact.name }</option>;
                        })}
                      </Select>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={4} colEnd={8} breakpoints={[{ width: 1600, colStart: 1, colEnd: 6 }]} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Billing Company</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToCompany}
                        onChange={(e: any) => setBillToCompany(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Billing Address</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToAddress}
                        onChange={(e: any) => setBillToAddress(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Billing Address 2</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToAddress2}
                        onChange={(e: any) => setBillToAddress2(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Billing City</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToCity}
                        onChange={(e: any) => setBillToCity(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Billing State</th>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToState}
                        onChange={(e: any) => setBillToState(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Billing Zip</th>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToZip}
                        onChange={(e: any) => setBillToZip(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Billing Phone</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToPhone}
                        onChange={(e: any) => setBillToPhone(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={8} colEnd={12} breakpoints={[{ width: 1600, colStart: 6, colEnd: 12 }]} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Shipping Company</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToCompany}
                        onChange={(e: any) => setShipToCompany(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping Address</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToAddress}
                        onChange={(e: any) => setShipToAddress(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping Address 2</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToAddress2}
                        onChange={(e: any) => setShipToAddress2(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping City</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToCity}
                        onChange={(e: any) => setShipToCity(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping State</th>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToState}
                        onChange={(e: any) => setShipToState(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping Zip</th>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToZip}
                        onChange={(e: any) => setShipToZip(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Ship Via</th>
                    <td>
                      <FreightCarrierSelect
                        variant={['label-bold']}
                        value={shipViaId}
                        onChange={(e: any) => handleEditShipVia(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={7} colEnd={11} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Attn To / Contact</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToContact}
                        onChange={(e: any) => setShipToContact(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Contact Phone</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={contactPhone}
                        onChange={(e: any) => setContactPhone(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Contact Email</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={contactEmail}
                        onChange={(e: any) => setContactEmail(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                <Checkbox
                  variant={['label-bold', 'label-align-center']}
                  label="3RD PARTY BILL"
                  checked={isThirdParty}
                  onChange={(e: any) => {
                    setIsThirdParty(e.target.checked);
                    setIsCollect(false);
                  }}
                />
                <Checkbox
                  variant={['label-bold', 'label-align-center']}
                  label="COLLECT"
                  checked={isCollect}
                  onChange={(e: any) => {
                    setIsCollect(e.target.checked);
                    setIsThirdParty(false);
                  }}
                />
              </div>
              {(isCollect || isThirdParty) &&
                <Input
                  variant={['small', 'thin', 'label-bold']}
                  label="Account Number "
                  value={thirdPartyAccount}
                  onChange={(e: any) => setThirdPartyAccount(e.target.value)}
                />
              }
            </GridItem>

            <GridItem colStart={1} colEnd={12} variant={['no-style']}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <Checkbox
                  variant={['label-bold', 'label-align-center']}
                  label="TAXABLE"
                  checked={isTaxable}
                  onChange={(e: any) => toggleTaxable(e.target.checked)}
                />
                <Checkbox
                  variant={['label-bold', 'label-align-center']}
                  label="BLIND"
                  checked={isBlindShipment}
                  onChange={(e: any) => {
                    setIsBlind(e.target.checked);
                    if (e.target.checked) setIsNoPriceInvoice(true);
                  }}
                />
                <Checkbox
                  variant={['label-bold', 'label-align-center']}
                  label="NPI"
                  checked={isNoPriceInvoice}
                  onChange={(e: any) => setIsNoPriceInvoice(e.target.checked)}
                />
                <Checkbox
                  variant={['label-bold', 'label-align-center']}
                  label="SETUP"
                  checked={isSetup}
                  onChange={(e: any) => setIsSetup(e.target.checked)}
                />
                <Checkbox
                  variant={['label-bold', 'label-align-center']}
                  label="Email Invoice EOD"
                  checked={isEndOfDay}
                  onChange={(e: any) => setIsEndOfDay(e.target.checked)}
                />
              </div>
            </GridItem>

            <GridItem colStart={1} colEnd={12} variant={['low-opacity-bg']}>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <Select
                  label="Sales Status"
                  variant={['label-stack']}
                  value={invoiceStatus}
                  onChange={(e: any) => setInvoiceStatus(e.target.value)}
                  data-id="sales-status"
                >
                  <option value="INVOICE PENDING">INVOICE PENDING</option>
                  <option value="SENT TO ACCOUNTING">SENT TO ACCOUNTING</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="STOP - HOLD">STOP - HOLD</option>
                  <option value="HOLD AS FAVOR">HOLD AS FAVOR</option>
                </Select>

                <Select
                  label="Accouting Status"
                  variant={['label-stack']}
                  value={accountingStatus}
                  onChange={(e: any) => setAccountingStatus(e.target.value)}
                >
                  <option value=""></option>
                  <option value="IN PROCESS">IN PROCESS</option>
                  <option value="COMPLETE">COMPLETE</option>
                  <option value="PAYMENT EXCEPTION">PAYMENT EXCEPTION</option>
                </Select>

                <Select
                  label="Shipping Status"
                  variant={['label-stack']}
                  value={shippingStatus}
                  onChange={(e: any) => setShippingStatus(e.target.value)}
                >
                  <option value=""></option>
                  <option value="ORDER PICKED">ORDER PICKED</option>
                  <option value="ORDER PACKED">ORDER PACKED</option>
                  <option value="ORDER COMPLETE">ORDER COMPLETE</option>
                </Select>
              </div>
            </GridItem>

            <GridItem colStart={1} colEnd={8} variant={['no-style']} style={{ marginTop: '1rem' }}>
              <h3>Handwritten Items</h3> 
              <Table variant={['plain', 'edit-row-details']}>
                <thead>
                  <tr>
                    <th style={{ color: 'white' }}>Stock Number</th>
                    <th style={{ color: 'white' }}>Location</th>
                    <th style={{ color: 'white' }}>Cost</th>
                    <th style={{ color: 'white' }}>Qty</th>
                    <th style={{ color: 'white' }}>Part Number</th>
                    <th style={{ color: 'white' }}>Description</th>
                    <th style={{ color: 'white' }}>Unit Price</th>
                    <th style={{ color: 'white' }}>Date</th>
                    <th style={{ color: 'white' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {handwrittenItems.map((item: HandwrittenItem, i: number) => { 
                    return (
                      <tr key={i}>
                        <td>
                          <Input
                            value={item.stockNum}
                            onChange={(e: any) => editHandwrittenItem({ ...item, stockNum: e.target.value }, i)}
                            disabled={item.desc === 'TAX' || item.partNum === 'FREIGHT'}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.location}
                            onChange={(e: any) => editHandwrittenItem({ ...item, location: e.target.value }, i)}
                            disabled={item.desc === 'TAX' || item.partNum === 'FREIGHT'}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.cost}
                            type="number"
                            onChange={(e: any) => editHandwrittenItem({ ...item, cost: e.target.value }, i)}
                            disabled={item.desc === 'TAX' || item.partNum === 'FREIGHT'}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.qty}
                            type="number"
                            onChange={(e: any) => editHandwrittenItem({ ...item, qty: e.target.value }, i)}
                            disabled={item.desc === 'TAX' || item.partNum === 'FREIGHT'}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.partNum}
                            onChange={(e: any) => editHandwrittenItem({ ...item, partNum: e.target.value }, i)}
                            disabled={item.desc === 'TAX' || item.partNum === 'FREIGHT'}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.desc}
                            onChange={(e: any) => editHandwrittenItem({ ...item, desc: e.target.value }, i)}
                            disabled={item.desc === 'TAX' || item.partNum === 'FREIGHT'}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.desc === 'TAX' ? taxTotal : item.unitPrice}
                            type="number"
                            onChange={(e: any) => editHandwrittenItem({ ...item, unitPrice: e.target.value }, i)}
                            disabled={item.desc === 'TAX' || item.partNum === 'FREIGHT'}
                          />
                        </td>
                        <td>
                          <Input
                            value={parseDateInputValue(item.date)}
                            onChange={(e: any) => editHandwrittenItem({ ...item, date: new Date(e.target.value) }, i)}
                            disabled={item.desc === 'TAX' || item.partNum === 'FREIGHT'}
                            type="date"
                          />
                        </td>
                        <td>
                          <Button
                            variant={['red-color']}
                            onClick={() => handleDeleteItem(item)}
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

            <GridItem colStart={9} colEnd={12} variant={['no-style']} style={{ marginTop: '1rem' }}>
              <h3>Tracking Numbers</h3>
              <div className="edit-handwritten-details__tracking-numbers">
                {trackingNumbers.map((num, i) => {
                  return (
                    <Fragment key={i}>
                      <div>
                        <Input
                          variant={['small', 'thin']}
                          value={num.trackingNumber}
                          onChange={(e: any) => editTrackingNumbers(e.target.value, i)}
                        />
                        <Button
                          variant={['danger']}
                          type="button"
                          onClick={() => handleDeleteTrackingNumber(num.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Fragment>
                  );
                })}

                <div>
                  <Input
                    variant={['small', 'thin']}
                    value={blankTrackingNumber}
                    onChange={(e: any) => setBlankTrackingNumber(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddTrackingNumber}>Add</Button>
                </div>
              </div>
            </GridItem>

            <GridItem variant={['low-opacity-bg']} colStart={1} colEnd={7}>
              <div className="handwritten-details__shipping-notes">
                <Input
                  style={{ maxWidth: 'none' }}
                  label="Shipping Notes"
                  variant={['label-stack', 'label-bold', 'text-area', 'label-full-width']}
                  rows={5}
                  value={shippingNotes}
                  onChange={(e: any) => setShippingNotes(e.target.value)}
                />

                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th><strong>Mousepads</strong></th>
                      <td style={{ padding: 0 }}>
                        <Input
                          style={{ margin: 0, color: 'white' }}
                          variant={['no-arrows', 'no-style']}
                          value={mp}
                          onChange={(e: any) => setMp(e.target.value)}
                          type="number"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th><strong>Hats</strong></th>
                      <td style={{ padding: 0 }}>
                        <Input
                          style={{ margin: 0, color: 'white' }}
                          variant={['no-arrows', 'no-style']}
                          value={cap}
                          onChange={(e: any) => setCap(e.target.value)}
                          type="number"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th><strong>Brochures</strong></th>
                      <td style={{ padding: 0 }}>
                        <Input
                          style={{ margin: 0, color: 'white' }}
                          variant={['no-arrows', 'no-style']}
                          value={br}
                          onChange={(e: any) => setBr(e.target.value)}
                          type="number"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th><strong>Flashlights</strong></th>
                      <td style={{ padding: 0 }}>
                        <Input
                          style={{ margin: 0, color: 'white' }}
                          variant={['no-arrows', 'no-style']}
                          maxLength={245}
                          value={fl}
                          onChange={(e: any) => setFl(e.target.value)}
                          type="number"
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </GridItem>

            <GridItem variant={['low-opacity-bg']} colStart={7} colEnd={12} breakpoints={[{width: 1500, colStart: 1, colEnd: 5}]}>
              <div>
                <Input
                  style={{ maxWidth: 'none' }}
                  label="Order Notes"
                  variant={['label-stack', 'label-bold', 'text-area']}
                  rows={5}
                  maxLength={245}
                  value={orderNotes}
                  onChange={(e: any) => setOrderNotes(e.target.value)}
                />
              </div>
            </GridItem>
          </Grid>
        </form>
      }
    </>
  );
}
