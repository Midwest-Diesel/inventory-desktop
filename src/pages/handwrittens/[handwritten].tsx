import AltShipDialog from "@/components/Dialogs/handwrittens/AltShipDialog";
import CoreCreditsDialog from "@/components/Dialogs/handwrittens/CoreCreditsDialog";
import NewReturnDialog from "@/components/Dialogs/handwrittens/NewReturnDialog";
import EditHandwrittenDetails from "@/components/EditHandwrittenDetails";
import HandwrittenItemsTable from "@/components/HandwrittenItemsTable";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Input from "@/components/Library/Input";
import Loading from "@/components/Library/Loading";
import Select from "@/components/Library/Select/Select";
import Table from "@/components/Library/Table";
import Print from "@/components/Print";
import { userAtom } from "@/scripts/atoms/state";
import { supabase } from "@/scripts/config/supabase";
import { AltShip, deleteHandwritten, editHandwrittenPaymentType, getAltShipByHandwritten, getHandwrittenById } from "@/scripts/controllers/handwrittensController";
import { formatDate, formatPhone, parseResDate } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { confirm } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { useAtom } from "jotai";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";


export default function Handwritten() {
  const router = useRouter();
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [handwritten, setHandwritten] = useState<Handwritten>(null);
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
  const [showCCLabel, setShowCCLabel] = useState(false);
  const [payment, setPayment] = useState('');
  const [promptLeaveWindow, setPromptLeaveWindow] = useState(false);
  const ccLabelRef = useRef(null);
  const paymentTypes = ['Net 30', 'Wire Transfer', 'EBPP - Secure', 'Visa', 'Mastercard', 'AMEX', 'Discover', 'Comchek', 'T-Check', 'Check', 'Cash', 'Card on File', 'Net 10', 'No Charge'].sort();

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      const res = await getHandwrittenById(Number(params.handwritten));
      setTitle(`${res.id} Handwritten`);
      setHandwritten(res);
      if (res.invoiceStatus === 'INVOICE PENDING') {
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
    const fetchData = async () => {
      if (handwritten) {
        const altShip = await getAltShipByHandwritten(handwritten.id);
        setAltShipData(altShip);
        setPayment(handwritten.payment);
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
      const exit = await confirm("Do you want to leave the page before printing the credit card label?");
      if (exit) {
        router.push(url);
      }
    };
    
    router.events.on('routeChangeStart', handleRouteChangeStart);  
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [promptLeaveWindow]);

  useEffect(() => {
    function confirmLeave(e: any) {
      e.preventDefault();
      e.returnValue = '';
    }
    
    window.addEventListener('beforeunload', confirmLeave);
    return () => {
      window.removeEventListener('beforeunload', confirmLeave);
    };
  }, []);

  const refreshHandwrittenItems = (e: RealtimePostgresInsertPayload<HandwrittenItem>) => {
    const newItems = [...handwritten.handwrittenItems, { ...e.new, date: parseResDate(e.new.date as any) }];
    setHandwritten({ ...handwritten, handwrittenItems: newItems });
  };

  const refreshHandwrittenItemsChildren = (e: RealtimePostgresInsertPayload<HandwrittenItemChild>) => {
  };

  const refreshHandwrittenOrderNotes = (e: RealtimePostgresUpdatePayload<Handwritten>) => {
    const newHandwritten: Handwritten = {...handwritten, orderNotes: e.new.orderNotes };
    setHandwritten(newHandwritten);
  };

  const handleDelete = async () => {
    if (user.accessLevel <= 1 || prompt('Type "confirm" to delete this handwritten') !== 'confirm') return;
    await deleteHandwritten(Number(handwritten.id));
    router.replace('/handwrittens');
  };

  const handleChangePayment = async (id: number, value: string) => {
    setPayment(value);
    await editHandwrittenPaymentType(id, value);
  };

  const handleChangeCard = () => {
    if (cardNum || cvv || expDate) {
      setPromptLeaveWindow(true);
    } else {
      setPromptLeaveWindow(false);
    }
  };

  const handlePrintShipDocs = async () => {
    if (handwritten.shipVia.toLowerCase().includes('freight')) {
      const copies = Number(prompt('How many shipping labels do you want to print?'));
      if (copies > 0) await handlePrintShippingLabel(copies);
    } else if (await confirm('Print shipping label?')) {
      await handlePrintShippingLabel();
    }

    const cityStateZip = `${handwritten.shipToCity} ${handwritten.shipToState} ${handwritten.shipToZip}`;
    const args = {
      shipToCompany: handwritten.shipToCompany || '',
      shipToAddress: handwritten.shipToAddress || '',
      shipToAddress2: handwritten.shipToAddress2 || '',
      shipToCityStateZip: cityStateZip || '',
      shipFromCompany: 'MIDWEST DIESEL',
      shipFromAddress: '3051 82ND LANE NE',
      shipFromAddress2: '',
      shipFromCityStateZip: 'MINNEAPOLIS MN 55449',
      shipVia: handwritten.shipVia || '',
      prepaid: (!handwritten.isCollect && !handwritten.isThirdParty),
      collect: handwritten.isCollect,
      thirdParty: handwritten.isThirdParty
    };
    await invoke('print_bol', { args });
  };

  const handlePrintShippingLabel = async (copies = 1) => {
    const cityStateZip = [handwritten.shipToCity, `${handwritten.shipToState} ${handwritten.shipToZip}`].join(', ');
    const args = {
      company: handwritten.shipToCompany || '',
      address: handwritten.shipToAddress || '',
      address2: (handwritten.shipToAddress2 ? handwritten.shipToAddress2 : cityStateZip) || '',
      cityStateZip: cityStateZip && handwritten.shipToAddress2 ? cityStateZip : '',
      copies
    };
    await invoke('print_shipping_label', { args });
  };

  const handlePrintCCLabel = async () => {
    if (!cardNum || !expDate || !cvv) return;
    await invoke('print_cc_label', { args: { cardNum: Number(cardNum), expDate, cvv: Number(cvv), cardZip, cardName, cardAddress } });
  };
  

  return (
    <Layout title="Handwritten Details">
      { showCCLabel && <Print html={ccLabelRef.current.innerHTML} styles={{ width: '30rem' }} onPrint={() => setShowCCLabel(false)} /> }

      <div className="handwritten-details">
        {handwritten ? isEditing ?
          <EditHandwrittenDetails handwritten={handwritten} setHandwritten={setHandwritten} setIsEditing={setIsEditing} />
          :
          <>
            <div className="handwritten-details__header">
              <h2>Handwritten { handwritten.id }</h2>

              <div className="header__btn-container">
                <Button
                  variant={['blue']}
                  className="handwritten-details__edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  className="handwritten-details__close-btn"
                  onClick={() => window.history.back()}
                >
                  Close
                </Button>
                {user.accessLevel > 1 &&
                  <Button
                    variant={['danger']}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                }
              </div>
            </div>

            <div className="handwritten-details__top-bar">
              <Button onClick={() => setCoreCreditsOpen(!coreCreditsOpen)} disabled={handwritten.cores.length === 0}>Core Credit</Button>
              <Button onClick={() => setAltShipOpen(!altShipOpen)} disabled={altShipData.length === 0}>Alt Ship</Button>
              <Button onClick={() => setReturnsOpen(!returnsOpen)}>New Return</Button>
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
                      <td>{ handwritten.poNum }</td>
                    </tr>
                    <tr>
                      <th><strong>Source</strong></th>
                      <td>{ handwritten.source }</td>
                    </tr>
                    <tr>
                      <th><strong>Salesperson</strong></th>
                      <td>{ handwritten.initials }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={4} colEnd={8} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th><strong>Billing Company</strong></th>
                      <td>{ handwritten.billToCompany }</td>
                    </tr>
                    <tr>
                      <th><strong>Billing Address</strong></th>
                      <td>{ handwritten.billToAddress }</td>
                    </tr>
                    <tr>
                      <th><strong>Billing City</strong></th>
                      <td>{ handwritten.billToCity }</td>
                    </tr>
                    <tr>
                      <th><strong>Billing State</strong></th>
                      <td>{ handwritten.billToState }</td>
                    </tr>
                    <tr>
                      <th><strong>Billing Zip</strong></th>
                      <td>{ handwritten.billToZip }</td>
                    </tr>
                    <tr>
                      <th><strong>Billing Phone</strong></th>
                      <td>{ formatPhone(handwritten.billToPhone) }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={8} colEnd={12} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th><strong>Shipping Company</strong></th>
                      <td>{ handwritten.shipToCompany }</td>
                    </tr>
                    <tr>
                      <th><strong>Shipping Address</strong></th>
                      <td>{ handwritten.shipToAddress }</td>
                    </tr>
                    <tr>
                      <th><strong>Shipping City</strong></th>
                      <td>{ handwritten.shipToCity }</td>
                    </tr>
                    <tr>
                      <th><strong>Shipping State</strong></th>
                      <td>{ handwritten.shipToState }</td>
                    </tr>
                    <tr>
                      <th><strong>Shipping Zip</strong></th>
                      <td>{ handwritten.shipToZip }</td>
                    </tr>
                    <tr>
                      <th><strong>Ship Via</strong></th>
                      <td>{ handwritten.shipVia }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={5} colEnd={10} rowEnd={3} variant={['low-opacity-bg']} className="no-print">
                <div ref={ccLabelRef}>
                  <Table variant={['plain', 'edit-row-details']}>
                    <tbody>
                      <tr>
                        <th>Card Number</th>
                        <td>
                          <Input
                            variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                            value={cardNum}
                            onChange={(e: any) => {
                              setCardNum(e.target.value);
                              handleChangeCard();
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Exp Date</th>
                        <td>
                          <Input
                            variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                            value={expDate}
                            onChange={(e: any) => {
                              setExpDate(e.target.value);
                              handleChangeCard();
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Security Code</th>
                        <td>
                          <Input
                            variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                            value={cvv}
                            type="number"
                            onChange={(e: any) => {
                              setCvv(e.target.value);
                              handleChangeCard();
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Card Zip Code</th>
                        <td>
                          <Input
                            variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                            value={cardZip}
                            onChange={(e: any) => setCardZip(e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Card Address</th>
                        <td>
                          <Input
                            variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold', 'search']}
                            value={cardAddress}
                            onChange={(e: any) => setCardAddress(e.target.value)}
                          >
                            <Button
                              variant={['x-small']}
                              style={{ width: '10rem' }}
                              onClick={() => {
                                setCardAddress(handwritten.billToAddress);
                                setCardZip(handwritten.billToZip);
                              }}
                            >
                              Same as Bill To
                            </Button>
                          </Input>
                        </td>
                      </tr>
                      <tr>
                        <th>Card Name</th>
                        <td>
                          <Input
                            variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold', 'search']}
                            value={cardName}
                            onChange={(e: any) => setCardName(e.target.value)}
                          >
                            <Button variant={['x-small']} style={{ width: '10rem' }} onClick={() => setCardName(handwritten.billToCompany)}>Same as Bill To</Button>
                          </Input>
                        </td>
                      </tr>
                      <tr>
                        <th>Payment Type</th>
                        <td>
                          <Select
                            value={payment}
                            onChange={(e: any) => handleChangePayment(handwritten.id, e.target.value)}
                          >
                            <option value="">-- SELECT PAYMENT TYPE --</option>
                            {paymentTypes.map((type, i) => {
                              return <option key={i}>{ type }</option>;
                            })}
                          </Select>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </GridItem>

              <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th><strong>Contact</strong></th>
                      <td>{ handwritten.contactName }</td>
                    </tr>
                    <tr>
                      <th><strong>Contact Phone</strong></th>
                      <td>{ formatPhone(handwritten.phone) }</td>
                    </tr>
                    <tr>
                      <th><strong>Contact Cell</strong></th>
                      <td>{ formatPhone(handwritten.cell) }</td>
                    </tr>
                    <tr>
                      <th><strong>Contact Fax</strong></th>
                      <td>{ formatPhone(handwritten.customer.fax) }</td>
                    </tr>
                    <tr>
                      <th><strong>Contact Email</strong></th>
                      <td>{ handwritten.customer.email }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={10} colEnd={12} variant={['low-opacity-bg']} className="no-print">
                <div className="handwritten-details__btn-row">
                  <Button variant={['x-small']} onClick={handlePrintShipDocs}>Print Ship Docs</Button>
                  <Button variant={['x-small']} onClick={() => window.print()}>Print Invoice</Button>
                  <Button variant={['x-small']} onClick={() => handlePrintShippingLabel()}>Print Ship Label</Button>
                  <Button variant={['x-small']} onClick={() => window.print()}>Print CI and COO</Button>
                  <Button variant={['x-small']} onClick={() => window.print()}>Print Return BOL</Button>
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

              <GridItem colStart={1} colEnd={12} variant={['low-opacity-bg']}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-md)' }}><strong>Sales Status</strong></p>
                    <p style={{ color: 'var(--yellow-1)' }}>{ handwritten.invoiceStatus }</p>
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
                <HandwrittenItemsTable className="handwritten-items-table--handwrittens-page" handwritten={handwritten} handwrittenItems={handwritten.handwrittenItems} setHandwritten={setHandwritten} />
              </GridItem>

              <GridItem variant={['low-opacity-bg']} colStart={1} colEnd={7}>
                <div className="handwritten-details__shipping-notes">
                  <div>
                    <h4 style={{ marginBottom: '0.3rem' }}>Shipping Notes</h4>
                    <p style={{ whiteSpace: 'pre-line' }}>{ handwritten.shippingNotes }</p>
                  </div>

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
                </div>
              </GridItem>

              <GridItem variant={['low-opacity-bg']} colStart={7} colEnd={12}>
                <h4 style={{ marginBottom: '0.3rem' }}>Order Notes</h4>
                <p style={{ whiteSpace: 'pre-line' }}>{ handwritten.orderNotes }</p>
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
