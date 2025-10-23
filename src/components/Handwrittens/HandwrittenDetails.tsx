import AltShipDialog from "@/components/Dialogs/handwrittens/AltShipDialog";
import CoreCreditsDialog from "@/components/Dialogs/handwrittens/CoreCreditsDialog";
import NewReturnDialog from "@/components/Dialogs/handwrittens/NewReturnDialog";
import PrintInvoiceDialog from "@/components/Dialogs/handwrittens/PrintInvoiceDialog";
import TakeoffsDialog from "@/components/Dialogs/handwrittens/TakeoffsDialog";
import HandwrittenItemsTable from "@/components/Handwrittens/HandwrittenItemsTable";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Input from "@/components/Library/Input";
import Table from "@/components/Library/Table";
import { userAtom } from "@/scripts/atoms/state";
import { supabase } from "@/scripts/config/supabase";
import { deleteHandwritten, getHandwrittenById } from "@/scripts/services/handwrittensService";
import { formatCurrency, formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { invoke, confirm } from "@/scripts/config/tauri";
import { useAtom } from "jotai";
import Link from "@/components/Library/Link";
import { useParams } from "react-router-dom";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavState } from "@/hooks/useNavState";
import CreditCardBlock from "@/components/Handwrittens/CreditCardBlock";
import { ask } from "@/scripts/config/tauri";
import { usePrintQue } from "@/hooks/usePrintQue";
import { getAltShipByCustomerId } from "@/scripts/services/altShipService";

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


