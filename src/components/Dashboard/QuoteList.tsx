/* eslint-disable */
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import Button from "../Library/Button";
import QuoteSearchDialog from "../Dialogs/dashboard/QuoteSearchDialog";
import { useAtom } from "jotai";
import { lastPartSearchAtom, quotesAtom, selectedCustomerAtom, userAtom } from "@/scripts/atoms/state";
import EditQuoteDialog from "@/components/Dialogs/dashboard/EditQuoteDialog";
import { addQuote, deleteQuote, getQuotesCount, getSomeQuotes, searchQuotes, toggleAddToEmail, toggleQuoteSold } from "@/scripts/controllers/quotesController";
import Table from "@/components/Library/Table";
import Pagination from "@/components/Library/Pagination";
import { formatCurrency, formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import Checkbox from "@/components/Library/Checkbox";
import { getPartById, getPartByPartNum } from "@/scripts/controllers/partsController";
import { invoke } from "@/scripts/config/tauri";
import PiggybackQuoteDialog from "../Dialogs/dashboard/PiggybackQuoteDialog";
import Link from "../Library/Link";
import SalesEndOfDayDialog from "../Dialogs/dashboard/SalesEndOfDayDialog";
import Toast from "../Library/Toast";
import { confirm } from "@/scripts/config/tauri";
import EmailQuotesDialog from "../Dialogs/dashboard/EmailQuotesDialog";

interface Props {
  quotes: Quote[]
  setQuotes: (quotes: Quote[]) => void
  setSelectHandwrittenOpen: (value: boolean) => void
  setSelectedHandwrittenPart: (part: Part) => void
  setHandwrittenCustomer: (customer: Customer) => void
  setHandwrittenQuote: (quote: Quote) => void
}


export default function QuoteList({ quotes, setQuotes, setSelectHandwrittenOpen, setSelectedHandwrittenPart, setHandwrittenCustomer, setHandwrittenQuote }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [quotesData, setQuotesData] = useAtom<Quote[]>(quotesAtom);
  const [count, setCount] = useState<number[]>([]);
  const [quotesOpen, setQuotesOpen] = useState(localStorage.getItem('quotesOpen') === 'true' || localStorage.getItem('quotesOpen') === null ? true : false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [quoteEdited, setQuoteEdited] = useState<Quote>(null);
  const [quoteListType, setQuoteListType] = useState('part');
  const [lastSearch] = useAtom<string>(lastPartSearchAtom);
  const [selectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [paginatedQuotes, setPaginatedQuotes] = useState<Quote[]>([]);
  const [expandedQuotes, setExpandedQuotes] = useState<number[]>([]);
  const [filterByCustomer, setFilterByCustomer] = useState(true);
  const [piggybackQuoteOpen, setPiggybackQuoteOpen] = useState(false);
  const [piggybackQuote, setPiggybackQuote] = useState<Quote>(null);
  const [endOfDayOpen, setEndOfDayOpen] = useState(false);
  const [showingSearchResults, setShowingSearchResults] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [quoteEmailed, setQuoteEmailed] = useState<Quote>(null);
  const search = localStorage.getItem('altPartSearches') || localStorage.getItem('partSearches') || null;
  const [page, setPage] = useState(1);
  const LIMIT = 26;

  useEffect(() => {
    const fetchData = async () => {
      await handleChangePage(null, 1);

      if (!localStorage.getItem('customerId')) {
        setFilterByCustomer(false);
      } else {
        setFilterByCustomer(true);
      }
    };
    fetchData();
  }, [lastSearch, selectedCustomer, quotesData]);

  useEffect(() => {
    const fetchData = async () => {
      const pageCount = await getQuotesCount(search && JSON.parse(search).length > 1 ? JSON.parse(search).partNum : '', filterByCustomer ? selectedCustomer.id : null, quoteListType === 'engine');
      setCount(pageCount);
      await handleChangePage(null, 1);
    };
    fetchData();
  }, [filterByCustomer]);

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
      date: new Date(),
      source: null,
      customerId: selectedCustomer.id,
      contact: selectedCustomer ? selectedCustomer.contact : '',
      phone: selectedCustomer ? selectedCustomer.phone : '',
      state: selectedCustomer ? selectedCustomer.billToState : '',
      partNum: null,
      desc: '',
      stockNum: null,
      price: 0,
      notes: null,
      salesmanId: user.id,
      rating: 0,
      email: selectedCustomer.email,
      partId: null
    };
    await addQuote(newQuote);
    setQuotes(await getSomeQuotes(page, LIMIT, lastSearch, selectedCustomer.id, quoteListType === 'engine'));
    setToastOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!await confirm('Are you sure you want to delete this quote?')) return;
    await deleteQuote(id);
    setQuotes(quotes.filter((quote) => quote.id !== id));
    setExpandedQuotes([]);
  };

  const invoiceQuote = async (quote: Quote) => {
    if (!quote.customer || !quote.part) return;
    const part = (
      quote.part ?
        await getPartById(quote.part.id)
        :
        await getPartByPartNum(quote.partNum)
    );
    setSelectHandwrittenOpen(true);
    setSelectedHandwrittenPart(part);
    setHandwrittenCustomer(quote.customer);
    setHandwrittenQuote(quote);
  };

  const handleEmail = (quote: Quote) => {
    if (!quote.customer) return;
    setEmailDialogOpen(true);
    setQuoteEmailed(quote);
  };

  const handleChangePage = async (_: any, page: number) => {
    if (!selectedCustomer.id && localStorage.getItem('customerId')) return;
    if (showingSearchResults) {
      const res = await searchQuotes({ ...JSON.parse(localStorage.getItem('quoteSearch')), page });
      setPaginatedQuotes(res.rows);
      setCount(res.minItems);
    } else {
      const res = await getSomeQuotes(page, LIMIT, search ? JSON.parse(search).partNum : '', filterByCustomer ? selectedCustomer.id : null, quoteListType === 'engine');
      setPaginatedQuotes(res);
      if (filterByCustomer) {
        const pageCount = await getQuotesCount(search && JSON.parse(search).length > 1 ? JSON.parse(search).partNum : '', selectedCustomer.id, quoteListType === 'engine');
        setCount(pageCount);
      }
      if (res.length === 0 && filterByCustomer) setFilterByCustomer(false);
    }
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

  const handleAddToEmail = async (id: number, value: boolean) => {
    await toggleAddToEmail(id, value);
    await handleChangePage(null, page);
  };

  const quotePiggyback = (quote: Quote) => {
    setPiggybackQuoteOpen(true);
    setPiggybackQuote(quote);
  };

  const handleQuoteSale = async (e: any, quote: Quote) => {
    if (!await confirm(`Mark quote as ${e.target.checked ? 'Sold' : 'Unsold'}`)) return;
    await toggleQuoteSold({ ...quote, sale: !e.target.checked });
    setQuotes(quotes.map((q) => q.id === quote.id ? { ...q, sale: !e.target.checked } : q));
    setQuotesData(quotesData.map((q) => q.id === quote.id ? { ...q, sale: !e.target.checked } : q));
  };


  return (
    <div className="quote-list">
      <Toast msg="Created quote" type="success" open={toastOpen} setOpen={setToastOpen} />

      <div className="quote-list__header no-select" onClick={toggleQuotesOpen}>
        <h2>Part Quotes</h2>
        <Image src={`/images/icons/arrow-${quotesOpen ? 'up' : 'down'}.svg`} alt="arrow" width={25} height={25} />
      </div>

      {quoteEmailed &&
        <EmailQuotesDialog
          open={emailDialogOpen}
          setOpen={setEmailDialogOpen}
          quote={quoteEmailed}
        />
      }

      <QuoteSearchDialog
        open={searchDialogOpen}
        setOpen={setSearchDialogOpen}
        setQuotes={setPaginatedQuotes}
        setCount={setCount}
        setShowingSearchResults={setShowingSearchResults}
        limit={LIMIT}
        page={page}
      />
      <SalesEndOfDayDialog open={endOfDayOpen} setOpen={setEndOfDayOpen} />
      { quoteEdited && <EditQuoteDialog setQuoteEdited={setQuoteEdited} quote={quoteEdited} setQuote={(q: Quote) => handleEdit(q)} /> }
      { piggybackQuote &&
        <PiggybackQuoteDialog
          open={piggybackQuoteOpen}
          setOpen={setPiggybackQuoteOpen}
          quote={piggybackQuote}
          handleChangeQuotesPage={handleChangePage}
          quotesPage={page}
        />
      }

      {quotesOpen &&
        <>
          <div className="quote-list-top-bar">
            <Button onClick={() => setSearchDialogOpen(true)}>Search</Button>
            {/* <Button onClick={() => setQuoteListType(quoteListType === 'part' ? 'engine' : 'part')}>
              { quoteListType === 'part' ? 'Engine Quotes' : 'Part Quotes' }
            </Button> */}
            <Button onClick={handleNewQuote}>New</Button>
            <Button
              onClick={() => setFilterByCustomer(!filterByCustomer)}
              disabled={!localStorage.getItem('customerId') && true}
            >
              {filterByCustomer ? 'No Customer Filter' : 'Filter by Customer'}
            </Button>
            <Button onClick={() => setEndOfDayOpen(true)}>Sales End of Day</Button>
          </div>

          <div style={{ height: '21.5rem', width: 'fit-content', overflow: 'auto' }}>
            <Table data-id="part-quotes">
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
                {paginatedQuotes.length === 0 && <tr><td colSpan={15} style={{ margin: '0.6rem 0' }}>No results...</td></tr>}
                {paginatedQuotes.map((quote: Quote, i) => {
                  const isExpanded = expandedQuotes.includes(quote.id);
                  return (
                    <Fragment key={i}>
                      <tr>
                        <td rowSpan={isExpanded ? 2 : 1}>
                          {quote.piggybackQuotes.length > 0 &&
                            <Button variant={['no-style']} onClick={() => toggleExpandedQuotes(quote.id, !isExpanded)}>
                              <Image src={`/images/icons/arrow-${isExpanded ? 'up' : 'down'}.svg`} alt="Arrow" width={25} height={25} />
                            </Button>
                          }
                        </td>
                        <td className="table-buttons table-buttons--grid quote-list__btn-grid">
                          <Button variant={['fit']} onClick={() => quotePiggyback(quote)}>
                            <Image alt="Quote piggyback" src="/images/icons/box-arrow-up.svg" width={17} height={17} />
                          </Button>
                          <Button variant={['fit']} onClick={() => setQuoteEdited(quote)}>
                            <Image alt="Edit" src="/images/icons/edit.svg" width={17} height={17} />
                          </Button>
                          {quote.customer &&
                            <Button variant={['fit']} onClick={() => handleEmail(quote)}>
                              <Image alt="Email" src="/images/icons/email.svg" width={17} height={17} />
                            </Button>
                          }
                          <Button variant={['fit']} onClick={() => invoiceQuote(quote)} data-id="invoice-btn">
                            <Image alt="Add to handwritten" src="/images/icons/invoice.svg" width={17} height={17} />
                          </Button>
                          <Button variant={['fit', 'danger']} onClick={() => handleDelete(quote.id)} data-id="delete-quote">
                            <Image alt="Delete" src="/images/icons/delete.svg" width={17} height={17} />
                          </Button>
                        </td>
                        <td>{ formatDate(quote.date) }</td>
                        <td>{ quote.salesman }</td>
                        <td>{ quote.source }</td>
                        <td style={{ width: '15rem' }}>{ quote.customer && <Link href={`/customer/${quote.customer.id}`}>{ quote.customer.company }</Link> }</td>
                        <td>{ quote.contact }</td>
                        <td style={{ width:'7.5rem' }}>{ formatPhone(quote.customer?.phone) }</td>
                        <td>{ quote.customer?.billToState }</td>
                        <td>
                          {quote.part ?
                            <Link href={`/part/${quote.part.id}`}>{ quote.partNum }</Link>
                            :
                            quote.partNum
                          }
                        </td>
                        <td style={{ width: '15rem' }}>{ quote.desc }</td>
                        <td>{ quote.stockNum }</td>
                        <td>{ formatCurrency(quote.price) }</td>
                        <td>{ quote.notes }</td>
                        <td className="cbx-td" style={ quote.sale ? { backgroundColor: 'var(--green-dark-2)' } : null}>
                          <Checkbox
                            checked={quote.sale}
                            onChange={(e) => handleQuoteSale(e, quote)}
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
                                        {piggybackQuote.part ?
                                          <Link href={`/part/${piggybackQuote.part.id}`}>{ piggybackQuote.partNum }</Link>
                                          :
                                          <p>{ piggybackQuote.partNum }</p>
                                        }
                                        <p><strong>{ piggybackQuote.desc }</strong></p>
                                        <p><em>{ piggybackQuote.part && piggybackQuote.part.remarks }</em></p>
                                        <Checkbox
                                          label="Add to Email"
                                          variant={['label-bold', 'label-align-center', 'label-vertical-align']}
                                          checked={piggybackQuote.addToEmail}
                                          onChange={(e: any) => handleAddToEmail(quote.id, e.target.checked)}
                                        />
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
              pageSize={LIMIT}
            />
          </div>
        </>
      }
    </div>
  );
}
