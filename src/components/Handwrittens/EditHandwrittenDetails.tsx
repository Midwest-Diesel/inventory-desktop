import { errorAtom, quickPickItemIdAtom, sourcesAtom } from "@/scripts/atoms/state";
import { addHandwrittenItem, deleteHandwrittenItem, editHandwritten, editHandwrittenHasPrinted, editHandwrittenItem, editHandwrittenTaxable, getHandwrittenById, getHandwrittenEmails, setAllHandwrittenItemDates } from "@/scripts/services/handwrittensService";
import { useAtom } from "jotai";
import { FormEvent, Fragment, useEffect, useRef, useState } from "react";
import GridItem from "../library/grid/GridItem";
import Input from "../library/Input";
import Grid from "../library/grid/Grid";
import Select from "../library/select/Select";
import { formatCurrency, formatDate, parseDateInputValue } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import CustomerDropdown from "../library/dropdown/CustomerDropdown";
import { getCustomerById, getCustomerByName } from "@/scripts/services/customerService";
import { getAllSources } from "@/scripts/services/sourcesService";
import { deleteCoreByItemId, editCoreCharge, editCoreCustomer, getCoresByHandwrittenItem } from "@/scripts/services/coresService";
import ShippingListModal from "./modals/ShippingListModal";
import Checkbox from "../library/Checkbox";
import { usePreventNavigation } from "../../hooks/usePreventNavigation";
import ChangeCustomerInfoModal from "./modals/ChangeCustomerInfoModal";
import { addTrackingNumber, deleteTrackingNumber, editTrackingNumber } from "@/scripts/services/trackingNumbersService";
import FreightCarrierSelect from "../library/select/FreightCarrierSelect";
import { getFreightCarrierById } from "@/scripts/services/freightCarriersService";
import { getAllUsers, getUserById } from "@/scripts/services/userService";
import CreditCardBlock from "./CreditCardBlock";
import DropdownOption from "../library/dropdown/DropdownOption";
import { arrayOfObjectsMatch } from "@/scripts/tools/utils";
import PromotionalModal from "./modals/PromotionalModal";
import Loading from "../library/Loading";
import { ask } from "@/scripts/config/tauri";
import { getAltShipByCustomerId } from "@/scripts/services/altShipService";
import AltShipDialog from "./dialogs/AltShipDialog";
import { usePrintQue } from "@/hooks/usePrintQue";
import { useQuery } from "@tanstack/react-query";
import TextArea from "../library/TextArea";
import { addCoreCharge } from "@/scripts/logic/handwrittens";
import EditHandwrittenItemsTable from "./EditHandwrittenItemsTable";
import ModalList from "../library/ModalList";
import InputDropdown from "../library/InputDropdown";
import HandwrittenStatusFields from "./HandwrittenStatusFields";

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


