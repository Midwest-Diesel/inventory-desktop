import QuoteList from "@/components/Dashboard/QuoteList";
import EditQuoteDialog from "@/components/Dialogs/dashboard/EditQuoteDialog";
import EmailQuotesDialog from "@/components/Dialogs/dashboard/EmailQuotesDialog";
import PiggybackQuoteDialog from "@/components/Dialogs/dashboard/PiggybackQuoteDialog";
import QuoteSearchDialog from "@/components/Dialogs/dashboard/QuoteSearchDialog";
import SalesEndOfDayDialog from "@/components/Dialogs/dashboard/SalesEndOfDayDialog";
import Button from "@/components/Library/Button";
import Toast from "@/components/Library/Toast";
import { lastPartSearchAtom, quotesAtom, selectedCustomerAtom, userAtom } from "@/scripts/atoms/state";
import { getCustomerById } from "@/scripts/services/customerService";
import { getPartById } from "@/scripts/services/partsService";
import { addQuote, getSomeQuotes, searchQuotes } from "@/scripts/services/quotesService";
import { isObjectNull } from "@/scripts/tools/utils";
import { useAtom } from "jotai";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
  quotes: Quote[]
  setQuotes: (quotes: Quote[]) => void
  setHandwrittenQuote: (quote: Quote | null) => void
  setHandwrittenCustomer: (customer: Customer | null) => void
  setSelectHandwrittenOpen: (value: boolean) => void
  setSelectedHandwrittenPart: (part: Part | null) => void
}


