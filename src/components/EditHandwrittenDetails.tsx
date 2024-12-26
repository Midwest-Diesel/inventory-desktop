import { sourcesAtom } from "@/scripts/atoms/state";
import { addAltShipAddress, deleteHandwrittenItem, editHandwritten, editHandwrittenItems, getHandwrittenById } from "@/scripts/controllers/handwrittensController";
import { useAtom } from "jotai";
import { FormEvent, useEffect, useState } from "react";
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
import { confirm } from "@tauri-apps/api/dialog";
import ShippingListDialog from "./Dialogs/handwrittens/ShippingListDialog";

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
  const [shipVia, setShipVia] = useState<string>(handwritten.shipVia);
  const [payment, setPayment] = useState<string>(handwritten.payment);
  const [contact, setContact] = useState<string>(handwritten.contactName);
  const [contactPhone, setContactPhone] = useState<string>(handwritten.phone);
  const [contactCell, setContactCell] = useState<string>(handwritten.cell);
  const [contactFax, setContactFax] = useState<string>(handwritten.customer.fax);
  const [contactEmail, setContactEmail] = useState<string>(handwritten.customer.email);
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
  const [shippingListDialogOpen, setShippingListDialogOpen] = useState(false);
  const [newShippingListRow, setNewShippingListRow] = useState<Handwritten>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (sourcesData.length === 0) setSourcesData(await getAllSources());
    };
    fetchData();
  }, []);

  useEffect(() => {
    setHandwrittenItems(handwritten.handwrittenItems);
  }, [handwritten]);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!await confirm('Are you sure you want to save these changes?')) return;
    await handleAltShip();
    const newCustomer = await getCustomerByName(company);
    const newInvoice = {
      id: handwritten.id,
      shipVia,
      initials: handwritten.initials,
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
      contactName: contact,
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
      fl: Number(fl)
    } as Handwritten;
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
    setIsEditing(false);
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


  return (
    <>
      {shippingListDialogOpen &&
        <ShippingListDialog
          open={shippingListDialogOpen}
          setOpen={setShippingListDialogOpen}
          handwrittenItems={handwrittenItems}
          newShippingListRow={newShippingListRow}
        />
      }

      {handwritten &&
        <form className="edit-handwritten-details" onSubmit={(e) => saveChanges(e)}>
          <div className="edit-handwritten-details__header">
            <h2>{ handwritten.id }</h2>
          
            <div className="header__btn-container">
              <Button
                variant={['save']}
                className="edit-handwritten-details__save-btn"
                type="submit"
              >
                Save
              </Button>
              <Button
                className="edit-handwritten-details__close-btn"
                type="button"
                onClick={() => setIsEditing(false)}
              >
                Stop Editing
              </Button>
            </div>
          </div>

          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={6} breakpoints={[{ width: 1600, colStart: 1, colEnd: 8 }]} variant={['low-opacity-bg']}>
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
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={6} colEnd={9} breakpoints={[{ width: 1600, colStart: 1, colEnd: 6 }]} variant={['low-opacity-bg']}>
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

            <GridItem colStart={9} colEnd={12} breakpoints={[{ width: 1600, colStart: 6, colEnd: 12 }]} variant={['low-opacity-bg']}>
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
                      <Input
                        variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipVia}
                        onChange={(e: any) => setShipVia(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Contact</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={contact}
                        onChange={(e: any) => setContact(e.target.value)}
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
                    <th>Contact Cell</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={contactCell}
                        onChange={(e: any) => setContactCell(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Contact Fax</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={contactFax}
                        onChange={(e: any) => setContactFax(e.target.value)}
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
            </GridItem>

            <GridItem colStart={1} colEnd={12} variant={['no-style']}>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <Select
                  label="Sales Status"
                  variant={['label-stack']}
                  value={invoiceStatus}
                  onChange={(e: any) => setInvoiceStatus(e.target.value)}
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
              <Table>
                <thead>
                  <tr>
                    <th>Stock Number</th>
                    <th>Location</th>
                    <th>Cost</th>
                    <th>Qty</th>
                    <th>Part Number</th>
                    <th>Description</th>
                    <th>Unit Price</th>
                    <th>Date</th>
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
                          />
                        </td>
                        <td>
                          <Input
                            value={item.location}
                            onChange={(e: any) => editHandwrittenItem({ ...item, location: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.cost}
                            type="number"
                            onChange={(e: any) => editHandwrittenItem({ ...item, cost: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.qty}
                            type="number"
                            onChange={(e: any) => editHandwrittenItem({ ...item, qty: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.partNum}
                            onChange={(e: any) => editHandwrittenItem({ ...item, partNum: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.desc}
                            onChange={(e: any) => editHandwrittenItem({ ...item, desc: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.unitPrice}
                            type="number"
                            onChange={(e: any) => editHandwrittenItem({ ...item, unitPrice: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={parseDateInputValue(item.date)}
                            type="date"
                            onChange={(e: any) => editHandwrittenItem({ ...item, date: new Date(e.target.value) }, i)}
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

              <Button>Add</Button>
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
