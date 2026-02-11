import AltShipDialog from "./dialogs/AltShipDialog";
import CoreCreditsDialog from "./dialogs/CoreCreditsDialog";
import NewReturnDialog from "./dialogs/NewReturnDialog";
import PrintInvoiceDialog from "./dialogs/PrintInvoiceDialog";
import TakeoffsDialog from "./dialogs/TakeoffsDialog";
import HandwrittenItemsTable from "@/components/handwrittens/HandwrittenItemsTable";
import Button from "@/components/library/Button";
import Checkbox from "@/components/library/Checkbox";
import Grid from "@/components/library/grid/Grid";
import GridItem from "@/components/library/grid/GridItem";
import Input from "@/components/library/Input";
import Table from "@/components/library/Table";
import { userAtom } from "@/scripts/atoms/state";
import { supabase } from "@/scripts/config/supabase";
import { deleteHandwritten, editHandwritten, getHandwrittenById } from "@/scripts/services/handwrittensService";
import { formatCurrency, formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { invoke, confirm } from "@/scripts/config/tauri";
import { useAtom } from "jotai";
import Link from "@/components/library/Link";
import { useParams } from "react-router-dom";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavState } from "@/hooks/useNavState";
import CreditCardBlock from "@/components/handwrittens/CreditCardBlock";
import { ask } from "@/scripts/config/tauri";
import { usePrintQue } from "@/hooks/usePrintQue";
import { getAltShipByCustomerId } from "@/scripts/services/altShipService";
import { useQuery } from "@tanstack/react-query";
import { startTakeoff } from "@/scripts/logic/handwrittens";
import { prompt } from "../library/Prompt";
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