export default function QuotesSection({ quotes, setQuotes, setHandwrittenQuote, setHandwrittenCustomer, setSelectHandwrittenOpen, setSelectedHandwrittenPart }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [quotesData, setQuotesData] = useAtom<Quote[]>(quotesAtom);
  const [lastSearch] = useAtom<string>(lastPartSearchAtom);
  const [count, setCount] = useState<number[]>([]);
  const [quotesOpen, setQuotesOpen] = useState(localStorage.getItem('quotesOpen') === 'true' || localStorage.getItem('quotesOpen') === null ? true : false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [quoteEdited, setQuoteEdited] = useState<Quote | null>(null);
  const [quoteListType, setQuoteListType] = useState<'part' | 'engine'>('part');
  const [searchData, setSearchData] = useState<any>(null);
  const [selectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [filterByCustomer, setFilterByCustomer] = useState(false);
  const [filterByPart, setFilterByPart] = useState(false);
  const [piggybackQuoteOpen, setPiggybackQuoteOpen] = useState(false);
  const [piggybackQuote, setPiggybackQuote] = useState<Quote | null>(null);
  const [endOfDayOpen, setEndOfDayOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [quoteEmailed, setQuoteEmailed] = useState<Quote | null>(null);
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const partNumSearch = localStorage.getItem('altPartSearches') || localStorage.getItem('partSearches') || null;
  const partNum = partNumSearch ? JSON.parse(partNumSearch).partNum : '';
  const LIMIT = 26;

  useEffect(() => {
    setLoaded(true);
    const fetchData = async () => {
      if (isObjectNull(selectedCustomer)) {
        const res = await getCustomerById(Number(localStorage.getItem('customerId')));
        setCustomer(res ?? { id: 0 });
      } else {
        setCustomer(selectedCustomer);
        setFilterByCustomer(true);
      }
    };
    fetchData();
  }, [selectedCustomer]);

  useEffect(() => {
    if (!loaded) return;
    const fetchData = async () => {
      if (partNum?.trim().replace('*', '') !== '') {
        setFilterByPart(true);
      }
    };
    fetchData();
  }, [loaded, customer, lastSearch]);

  useEffect(() => {
    if (!loaded) return;
    setQuotesData([]);
  }, [filterByCustomer, filterByPart, quoteListType, customer]);

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
    const newQuote: any = {
      date: new Date(),
      source: null,
      customerId: customer?.id,
      contact: customer ? customer.contact : '',
      phone: customer ? customer.phone : '',
      state: customer ? customer.billToState : '',
      partNum: null,
      desc: '',
      stockNum: null,
      price: 0,
      notes: null,
      salesmanId: user.id,
      rating: 0,
      email: customer?.email,
      partId: null
    };
    await addQuote(newQuote);
    await onChangePage(null, page);
    setToastOpen(true);
    setFilterByCustomer(false);
    setFilterByPart(false);
    setQuoteListType('part');
  };

  const onChangePage = async (_: any, page: number, resetSearch = false) => {
    if (!loaded || !customer) return;
    if (searchData && !resetSearch) {
      const res = await searchQuotes({ ...searchData, page: (page - 1) * LIMIT, limit: LIMIT }, filterByCustomer ? customer.id : 0);
      setQuotes(res.rows);
      setCount(res.minItems);
      return;
    }

    const res = await getSomeQuotes(page, LIMIT, filterByPart ? partNum : '', filterByCustomer ? customer.id : 0, quoteListType === 'engine');
    setQuotes(res.rows);
    setCount(res.minItems);
    setPage(page);
  };

  const onInvoiceQuote = async (quote: Quote) => {
    if (!quote.customer || !quote.part) return;
    const part: Part | null = await getPartById(quote.part.id);
    setSelectHandwrittenOpen(true);
    if (part) setSelectedHandwrittenPart(part);
    setHandwrittenCustomer(quote.customer);
    setHandwrittenQuote(quote);
  };

  const onQuotePiggyback = (quote: Quote) => {
    setPiggybackQuoteOpen(true);
    setPiggybackQuote(quote);
  };

  const handleEmail = (quote: Quote) => {
    if (!quote.customer) return;
    setEmailDialogOpen(true);
    setQuoteEmailed(quote);
  };



  return (
    <div>
      <Toast msg="Created quote" type="success" open={toastOpen} setOpen={setToastOpen} />
      <div className="quote-list__header no-select" onClick={toggleQuotesOpen}>
        <h2>Quotes</h2>
        <Image src={`/images/icons/arrow-${quotesOpen ? 'up' : 'down'}.svg`} alt="arrow" width={25} height={25} />
      </div>

      {quoteEmailed &&
        <EmailQuotesDialog
          open={emailDialogOpen}
          setOpen={setEmailDialogOpen}
          quote={quoteEmailed}
        />
      }

      {searchDialogOpen &&
        <QuoteSearchDialog
          open={searchDialogOpen}
          setOpen={setSearchDialogOpen}
          setQuotes={setQuotes}
          setCount={setCount}
          filterByCustomer={filterByCustomer}
          searchData={searchData}
          setSearchData={setSearchData}
          backupFunction={onChangePage}
          limit={LIMIT}
          page={page}
        />
      }
      <SalesEndOfDayDialog open={endOfDayOpen} setOpen={setEndOfDayOpen} />
      { quoteEdited && <EditQuoteDialog setQuoteEdited={setQuoteEdited} quote={quoteEdited} setQuote={(q: Quote) => handleEdit(q)} /> }
      {piggybackQuote &&
        <PiggybackQuoteDialog
          open={piggybackQuoteOpen}
          setOpen={setPiggybackQuoteOpen}
          quote={piggybackQuote}
          handleChangeQuotesPage={onChangePage}
          quotesPage={page}
        />
      }

      <div className="quote-list-top-bar">
        <Button onClick={() => setSearchDialogOpen(true)}>Search</Button>
        <Button onClick={handleNewQuote}>New</Button>
        <Button onClick={() => setQuoteListType(quoteListType === 'part' ? 'engine' : 'part')} data-testid="engine-quotes-btn">
          { quoteListType === 'part' ? 'Engine Quotes' : 'Part Quotes' }
        </Button>
        <Button
          onClick={() => setFilterByCustomer(!filterByCustomer)}
          disabled={!localStorage.getItem('customerId') && true}
        >
          {filterByCustomer ? 'No Customer Filter' : 'Filter by Customer'}
        </Button>
        <Button
          onClick={() => setFilterByPart(!filterByPart)}
          disabled={partNum?.trim().replace('*', '') === ''}
        >
          {filterByPart ? 'No Part Filter' : 'Filter by Part'}
        </Button>
        <Button onClick={() => setEndOfDayOpen(true)}>Sales End of Day</Button>
      </div>

      {quotesOpen &&
        <QuoteList
          quotes={quotes}
          setQuotes={setQuotes}
          onInvoiceQuote={onInvoiceQuote}
          onChangePage={onChangePage}
          onQuotePiggyback={onQuotePiggyback}
          handleEmail={handleEmail}
          setQuoteEdited={setQuoteEdited}
          page={page}
          limit={LIMIT}
          count={count}
        />
      }
    </div>
  );
}
