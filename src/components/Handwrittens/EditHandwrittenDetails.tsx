import { errorAtom, sourcesAtom } from "@/scripts/atoms/state";
import { addHandwrittenItem, deleteHandwrittenItem, editHandwritten, editHandwrittenItem, editHandwrittenTaxable, getHandwrittenEmails } from "@/scripts/services/handwrittensService";
import { useAtom } from "jotai";
import { FormEvent, Fragment, useEffect, useState } from "react";
import GridItem from "../Library/Grid/GridItem";
import Input from "../Library/Input";
import Grid from "../Library/Grid/Grid";
import Select from "../Library/Select/Select";
import { formatCurrency, formatDate, parseDateInputValue } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";
import CustomerDropdown from "../Library/Select/CustomerDropdown";
import { getCustomerByName } from "@/scripts/services/customerService";
import { getAllSources } from "@/scripts/services/sourcesService";
import { deleteCoreByItemId, editCoreCustomer } from "@/scripts/services/coresService";
import ShippingListDialog from "../Dialogs/handwrittens/ShippingListDialog";
import Checkbox from "../Library/Checkbox";
import { PreventNavigation } from "../PreventNavigation";
import ChangeCustomerInfoDialog from "../Dialogs/handwrittens/ChangeCustomerInfoDialog";
import { addTrackingNumber, deleteTrackingNumber, editTrackingNumber } from "@/scripts/services/trackingNumbersService";
import FreightCarrierSelect from "../Library/Select/FreightCarrierSelect";
import { getFreightCarrierById } from "@/scripts/services/freightCarriersService";
import { getAllUsers } from "@/scripts/services/userService";
import CreditCardBlock from "./CreditCardBlock";
import Dropdown from "../Library/Dropdown/Dropdown";
import DropdownOption from "../Library/Dropdown/DropdownOption";
import { arrayOfObjectsMatch } from "@/scripts/tools/utils";
import PromotionalDialog from "../Dialogs/handwrittens/PromotionalDialog";
import Loading from "../Library/Loading";
import { ask } from "@/scripts/config/tauri";
import { getAltShipByCustomerId } from "@/scripts/services/altShipService";
import AltShipDialog from "../Dialogs/handwrittens/AltShipDialog";
import { usePrintQue } from "@/hooks/usePrintQue";

interface Props {
  handwritten: Handwritten
  setHandwritten: (handwritten: Handwritten | null) => void
  handleAltShip: () => Promise<void>
  setIsEditing: (value: boolean) => void
  setPromptLeaveWindow: (value: boolean) => void
  cardNum: string
  expDate: string
  cvv: string
  cardZip: string
  cardName: string
  cardAddress: string
  payment: string
  setPayment: (value: string) => void
  setCardNum: (value: string) => void
  setExpDate: (value: string) => void
  setCvv: (value: string) => void
  setCardZip: (value: string) => void
  setCardName: (value: string) => void
  setCardAddress: (value: string) => void
  setAddQtyDialogOpen: (value: boolean) => void
}


