import AltShipDialog from "@/components/Dialogs/handwrittens/AltShipDialog";
import CoreCreditsDialog from "@/components/Dialogs/handwrittens/CoreCreditsDialog";
import NewReturnDialog from "@/components/Dialogs/handwrittens/NewReturnDialog";
import PrintInvoiceDialog from "@/components/Dialogs/handwrittens/PrintInvoiceDialog";
import TakeoffsDialog from "@/components/Dialogs/handwrittens/TakeoffsDialog";
import EditHandwrittenDetails from "@/components/EditHandwrittenDetails";
import HandwrittenItemsTable from "@/components/HandwrittenItemsTable";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Input from "@/components/Library/Input";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import { userAtom } from "@/scripts/atoms/state";
import { supabase } from "@/scripts/config/supabase";
import { AltShip, deleteHandwritten, editHandwrittenShipTo, getAltShipByHandwritten, getHandwrittenById } from "@/scripts/controllers/handwrittensController";
import { formatCurrency, formatDate, formatPhone, parseResDate } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { invoke, confirm } from "@/scripts/config/tauri";
import { useAtom } from "jotai";
import Link from "@/components/Library/Link";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { useNavState } from "@/components/Navbar/useNavState";
import CreditCardBlock from "@/components/CreditCardBlock";


