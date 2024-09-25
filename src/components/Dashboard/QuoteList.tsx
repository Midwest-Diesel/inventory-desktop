import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import Button from "../Library/Button";
import QuoteSearchDialog from "../Dialogs/dashboard/QuoteSearchDialog";
import { useAtom } from "jotai";
import { lastPartSearchAtom, quotesAtom, selectedCustomerAtom, userAtom } from "@/scripts/atoms/state";
import EditQuoteDialog from "@/components/Dialogs/dashboard/EditQuoteDialog";
import { addQuote, deleteQuote, getQuotesCount, getSomeQuotes, toggleQuoteSold } from "@/scripts/controllers/quotesController";
import Table from "@/components/Library/Table";
import Pagination from "@/components/Library/Pagination";
import { formatCurrency, formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import Link from "next/link";
import Checkbox from "@/components/Library/Checkbox";
import { newDraftEmail } from "@/scripts/config/outlook";
import { getPartByPartNum } from "@/scripts/controllers/partsController";

interface Props {
  selectHandwrittenOpen: boolean
  setSelectHandwrittenOpen: (value: boolean) => void
  setSelectedHandwrittenPart: (part: Part) => void
}


export default function QuoteList({ selectHandwrittenOpen, setSelectHandwrittenOpen, setSelectedHandwrittenPart }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [quotesData, setQuotesData] = useAtom<Quote[]>(quotesAtom);
  const [quotes, setQuotes] = useState<Quote[]>(quotesData);
  const [count, setCount] = useState<number[]>([]);
  const [quotesOpen, setQuotesOpen] = useState(localStorage.getItem('quotesOpen') === 'true' || localStorage.getItem('quotesOpen') === null ? true : false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [quoteEdited, setQuoteEdited] = useState<Quote>(null);
  const [quoteListType, setQuoteListType] = useState('part');
  const [lastSearch] = useAtom<string>(lastPartSearchAtom);
  const [selectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [paginatedQuotes, setPaginatedQuotes] = useState<Quote[]>([]);
  const [expandedQuotes, setExpandedQuotes] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const pageCount = await getQuotesCount(lastSearch, selectedCustomer.id, quoteListType === 'engine');
      setCount(pageCount);
      await handleChangePage(null, 1);
    };
    fetchData();
  }, [lastSearch, selectedCustomer, quotesData]);


  const toggleQuotesOpen = () => {
    localStorage.setItem('quotesOpen', `${!quotesOpen}`);
    setQuotesOpen(!quotesOpen);
  };

  const handleEdit = (quote: Quote) => {
    const index = quotes.findIndex((q) => q.id === quote.id);
    const newQuotes = [...quotes];
    newQuotes[index] = quote;
    setQuotes(newQuotes);
  };

  const handleNewQuote = async () => {
    const newQuote = {
      customer: null,
      date: new Date(),
      source: null,
      contact: '',
      phone: null,
      state: '',
      partNum: '',
      stockNum: '',
      desc: '',
      price: 0,
      notes: '',
    } as Quote;
    await addQuote(newQuote, user.id);
    setQuotes(await getSomeQuotes(page, 26, lastSearch, selectedCustomer.id, quoteListType === 'engine'));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    await deleteQuote(id);
    setQuotes(quotes.filter((quote) => quote.id !== id));
  };

  const invoiceQuote = async (quote: Quote) => {
    if (!confirm('Are you sure you want to invoice this quote?')) return;
    toggleQuoteSold({ ...quote, sale: true });
    setQuotes(quotes.map((q) => q.id === quote.id ? { ...q, sale: true } : q));

    const part = await getPartByPartNum(quote.partNum);
    if (selectHandwrittenOpen) setSelectHandwrittenOpen(false);
    setTimeout(() => setSelectHandwrittenOpen(true), 1);
    setSelectedHandwrittenPart(part);
  };

  const handleEmail = async (quote: Quote) => {
    const recipient = prompt('Enter recipient', quote.customer.email || '');
    if (!recipient) return;
    // const email = `mailto:${recipient}?subject=Quote&body=Quote%20Part%0A`;
    // window.location.href = email;
    const email: Email = {
      subject: 'Quote',
      body: {
        contentType: 'HTML',
        content: `${quote.desc}`
      },
      toRecipients: [{
        emailAddress: { address: recipient }
      }]
    };
    await newDraftEmail(email);
  };

  const handleChangePage = async (data: any, page: number) => {
    if (!selectedCustomer.id && localStorage.getItem('customerId')) return;
    const res = await getSomeQuotes(page, 26, lastSearch, selectedCustomer.id, quoteListType === 'engine');
    setPaginatedQuotes(res);
    setPage(page);
  };

  const toggleExpandedQuotes = (i: number, isExpanded: boolean) => {
    let arr = [...expandedQuotes];
    if (isExpanded) {
      arr.push(i);
    } else {
      arr = arr.filter((num) => num !== i);
    }
    setExpandedQuotes(arr);
  };


  return (
    <div className="quote-list">
      <div className="quote-list__header no-select" onClick={toggleQuotesOpen}>
        <h2>Quotes</h2>
        <Image src={`/images/icons/arrow-${quotesOpen ? 'up' : 'down'}.svg`} alt="arrow" width={25} height={25} />
      </div>
      <QuoteSearchDialog open={searchDialogOpen} setOpen={setSearchDialogOpen} setQuotes={setQuotes} />
      { quoteEdited && <EditQuoteDialog setQuoteEdited={setQuoteEdited} quote={quoteEdited} setQuote={(q: Quote) => handleEdit(q)} /> }

      {quotesOpen &&
        <>
          <div className="quote-list-top-bar">
            <Button onClick={() => setSearchDialogOpen(true)}>Search</Button>
            {/* <Button onClick={() => setQuoteListType(quoteListType === 'part' ? 'engine' : 'part')}>
              { quoteListType === 'part' ? 'Engine Quotes' : 'Part Quotes' }
            </Button> */}
            <Button onClick={handleNewQuote}>New</Button>
          </div>

          <div style={{ height: '21.5rem', width: 'fit-content', overflow: 'auto' }}>
            <Table data-cy="part-quotes">
              <thead>
                <tr>
                  <th></th>
                  <th></th>
                  <th>Date</th>
                  <th>Qtd By</th>
                  <th>Source</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Phone</th>
                  <th>St.</th>
                  <th>Part Number</th>
                  <th>Description</th>
                  <th>Stock Number</th>
                  <th>Price</th>
                  <th>Notes</th>
                  <th>Sale</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuotes.map((quote: Quote, i) => {
                  const isExpanded = expandedQuotes.includes(i);
                  return (
                    <Fragment key={i}>
                      <tr style={ quote.sale ? { backgroundColor: 'var(--green-dark-2)' } : null}>
                        <td rowSpan={isExpanded ? 2 : 1}>
                          {quote.piggybackQuotes.length > 0 &&
                            <Button variant={['no-style']} onClick={() => toggleExpandedQuotes(i, !isExpanded)}>
                              <Image src={`/images/icons/arrow-${isExpanded ? 'up' : 'down'}.svg`} alt="Arrow" width={25} height={25} />
                            </Button>
                          }
                        </td>
                        <td className="table-buttons">
                          {!quote.sale && <Button variant={['x-small']} onClick={() => invoiceQuote(quote)} data-cy="invoice-btn">Invoice</Button>}
                          <Button variant={['x-small']} onClick={() => setQuoteEdited(quote)}>Edit</Button>
                          <Button variant={['x-small']} onClick={() => handleEmail(quote)}>Email</Button>
                          <Button variant={['x-small', 'danger']} onClick={() => handleDelete(quote.id)} data-cy="delete-quote">Delete</Button>
                        </td>
                        <td>{ formatDate(quote.date) }</td>
                        <td>{ quote.salesman }</td>
                        <td>{ quote.source }</td>
                        <td style={{ width: '15rem' }}>{ quote.customer && <Link href={`/customer/${quote.customer.id}`}>{ quote.customer.company }</Link> }</td>
                        <td>{ quote.contact }</td>
                        <td style={{ width:'7.5rem' }}>{ quote.phone && formatPhone(quote.phone) }</td>
                        <td>{ quote.state }</td>
                        <td><Link href={`/part/${quote.partNum}`}>{ quote.partNum }</Link></td>
                        <td style={{ width: '15rem' }}>{ quote.desc }</td>
                        <td>{ quote.stockNum }</td>
                        <td>{ formatCurrency(quote.price) }</td>
                        <td>{ quote.notes }</td>
                        <td className="cbx-td">
                          <Checkbox
                            checked={quote.sale}
                            onChange={(e: any) => {
                              toggleQuoteSold({ ...quote, sale: e.target.checked });
                              setQuotes(quotes.map((q) => q.id === quote.id ? { ...q, sale: e.target.checked } : q));
                              setQuotesData(quotesData.map((q) => q.id === quote.id ? { ...q, sale: e.target.checked } : q));
                            }}
                          />
                        </td>
                      </tr>

                      {isExpanded &&
                        <>
                          <tr>
                            <td colSpan={14} className="piggyback-quotes">
                              <h4>Piggyback Quotes</h4>
                              <ul>
                                {quote.piggybackQuotes.map((piggybackQuote: PiggybackQuote) => {
                                  return (
                                    <li key={piggybackQuote.id}>
                                      <div className="piggyback-quotes__item">
                                        <Link href={`/part/${piggybackQuote.partNum}`}>{ piggybackQuote.partNum }</Link>
                                        <p>{ piggybackQuote.notes }</p>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </td>
                          </tr>
                          <tr></tr>
                        </>
                      }
                    </Fragment>
                  );
                })}
              </tbody>
            </Table>

            <Pagination
              data={quotes}
              setData={handleChangePage}
              minData={count}
              pageSize={26}
            />
          </div>
        </>
      }
    </div>
  );
}
