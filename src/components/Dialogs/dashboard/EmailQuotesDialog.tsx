import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import { invoke } from "@/scripts/config/tauri";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "@/components/Library/Button";
import Input from "@/components/Library/Input";
import Table from "@/components/Library/Table";
import Pagination from "@/components/Library/Pagination";
import { getQuotesByCustomer } from "@/scripts/controllers/quotesController";
import Loading from "@/components/Library/Loading";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  quote: Quote
}


export default function SalesInfo({ open, setOpen, quote }: Props) {
  const [recipients, setRecipients] = useState<string>(quote.customer?.email ?? '');
  const [quotes, setQuotes] = useState<Quote[]>([quote]);
  const [customerQuotes, setCustomerQuotes] = useState<Quote[]>([]);
  const [paginatedQuotes, setPaginatedQuotes] = useState<Quote[]>([]);
  const [pageCount, setCount] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const LIMIT = 26;

  useEffect(() => {
    if (!open) return;
    clearData();

    const fetchData = async () => {
      const res = await getQuotesByCustomer(quote.customer?.id ?? null);
      setCustomerQuotes(res.rows);
      setCount(res.minItems);
      setLoading(false);
    };
    fetchData();
  }, [open]);

  const clearData = () => {
    setRecipients(quote.customer?.email ?? '');
    setQuotes([quote]);
    setLoading(true);
  };

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!recipients) return;
    const emailArgs: Email = {
      subject: `Midwest Diesel Quote`,
      body: `
        <style>
          table {
            border: 1px solid black;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border: 1px solid black;
          }
          th {
            background-color: #DDDCDC;
          }
        </style>
        <table>
          <thead>
            <tr>
              <th>Qty</th>
              <th>Part Number</th>
              <th>Description</th>
              <th>Unit Price</th>
              <th>Total Price</th>
              <th>Condition</th>
            </tr>
          </thead>
          <tbody>
            ${quotes.map((quote) => {
    const quoteArgs = {
      quoteId: quote.id,
      date: formatDate(quote.date),
      customer: quote.customer,
      contact: quote.contact,
      qty: (quote.part && quote.part.qty) || 1,
      partNum: quote.partNum,
      desc: quote.desc,
      unitPrice: quote.price
    };

    return (`
      <tr>
        <td>${quoteArgs.qty}</td>
        <td>${quoteArgs.partNum}</td>
        <td>${quoteArgs.desc}</td>
        <td>${formatCurrency(quoteArgs.unitPrice)}</td>
        <td>${formatCurrency(quoteArgs.qty * (quoteArgs.unitPrice ?? 0))}</td>
        <td>${quote.part ? quote.part.condition : ''}</td>
      </tr>
      ${quote.piggybackQuotes.map((quote: PiggybackQuote) => {
        if (quote.addToEmail) {  
          return (`
            <tr>
              <td>${quoteArgs.qty}</td>
              <td>${quote.partNum}</td>
              <td>${quote.desc}</td>
              <td>${formatCurrency(quote.price)}</td>
              <td>${formatCurrency(quoteArgs.qty * quote.price)}</td>
              <td>${quote.part ? quote.part.condition : ''}</td>
            </tr>
          `);
        }
      })}  
    `);
  }).join('')}
          </tbody>
        </table>
      `,
      recipients: recipients.split(',').map((r) => r.trim()),
      attachments: []
    };
    invoke('new_email_draft', { emailArgs });
    clearData();
    setOpen(false);
  };

  const handleChangePage = async (_: any, page: number) => {
    const startIndex = (page - 1) * LIMIT;
    const endIndex = startIndex + LIMIT;
    setPaginatedQuotes(customerQuotes.slice(startIndex, endIndex));
  };

  const toggleQuoteSelected = (quote: Quote, selected: boolean) => {
    if (selected) {
      setQuotes(quotes.filter((q) => q.id !== quote.id));
    } else {
      setQuotes([...quotes, quote]);
    }
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Email Quotes"
      width={800}
    >
      <form onSubmit={handleEmail}>
        <Input
          variant={['label-bold', 'label-stack']}
          label="Recipients (seperated by comma)"
          value={recipients}
          onChange={(e: any) => setRecipients(e.target.value)}
          required
        />

        <h2>Selected Quotes: { quote.customer?.company }</h2>
        <div style={{ maxHeight: '10rem', overflowY: 'auto' }}>
          <Table>
            <thead>
              <th>Date</th>
              <th>Part Number</th>
              <th>Stock Number</th>
              <th>Description</th>
              <th>Total Price</th>
            </thead>
            <tbody>
              {quotes.map((quote) => {
                return (
                  <tr key={quote.id}>
                    <td>{ formatDate(quote.date) }</td>
                    <td>{ quote.partNum }</td>
                    <td>{ quote.stockNum }</td>
                    <td>{ quote.desc }</td>
                    <td>{ formatCurrency(quote.part ? (quote.price ?? 0) * quote.part.qty : quote.price) }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        <h2>Add Additional Quotes</h2>
        { loading && <Loading /> }
        {!loading &&
          <>
            <div style={{ maxHeight: '15rem', overflowY: 'auto' }}>
              <Table>
                <thead>
                  <th>Date</th>
                  <th>Part Number</th>
                  <th>Stock Number</th>
                  <th>Description</th>
                  <th>Total Price</th>
                </thead>
                <tbody>
                  {paginatedQuotes.map((quote) => {
                    const selected = quotes.some((q) => q.id === quote.id);
                    return (
                      <tr
                        key={quote.id}
                        style={selected ? { color: 'var(--yellow-1)', cursor: 'pointer' } : { cursor: 'pointer' }}
                        onClick={() => toggleQuoteSelected(quote, selected)}
                      >
                        <td>{ formatDate(quote.date) }</td>
                        <td>{ quote.partNum }</td>
                        <td>{ quote.stockNum }</td>
                        <td>{ quote.desc }</td>
                        <td>{ formatCurrency(quote.part ? (quote.price ?? 0) * quote.part.qty : quote.price) }</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            <Pagination
              data={customerQuotes}
              setData={handleChangePage}
              minData={pageCount}
              pageSize={LIMIT}
            />
          </>
        }

        <div className="form__footer">
          <Button type="submit" variant={['small']}>Email</Button>
        </div>
      </form>
    </Dialog>
  );
}