export default function Handwritten() {
  const { closeBtn, push } = useNavState();
  const router = useRouter();
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [handwritten, setHandwritten] = useState<Handwritten | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [coreCreditsOpen, setCoreCreditsOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [altShipOpen, setAltShipOpen] = useState(false);
  const [altShipData, setAltShipData] = useState<AltShip[]>([]);
  const [cardNum, setCardNum] = useState<number>('' as any);
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState<number>('' as any);
  const [cardZip, setCardZip] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardAddress, setCardAddress] = useState('');
  const [payment, setPayment] = useState('');
  const [promptLeaveWindow, setPromptLeaveWindow] = useState(false);
  const [printInvoiceOpen, setPrintInvoiceOpen] = useState(false);
  const [takeoff, setTakeoff] = useState('');
  const [takeoffItem, setTakeoffItem] = useState<HandwrittenItem | HandwrittenItemChild | null>(null);
  const [takeoffsOpen, setTakeoffsOpen] = useState(false);
  const [taxTotal, setTaxTotal] = useState(0);
  const TAX_RATE = 0.08375;

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      const res = await getHandwrittenById(Number(params.handwritten));
      setTitle(`${res?.id} Handwritten`);
      setHandwritten(res);
      if (res?.invoiceStatus === 'INVOICE PENDING') {
        setIsEditing(true);
      }
    };
    fetchData();
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!handwritten) return;
      const res = await getHandwrittenById(Number(params.handwritten));
      setHandwritten(res);
    };
    fetchData();
  }, [isEditing]);

  useEffect(() => {
    const taxItemsAmount = (handwritten && handwritten.handwrittenItems.map((item) => (item?.qty ?? 0) * (item?.unitPrice ?? 0)).reduce((acc, cur) => acc + cur, 0)) ?? 0;
    setTaxTotal(Number((taxItemsAmount * TAX_RATE).toFixed(2)));

    const fetchData = async () => {
      if (handwritten) {
        const altShip = await getAltShipByHandwritten(handwritten.id);
        setAltShipData(altShip);
        setPayment(handwritten.payment ?? '');
      }
    };
    fetchData();
    supabase
      .channel('pendingInvoicesItems')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pendingInvoicesItems' }, refreshHandwrittenItems)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pendingInvoicesItemsChildren' }, refreshHandwrittenItemsChildren)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pendingInvoices' }, refreshHandwrittenOrderNotes)
      .subscribe();
  }, [handwritten]);

  useEffect(() => {
    const handleRouteChangeStart = async (url: string) => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      if (!promptLeaveWindow) {
        router.push(url);
        return;
      }
      router.replace(location.href);
      const exit = await confirm("Leave the page before printing the credit card label?");
      if (exit) {
        await push(url, url);
      }
    };
    
    router.events.on('routeChangeStart', handleRouteChangeStart);  
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [promptLeaveWindow]);

  useEffect(() => {
    if (!promptLeaveWindow) return;
    function confirmLeave(e: any) {
      e.preventDefault();
      e.returnValue = '';
    }
    
    window.addEventListener('beforeunload', confirmLeave);
    return () => {
      window.removeEventListener('beforeunload', confirmLeave);
    };
  }, [promptLeaveWindow]);

  const refreshHandwrittenItems = async (e: RealtimePostgresInsertPayload<HandwrittenItem>) => {
    const newItems = [...(handwritten?.handwrittenItems ?? []), { ...e.new, date: parseResDate(e.new.date as any) }];
    const res = await getHandwrittenById(Number(params.handwritten));
    if (!res) {
      location.reload();
      return;
    }
    setHandwritten({ ...res, handwrittenItems: newItems });
  };

  const refreshHandwrittenItemsChildren = (e: RealtimePostgresInsertPayload<HandwrittenItemChild>) => {
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
        shipToCompany: handwritten?.shipToCompany ?? '',
        shipToAddress: handwritten?.shipToAddress ?? '',
        shipToAddress2: `, ${handwritten?.shipToAddress2}`,
        shipToCityStateZip: cityStateZip ?? '',
        shipFromCompany: 'MIDWEST DIESEL',
        shipFromAddress: '3051 82ND LANE NE',
        shipFromAddress2: '',
        shipFromCityStateZip: 'MINNEAPOLIS MN 55449',
        shipVia: handwritten?.shipVia.name ?? '',
        prepaid: (!handwritten?.isCollect && !handwritten?.isThirdParty),
        collect: handwritten?.isCollect,
        thirdParty: handwritten?.isThirdParty
      };
      await invoke('print_bol', { args });
    } else if (await confirm('Print packing slip?')) {
      const billToCityStateZip = `${handwritten?.billToCity}${handwritten?.billToCity ? ',' : ''} ${handwritten?.billToState} ${handwritten?.billToZip}`;
      const shipToCityStateZip = `${handwritten?.shipToCity}${handwritten?.shipToCity ? ',' : ''} ${handwritten?.shipToState} ${handwritten?.shipToZip}`;
      const args = {
        invoiceDate: formatDate(handwritten?.date) ?? '',
        poNum: handwritten?.poNum ?? '',
        billToCompany: handwritten?.billToCompany ?? '',
        billToAddress: handwritten?.billToAddress ?? '',
        billToAddress2: handwritten?.billToAddress2 ? `"${handwritten?.billToAddress2}" & Chr(11)` : '""',
        billToCityStateZip,
        shipToCompany: handwritten?.shipToCompany ?? '',
        shipToContact: handwritten?.shipToContact ? `"${handwritten?.shipToContact}" & Chr(11)` : '""',
        shipToAddress: handwritten?.shipToAddress ?? '',
        shipToAddress2: handwritten?.shipToAddress2 ? `"${handwritten?.shipToAddress2}" & Chr(11)` : '""',
        shipToCityStateZip,
        items: JSON.stringify(handwritten?.handwrittenItems.map((item) => {
          const price = formatCurrency(item.unitPrice).replaceAll(',', '|') || '$0.00';
          const total = formatCurrency((item?.unitPrice ?? 0) * (item?.qty ?? 0)).replaceAll(',', '|') || '$0.00';

          return {
            qty: item.qty ?? '',
            partNum: item.partNum ?? '',
            desc: item.desc ?? '',
            price: handwritten?.isNoPriceInvoice ? '-9999' : price,
            total: handwritten?.isNoPriceInvoice ? '-9999' : total
          };
        })) || '[]'
      };
      await invoke('print_packing_slip', { args });
    }
  };

  const handlePrintShipDocsBlind = async () => {
    if (handwritten?.shipVia?.type === 'Truck Line') {
      const copies = Number(prompt('How many shipping labels do you want to print?'));
      if (copies > 0) await handlePrintShippingLabel(copies);

      const cityStateZip = `${handwritten?.shipToCity} ${handwritten?.shipToState} ${handwritten?.shipToZip}`;
      const args = {
        shipToCompany: handwritten?.shipToCompany ?? '',
        shipToAddress: handwritten?.shipToAddress ?? '',
        shipToAddress2: `, ${handwritten?.shipToAddress2}`,
        shipToCityStateZip: cityStateZip ?? '',
        shipFromCompany: '',
        shipFromAddress: '',
        shipFromAddress2: '',
        shipFromCityStateZip: '',
        shipVia: handwritten?.shipVia.name ?? '',
        prepaid: (!handwritten?.isCollect && !handwritten?.isThirdParty),
        collect: handwritten?.isCollect,
        thirdParty: handwritten?.isThirdParty
      };
      await invoke('print_bol', { args });
    } else if (await confirm('Print packing slip?')) {
      const billToCityStateZip = `${handwritten?.billToCity}${handwritten?.billToCity ? ',' : ''} ${handwritten?.billToState} ${handwritten?.billToZip}`;
      const shipToCityStateZip = `${handwritten?.shipToCity}${handwritten?.shipToCity ? ',' : ''} ${handwritten?.shipToState} ${handwritten?.shipToZip}`;
      const args = {
        invoiceDate: formatDate(handwritten?.date) ?? '',
        billToCompany: handwritten?.billToCompany ?? '',
        billToAddress: handwritten?.billToAddress ?? '',
        billToAddress2: handwritten?.billToAddress2 ? `"${handwritten?.billToAddress2}" & Chr(11)` : '""',
        billToCityStateZip,
        shipToCompany: handwritten?.shipToCompany ?? '',
        shipToContact: handwritten?.shipToContact ? `"${handwritten?.shipToContact}" & Chr(11)` : '""',
        shipToAddress: handwritten?.shipToAddress ?? '',
        shipToAddress2: handwritten?.shipToAddress2 ? `"${handwritten?.shipToAddress2}" & Chr(11)` : '""',
        shipToCityStateZip,
        items: JSON.stringify(handwritten?.handwrittenItems.map((item) => {
          return {
            qty: item.qty ?? '',
            partNum: item.partNum ?? '',
            desc: item.desc ?? ''
          };
        })) || '[]'
      };
      await invoke('print_packing_slip_blind', { args });
    }
  };

  const handlePrintShippingLabel = async (copies: number) => {
    if (!await confirm(`Print ${copies} shipping label${copies > 1 ? 's' : ''}?`)) return;
    if (handwritten?.isBlindShipment) {
      const shipFromCityStateZip = [handwritten?.billToCity, `${handwritten?.billToState} ${handwritten?.billToZip}`].join(', ');
      const shipToCityStateZip = [handwritten?.shipToCity, `${handwritten?.shipToState} ${handwritten?.shipToZip}`].join(', ');
      const args = {
        shipFromCompany: handwritten?.billToCompany ?? '',
        shipFromAddress: handwritten?.billToAddress ?? '',
        shipFromAddress2: handwritten?.billToAddress2 ? `"${handwritten?.billToAddress2}" & Chr(11)` : '""',
        shipFromCityStateZip: shipFromCityStateZip ?? '',
        shipToCompany: handwritten?.shipToCompany ?? '',
        shipToAddress: handwritten?.shipToAddress ?? '',
        shipToAddress2: handwritten?.shipToAddress2 ? `"${handwritten?.shipToAddress2}" & Chr(11)` : '""',
        shipToCityStateZip: shipToCityStateZip ?? '',
        copies
      };
      await invoke('print_shipping_label', { args });
    } else {
      const shipToCityStateZip = [handwritten?.shipToCity, `${handwritten?.shipToState} ${handwritten?.shipToZip}`].join(', ');
      const args = {
        shipFromCompany: 'MIDWEST DIESEL',
        shipFromAddress: '3051 82ND LANE NE',
        shipFromAddress2: '""',
        shipFromCityStateZip: 'BLAINE, MN 55449',
        shipToCompany: handwritten?.shipToCompany ?? '',
        shipToAddress: handwritten?.shipToAddress ?? '',
        shipToAddress2: handwritten?.shipToAddress2 ? `"${handwritten?.shipToAddress2}" & Chr(11)` : '""',
        shipToCityStateZip: shipToCityStateZip ?? '',
        copies
      };
      await invoke('print_shipping_label', { args });
    }
  };

  const handlePrintCI = async () => {
    const cityStateZip = [handwritten?.shipToCity, `${handwritten?.shipToState} ${handwritten?.shipToZip}`].join(', ');
    const args = {
      company: handwritten?.shipToCompany ?? '',
      address: handwritten?.shipToAddress ?? '',
      address2: (handwritten?.shipToAddress2 ? handwritten?.shipToAddress2 : cityStateZip) ?? '',
      cityStateZip: cityStateZip && handwritten?.shipToAddress2 ? cityStateZip : '',
      date: formatDate(handwritten?.date) ?? '',
      po: handwritten?.poNum ?? ''
    };
    await invoke('print_ci', { args });
    await invoke('print_coo');
  };

  const handlePrintReturnBOL = async () => {
    const cityStateZip = `${handwritten?.shipToCity} ${handwritten?.shipToState} ${handwritten?.shipToZip}`;
    const args = {
      shipFromCompany: handwritten?.shipToCompany ?? '',
      shipFromAddress: handwritten?.shipToAddress ?? '',
      shipFromAddress2: handwritten?.shipToAddress2 ?? '',
      shipFromCityStateZip: cityStateZip ?? '',
      shipToCompany: 'MIDWEST DIESEL',
      shipToAddress: '3051 82ND LANE NE',
      shipToAddress2: '',
      shipToCityStateZip: 'MINNEAPOLIS MN 55449',
      shipVia: handwritten?.shipVia?.name ?? '',
      prepaid: (!handwritten?.isCollect && !handwritten?.isThirdParty),
      collect: handwritten?.isCollect,
      thirdParty: handwritten?.isThirdParty
    };
    await invoke('print_bol', { args });
  };

  const handlePrintCCLabel = async () => {
    if (!await confirm('Print a CC label?')) return;
    if (!cardNum || !expDate || !cvv) return;
    await invoke('print_cc_label', { args: { cardNum: Number(cardNum), expDate, cvv: Number(cvv), cardZip, cardName, cardAddress } });
  };

  const handleTakeoffs = (e: FormEvent) => {
    e.preventDefault();
    const stockNum = takeoff.replace('<', '').replace('>', '');
    const children: HandwrittenItemChild[] = [];
    const item: HandwrittenItem | null = handwritten?.handwrittenItems.find((item) => item.stockNum === stockNum && item.location !== 'CORE DEPOSIT') ?? null;
    handwritten?.handwrittenItems.forEach((item) => {
      if (item.invoiceItemChildren.length > 0) children.push(...item.invoiceItemChildren);
    });
    const itemChild: HandwrittenItemChild = children.find((item) => item.stockNum === stockNum) ?? {} as HandwrittenItemChild;

    if (!item && !itemChild) return;
    setTakeoffsOpen(true);
    setTakeoffItem(item);
  };

  const handleSameAsBillTo = async () => {
    const { shipToAddress, shipToAddress2, shipToCity, shipToState, shipToZip, shipToCompany } = handwritten as Handwritten;
    const isBlank = [shipToAddress, shipToAddress2, shipToCity, shipToState, shipToZip, shipToCompany].filter((h) => h).length === 0;
    if (!isBlank && !await confirm('Replace Ship To Data?')) return;
    const data = {
      id: handwritten?.id,
      shipToAddress: handwritten?.billToAddress ?? '',
      shipToAddress2: handwritten?.billToAddress2 ?? '',
      shipToCity: handwritten?.billToCity ?? '',
      shipToState: handwritten?.billToState ?? '',
      shipToZip: handwritten?.billToZip ?? '',
      shipToCompany: handwritten?.billToCompany ?? ''
    } as any;
    setHandwritten({
      ...(handwritten ?? {} as Handwritten),
      shipToAddress: handwritten?.billToAddress ?? '',
      shipToAddress2: handwritten?.billToAddress2 ?? '',
      shipToCity: handwritten?.billToCity ?? '',
      shipToState: handwritten?.billToState ?? '',
      shipToZip: handwritten?.billToZip ?? '',
      shipToCompany: handwritten?.billToCompany ?? ''
    });
    await editHandwrittenShipTo(data);
  };
  

  return (
    <Layout title="Handwritten Details">
      <PrintInvoiceDialog open={printInvoiceOpen} setOpen={setPrintInvoiceOpen} handwritten={handwritten} />
      { takeoffItem && <TakeoffsDialog open={takeoffsOpen} setOpen={setTakeoffsOpen} item={takeoffItem} setHandwritten={setHandwritten} /> }

      <div className="handwritten-details">
        {handwritten ? isEditing ?
          <EditHandwrittenDetails
            handwritten={handwritten}
            setHandwritten={setHandwritten}
            setIsEditing={setIsEditing}
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
          :
          <>
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
                  onClick={async () => await closeBtn()}
                >
                  Close
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
              <Button onClick={() => setCoreCreditsOpen(!coreCreditsOpen)} disabled={handwritten.cores.length === 0}>Core Credit</Button>
              <Button onClick={() => setAltShipOpen(!altShipOpen)} disabled={altShipData.length === 0}>Alt Ship</Button>
              <Button onClick={() => setReturnsOpen(!returnsOpen)} data-testid="new-return-btn">New Return</Button>
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
            />

            <Grid rows={1} cols={12} gap={1}>
              <GridItem colStart={1} colEnd={4} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th><strong>Date</strong></th>
                      <td>{ formatDate(handwritten.date) }</td>
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

              <GridItem colStart={4} colEnd={8} variant={['low-opacity-bg']}>
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

              <GridItem colStart={8} colEnd={12} variant={['low-opacity-bg']}>
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

              {/* <GridItem colStart={12} colEnd={14} variant={['no-style']}>
                <Button variant={['xx-small']} onClick={handleSameAsBillTo}>Same as Bill To</Button>
              </GridItem> */}

              <GridItem colStart={1} colEnd={3} variant={['low-opacity-bg']} className="no-print">
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

              <GridItem colStart={3} colEnd={7} rowEnd={3} variant={['low-opacity-bg']} className="no-print">
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

              <GridItem colStart={7} colEnd={11} variant={['low-opacity-bg']}>
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
                  handwrittenItems={handwritten.handwrittenItems}
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
                          <td>{ handwritten.mp }</td>
                        </tr>
                        <tr>
                          <th><strong>Hats</strong></th>
                          <td>{ handwritten.cap }</td>
                        </tr>
                        <tr>
                          <th><strong>Brochures</strong></th>
                          <td>{ handwritten.br }</td>
                        </tr>
                        <tr>
                          <th><strong>Flashlights</strong></th>
                          <td>{ handwritten.fl }</td>
                        </tr>
                      </tbody>
                    </Table>
                  }
                </div>
              </GridItem>

              <GridItem variant={['low-opacity-bg']} colStart={7} colEnd={12}>
                <h4 style={{ marginBottom: '0.3rem' }}>Order Notes</h4>
                <p style={{ whiteSpace: 'pre-line' }} data-testid="order-notes">{ handwritten.orderNotes }</p>
              </GridItem>
            </Grid>

            <form onSubmit={handleTakeoffs}>
              <br />
              <Input
                variant={['label-bold', 'label-stack', 'small']}
                label="Takeoff"
                value={takeoff}
                onChange={(e: any) => setTakeoff(e.target.value)}
                required
              />
            </form>
          </>
          :
          <Loading />
        }
      </div>
    </Layout>
  );
}
