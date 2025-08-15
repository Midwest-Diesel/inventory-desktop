/* eslint-disable */

import { Fragment, useState } from "react";
import Button from "../Library/Button";
import Table from "@/components/Library/Table";
import Pagination from "@/components/Library/Pagination";
import { formatCurrency, formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import Checkbox from "@/components/Library/Checkbox";
import Link from "../Library/Link";
import { ask } from "@/scripts/config/tauri";
import { deleteQuote, toggleAddToEmail, toggleQuoteSold } from "@/scripts/services/quotesService";
import { useAtom } from "jotai";
import { quotesAtom } from "@/scripts/atoms/state";
import { useTooltip } from "@/hooks/useTooltip";

interface Props {
  quotes: Quote[]
  setQuotes: (quotes: Quote[]) => void
  onInvoiceQuote: (quote: Quote) => void
  onChangePage: (data: any, page: number) => void
  onQuotePiggyback: (quote: Quote) => void
  handleEmail: (quote: Quote) => void
  setQuoteEdited: (quote: Quote | null) => void
  page: number
  limit: number
  count: number
}


export default function QuoteList({ quotes, setQuotes, onInvoiceQuote, onChangePage, onQuotePiggyback, handleEmail, setQuoteEdited, page, limit, count }: Props) {
  const tooltip = useTooltip();
  const [quotesData, setQuotesData] = useAtom<Quote[]>(quotesAtom);
  const [expandedQuotes, setExpandedQuotes] = useState<number[]>([]);

  const toggleExpandedQuotes = (i: number, isExpanded: boolean) => {
    let arr = [...expandedQuotes];
    if (isExpanded) {
      arr.push(i);
    } else {
      arr = arr.filter((num) => num !== i);
    }
    setExpandedQuotes(arr);
  };

  const handleDelete = async (id: number) => {
    if (!await ask('Are you sure you want to delete this quote?')) return;
    await deleteQuote(id);
    setQuotes(quotes.filter((quote) => quote.id !== id));
    setExpandedQuotes([]);
  };

  const handleAddToEmail = async (id: number, value: boolean) => {
    await toggleAddToEmail(id, value);
    await onChangePage(null, page);
  };

  const handleQuoteSale = async (e: any, quote: Quote) => {
    if (!await ask(`Mark quote as ${e.target.checked ? 'Sold' : 'Unsold'}`)) return;
    await toggleQuoteSold({ ...quote, sale: !e.target.checked });
    setQuotes(quotes.map((q) => q.id === quote.id ? { ...q, sale: !e.target.checked } : q));
    setQuotesData(quotesData.map((q) => q.id === quote.id ? { ...q, sale: !e.target.checked } : q));
  };
  

  return (
    <div className="quote-list">
      <div style={{ height: quotes.length > 3 ? '19rem' : 'fit-content', overflow: 'auto' }}>
        <Table data-testid="part-quotes">
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
            {quotes.length === 0 && <tr><td colSpan={15} style={{ margin: '0.6rem 0' }}>No results...</td></tr>}
            {quotes.map((quote: Quote, i) => {
              if (!quote) return;
              const isExpanded = expandedQuotes.includes(quote.id);
              return (
                <Fragment key={i}>
                  <tr>
                    <td rowSpan={isExpanded ? 2 : 1}>
                      {quote.piggybackQuotes.length > 0 &&
                        <Button variant={['no-style']} onClick={() => toggleExpandedQuotes(quote.id, !isExpanded)}>
                          <img src={`/images/icons/arrow-${isExpanded ? 'up' : 'down'}.svg`} alt="Arrow" width={25} height={25} />
                        </Button>
                      }
                    </td>
                    <td className="table-buttons table-buttons--grid quote-list__btn-grid">
                      <Button
                        variant={['fit']}
                        onClick={() => onQuotePiggyback(quote)}
                        onMouseEnter={() => tooltip.set('Piggyback Quote')}
                        onMouseLeave={() => tooltip.set('')}
                      >
                        <img alt="Quote piggyback" src="/images/icons/box-arrow-up.svg" width={17} height={17} />
                      </Button>
                      <Button
                        variant={['fit']}
                        onClick={() => setQuoteEdited(quote)}
                        onMouseEnter={() => tooltip.set('Edit')}
                        onMouseLeave={() => tooltip.set('')}
                      >
                        <img alt="Edit" src="/images/icons/edit.svg" width={17} height={17} />
                      </Button>
                      {quote.customer &&
                        <Button
                          variant={['fit']}
                          onClick={() => handleEmail(quote)}
                          onMouseEnter={() => tooltip.set('Email')}
                          onMouseLeave={() => tooltip.set('')}
                        >
                          <img alt="Email" src="/images/icons/email.svg" width={17} height={17} />
                        </Button>
                      }
                      <Button
                        variant={['fit']}
                        onClick={() => onInvoiceQuote(quote)}
                        data-testid="invoice-btn"
                        onMouseEnter={() => tooltip.set('Add to Handwritten')}
                        onMouseLeave={() => tooltip.set('')}
                      >
                        <img alt="Add to handwritten" src="/images/icons/invoice.svg" width={17} height={17} />
                      </Button>
                      <Button variant={['fit', 'danger']} onClick={() => handleDelete(quote.id)} data-testid="delete-quote">
                        <img alt="Delete" src="/images/icons/delete.svg" width={17} height={17} />
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
                    <td data-testid="quote-stock-num">{ quote.stockNum }</td>
                    <td>{ formatCurrency(quote.price) }</td>
                    <td>{ quote.notes }</td>
                    <td className="cbx-td" style={ quote.sale ? { backgroundColor: 'var(--green-dark-2)' } : {}}>
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
      </div>
      <Pagination
        data={quotesData}
        setData={onChangePage}
        pageCount={count}
        pageSize={limit}
      />
    </div>
  );
}