const MAX_ROWS = 12;

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
  const [quickPickItemId, setQuickPickItemId] = useAtom<number>(quickPickItemIdAtom);
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
  const [customerEngineInfo, setCustomerEngineInfo] = useState<string>(handwritten.customerEngineInfo ?? '');
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>(handwritten.invoiceStatus);
  const [accountingStatus, setAccountingStatus] = useState<AccountingStatus | null>(handwritten.accountingStatus ?? '');
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus | null>(handwritten.shippingStatus ?? '');
  const [handwrittenItems, setHandwrittenItems] = useState<HandwrittenItem[]>(handwritten.handwrittenItems);
  const [orderNotes, setOrderNotes] = useState<string>(handwritten.orderNotes ?? '');
  const [shippingNotes, setShippingNotes] = useState<string>(handwritten.shippingNotes ?? '');
  const [mp, setMp] = useState<number>(handwritten.mp);
  const [cap, setCap] = useState<number>(handwritten.cap);
  const [br, setBr] = useState<number>(handwritten.br);
  const [fl, setFl] = useState<number>(handwritten.fl);
  const [trackingNumbers, setTrackingNumbers] = useState<TrackingNumber[]>(handwritten.trackingNumbers);
  const [blankTrackingNumber, setBlankTrackingNumber] = useState('');
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
  const [changeCustomerDialogData, setChangeCustomerDialogData] = useState<Handwritten | null>(null);
  const [altShipOpen, setAltShipOpen] = useState(false);
  const [accountingProcessOpen, setAccountingProcessOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const accountNumRef = useRef<HTMLInputElement | null>(null);
  const isSentToAccounting = invoiceStatus === 'SENT TO ACCOUNTING' && handwritten.invoiceStatus !== 'SENT TO ACCOUNTING';
  usePreventNavigation(!changesSaved, 'Leave without saving changes?');
  

  useEffect(() => {
    setShipToAddress(handwritten.shipToAddress ?? '');
    setShipToAddress2(handwritten.shipToAddress2 ?? '');
    setShipToCity(handwritten.shipToCity ?? '');
    setShipToState(handwritten.shipToState ?? '');
    setShipToZip(handwritten.shipToZip ?? '');
    setShipToCompany(handwritten.shipToCompany ?? '');
    setOrderNotes(handwritten.orderNotes ?? '');
  }, [handwritten]);

  useQuery({
    queryKey: ['sources'],
    queryFn: getAllSources,
    enabled: sourcesData.length === 0,
    onSuccess: (data: string[]) => {
      setSourcesData(data);
    }
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getAllUsers
  });

  const { data: altShip = [], refetch: refetchAltShip } = useQuery<AltShip[]>({
    queryKey: ['altShip', handwritten.customer.id],
    queryFn: () => getAltShipByCustomerId(handwritten.customer.id)
  });

  const { data: emails = [] } = useQuery<string[]>({
    queryKey: ['emails', handwritten.customer],
    queryFn: async () => await getHandwrittenEmails(handwritten.customer.id)
  });

  const { data: customerData } = useQuery<Customer | null>({
    queryKey: ['customerData'],
    queryFn: () => getCustomerById(handwritten.customer.id)
  });

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!changesSaved && !await ask('Are you sure you want to save these changes?')) return;
    setChangesSaved(true);
    if (isSentToAccounting && handwrittenItems.some((item) => item.cost === 0.04)) {
      setError('Can\'t save when items have $0.04 cost');
      return;
    }

    // Save handwritten data
    const newCustomer = await getCustomerByName(company);
    const user = await getUserById(soldBy);
    const newInvoice = {
      id: handwritten.id,
      shipViaId: shipViaId || null,
      handwrittenItems,
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
      customerEngineInfo,
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
      soldById: soldBy,
      soldBy: user?.initials,
      createdBy: handwritten.createdBy
    } as any;
    setNewShippingListRow(newInvoice);
    await editHandwritten(newInvoice);
    await handleEditHandwrittenItems();
    await handleAccountingCompleted();
    await editCoreCustomer(handwritten.id, newCustomer?.id ?? null);

    if (newInvoice.billToCompany !== newInvoice.shipToCompany && !newInvoice.isBlindShipment && !newInvoice.isNoPriceInvoice) {
      await promptBlindShipment(newInvoice);
    }

    // Save other data related to handwritten
    await saveAltShip(newInvoice);
    await saveTrackingNumbers();

    // Start SEND TO ACCOUNTING process
    setChangeCustomerDialogData(newInvoice);
    setAccountingProcessOpen(true);
  };

  const handleAccountingCompleted = async () => {
    const isAccountingCompleted = accountingStatus === 'COMPLETE' && handwritten.accountingStatus !== 'COMPLETE';
    if (!isAccountingCompleted) return;
    await setAllHandwrittenItemDates(handwritten.id);
  };

  const handleEditHandwrittenItems = async () => {
    if (!arrayOfObjectsMatch(handwrittenItems, handwritten.handwrittenItems)) {
      for (let i = 0; i < handwrittenItems.length; i++) {
        const item = handwrittenItems[i];
        const newItem = {
          id: Number(item.id),
          handwrittenId: Number(handwritten.id),
          stockNum: item.stockNum,
          location: item.location,
          cost: Number(item.cost),
          qty: Number(item.qty),
          partNum: item.partNum,
          desc: item.desc,
          unitPrice: Number(item.unitPrice),
          date: item.date
        } as HandwrittenItem;
        await editHandwrittenItem(newItem);

        // Edit core charge if item cost has changed
        if (item.partNum?.includes('CORE DEPOSIT')) {
          const cores = await getCoresByHandwrittenItem(item.id);
          if (cores[0]?.charge !== Number(item.unitPrice)) await editCoreCharge(Number(cores[0]?.id), Number(item.unitPrice));
        }
      }
    }
  };

  const saveAltShip = async (newInvoice: Handwritten) => {
    if (
      newInvoice.shipToAddress !== handwritten.shipToAddress ||
      newInvoice.shipToAddress2 !== handwritten.shipToAddress2 ||
      newInvoice.shipToCity !== handwritten.shipToCity ||
      newInvoice.shipToState !== handwritten.shipToState ||
      newInvoice.shipToZip !== handwritten.shipToZip ||
      newInvoice.shipToCompany !== handwritten.shipToCompany
    ) {
      await handleAltShip();
    }
  };

  const saveTrackingNumbers = async () => {
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
  };

  const promptBlindShipment = async (newInvoice: Handwritten) => {
    if (await ask('Make shipment blind?')) {
      await editHandwritten({ ...newInvoice, isBlindShipment: true, isNoPriceInvoice: true });
    } else if (await ask('Set No Price Invoice?')) {
      await editHandwritten({ ...newInvoice, isNoPriceInvoice: true });
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

    const splitItems = (items: any[], size: number) => {
      const chunks = [];
      for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
      }
      return chunks;
    };
    const itemChunks = splitItems(handwritten?.handwrittenItems ?? [], MAX_ROWS);

    for (let i = 0; i < itemChunks.length; i++) {
      const chunk = itemChunks[i];
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
        accountNum: handwritten?.thirdPartyAccount ?? '',
        paymentType: handwritten.payment ?? '',
        createdBy: handwritten.createdBy ?? '',
        soldBy: handwritten.soldBy ?? '',
        legacyId: handwritten?.legacyId ?? '',
        handwrittenId: Number(handwritten.id),
        date: formatDate(handwritten.date) ?? '',
        contactName: handwritten.contactName ?? '',
        poNum: handwritten.poNum ?? '',
        shipVia: shipVia?.name ?? '',
        source: handwritten.source ?? '',
        invoiceNotes: handwritten.orderNotes ? handwritten.orderNotes.replace(/[\n\r]/g, '  ').replaceAll('…', '...') : '',
        shippingNotes: handwritten.shippingNotes ? handwritten.shippingNotes.replace(/[\n\r]/g, '  ').replaceAll('…', '...') : '',
        mp: `${!handwritten.isBlindShipment ? handwritten.mp ?? 0 : 0}`,
        cap: `${!handwritten.isBlindShipment ? handwritten.cap ?? 0 : 0}`,
        br: `${!handwritten.isBlindShipment ? handwritten.br ?? 0 : 0}`,
        fl: `${!handwritten.isBlindShipment ? handwritten.fl ?? 0 : 0}`,
        setup: handwritten.isSetup ?? false,
        taxable: handwritten.isTaxable ?? false,
        blind: handwritten.isBlindShipment ?? false,
        npi: handwritten.isNoPriceInvoice ?? false,
        collect: handwritten.isCollect ?? false,
        thirdParty: handwritten.isThirdParty ?? false,
        contactPhone: handwritten.phone,
        email: handwritten.email,
        handwrittenTotal,
        items: chunk.map((item) => {
          return {
            stockNum: item.stockNum ?? '',
            location: item.location ?? '',
            cost: formatCurrency(item.cost) ?? '$0.00',
            qty: item.qty,
            partNum: item.partNum ?? '',
            desc: item.desc ?? '',
            unitPrice: formatCurrency(item.unitPrice) ?? '$0.00',
            total: formatCurrency((item.qty ?? 0) * (item.unitPrice ?? 0)) ?? '$0.00',
            itemChildren: item.invoiceItemChildren
          };
        }) ?? []
      };
      const itemChildren = chunk.flatMap((item) =>
        (item.invoiceItemChildren ?? []).map((child: HandwrittenItemChild) => ({
          cost: formatCurrency(child.cost) || '$0.00',
          qty: child.qty,
          partNum: child.partNum,
          desc: child.part?.desc,
          stockNum: child.stockNum,
          location: child.part?.location,
          unitPrice: formatCurrency((item?.unitPrice ?? 0)) || '$0.00',
          total: formatCurrency((child?.qty ?? 0) * (item?.unitPrice ?? 0)) || '$0.00'
        }))
      );
      const itemsWithChildren = [...args.items.filter((item: any) => item.itemChildren.length === 0), ...(itemChildren ?? [])];

      addToQue('handwrittenAcct', 'print_accounting_handwritten', { ...args, items: args.items }, '1100px', '816px');
      addToQue('handwrittenShip', 'print_shipping_handwritten', { ...args, items: itemsWithChildren }, '1100px', '816px');
      if (hasCore) addToQue('handwrittenCore', 'print_core_handwritten', args, '1100px', '816px');
    }
    printQue();
    setLoading(false);
  };

  const handlePrintCCLabel = async () => {
    if (!cardNum || !expDate || !cvv) return;
    addToQue('ccLabel', 'print_cc_label', { cardNum, expDate, cvv, cardZip, cardName, cardAddress }, '230.4px', '120px');
    printQue();
  };

  const handleEditItem = async (item: HandwrittenItem, i: number) => {
    const newItems = [...handwrittenItems];
    newItems[i] = item;
    console.log(item);
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
        unitPrice: 0,
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
    if (!id) {
      if (row) await deleteHandwrittenItem(row.id);
      return;
    }

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
    const user = await getUserById(soldBy);
    const newInvoice = {
      id: handwritten.id,
      shipViaId,
      handwrittenItems,
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
      soldById: soldBy,
      soldBy: user?.initials,
      createdBy: handwritten.createdBy
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

  const toggleQuickPick = (item: HandwrittenItem) => {
    setQuickPickItemId(quickPickItemId ? 0 : item.id);
  };

  const handleCoreCharge = async (item: HandwrittenItem) => {
    const created = await addCoreCharge(handwritten, item);
    const res = await getHandwrittenById(handwritten.id);
    if (!res) return;

    const duplicate = handwrittenItems.some((h) => h.id === res.handwrittenItems[0].id);
    if (created && !duplicate) {
      setHandwrittenItems((prev) => [res.handwrittenItems[0], ...prev]);
    }
  };

  const onAccountingProcessClose = async () => {
    if (isSentToAccounting && (!handwritten.hasPrinted || (handwritten.hasPrinted && await ask('Reprint this handwritten?')))) {
      await onPrintCCLabel();
      await onPrintHandwritten();
      if (!handwritten.hasPrinted) await editHandwrittenHasPrinted(handwritten.id, true);
    }
    setAccountingProcessOpen(false);
    setIsEditing(false);
  };


  return (
    <>
      {loading &&
        <div style={{ position: 'absolute', inset: 0, alignContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1 }}>
          <Loading />
        </div>
      }

      {accountingProcessOpen &&
        <ModalList onClose={onAccountingProcessClose}>
          <PromotionalModal
            open={isSentToAccounting}
            handwritten={handwritten}
            onAddPromotionals={onAddPromotionals}
          />

          <ShippingListModal
            open={isSentToAccounting}
            handwrittenItems={handwrittenItems}
            newShippingListRow={newShippingListRow}
          />

          <ChangeCustomerInfoModal
            customer={customerData ?? null}
            handwritten={changeCustomerDialogData}
          />
        </ModalList>
      }

      {handwritten &&
        <>
          <AltShipDialog
            open={altShipOpen}
            setOpen={setAltShipOpen}
            handwritten={handwritten}
            setHandwritten={setHandwritten}
            altShip={altShip}
            refetchAltShip={refetchAltShip}
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
                  Cancel Editing
                </Button>
              </div>
            </div>

            <div className="edit-handwritten-details__top-bar">
              <Button type="button" onClick={() => setAltShipOpen(!altShipOpen)} disabled={altShip.length === 0}>Alt Ship</Button>
              <Button type="button" onClick={() => setAddQtyDialogOpen(true)} disabled={handwritten.invoiceStatus === 'SENT TO ACCOUNTING'} data-testid="add-qty-io-btn">Add Qty | I/O</Button>
            </div>

            <Grid>
              <GridItem variant={['low-opacity-bg']}>
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
              
              <GridItem variant={['low-opacity-bg']} className="no-print">
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

              <GridItem variant={['low-opacity-bg']}>
                <Table variant={['plain', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Date</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={parseDateInputValue(date)}
                          onChange={(e: any) => setDate(new Date(e.target.value))}
                          type="date"
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
                          <option value="">-- SOLD BY --</option>
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

              <GridItem variant={['no-style']}>
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

              <GridItem variant={['low-opacity-bg']}>
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
                        <InputDropdown
                          variant={['no-margin', 'fill']}
                          value={contactEmail}
                          onChange={(value) => setContactEmail(value)}
                          maxHeight="25rem"
                          data-testid="eod-email"
                        >
                          {emails.map((email, i) => {
                            return <DropdownOption key={i} value={email}>{ email }</DropdownOption>;
                          })}
                        </InputDropdown>
                      </td>
                    </tr>
                    <tr>
                      <th>Customer Engine Info</th>
                      <td>
                        <Input
                          variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                          value={customerEngineInfo}
                          onChange={(e) => setCustomerEngineInfo(e.target.value)}
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
                      setTimeout(() => accountNumRef.current?.focus(), 100);
                    }}
                  />
                  <Checkbox
                    variant={['label-bold', 'label-align-center']}
                    label="COLLECT"
                    checked={isCollect}
                    onChange={(e: any) => {
                      setIsCollect(e.target.checked);
                      setIsThirdParty(false);
                      setTimeout(() => accountNumRef.current?.focus(), 100);
                    }}
                  />
                </div>
                {(isCollect || isThirdParty) &&
                  <Input
                    variant={['small', 'thin', 'label-bold']}
                    label="Account Number "
                    value={thirdPartyAccount}
                    onChange={(e: any) => setThirdPartyAccount(e.target.value)}
                    ref={accountNumRef}
                  />
                }
              </GridItem>

              <GridItem colSpan={12} variant={['no-style']}>
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

              <HandwrittenStatusFields
                invoiceStatus={invoiceStatus}
                accountingStatus={accountingStatus}
                shippingStatus={shippingStatus}
                onChangeInvoiceStatus={setInvoiceStatus}
                onChangeAccountingStatus={setAccountingStatus}
                onChangeShippingStatus={setShippingStatus}
                isEditing={true}
              />

              <GridItem colSpan={8} variant={['no-style']} style={{ marginTop: '1rem' }}>
                <EditHandwrittenItemsTable
                  handwritten={handwritten}
                  handwrittenItems={handwrittenItems}
                  handleCoreCharge={handleCoreCharge}
                  toggleQuickPick={toggleQuickPick}
                  quickPickItemId={quickPickItemId}
                  handleEditItem={handleEditItem}
                  handleDeleteItem={handleDeleteItem}
                />
              </GridItem>

              <GridItem variant={['no-style']} style={{ marginTop: '1rem' }} className="grid__item--tracking">
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

              <GridItem variant={['low-opacity-bg']} colSpan={6}>
                <div className="handwritten-details__shipping-notes">
                  <TextArea
                    style={{ maxWidth: 'none' }}
                    label="Shipping Notes"
                    variant={['label-stack', 'label-bold', 'label-full-width']}
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

              <GridItem variant={['low-opacity-bg']} colSpan={6}>
                <div>
                  <TextArea
                    style={{ maxWidth: 'none' }}
                    label="Order Notes"
                    variant={['label-stack', 'label-bold']}
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