const MAX_ROWS = 20;

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
  const [printInvoiceOpen, setPrintInvoiceOpen] = useState(false);
  const [takeoff, setTakeoff] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [takeoffItem, setTakeoffItem] = useState<HandwrittenItem | HandwrittenItemChild | null>(null);
  const [takeoffsOpen, setTakeoffsOpen] = useState(false);
  const takeoffInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (handwritten) setPayment(handwritten.payment ?? '');
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

  const { data: altShip = [], refetch: refetchAltShip } = useQuery<AltShip[]>({
    queryKey: ['altShip', handwritten.customer.id],
    queryFn: () => getAltShipByCustomerId(handwritten.customer.id)
  });

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
    if (user.accessLevel <= 1 || await prompt('Type "confirm" to delete this handwritten') !== 'confirm') return;
    await deleteHandwritten(Number(handwritten?.id));
    await push('Handwrittens', '/handwrittens');
  };

  const handlePrintShipDocs = async () => {
    if (await ask('Print packing slip?')) {
      printPackingSlip(false);
    }

    if (handwritten?.shipVia?.type === 'Truck Line') {
      const copies = Number(await prompt('How many shipping labels do you want to print?'));
      if (copies > 0) await handlePrintShippingLabel(copies);

      const cityStateZip = `${handwritten?.shipToCity} ${handwritten?.shipToState} ${handwritten?.shipToZip}`;
      const args = {
        ship_to_company: handwritten?.shipToCompany ?? '',
        ship_to_address: handwritten?.shipToAddress ?? '',
        ship_to_address_2: handwritten?.shipToAddress2 ?? '',
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
    }
  };

  const handlePrintShipDocsBlind = async () => {
    if (await ask('Print packing slip?')) {
      printPackingSlip(true);
    }

    if (handwritten?.shipVia?.type === 'Truck Line') {
      const copies = Number(await prompt('How many shipping labels do you want to print?'));
      if (copies > 0) await handlePrintShippingLabel(copies);

      const cityStateZip = `${handwritten?.shipToCity} ${handwritten?.shipToState} ${handwritten?.shipToZip}`;
      const args = {
        ship_to_company: handwritten?.shipToCompany ?? '',
        ship_to_address: handwritten?.shipToAddress ?? '',
        ship_to_address_2: handwritten?.shipToAddress2 ?? '',
        ship_to_city_state_zip: cityStateZip ?? '',
        ship_from_company: handwritten.billToCompany ?? '',
        ship_from_address: '3051 82ND LANE NE',
        ship_from_address_2: '',
        ship_from_city_state_zip: 'MINNEAPOLIS MN 55449',
        ship_via: handwritten?.shipVia.name ?? '',
        prepaid: (!handwritten?.isCollect && !handwritten?.isThirdParty),
        collect: handwritten?.isCollect,
        third_party: handwritten?.isThirdParty
      };
      await invoke('print_bol', { args });
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
        billToCityStateZip: billToCityStateZip,
        shipToCompany: handwritten?.shipToCompany ?? '',
        shipToContact: handwritten?.shipToContact ?? '',
        shipToAddress: handwritten?.shipToAddress ?? '',
        shipToAddress2: handwritten?.shipToAddress2 ?? '',
        shipToCityStateZip: shipToCityStateZip,
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
          shipFromCompany: handwritten?.billToCompany ?? '',
          shipFromAddress: handwritten?.billToAddress ?? '',
          shipFromAddress2: handwritten?.billToAddress2 ? `${handwritten?.billToAddress2}\n` : '',
          shipFromCityStateZip: shipFromCityStateZip ?? '',
          shipToCompany: handwritten?.shipToCompany ?? '',
          shipToAddress: handwritten?.shipToAddress ?? '',
          shipToAddress2: handwritten?.shipToAddress2 ? `${handwritten?.shipToAddress2}\n` : '',
          shipToCityStateZip: shipToCityStateZip ?? '',
          shipToContact: handwritten?.shipToContact ?? ''
        };
        addToQue('shippingLabel', 'print_shipping_label', args, '576px', '374.4px');
      } else {
        const shipToCityStateZip = [handwritten?.shipToCity, `${handwritten?.shipToState} ${handwritten?.shipToZip}`].join(', ');
        const args = {
          shipFromCompany: 'MIDWEST DIESEL',
          shipFromAddress: '3051 82ND LANE NE',
          shipFromAddress2: '',
          shipFromCityStateZip: 'BLAINE, MN 55449',
          shipToCompany: handwritten?.shipToCompany ?? '',
          shipToAddress: handwritten?.shipToAddress ?? '',
          shipToAddress2: handwritten?.shipToAddress2 ? `${handwritten?.shipToAddress2}\n` : '',
          shipToCityStateZip: shipToCityStateZip ?? '',
          shipToContact: handwritten?.shipToContact ?? ''
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
    addToQue('ccLabel', 'print_cc_label', { cardNum, expDate, cvv, cardZip, cardName, cardAddress }, '280px', '135px');
    printQue();
  };

  const handleTakeoffs = (e: FormEvent) => {
    e.preventDefault();
    const { item, itemChild, parentItem } = startTakeoff(takeoff, handwritten);
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
    const year = (handwritten.date.getUTCFullYear()).toString();
    const month = (handwritten.date.getUTCMonth() + 1).toString();
    const day = (handwritten.date.getUTCDate()).toString();
    const args = {
      id: Number(handwritten.legacyId ?? handwritten.id),
      email: handwritten.email ?? '',
      company: handwritten.customer.company,
      date: formatDate(handwritten.date),
      year,
      month,
      day,
      ship_via: handwritten.shipVia?.name ?? '',
      tracking_numbers: handwritten.trackingNumbers.map((num) => `<li style='margin: 0;'>${num.trackingNumber}</li>`)
    };
    invoke('email_karmak_invoice', { args });
  };

  const onChangeInvoiceStatus = async (invoiceStatus: InvoiceStatus) => {
    const newHandwritten = { ...handwritten, invoiceStatus };
    await editHandwritten(newHandwritten);
    setHandwritten(newHandwritten);
  };

  const onChangeAccountingStatus = async (accountingStatus: AccountingStatus | null) => {
    const newHandwritten = { ...handwritten, accountingStatus };
    await editHandwritten(newHandwritten);
    setHandwritten(newHandwritten);
  };

  const onChangeShippingStatus = async (shippingStatus: ShippingStatus | null) => {
    const newHandwritten = { ...handwritten, shippingStatus };
    await editHandwritten(newHandwritten);
    setHandwritten(newHandwritten);
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
          handwrittenId={Number(params.handwritten)}
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
          <Button onClick={() => setAltShipOpen(!altShipOpen)} disabled={altShip.length === 0}>Alt Ship</Button>
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
          altShip={altShip}
          refetchAltShip={refetchAltShip}
          onChangeAltShip={handleAltShip}
        />

        <Grid>
          <GridItem variant={['low-opacity-bg']}>
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

          <GridItem variant={['low-opacity-bg']}>
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

          <GridItem variant={['low-opacity-bg']}>
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
                <tr>
                  <th><strong>Customer Engine Info</strong></th>
                  <td>{ handwritten.customerEngineInfo }</td>
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

          <GridItem colSpan={2} variant={['low-opacity-bg']} className="no-print">
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

          <GridItem colSpan={12} variant={['no-style']}>
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

          <HandwrittenStatusFields
            invoiceStatus={handwritten.invoiceStatus}
            accountingStatus={handwritten.accountingStatus}
            shippingStatus={handwritten.shippingStatus}
            onChangeInvoiceStatus={onChangeInvoiceStatus}
            onChangeAccountingStatus={onChangeAccountingStatus}
            onChangeShippingStatus={onChangeShippingStatus}
            isEditing={false}
          />

          <GridItem variant={['no-style']} colSpan={8}>
            <HandwrittenItemsTable
              className="handwritten-items-table--handwrittens-page"
              handwritten={handwritten}
              setHandwritten={setHandwritten}
            />
          </GridItem>

          <GridItem variant={['no-style']}>
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

          <GridItem variant={['low-opacity-bg']} colSpan={6}>
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

          <GridItem style={{ height: '100%' }} variant={['low-opacity-bg']} colSpan={6}>
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
