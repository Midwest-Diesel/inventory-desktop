import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Dialog from "../../Library/Dialog";
import Table from "../../Library/Table";
import Link from "../../Library/Link";
import { getSalesByYear } from "@/scripts/tools/search";
import { useEffect, useState } from "react";
import { getSalesInfo, searchParts } from "@/scripts/controllers/partsController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}


export default function SalesInfo({ open, setOpen }: Props) {
  const [sales, setSales] = useState<Part[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [counters, setCounters] = useState({ new: 0, recon: 0, used: 0, core: 0 });
  const prevSearches = JSON.parse(localStorage.getItem('altPartSearches')!) ?? JSON.parse(localStorage.getItem('partSearches')!);


  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      const search = await searchParts(prevSearches);
      if (!search || search.length === 0) return;
      const res = await getSalesInfo(search[0].altParts.join('|'));
      if (!res) return;
      setSales(res.sales);
      setQuotes(res.quotes);
      setCounters(res.counters);
    };
    fetchData();
  }, [open]);


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Sales Info"
      width={1200}
      height={650}
      x={50}
    >
      <div className="sales-info">
        <div className="sales-info__top-section">
          <div>
            <h2>New</h2>
            <p>{ counters.new }</p>
          </div>
          <div>
            <h2>Recon</h2>
            <p>{ counters.recon }</p>
          </div>
          <div>
            <h2>Used</h2>
            <p>{ counters.used }</p>
          </div>
          <div>
            <h2>Core</h2>
            <p>{ counters.core }</p>
          </div>
        </div>

        <section>
          <h3>Sales History</h3>
          <div className="sales-info__sales-history">
            <Table>
              <thead>
                <tr>
                  <th>Part Number</th>
                  <th>Sold Date</th>
                  <th>Customer</th>
                  <th>Qty Sold</th>
                  <th>Selling Price</th>
                  <th>Condition</th>
                  <th>Handwritten</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((part: Part) => {
                  return (
                    <tr key={part.id}>
                      <td><Link href={`/part/${part.id}`}>{ part.partNum }</Link></td>
                      <td>{ formatDate(part.soldToDate) }</td>
                      <td>{ part.soldTo }</td>
                      <td>{ part.qtySold }</td>
                      <td>{ formatCurrency(part.sellingPrice) }</td>
                      <td>{ part.condition }</td>
                      <td><Link href={`/handwrittens/${part.invoiceNum}`}>{ part.invoiceNum }</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {quotes.length > 0 &&
            <div style={{ display: 'flex' }}>
              <div>
                <h3>Quotes</h3>
                <div className="sales-info__quotes-history">
                  <Table>
                    <thead>
                      <tr>
                        <th>Initials</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Price</th>
                        <th>Condition</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((quote: Quote) => {
                        return (
                          <tr key={quote.id}>
                            <td>{ quote.salesman }</td>
                            <td>{ formatDate(quote.date) }</td>
                            <td>{ quote.customer as any }</td>
                            <td>{ formatCurrency(quote.price) }</td>
                            <td>{ (quote as any).condition }</td>
                            <td>{ quote.notes }</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </div>
              <div className="sales-info__sales-by-year">
                <h3>Sales by Year</h3>
                {getSalesByYear(sales).map((sale: any, i: number) => {
                  return (
                    <div key={i} className="sales-info__sales-by-year--row">
                      <p>{ sale.year }</p>
                      <p>---</p>
                      <p>{ sale.amount }</p>
                    </div>
                  );
                })}
              </div>
            </div>
          }
        </section>
      </div>
    </Dialog>
  );
}
