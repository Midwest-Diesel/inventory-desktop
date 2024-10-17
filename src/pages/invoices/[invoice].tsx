import EditInvoiceDetails from "@/components/EditInvoiceDetails";
import InvoiceItemsTable from "@/components/InvoiceItemsTable";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Loading from "@/components/Library/Loading";
import { getInvoiceById } from "@/scripts/controllers/invoicesController";
import { formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function Invoice() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      setInvoice(await getInvoiceById(Number(params.invoice)));
    };
    fetchData();
  }, [params]);  


  return (
    <Layout title="Invoice Details">
      <div className="invoice-details">
        {invoice ? isEditing ?
          <EditInvoiceDetails invoice={invoice} setInvoice={setInvoice} setIsEditing={setIsEditing} />
          :
          <>
            <div className="invoice-details__header">
              <h2>{ invoice.id }</h2>
              <Button
                variant={['X', 'link']}
                className="invoice-details__close-btn"
              >
                <a href="/invoices">Close</a>
              </Button>
              <Button
                variant={['X', 'blue']}
                className="invoice-details__edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>

            <Grid rows={1} cols={12} gap={1}>
              <GridItem colStart={1} colEnd={5}>
                <div className="invoice-details__row">
                  <p><strong>Date</strong></p>
                  <p>{ formatDate(invoice.date) }</p>
                </div>
                <div className="invoice-details__row">
                  <p><strong>Customer</strong></p>
                  <p>{ invoice.customer.company }</p>
                </div>
                <div className="invoice-details__row">
                  <p><strong>Customer Type</strong></p>
                  <p>{ invoice.customer.customerType }</p>
                </div>
                <div className="invoice-details__row">
                  <p><strong>PO Number</strong></p>
                  <p>{ invoice.poNum }</p>
                </div>
                <div className="invoice-details__row">
                  <p><strong>Payment</strong></p>
                  <p>{ invoice.payment }</p>
                </div>
                <div className="invoice-details__row">
                  <p><strong>Source</strong></p>
                  <p>{ invoice.source }</p>
                </div>
                <div className="invoice-details__row">
                  <p><strong>Salesperson</strong></p>
                  <p>{ invoice.salesperson }</p>
                </div>
              </GridItem>

              <GridItem colStart={1} colEnd={6}>
                <div className="customer-details__row">
                  <p><strong>Billing Address</strong></p>
                  <p>{ invoice.billToAddress }</p>
                </div>
                <div className="customer-details__row">
                  <p><strong>Billing City</strong></p>
                  <p>{ invoice.billToCity }</p>
                </div>
                <div className="customer-details__row">
                  <p><strong>Billing State</strong></p>
                  <p>{ invoice.billToState }</p>
                </div>
                <div className="customer-details__row">
                  <p><strong>Billing Zip</strong></p>
                  <p>{ invoice.billToZip }</p>
                </div>
                <div className="customer-details__row">
                  <p><strong>Billing Phone</strong></p>
                  <p>{ formatPhone(invoice.billToPhone) }</p>
                </div>
                <div className="customer-details__row">
                  <p><strong>Fax</strong></p>
                  <p>{ invoice.billToFax }</p>
                </div>
                <div className="customer-details__row">
                  <p><strong>Contact</strong></p>
                  <p>{ invoice.billToContact }</p>
                </div>
              </GridItem>

              <GridItem colStart={6} colEnd={11}>
                <div className="customer-details__row">
                  <p><strong>Shipping Address</strong></p>
                  <p>{ invoice.shipToAddress }</p>
                </div>
                <div className="customer-details__row">
                  <p><strong>Shipping City</strong></p>
                  <p>{ invoice.shipToCity }</p>
                </div>
                <div className="customer-details__row">
                  <p><strong>Shipping State</strong></p>
                  <p>{ invoice.shipToState }</p>
                </div>
                <div className="customer-details__row">
                  <p><strong>Shipping Zip</strong></p>
                  <p>{ invoice.shipToZip }</p>
                </div>
              </GridItem>

              <GridItem variant={['no-style']} colStart={1} colEnd={11}>
                <InvoiceItemsTable invoiceItems={invoice.invoiceItems} />
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
