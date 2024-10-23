import InvoicesSearchDialog from "@/components/Dialogs/InvoicesSearchDialog";
import InvoiceItemsTable from "@/components/InvoiceItemsTable";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { invoicesAtom } from "@/scripts/atoms/state";
import { getInvoicesByDate, getInvoiceCount, getSomeInvoices } from "@/scripts/controllers/invoicesController";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Link from "next/link";


export default function Invoices() {
  const [invoicesData] = useAtom(invoicesAtom);
  const [invoices, setInvoices] = useState<Invoice[]>(invoicesData);
  const [yesterdayInvoices, setYesterdayInvoices] = useState<Invoice[]>(invoicesData);
  const [invoiceCount, setInvoiceCount] = useState<number[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [focusedInvoice, setFocusedInvoice] = useState<Invoice>(null);

  useEffect(() => {
    const fetchData = async () => {
      const pageCount = await getInvoiceCount();
      setInvoiceCount(pageCount);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setYesterdayInvoices(await getInvoicesByDate(yesterday));
    };
    fetchData();
  }, []);

  const handleChangePage = async (data: any, page: number) => {
    if (data.length > 0) {
      setInvoices(data.slice((page - 1) * 26, page * 26));
    } else {
      const res = await getSomeInvoices(page, 26);
      setInvoices(res);
    }
  };

  const handleSearch = (results: Invoice[]) => {
    handleChangePage(results, 1);
  };

  const sumInvoiceCosts = (invoiceItems: InvoiceItem[]): number => {
    return invoiceItems.reduce((acc, item) => acc + (item.cost * item.qty), 0);
  };

  const sumInvoiceItems = (invoiceItems: InvoiceItem[]): number => {
    return invoiceItems.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  };

  const getTotalCogs = (): number => {
    return yesterdayInvoices.reduce((acc, invoice) => acc + sumInvoiceCosts(invoice.invoiceItems), 0);
  };

  const getTotalSales = (): number => {
    return yesterdayInvoices.reduce((acc, invoice) => acc + sumInvoiceItems(invoice.invoiceItems), 0);
  };


  return (
    <Layout>
      <div className="invoices__container">
        <div className="invoices">
          <h1>Invoices</h1>
          <div className="invoices__top-bar">
            <Button onClick={() => setOpenSearch(true)}>Search</Button>
            <div className="invoices__top-bar--count-block">
              <h4>Yesterday&apos;s COGS</h4>
              <p>{ yesterdayInvoices && formatCurrency(getTotalCogs()) }</p>
            </div>
            <div className="invoices__top-bar--count-block">
              <h4>Yesterday&apos;s Sales</h4>
              <p>{ yesterdayInvoices && formatCurrency(getTotalSales()) }</p>
            </div>
          </div>

          <InvoicesSearchDialog open={openSearch} setOpen={setOpenSearch} setInvoices={handleSearch} />

          {invoices ?
            <div className="invoices__table-container">
              <Table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Date</th>
                    <th>Bill to Company</th>
                    <th>Ship to Company</th>
                    <th>Source</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice: Invoice) => {
                    return (
                      <tr key={invoice.id} onClick={() => setFocusedInvoice(invoice)}>
                        <td><Link href={`/invoices/${invoice.id}`}>{ invoice.id }</Link></td>
                        <td>{ formatDate(invoice.date) }</td>
                        <td>{ invoice.billToCompany }</td>
                        <td>{ invoice.shipToCompany }</td>
                        <td>{ invoice.source }</td>
                        <td>{ invoice.payment }</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <Pagination
                data={invoicesData}
                setData={handleChangePage}
                minData={invoiceCount}
                pageSize={26}
              />
            </div>
            :
            <p>Loading...</p>
          }
        </div>

        {focusedInvoice && <InvoiceItemsTable className="invoice-items-table--invoices-page" invoiceItems={focusedInvoice.invoiceItems} /> }
      </div>
    </Layout>
  );
}
