import AltShipDialog from "@/components/Dialogs/handwrittens/AltShipDialog";
import CoreCreditsDialog from "@/components/Dialogs/handwrittens/CoreCreditsDialog";
import NewReturnDialog from "@/components/Dialogs/handwrittens/NewReturnDialog";
import EditHandwrittenDetails from "@/components/EditHandwrittenDetails";
import HandwrittenItemsTable from "@/components/HandwrittenItemsTable";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import { userAtom } from "@/scripts/atoms/state";
import { supabase } from "@/scripts/config/supabase";
import { AltShip, deleteHandwritten, getAltShipByHandwritten, getHandwrittenById } from "@/scripts/controllers/handwrittensController";
import { formatDate, formatPhone, parseResDate } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { useAtom } from "jotai";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { confirm } from '@tauri-apps/api/dialog';


export default function Handwritten() {
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [handwritten, setHandwritten] = useState<Handwritten>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [coreCreditsOpen, setCoreCreditsOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [altShipOpen, setAltShipOpen] = useState(false);
  const [altShipData, setAltShipData] = useState<AltShip[]>([]);

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
    location.replace('/handwrittens');
  };
  

  return (
    <Layout title="Handwritten Details">
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
                  variant={['link']}
                  className="handwritten-details__close-btn"
                >
                  <Link href="/handwrittens">Close</Link>
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
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th><strong>Card Number</strong></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th><strong>Exp Date</strong></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th><strong>Security Code</strong></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th><strong>Card Zip Code</strong></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th><strong>Card Name</strong></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th><strong>Payment Type</strong></th>
                      <td>{ handwritten.payment }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={6} colEnd={10} variant={['low-opacity-bg']}>
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

              <GridItem colStart={10} colEnd={12} variant={['low-opacity-bg']}>
                <div className="handwritten-details__btn-row">
                  <Button variant={['x-small']}>Print Ship Docs</Button>
                  <Button variant={['x-small']}>Print Invoice</Button>
                  <Button variant={['x-small']}>Print Ship Label</Button>
                  <Button variant={['x-small']}>Print CI and COO</Button>
                  <Button variant={['x-small']}>Print Return BOL</Button>
                  <Button variant={['x-small']}>Print CC Label</Button>
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

              <GridItem variant={['low-opacity-bg']} colStart={8} colEnd={12}>
                <div>
                  <h4 style={{ marginBottom: '0.3rem' }}>Order Notes</h4>
                  <p style={{ whiteSpace: 'pre-line' }}>{ handwritten.orderNotes }</p>
                </div>
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