export default function EditHandwrittenDetails({
  handwritten,
  setHandwritten,
  handleAltShip,
  setIsEditing,
  setPromptLeaveWindow,
  cardNum,
  expDate,
  cvv,
  cardZip,
  cardName,
  cardAddress,
  payment,
  setPayment,
  setCardNum,
  setExpDate,
  setCvv,
  setCardZip,
  setCardName,
  setCardAddress,
  setAddQtyDialogOpen
}: Props) {
  const { addToQue, printQue } = usePrintQue();
  const [sourcesData, setSourcesData] = useAtom<string[]>(sourcesAtom);
  const [, setError] = useAtom<string>(errorAtom);
  const [date, setDate] = useState<Date>(handwritten.date);
  const [poNum, setPoNum] = useState<string>(handwritten.poNum ?? '');
  const [company, setCompany] = useState<string>(handwritten.customer?.company ?? '');
  const [source, setSource] = useState<string>(handwritten.source ?? '');
  const [billToCompany, setBillToCompany] = useState<string>(handwritten.billToCompany ?? '');
  const [billToAddress, setBillToAddress] = useState<string>(handwritten.billToAddress ?? '');
  const [billToAddress2, setBillToAddress2] = useState<string>(handwritten.billToAddress2 ?? '');
  const [billToCity, setBillToCity] = useState<string>(handwritten.billToCity ?? '');
  const [billToState, setBillToState] = useState<string>(handwritten.billToState ?? '');
  const [billToZip, setBillToZip] = useState<string>(handwritten.billToZip ?? '');
  const [billToPhone, setBillToPhone] = useState<string>(handwritten.billToPhone ?? '');
  const [shipToAddress, setShipToAddress] = useState<string>(handwritten.shipToAddress ?? '');
  const [shipToAddress2, setShipToAddress2] = useState<string>(handwritten.shipToAddress2 ?? '');
  const [shipToCity, setShipToCity] = useState<string>(handwritten.shipToCity ?? '');
  const [shipToState, setShipToState] = useState<string>(handwritten.shipToState ?? '');
  const [shipToZip, setShipToZip] = useState<string>(handwritten.shipToZip ?? '');
  const [shipToCompany, setShipToCompany] = useState<string>(handwritten.shipToCompany ?? '');
  const [shipViaId, setShipViaId] = useState<number | null>(handwritten.shipVia?.id ?? null);
  const [shipToContact, setShipToContact] = useState<string>(handwritten.shipToContact ?? '');
  const [contact, setContact] = useState<string>(handwritten.contactName ?? '');
  const [contactPhone, setContactPhone] = useState<string>(handwritten.phone ?? '');
  const [contactCell] = useState<string>(handwritten.cell ?? '');
  const [contactFax] = useState<string>(handwritten.fax ?? '');
  const [contactEmail, setContactEmail] = useState<string>(handwritten.email ?? '');
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>(handwritten.invoiceStatus);
  const [accountingStatus, setAccountingStatus] = useState<AccountingStatus>(handwritten.accountingStatus ?? '');
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus>(handwritten.shippingStatus ?? '');
  const [handwrittenItems, setHandwrittenItems] = useState<HandwrittenItem[]>(handwritten.handwrittenItems);
  const [orderNotes, setOrderNotes] = useState<string>(handwritten.orderNotes ?? '');
  const [shippingNotes, setShippingNotes] = useState<string>(handwritten.shippingNotes ?? '');
  const [mp, setMp] = useState<number>(handwritten.mp);
  const [cap, setCap] = useState<number>(handwritten.cap);
  const [br, setBr] = useState<number>(handwritten.br);
  const [fl, setFl] = useState<number>(handwritten.fl);
  const [trackingNumbers, setTrackingNumbers] = useState<TrackingNumber[]>(handwritten.trackingNumbers);
  const [blankTrackingNumber, setBlankTrackingNumber] = useState('');
  const [shippingListDialogOpen, setShippingListDialogOpen] = useState(false);
  const [promotionalDialogOpen, setPromotionalDialogOpen] = useState(false);
  const [newShippingListRow, setNewShippingListRow] = useState<Handwritten | null>(null);
  const [isTaxable, setIsTaxable] = useState<boolean>(handwritten.isTaxable);
  const [isBlindShipment, setIsBlind] = useState<boolean>(handwritten.isBlindShipment);
  const [isThirdParty, setIsThirdParty] = useState<boolean>(handwritten.isThirdParty);
  const [isNoPriceInvoice, setIsNoPriceInvoice] = useState<boolean>(handwritten.isNoPriceInvoice);
  const [isCollect, setIsCollect] = useState<boolean>(handwritten.isCollect);
  const [isSetup, setIsSetup] = useState<boolean>(handwritten.isSetup);
  const [isEndOfDay, setIsEndOfDay] = useState<boolean>(handwritten.isEndOfDay);
  const [thirdPartyAccount, setThirdPartyAccount] = useState<string>(handwritten.thirdPartyAccount ?? '');
  const [soldBy, setSoldBy] = useState<number>(handwritten.soldById);
  const [changesSaved, setChangesSaved] = useState(true);
  const [changeCustomerDialogOpen, setChangeCustomerDialogOpen] = useState(false);
  const [changeCustomerDialogData, setChangeCustomerDialogData] = useState<Handwritten | null>(null);
  const [taxTotal, setTaxTotal] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [altShipOpen, setAltShipOpen] = useState(false);
  const [altShipData, setAltShipData] = useState<AltShip[]>([]);
  const [loading, setLoading] = useState(false);
  const TAX_RATE = 0.08375;

  useEffect(() => {
    const fetchData = async () => {
      if (sourcesData.length === 0) setSourcesData(await getAllSources());
      const users = await getAllUsers();
      setUsers(users);
      if (!soldBy) setSoldBy(users[0].id);
      const emails = await getHandwrittenEmails(handwritten.customer.id);
      setEmails(emails);

      const altShip = await getAltShipByCustomerId(handwritten.customer.id);
      setAltShipData(altShip);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const taxItemsAmount = handwrittenItems.map((item) => (item.qty ?? 0) * (item.unitPrice ?? 0)).reduce((acc, cur) => acc + cur, 0);
    setTaxTotal(Number((taxItemsAmount * TAX_RATE).toFixed(2)));
  }, [handwrittenItems]);

  useEffect(() => {
    setShipToAddress(handwritten.shipToAddress ?? '');
    setShipToAddress2(handwritten.shipToAddress2 ?? '');
    setShipToCity(handwritten.shipToCity ?? '');
    setShipToState(handwritten.shipToState ?? '');
    setShipToZip(handwritten.shipToZip ?? '');
    setShipToCompany(handwritten.shipToCompany ?? '');
  }, [handwritten]);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!changesSaved && !await ask('Are you sure you want to save these changes?')) return;
    setChangesSaved(true);
    const isSentToAccounting = invoiceStatus === 'SENT TO ACCOUNTING' && handwritten.invoiceStatus !== 'SENT TO ACCOUNTING';
    if (isSentToAccounting && handwrittenItems.some((item) => item.cost === 0.04)) {
      setError('Can\'t save when items have $0.04 cost');
      return;
    }

    await handleAltShip();
    const newCustomer = await getCustomerByName(company);
    const newInvoice = {
      id: handwritten.id,
      shipViaId,
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
    await editCoreCustomer(handwritten.id, newCustomer?.id ?? null);

    if (!arrayOfObjectsMatch(handwrittenItems, handwritten.handwrittenItems)) {
      for (let i = 0; i < handwrittenItems.length; i++) {
        const item = handwrittenItems[i];
        const newItem = {
          id: Number(item.id),
          handwrittenId: Number(handwritten.id),
          stockNum: item.stockNum,
          location: item.location,
          cost: item.stockNum ? Number(item.cost) : 0,
          qty: item.stockNum ? Number(item.qty) : 0,
          partNum: item.partNum,
          desc: item.desc,
          unitPrice: Number(item.unitPrice),
          date: item.date
        } as HandwrittenItem;
        await editHandwrittenItem(newItem);
      }
    }

    if (isSentToAccounting) {
      if (await ask('Do you want to add marketing materials?')) {
        setPromotionalDialogOpen(true);
      } else {
        if (await ask('Add this to shipping list?')) {
          setShippingListDialogOpen(true);
        } else {
          const hasCore = handwrittenItems.some((item) => item.location === 'CORE DEPOSIT');
          await handlePrintCCLabel();
          await printHandwritten(hasCore, newInvoice);
        }
      }
    }

    // Tracking numbers
    const deletedNumbers: number[] = [];
    for (let i = 0; i < handwritten.trackingNumbers.length; i++) {
      const id = handwritten.trackingNumbers[i].id;
      if (!trackingNumbers.some((num) => num.id === id)) {
        await deleteTrackingNumber(id);
        deletedNumbers.push(id);
      }
    }

    for (let i = 0; i < trackingNumbers.length; i++) {
      if (deletedNumbers.some((num: any) => num.id === deletedNumbers)) continue;
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

  const stopEditing = async () => {
    if (changesSaved) {
      setIsEditing(false);
    } else if (await ask('Do you want to leave without saving?')) {
      setIsEditing(false);
    }
  };

  const printHandwritten = async (hasCore: boolean, handwritten: Handwritten) => {
    setLoading(true);
    const itemTotals: number[] = handwrittenItems.map((item) => (item.qty ?? 0) * (item.unitPrice ?? 0));
    const handwrittenTotal = formatCurrency(itemTotals.reduce((acc, cur) => acc + cur, 0));
    const shipVia = await getFreightCarrierById(shipViaId);
    const args = {
      billToCompany: handwritten.billToCompany ?? '',
      billToAddress: handwritten.billToAddress ?? '',
      billToAddress2: handwritten.billToAddress2 ?? '',
      billToCity: handwritten.billToCity ?? '',
      billToState: handwritten.billToState ?? '',
      billToZip: handwritten.billToZip ?? '',
      billToCountry: handwritten.billToCountry ?? '',
      shipToCompany: handwritten.shipToCompany ?? '',
      shipToAddress: handwritten.shipToAddress ?? '',
      shipToAddress2: handwritten.shipToAddress2 ?? '',
      shipToCity: handwritten.shipToCity ?? '',
      shipToState: handwritten.shipToState ?? '',
      shipToZip: handwritten.shipToZip ?? '',
      shipToContact: handwritten.shipToContact ?? '',
      shipToCountry: '',
      accountNum: '',
      paymentType: handwritten.payment ?? '',
      createdBy: handwritten.createdBy ?? '',
      soldBy: users.find((user) => user.id === Number(handwritten.soldBy))?.initials ?? '',
      handwrittenId: Number(handwritten.id),
      date: formatDate(handwritten.date) ?? '',
      contact: handwritten.shipToContact ?? '',
      poNum: handwritten.poNum ?? '',
      shipVia: shipVia?.name ?? '',
      source: handwritten.source ?? '',
      invoiceNotes: handwritten.orderNotes ? handwritten.orderNotes.replace(/[\n\r]/g, '  ').replaceAll('…', '...') : '',
      shippingNotes: handwritten.shippingNotes ? handwritten.shippingNotes.replace(/[\n\r]/g, '  ').replaceAll('…', '...') : '',
      mp: `${handwritten.mp ?? 0} Mousepads`,
      cap: `${handwritten.cap ?? 0} Hats`,
      br: `${handwritten.br ?? 0} Brochures`,
      fl: `${handwritten.fl ?? 0} Flashlights`,
      setup: handwritten.isSetup ?? false,
      taxable: handwritten.isTaxable ?? false,
      blind: handwritten.isBlindShipment ?? false,
      npi: handwritten.isNoPriceInvoice ?? false,
      collect: handwritten.isCollect ?? false,
      thirdParty: handwritten.isThirdParty ?? false,
      handwrittenTotal,
      items: handwrittenItems.map((item) => {
        return {
          stockNum: item.stockNum ?? '',
          location: item.location ?? '',
          cost: formatCurrency(item.cost).replaceAll(',', '|') ?? '$0.00',
          qty: item.qty,
          partNum: item.partNum ?? '',
          desc: item.desc ?? '',
          unitPrice: formatCurrency(item.unitPrice).replaceAll(',', '|') ?? '$0.00',
          total: formatCurrency((item.qty ?? 0) * (item.unitPrice ?? 0)).replaceAll(',', '|') ?? '$0.00',
          itemChildren: item.invoiceItemChildren
        };
      }) ?? []
    };
    const itemChildren = handwrittenItems.map((item) => {
      if (item.invoiceItemChildren.length > 0) return item.invoiceItemChildren.map((child) => {
        return {
          cost: formatCurrency(child.cost).replaceAll(',', '|') || '$0.00',
          qty: child.qty,
          partNum: child.partNum,
          desc: child.part?.desc,
          stockNum: child.stockNum,
          location: child.part?.location,
          unitPrice: formatCurrency(item.unitPrice).replaceAll(',', '|') || '$0.00',
          total: formatCurrency((child.qty ?? 0) * (item.unitPrice ?? 0)).replaceAll(',', '|') || '$0.00'
        };
      });
    }).filter((item) => item).flat();
    const itemsWithChildren = [...args.items.filter((item: any) => item.itemChildren.length === 0), ...itemChildren ];

    addToQue('handwrittenAcct', 'print_accounting_handwritten', { ...args, items: args.items }, '1100px', '816px');
    addToQue('handwrittenShip', 'print_shipping_handwritten', { ...args, items: itemsWithChildren }, '1100px', '816px');
    if (hasCore) addToQue('handwrittenCore', 'print_core_handwritten', args, '1100px', '816px');
    printQue();
    setLoading(false);
  };

  const handlePrintCCLabel = async () => {
    if (!cardNum || !expDate || !cvv) return;
    addToQue('ccLabel', 'print_cc_label', { cardNum, expDate, cvv, cardZip, cardName, cardAddress }, '230.4px', '120px');
    printQue();
  };

  const handleEditItem = (item: HandwrittenItem, i: number) => {
    const newItems = [...handwrittenItems];
    newItems[i] = item;
    setHandwrittenItems(newItems);
  };

  const handleDeleteItem = async (item: HandwrittenItem) => {
    if (!await ask('Are you sure you want to delete this item?')) return;
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
      setHandwrittenItems(handwrittenItems.filter((i) => i.id !== item?.id));
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

    if (!row) {
      const id = await addHandwrittenItem(item);
      setHandwrittenItems([...handwrittenItems, { id, ...item }]);
    } else {
      await editHandwrittenItem(item);
    }
  };

  const handleSameAsBillTo = () => {
    setShipToAddress(billToAddress);
    setShipToAddress2(billToAddress2);
    setShipToCity(billToCity);
    setShipToState(billToState);
    setShipToZip(billToZip);
    setShipToCompany(billToCompany);
  };

  const onPrintCCLabel = async () => {
    await handlePrintCCLabel();
  };

  const onPrintHandwritten = async () => {
    const newCustomer = await getCustomerByName(company);
    const newInvoice = {
      id: handwritten.id,
      shipViaId,
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
    const hasCore = handwrittenItems.some((item) => item.location === 'CORE DEPOSIT');
    await printHandwritten(hasCore, newInvoice);
  };

  const onAddPromotionals = (mp: number, cap: number, br: number, fl: number) => {
    setMp(mp);
    setCap(cap);
    setBr(br);
    setFl(fl);
  };

  const onPromotionalsClose = async () => {
    if (await ask('Add this to shipping list?')) {
      setShippingListDialogOpen(true);
    } else {
      const newCustomer = await getCustomerByName(company);
      const newInvoice = {
        id: handwritten.id,
        shipViaId,
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
      const hasCore = handwrittenItems.some((item) => item.location === 'CORE DEPOSIT');
      await handlePrintCCLabel();
      await printHandwritten(hasCore, newInvoice);
    }
  };


  return (
    <>
      <PreventNavigation shouldPrevent={!changesSaved} text="Leave without saving changes?" />
      {loading &&
        <div style={{ position: 'absolute', inset: 0, alignContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1 }}>
          <Loading />
        </div>
      }

      {changeCustomerDialogOpen &&
        <ChangeCustomerInfoDialog
          open={changeCustomerDialogOpen}
          setOpen={setChangeCustomerDialogOpen}
          customer={handwritten.customer}
          handwritten={changeCustomerDialogData}
          setIsEditing={setIsEditing}
        />
      }

      {promotionalDialogOpen &&
        <PromotionalDialog
          open={promotionalDialogOpen}
          setOpen={setPromotionalDialogOpen}
          handwritten={handwritten}
          onAddPromotionals={onAddPromotionals}
          onClose={onPromotionalsClose}
        />
      }

      {shippingListDialogOpen &&
        <ShippingListDialog
          open={shippingListDialogOpen}
          setOpen={setShippingListDialogOpen}
          handwrittenItems={handwrittenItems}
          newShippingListRow={newShippingListRow}
          setIsEditing={setIsEditing}
          onPrintCCLabel={onPrintCCLabel}
          onPrintHandwritten={onPrintHandwritten}
        />
      }

      {handwritten &&
        <>
          <AltShipDialog
            open={altShipOpen}
            setOpen={setAltShipOpen}
            handwritten={handwritten}
            setHandwritten={setHandwritten}
            altShipData={altShipData}
            setAltShipData={setAltShipData}
            onChangeAltShip={handleAltShip}
          />

          <form className="edit-handwritten-details" onSubmit={(e) => saveChanges(e)} onChange={() => setChangesSaved(false)}>
            <div className="edit-handwritten-details__header">
              <h2>Handwritten { handwritten.id }</h2>
            
              <div className="header__btn-container">
                <Button
                  variant={['save']}
                  className="edit-handwritten-details__save-btn"
                  type="submit"
                  data-testid="save-btn"
                >
                  Save
                </Button>
                <Button
                  className="edit-handwritten-details__close-btn"
                  type="button"
                  onClick={stopEditing}
                  data-testid="stop-edit-btn"
                >
                  Stop Editing
                </Button>
              </div>
            </div>

            <div className="edit-handwritten-details__top-bar">
              <Button type="button" onClick={() => setAltShipOpen(!altShipOpen)} disabled={altShipData.length === 0}>Alt Ship</Button>
              <Button type="button" onClick={() => setAddQtyDialogOpen(true)} data-testid="add-qty-io-btn">Add Qty | I/O</Button>
            </div>

            <Grid rows={1} cols={11} gap={1}>
              <GridItem colStart={1} colEnd={5} breakpoints={[{ width: 1600, colStart: 1, colEnd: 6 }]} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Billing Company</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={billToCompany}
                          onChange={(e: any) => setBillToCompany(e.target.value)}
                          data-testid="bill-to-company"
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
                          data-testid="bill-to-address"
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
                          data-testid="bill-to-address-2"
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
                          data-testid="bill-to-city"
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
                          data-testid="bill-to-state"
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
                          data-testid="bill-to-zip"
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
                          data-testid="bill-to-phone"
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>
              
              <GridItem colStart={5} colEnd={9} variant={['low-opacity-bg']} className="no-print">
                <CreditCardBlock
                  handwritten={handwritten}
                  setPromptLeaveWindow={setPromptLeaveWindow}
                  cardNum={cardNum}
                  expDate={expDate}
                  cvv={cvv}
                  cardZip={cardZip}
                  cardName={cardName}
                  cardAddress={cardAddress}
                  payment={payment}
                  setPayment={setPayment}
                  setCardNum={setCardNum}
                  setExpDate={setExpDate}
                  setCvv={setCvv}
                  setCardZip={setCardZip}
                  setCardName={setCardName}
                  setCardAddress={setCardAddress}
                />
              </GridItem>

              <GridItem colStart={9} colEnd={12} breakpoints={[{ width: 1600, colStart: 1, colEnd: 8 }]} variant={['low-opacity-bg']}>
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
                        <CustomerDropdown
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
                          data-testid="po-num"
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
                          data-testid="source"
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
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={contact}
                          onChange={(e: any) => setContact(e.target.value)}
                          data-testid="contact"
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={1} colEnd={5} breakpoints={[{ width: 1600, colStart: 6, colEnd: 12 }]} variant={['no-style']}>
                <GridItem variant={['no-style']}>
                  <Button variant={['xx-small']} onClick={handleSameAsBillTo} type="button">Same as Bill To</Button>
                </GridItem>

                <GridItem variant={['low-opacity-bg']}>
                  <Table variant={['plain', 'edit-row-details']}>
                    <tbody>
                      <tr>
                        <th>Shipping Company</th>
                        <td>
                          <Input
                            variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                            value={shipToCompany}
                            onChange={(e: any) => setShipToCompany(e.target.value)}
                            data-testid="ship-to-company"
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
                            data-testid="ship-to-address"
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
                            data-testid="ship-to-address-2"
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
                            data-testid="ship-to-city"
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
                            data-testid="ship-to-state"
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
                            data-testid="ship-to-zip"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Ship Via</th>
                        <td>
                          <FreightCarrierSelect
                            variant={['label-bold']}
                            value={shipViaId ?? ''}
                            onChange={(e: any) => handleEditShipVia(e.target.value)}
                            data-testid="ship-via"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </GridItem>
              </GridItem>

              <GridItem colStart={5} colEnd={9} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Attn To / Contact</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={shipToContact}
                          onChange={(e: any) => setShipToContact(e.target.value)}
                          data-testid="attn-to"
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
                          data-testid="contact-phone"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>EOD Email</th>
                      <td>
                        <Dropdown
                          variant={['input', 'no-margin', 'fill']}
                          value={contactEmail}
                          onChange={(value: string) => setContactEmail(value)}
                          maxHeight="25rem"
                          data-testid="eod-email"
                        >
                          {emails.map((email, i) => {
                            return <DropdownOption key={i} value={email}>{ email }</DropdownOption>;
                          })}
                        </Dropdown>
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
                    data-testid="sales-status"
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
                      { handwritten.invoiceStatus !== 'SENT TO ACCOUNTING' && <th style={{ color: 'white' }}></th> }
                    </tr>
                  </thead>
                  <tbody>
                    {handwrittenItems.map((item: HandwrittenItem, i: number) => {
                      const isDisabled = item.desc === 'TAX' || item.partNum === 'FREIGHT' || handwritten.invoiceStatus === 'SENT TO ACCOUNTING';
                      return (
                        <tr key={i}>
                          <td>
                            <Input
                              value={item.stockNum ?? ''}
                              onChange={(e: any) => handleEditItem({ ...item, stockNum: e.target.value }, i)}
                              disabled={isDisabled}
                            />
                          </td>
                          <td>
                            <Input
                              value={item.location ?? ''}
                              onChange={(e: any) => handleEditItem({ ...item, location: e.target.value }, i)}
                              disabled={isDisabled}
                            />
                          </td>
                          <td>
                            <Input
                              value={item.cost ?? ''}
                              onChange={(e: any) => handleEditItem({ ...item, cost: e.target.value }, i)}
                              disabled={isDisabled}
                              data-testid="item-cost"
                              type="number"
                              step="any"
                            />
                          </td>
                          <td>
                            <Input
                              value={item.qty ?? ''}
                              type="number"
                              onChange={(e: any) => handleEditItem({ ...item, qty: e.target.value }, i)}
                              disabled={isDisabled}
                              data-testid="item-qty"
                            />
                          </td>
                          <td>
                            <Input
                              value={item.partNum ?? ''}
                              onChange={(e: any) => handleEditItem({ ...item, partNum: e.target.value }, i)}
                              disabled={isDisabled}
                            />
                          </td>
                          <td>
                            <Input
                              value={item.desc ?? ''}
                              onChange={(e: any) => handleEditItem({ ...item, desc: e.target.value }, i)}
                              disabled={isDisabled}
                            />
                          </td>
                          <td>
                            <Input
                              value={item.desc === 'TAX' ? taxTotal : item.unitPrice ?? ''}
                              onChange={(e: any) => handleEditItem({ ...item, unitPrice: e.target.value }, i)}
                              disabled={isDisabled}
                              type="number"
                              step="any"
                            />
                          </td>
                          <td>
                            <Input
                              value={parseDateInputValue(item.date)}
                              onChange={(e: any) => handleEditItem({ ...item, date: new Date(e.target.value) }, i)}
                              disabled={isDisabled}
                              type="date"
                            />
                          </td>
                          {handwritten.invoiceStatus !== 'SENT TO ACCOUNTING' &&
                            <td>
                              <Button
                                variant={['red-color']}
                                onClick={() => handleDeleteItem(item)}
                                type="button"
                                data-testid="item-delete-btn"
                              >
                                Delete
                              </Button>
                            </td>
                          }
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
                    data-testid="shipping-notes"
                  />

                  {!isBlindShipment &&
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
                  }
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
        </>
      }
    </>
  );
}