export default function HandwrittenDetails({
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
  const { closeDetailsBtn, push } = useNavState();
  const { addToQue, printQue } = usePrintQue();
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [coreCreditsOpen, setCoreCreditsOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [altShipOpen, setAltShipOpen] = useState(false);
  const [altShipData, setAltShipData] = useState<AltShip[]>([]);
  const [printInvoiceOpen, setPrintInvoiceOpen] = useState(false);
  const [takeoff, setTakeoff] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [takeoffItem, setTakeoffItem] = useState<HandwrittenItem | HandwrittenItemChild | null>(null);
  const [takeoffsOpen, setTakeoffsOpen] = useState(false);
  const [taxTotal, setTaxTotal] = useState(0);
  const takeoffInputRef = useRef<HTMLInputElement>(null);
  const TAX_RATE = 0.08375;
  const MAX_ROWS = 20;

  useEffect(() => {
    const taxItemsAmount = (handwritten && handwritten.handwrittenItems.map((item) => (item?.qty ?? 0) * (item?.unitPrice ?? 0)).reduce((acc, cur) => acc + cur, 0)) ?? 0;
    setTaxTotal(Number((taxItemsAmount * TAX_RATE).toFixed(2)));

    const fetchData = async () => {
      if (handwritten) {
        const altShip = await getAltShipByCustomerId(handwritten.customer.id);
        setAltShipData(altShip);
        setPayment(handwritten.payment ?? '');
      }
    };
    fetchData();
  }, [handwritten]);

  useEffect(() => {
    const channel = supabase
      .channel('handwrittenItems')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'handwrittenItems' }, refreshHandwrittenItems)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'handwrittens' }, refreshHandwrittenOrderNotes);
    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const refreshHandwrittenItems = async () => {
    const res = await getHandwrittenById(Number(params.handwritten));
    setHandwritten(res);
  };

  const refreshHandwrittenOrderNotes = async (e: RealtimePostgresUpdatePayload<Handwritten>) => {
    const res = await getHandwrittenById(Number(params.handwritten));
    if (!res) {
      location.reload();
      return;
    }
    setHandwritten({...res, orderNotes: e.new.orderNotes });
  };

  const handleDelete = async () => {
    if (user.accessLevel <= 1 || prompt('Type "confirm" to delete this handwritten') !== 'confirm') return;
    await deleteHandwritten(Number(handwritten?.id));
    await push('Handwrittens', '/handwrittens');
  };

  const handlePrintShipDocs = async () => {
    if (handwritten?.shipVia?.type === 'Truck Line') {
      const copies = Number(prompt('How many shipping labels do you want to print?'));
      if (copies > 0) await handlePrintShippingLabel(copies);

      const cityStateZip = `${handwritten?.shipToCity} ${handwritten?.shipToState} ${handwritten?.shipToZip}`;
      const args = {
        ship_to_company: handwritten?.shipToCompany ?? '',
        ship_to_address: handwritten?.shipToAddress ?? '',
        ship_to_address_2: `, ${handwritten?.shipToAddress2}`,
        ship_to_city_state_zip: cityStateZip ?? '',
        ship_from_company: 'MIDWEST DIESEL',
        ship_from_address: '3051 82ND LANE NE',
        ship_from_address_2: '',
        ship_from_city_state_zip: 'MINNEAPOLIS MN 55449',
        ship_via: handwritten?.shipVia.name ?? '',
        prepaid: (!handwritten?.isCollect && !handwritten?.isThirdParty),
        collect: handwritten?.isCollect,
        third_party: handwritten?.isThirdParty
      };
      await invoke('print_bol', { args });
    } else if (await ask('Print packing slip?')) {
      printPackingSlip(false);
    }
  };

  const handlePrintShipDocsBlind = async () => {
    if (handwritten?.shipVia?.type === 'Truck Line') {
      const copies = Number(prompt('How many shipping labels do you want to print?'));
      if (copies > 0) await handlePrintShippingLabel(copies);

      const cityStateZip = `${handwritten?.shipToCity} ${handwritten?.shipToState} ${handwritten?.shipToZip}`;
      const args = {
        ship_to_company: handwritten?.shipToCompany ?? '',
        ship_to_address: handwritten?.shipToAddress ?? '',
        ship_to_address_2: `, ${handwritten?.shipToAddress2}`,
        ship_to_city_state_zip: cityStateZip ?? '',
        ship_from_company: '',
        ship_from_address: '',
        ship_from_address_2: '',
        ship_from_city_state_zip: '',
        ship_via: handwritten?.shipVia.name ?? '',
        prepaid: (!handwritten?.isCollect && !handwritten?.isThirdParty),
        collect: handwritten?.isCollect,
        third_party: handwritten?.isThirdParty
      };
      await invoke('print_bol', { args });
    } else if (await ask('Print packing slip?')) {
      printPackingSlip(true);
    }
  };

  const printPackingSlip = (blind: boolean) => {
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
      const billToCityStateZip = `${handwritten?.billToCity}${handwritten?.billToCity ? ',' : ''} ${handwritten?.billToState} ${handwritten?.billToZip}`;
      const shipToCityStateZip = `${handwritten?.shipToCity}${handwritten?.shipToCity ? ',' : ''} ${handwritten?.shipToState} ${handwritten?.shipToZip}`;
      const args = {
        invoiceDate: formatDate(handwritten?.date) ?? '',
        poNum: handwritten?.poNum ?? '',
        billToCompany: handwritten?.billToCompany ?? '',
        billToAddress: handwritten?.billToAddress ?? '',
        billToAddress2: handwritten?.billToAddress2 ?? '',
        billToCityStateZip,
        ship_to_company: handwritten?.shipToCompany ?? '',
        shipToContact: handwritten?.shipToContact ?? '',
        ship_to_address: handwritten?.shipToAddress ?? '',
        ship_to_address_2: handwritten?.shipToAddress2 ?? '',
        shipToCityStateZip,
        blind,
        items: chunk.map((item) => {
          const price = formatCurrency(item.unitPrice) || '$0.00';
          const total = formatCurrency((item?.unitPrice ?? 0) * (item?.qty ?? 0)) || '$0.00';

          return {
            qty: item.qty ?? '',
            partNum: item.partNum ?? '',
            desc: item.desc ?? '',
            price: handwritten?.isNoPriceInvoice ? '' : price,
            total: handwritten?.isNoPriceInvoice ? '' : total
          };
        }) || []
      };
      addToQue('packingSlip', 'print_packing_slip', args, '816px', '1090px');
    }
    printQue();
  };

  const handlePrintShippingLabel = async (copies: number) => {
    if (!await confirm(`Print ${copies} shipping label${copies > 1 ? 's' : ''}?`)) return;
    for (let i = 0; i < copies; i++) {
      if (handwritten?.isBlindShipment) {
        const shipFromCityStateZip = [handwritten?.billToCity, `${handwritten?.billToState} ${handwritten?.billToZip}`].join(', ');
        const shipToCityStateZip = [handwritten?.shipToCity, `${handwritten?.shipToState} ${handwritten?.shipToZip}`].join(', ');
        const args = {
          ship_from_company: handwritten?.billToCompany ?? '',
          ship_from_address: handwritten?.billToAddress ?? '',
          ship_from_address_2: handwritten?.billToAddress2 ? `${handwritten?.billToAddress2}\n` : '',
          ship_from_city_state_zip: shipFromCityStateZip ?? '',
          ship_to_company: handwritten?.shipToCompany ?? '',
          ship_to_address: handwritten?.shipToAddress ?? '',
          ship_to_address_2: handwritten?.shipToAddress2 ? `${handwritten?.shipToAddress2}\n` : '',
          ship_to_city_state_zip: shipToCityStateZip ?? ''
        };
        addToQue('shippingLabel', 'print_shipping_label', args, '576px', '374.4px');
      } else {
        const shipToCityStateZip = [handwritten?.shipToCity, `${handwritten?.shipToState} ${handwritten?.shipToZip}`].join(', ');
        const args = {
          ship_from_company: 'MIDWEST DIESEL',
          ship_from_address: '3051 82ND LANE NE',
          ship_from_address_2: '',
          ship_from_city_state_zip: 'BLAINE, MN 55449',
          ship_to_company: handwritten?.shipToCompany ?? '',
          ship_to_address: handwritten?.shipToAddress ?? '',
          ship_to_address_2: handwritten?.shipToAddress2 ? `${handwritten?.shipToAddress2}\n` : '',
          ship_to_city_state_zip: shipToCityStateZip ?? ''
        };
        addToQue('shippingLabel', 'print_shipping_label', args, '576px', '374.4px');
      }
    }
    printQue();
  };

  const handlePrintCI = async () => {
    const cityStateZip = [handwritten?.shipToCity, `${handwritten?.shipToState} ${handwritten?.shipToZip}`].join(', ');
    const args = {
      company: handwritten?.shipToCompany ?? '',
      address: handwritten?.shipToAddress ?? '',
      address_2: (handwritten?.shipToAddress2 ? handwritten?.shipToAddress2 : cityStateZip) ?? '',
      city_state_zip: cityStateZip && handwritten?.shipToAddress2 ? cityStateZip : '',
      date: formatDate(handwritten?.date) ?? '',
      po: handwritten?.poNum ?? ''
    };
    await invoke('print_ci', { args });
    await invoke('print_coo');
  };

  const handlePrintReturnBOL = async () => {
    const cityStateZip = `${handwritten?.shipToCity} ${handwritten?.shipToState} ${handwritten?.shipToZip}`;
    const args = {
      ship_from_company: handwritten?.shipToCompany ?? '',
      ship_from_address: handwritten?.shipToAddress ?? '',
      ship_from_address_2: handwritten?.shipToAddress2 ?? '',
      ship_from_city_state_zip: cityStateZip ?? '',
      ship_to_company: 'MIDWEST DIESEL',
      ship_to_address: '3051 82ND LANE NE',
      ship_to_address_2: '',
      ship_to_city_state_zip: 'MINNEAPOLIS MN 55449',
      ship_via: handwritten?.shipVia?.name ?? '',
      prepaid: (!handwritten?.isCollect && !handwritten?.isThirdParty),
      collect: handwritten?.isCollect,
      third_party: handwritten?.isThirdParty
    };
    await invoke('print_bol', { args });
  };

  const handlePrintCCLabel = async () => {
    if (!await confirm('Print a CC label?')) return;
    if (!cardNum || !expDate || !cvv) {
      alert('Missing cardNum, expDate, or cvv');
      return;
    }
    addToQue('ccLabel', 'print_cc_label', { cardNum, expDate, cvv, cardZip, cardName, cardAddress }, '200px', '135px');
    printQue();
  };

  const handleTakeoffs = (e: FormEvent) => {
    e.preventDefault();
    const stockNum = takeoff.replace('<', '').replace('>', '');
    const children: HandwrittenItemChild[] = [];
    const item: HandwrittenItem | null = handwritten?.handwrittenItems.find((item) => item.stockNum === stockNum && item.location !== 'CORE DEPOSIT') ?? null;
    handwritten?.handwrittenItems.forEach((item) => {
      if (item.invoiceItemChildren.length > 0) children.push(...item.invoiceItemChildren);
    });
    const itemChild: HandwrittenItemChild | null = children.find((item) => item.stockNum === stockNum) ?? null;
    const parentItem = itemChild ? handwritten.handwrittenItems.find((i) => i.id === itemChild.parentId) : null;

    if (!item && !itemChild) return;
    setTakeoffsOpen(true);
    setTakeoffItem(item || itemChild);
    setUnitPrice(Number(item?.unitPrice || parentItem?.unitPrice));
  };

  const onSubmitTakeoff = () => {
    setTakeoff('');
    takeoffInputRef.current?.focus();
  };

  const handleViewKarmak = () => {
    const year = (handwritten.date.getUTCFullYear()).toString();
    const month = (handwritten.date.getUTCMonth() + 1).toString();
    const day = (handwritten.date.getUTCDate()).toString();
    const filepath = `\\\\MWD1-SERVER\\Server\\InvoiceScans\\Archives\\${year}\\${month}\\${day}\\${handwritten.legacyId ?? handwritten.id}.pdf`;
    invoke('view_file', { filepath });
  };

  const handleEmailKarmak = () => {
    const args = {
      id: Number(handwritten.legacyId ?? handwritten.id),
      email: handwritten.email ?? '',
      company: handwritten.customer.company,
      date: formatDate(handwritten.date),
      year: handwritten.date.getUTCFullYear().toString(),
      month: (handwritten.date.getUTCMonth() + 1).toString(),
      day: handwritten.date.getUTCDate().toString(),
      ship_via: handwritten.shipVia?.name ?? '',
      trackingNumbers: handwritten.trackingNumbers.map((num) => `<li style='margin: 0;'>${num.trackingNumber}</li>`)
    };
    invoke('email_end_of_day', { args });
  };


  return (
    <>
      <PrintInvoiceDialog open={printInvoiceOpen} setOpen={setPrintInvoiceOpen} handwritten={handwritten} />
      {takeoffItem &&
        <TakeoffsDialog
          open={takeoffsOpen}
          setOpen={setTakeoffsOpen}
          item={takeoffItem}
          unitPrice={unitPrice}
          setHandwritten={setHandwritten}
          onSubmit={onSubmitTakeoff}
          takeoffInputRef={takeoffInputRef}
        />
      }

      <div className="handwritten-details">
        <div className="handwritten-details__header">
          <h2>Handwritten <span data-testid="id">{ handwritten.id }</span></h2>

          <div className="header__btn-container">
            <Button
              variant={['blue']}
              className="handwritten-details__edit-btn"
              onClick={() => setIsEditing(true)}
              data-testid="edit-btn"
            >
              Edit
            </Button>
            <Button
              className="handwritten-details__close-btn"
              onClick={async () => await closeDetailsBtn()}
            >
              Back
            </Button>
            {user.accessLevel > 1 &&
              <Button
                variant={['danger']}
                onClick={handleDelete}
                data-testid="delete-btn"
              >
                Delete
              </Button>
            }
          </div>
        </div>

        <div className="handwritten-details__top-bar">
          <Button onClick={() => setCoreCreditsOpen(!coreCreditsOpen)} disabled={handwritten.cores.length === 0} data-testid="core-credit-btn">Core Credit</Button>
          <Button onClick={() => setAltShipOpen(!altShipOpen)} disabled={altShipData.length === 0}>Alt Ship</Button>
          <Button onClick={() => setReturnsOpen(!returnsOpen)} data-testid="new-return-btn">New Return</Button>
          <Button onClick={() => setAddQtyDialogOpen(true)} disabled={handwritten.invoiceStatus === 'SENT TO ACCOUNTING'} data-testid="add-qty-io-btn">Add Qty | I/O</Button>
          <Button onClick={handleViewKarmak}>View Karmak</Button>
          <Button onClick={handleEmailKarmak}>Email Karmak</Button>
        </div>

        <CoreCreditsDialog open={coreCreditsOpen} setOpen={setCoreCreditsOpen} cores={handwritten.cores} handwritten={handwritten} />
        <NewReturnDialog open={returnsOpen} setOpen={setReturnsOpen} handwritten={handwritten} />
        <AltShipDialog
          open={altShipOpen}
          setOpen={setAltShipOpen}
          handwritten={handwritten}
          setHandwritten={setHandwritten}
          altShipData={altShipData}
          setAltShipData={setAltShipData}
          onChangeAltShip={handleAltShip}
        />

        <Grid rows={1} cols={11} gap={1}>
          <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
            <Table variant={['plain', 'row-details']}>
              <tbody>
                <tr>
                  <th><strong>Billing Company</strong></th>
                  <td data-testid="bill-to-company">{ handwritten.billToCompany }</td>
                </tr>
                <tr>
                  <th><strong>Billing Address</strong></th>
                  <td data-testid="bill-to-address">{ handwritten.billToAddress }</td>
                </tr>
                <tr>
                  <th><strong>Billing Address 2</strong></th>
                  <td data-testid="bill-to-address-2">{ handwritten.billToAddress2 }</td>
                </tr>
                <tr>
                  <th><strong>Billing City</strong></th>
                  <td data-testid="bill-to-city">{ handwritten.billToCity }</td>
                </tr>
                <tr>
                  <th><strong>Billing State</strong></th>
                  <td data-testid="bill-to-state">{ handwritten.billToState }</td>
                </tr>
                <tr>
                  <th><strong>Billing Zip</strong></th>
                  <td data-testid="bill-to-zip">{ handwritten.billToZip }</td>
                </tr>
                <tr>
                  <th><strong>Billing Phone</strong></th>
                  <td data-testid="bill-to-phone">{ formatPhone(handwritten.billToPhone) }</td>
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

          <GridItem colStart={9} colEnd={12} variant={['low-opacity-bg']}>
            <Table variant={['plain', 'row-details']}>
              <tbody>
                <tr>
                  <th><strong>Date</strong></th>
                  <td data-testid="date">{ formatDate(handwritten.date) }</td>
                </tr>
                <tr>
                  <th><strong>Customer</strong></th>
                  <td><Link href={`/customer/${handwritten.customer.id}`}>{ handwritten.customer.company }</Link></td>
                </tr>
                <tr>
                  <th><strong>PO Number</strong></th>
                  <td data-testid="po-num">{ handwritten.poNum }</td>
                </tr>
                <tr>
                  <th><strong>Source</strong></th>
                  <td data-testid="source">{ handwritten.source }</td>
                </tr>
                <tr>
                  <th><strong>Created By</strong></th>
                  <td>{ handwritten.createdBy }</td>
                </tr>
                <tr>
                  <th><strong>Sold By</strong></th>
                  <td>{ handwritten.soldBy }</td>
                </tr>
                <tr>
                  <th><strong>Contact</strong></th>
                  <td data-testid="contact">{ handwritten.contactName }</td>
                </tr>
              </tbody>
            </Table>
          </GridItem>

          <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
            <Table variant={['plain', 'row-details']}>
              <tbody>
                <tr>
                  <th><strong>Shipping Company</strong></th>
                  <td data-testid="ship-to-company">{ handwritten.shipToCompany }</td>
                </tr>
                <tr>
                  <th><strong>Shipping Address</strong></th>
                  <td data-testid="ship-to-address">{ handwritten.shipToAddress }</td>
                </tr>
                <tr>
                  <th><strong>Shipping Address 2</strong></th>
                  <td data-testid="ship-to-address-2">{ handwritten.shipToAddress2 }</td>
                </tr>
                <tr>
                  <th><strong>Shipping City</strong></th>
                  <td data-testid="ship-to-city">{ handwritten.shipToCity }</td>
                </tr>
                <tr>
                  <th><strong>Shipping State</strong></th>
                  <td data-testid="ship-to-state">{ handwritten.shipToState }</td>
                </tr>
                <tr>
                  <th><strong>Shipping Zip</strong></th>
                  <td data-testid="ship-to-zip">{ handwritten.shipToZip }</td>
                </tr>
                <tr>
                  <th><strong>Ship Via</strong></th>
                  <td data-testid="ship-via">{ handwritten.shipVia && handwritten.shipVia.name }</td>
                </tr>
              </tbody>
            </Table>
          </GridItem>

          <GridItem colStart={5} colEnd={9} variant={['low-opacity-bg']}>
            <Table variant={['plain', 'row-details']}>
              <tbody>
                <tr>
                  <th><strong>Attn To / Contact</strong></th>
                  <td data-testid="attn-to">{ handwritten.shipToContact }</td>
                </tr>
                <tr>
                  <th><strong>Contact Phone</strong></th>
                  <td data-testid="contact-phone">{ formatPhone(handwritten.phone) }</td>
                </tr>
                <tr>
                  <th><strong>EOD Email</strong></th>
                  <td>{ handwritten.email }</td>
                </tr>
              </tbody>
            </Table>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
              <Checkbox
                variant={['label-bold', 'label-align-center']}
                label="3RD PARTY BILL"
                checked={handwritten.isThirdParty}
                disabled
              />
              <Checkbox
                variant={['label-bold', 'label-align-center']}
                label="COLLECT"
                checked={handwritten.isCollect}
                disabled
              />
            </div>
            {(handwritten.isCollect || handwritten.isThirdParty) &&
              <p><strong>Account Number:</strong> { handwritten.thirdPartyAccount }</p>
            }
          </GridItem>

          <GridItem colStart={10} colEnd={12} variant={['low-opacity-bg']} className="no-print">
            <div className="handwritten-details__btn-row">
              <Button
                variant={['x-small']}
                onClick={() => {
                  if (handwritten.isBlindShipment) {
                    handlePrintShipDocsBlind();
                  } else {
                    handlePrintShipDocs();
                  }
                }}>
                  Print Ship Docs
              </Button>
              <Button variant={['x-small']} onClick={() => setPrintInvoiceOpen(true)}>Print Invoice</Button>
              <Button variant={['x-small']} onClick={() => handlePrintShippingLabel(1)}>Print Ship Label</Button>
              <Button variant={['x-small']} onClick={handlePrintCI}>Print CI and COO</Button>
              <Button variant={['x-small']} onClick={handlePrintReturnBOL}>Print Return BOL</Button>
              <Button
                variant={['x-small']}
                onClick={() => {
                  setPromptLeaveWindow(false);
                  handlePrintCCLabel();
                }}
              >
                Print CC Label
              </Button>
            </div>
          </GridItem>

          <GridItem colStart={1} colEnd={12} variant={['no-style']}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <Checkbox
                variant={['label-bold', 'label-align-center']}
                label="TAXABLE"
                checked={handwritten.isTaxable}
                disabled
              />
              <Checkbox
                variant={['label-bold', 'label-align-center']}
                label="BLIND"
                checked={handwritten.isBlindShipment}
                disabled
              />
              <Checkbox
                variant={['label-bold', 'label-align-center']}
                label="NPI"
                checked={handwritten.isNoPriceInvoice}
                disabled
              />
              <Checkbox
                variant={['label-bold', 'label-align-center']}
                label="SETUP"
                checked={handwritten.isSetup}
                disabled
              />
              <Checkbox
                variant={['label-bold', 'label-align-center']}
                label="Email Invoice EOD"
                checked={handwritten.isEndOfDay}
                disabled
              />
            </div>
          </GridItem>

          <GridItem colStart={1} colEnd={12} variant={['low-opacity-bg']}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <p style={{ fontSize: 'var(--font-md)' }}><strong>Sales Status</strong></p>
                <p style={{ color: 'var(--yellow-1)' }} data-testid="sales-status">{ handwritten.invoiceStatus }</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-md)' }}><strong>Accounting Status</strong></p>
                <p style={{ color: 'var(--yellow-1)' }}>{ handwritten.accountingStatus }</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-md)' }}><strong>Shipping Status</strong></p>
                <p style={{ color: 'var(--yellow-1)' }}>{ handwritten.shippingStatus }</p>
              </div>
            </div>
          </GridItem>

          <GridItem variant={['no-style']} colStart={1} colEnd={8}>
            <HandwrittenItemsTable
              className="handwritten-items-table--handwrittens-page"
              handwritten={handwritten}
              setHandwritten={setHandwritten}
              taxTotal={taxTotal}
            />
          </GridItem>

          <GridItem variant={['no-style']} colStart={8} colEnd={12}>
            {handwritten.trackingNumbers.length > 0 &&
              <>
                <h3>Tracking Numbers</h3>
                <ul>
                  {handwritten.trackingNumbers.map((num: TrackingNumber) => {
                    return (
                      <li key={num.id}>{ num.trackingNumber }</li>
                    );
                  })}
                </ul>
              </>
            }
          </GridItem>

          <GridItem variant={['low-opacity-bg']} colStart={1} colEnd={7}>
            <div className="handwritten-details__shipping-notes">
              <div>
                <h4 style={{ marginBottom: '0.3rem' }}>Shipping Notes</h4>
                <p style={{ whiteSpace: 'pre-line' }} data-testid="shipping-notes">{ handwritten.shippingNotes }</p>
              </div>

              {!handwritten.isBlindShipment &&
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th><strong>Mousepads</strong></th>
                      <td data-testid="mp">{ handwritten.mp }</td>
                    </tr>
                    <tr>
                      <th><strong>Hats</strong></th>
                      <td data-testid="cap">{ handwritten.cap }</td>
                    </tr>
                    <tr>
                      <th><strong>Brochures</strong></th>
                      <td data-testid="br">{ handwritten.br }</td>
                    </tr>
                    <tr>
                      <th><strong>Flashlights</strong></th>
                      <td data-testid="fl">{ handwritten.fl }</td>
                    </tr>
                  </tbody>
                </Table>
              }
            </div>
          </GridItem>

          <GridItem style={{ height: '100%' }} variant={['low-opacity-bg']} colStart={7} colEnd={12}>
            <h4 style={{ marginBottom: '0.3rem' }}>Order Notes</h4>
            <p style={{ whiteSpace: 'pre-line' }} data-testid="order-notes">{ handwritten.orderNotes }</p>
          </GridItem>
        </Grid>

        <form onSubmit={handleTakeoffs}>
          <br />
          <Input
            ref={takeoffInputRef}
            variant={['label-bold', 'label-stack', 'small']}
            label="Takeoff"
            value={takeoff}
            onChange={(e: any) => setTakeoff(e.target.value)}
            required
            data-testid="takeoff-input"
          />
        </form>
      </div>
    </>
  );
}
