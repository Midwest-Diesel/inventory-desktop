import { editInvoice } from "@/scripts/controllers/invoicesController";
import { FormEvent, useState } from "react";
import Input from "./Library/Input";
import Button from "./Library/Button";
import GridItem from "./Library/Grid/GridItem";
import InvoiceItemsTable from "./InvoiceItemsTable";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Grid from "./Library/Grid/Grid";
import { useAtom } from "jotai";
import { sourcesAtom } from "@/scripts/atoms/state";
import Select from "./Library/Select/Select";

interface Props {
  invoice: Invoice
  setInvoice: (invoice: Invoice) => void
  setIsEditing: (value: boolean) => void
}


export default function EditInvoiceDetails({ invoice, setInvoice, setIsEditing }: Props) {
  const [sourcesData] = useAtom<string[]>(sourcesAtom);
  const [date, setDate] = useState(invoice.date || '' as any);
  const [company, setCompany] = useState(invoice.customer.company || '');
  const [customerType, setCustomerType] = useState(invoice.customer.customerType || '');
  const [poNum, setPoNum] = useState(invoice.poNum || '');
  const [payment, setPayment] = useState(invoice.payment || '');
  const [source, setSource] = useState<string>(invoice.source || '');
  const [salesperson, setSalesperson] = useState(invoice.salesperson || '');
  const [billToAddress, setBillToAddress] = useState(invoice.billToAddress || '');
  const [billToCity, setBillToCity] = useState(invoice.billToCity || '');
  const [billToState, setBillToState] = useState(invoice.billToState || '');
  const [billToZip, setBillToZip] = useState(invoice.billToZip || '');
  const [billToPhone, setBillToPhone] = useState(invoice.billToPhone || '');
  const [billToFax, setBillToFax] = useState(invoice.billToFax || '');
  const [billToContact, setBillToContact] = useState(invoice.billToContact || '');
  const [shipToAddress, setShipToAddress] = useState(invoice.shipToAddress || '');
  const [shipToCity, setShipToCity] = useState(invoice.shipToCity || '');
  const [shipToState, setShipToState] = useState(invoice.shipToState || '');
  const [shipToZip, setShipToZip] = useState(invoice.shipToZip || '');

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!await confirm('Are you sure you want to save these changes?')) return;
    const newInvoice = {
      id: invoice.id,
      date,
      customer: { ...invoice.customer, company, customerType },
      poNum,
      payment,
      source,
      salesperson,
      billToAddress,
      billToCity,
      billToState,
      billToZip,
      billToPhone,
      billToFax,
      billToContact,
      shipToAddress,
      shipToCity,
      shipToState,
      shipToZip,
      invoiceItems: invoice.invoiceItems
    } as Invoice;
    await editInvoice(newInvoice);
    setInvoice(newInvoice);
    setIsEditing(false);
  };
  

  return (
    <>
      {invoice &&
        <form className="edit-invoice-details" onSubmit={(e) => saveChanges(e)}>
          <div className="edit-invoice-details__header">
            <h2>{ invoice.id }</h2>
          
            <Button
              variant={['X']}
              className="edit-invoice-details__close-btn"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Stop Editing
            </Button>
            <Button
              variant={['X', 'save']}
              className="edit-invoice-details__save-btn"
              type="submit"
            >
              Save
            </Button>
          </div>

          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={5}>
              <div className="invoice-details__row">
                <Input
                  label="Date"
                  variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={parseDateInputValue(date)}
                  type="date"
                  onChange={(e: any) => setDate(new Date(e.target.value))}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Customer"
                  variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={company}
                  onChange={(e: any) => setCompany(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Customer Type"
                  variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={customerType}
                  onChange={(e: any) => setCustomerType(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="PO Number"
                  variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={poNum}
                  onChange={(e: any) => setPoNum(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Payment"
                  variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={payment}
                  onChange={(e: any) => setPayment(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Select
                  label="Source"
                  variant={['label-space-between', 'label-inline', 'label-full-width']}
                  value={source}
                  onChange={(e: any) => setSource(e.target.value)}
                >
                  {sourcesData.map((source: string, i) => {
                    return <option key={i} value={source}>{source}</option>;
                  })}
                </Select>
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Salesperson"
                  variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={salesperson}
                  onChange={(e: any) => setSalesperson(e.target.value)}
                />
              </div>
            </GridItem>

            <GridItem colStart={1} colEnd={6}>
              <div className="invoice-details__row">
                <Input
                  label="Billing Address"
                  variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={billToAddress}
                  onChange={(e: any) => setBillToAddress(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Billing City"
                  variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={billToCity}
                  onChange={(e: any) => setBillToCity(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Billing State"
                  variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={billToState}
                  onChange={(e: any) => setBillToState(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Billing Zip"
                  variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={billToZip}
                  onChange={(e: any) => setBillToZip(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Billing Phone"
                  variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={billToPhone}
                  onChange={(e: any) => setBillToPhone(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Fax"
                  variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={billToFax}
                  onChange={(e: any) => setBillToFax(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Contact"
                  variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={billToContact}
                  onChange={(e: any) => setBillToContact(e.target.value)}
                />
              </div>
            </GridItem>

            <GridItem colStart={6} colEnd={11}>
              <div className="invoice-details__row">
                <Input
                  label="Shipping Address"
                  variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={shipToAddress}
                  onChange={(e: any) => setShipToAddress(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Shipping City"
                  variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={shipToCity}
                  onChange={(e: any) => setShipToCity(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Shipping State"
                  variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={shipToState}
                  onChange={(e: any) => setShipToState(e.target.value)}
                />
              </div>
              <div className="invoice-details__row">
                <Input
                  label="Shipping Zip"
                  variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  value={shipToZip}
                  onChange={(e: any) => setShipToZip(e.target.value)}
                />
              </div>
            </GridItem>

            <GridItem variant={['no-style']} colStart={1} colEnd={11}>
              <InvoiceItemsTable invoiceItems={invoice.invoiceItems} />
            </GridItem>
          </Grid>
        </form>
      }
    </>
  );
}
