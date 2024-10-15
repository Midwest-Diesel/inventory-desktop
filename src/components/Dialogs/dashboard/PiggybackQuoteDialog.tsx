import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import { addQuote, getQuotesCountByPartNum, getSomeQuotesByPartNum, piggybackQuote, searchQuotes } from "@/scripts/controllers/quotesController";
import Table from "@/components/Library/Table";
import { formatDate } from "@/scripts/tools/stringUtils";
import Pagination from "@/components/Library/Pagination";
import { useAtom } from "jotai";
import { quotesAtom, userAtom } from "@/scripts/atoms/state";
import Button from "@/components/Library/Button";
import { getCustomerById } from "@/scripts/controllers/customerController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  part: Part
}


export default function PiggybackQuoteDialog({ open, setOpen, part }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [quotesData, setQuotesData] = useAtom<Quote[]>(quotesAtom);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quoteCount, setQuoteCount] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isEngineQuotes, setIsEngineQuotes] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      resetQuotesList();
    };
    fetchData();
  }, [open, isEngineQuotes]);

  const resetQuotesList = async () => {
    const pageCount = await getQuotesCountByPartNum(isEngineQuotes, part.partNum);
    setQuoteCount(pageCount);
    const res = await getSomeQuotesByPartNum(1, 26, part.partNum, isEngineQuotes);
    setQuotesData(res);
    setQuotes(res);
  };
  
  const handleChangePage = async (data: any, page: number) => {
    if (page === currentPage) return;
    const res = await getSomeQuotesByPartNum(page, 26, part.partNum, isEngineQuotes);
    setQuotes(res);
    setCurrentPage(page);
  };

  const handlePiggybackQuote = async () => {
    const customerId = Number(localStorage.getItem('customerId'));
    const customer = await getCustomerById(customerId) as Customer;
    const newQuote = {
      date: new Date(),
      customer: customer,
      contact: customer ? customer.contact : null,
      phone: customer ? customer.phone : null,
      state: customer ? customer.billToState : null,
      partNum: part.partNum,
      desc: part.desc,
      stockNum: part.stockNum,
      price: 0,
      notes: part.desc,
      salesmanId: user.id,
      sale: false,
      followedUp: false,
      rating: part.rating,
      toFollowUp: false,
      followUpNotes: '',
      email: customer ? customer.email : null,
      partId: part.id
    } as any;
    const id = await addQuote(newQuote, user.id) as any;
    await piggybackQuote(selectedQuoteId, id);
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Select Quote"
      width={600}
    >
      <div className="select-handwritten-dialog">
        <Button onClick={() => setIsEngineQuotes(!isEngineQuotes)}>Engine Quotes</Button>
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>Date</th>
              <th>Customer</th>
              <th>Part Num</th>
              <th>Desc</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote: Quote) => {
              return (
                <tr key={quote.id} onClick={() => setSelectedQuoteId(quote.id)} className={quote.id === selectedQuoteId ? 'select-handwritten-dialog--selected' : ''}>
                  <td>{ quote.id }</td>
                  <td>{ formatDate(quote.date) }</td>
                  <td>{ quote.customer.company }</td>
                  <td>{ quote.partNum }</td>
                  <td>{ quote.desc }</td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <Pagination
          data={quotesData}
          setData={handleChangePage}
          minData={quoteCount}
          pageSize={26}
        />
      </div>

      <Button onClick={handlePiggybackQuote}>Submit</Button>
    </Dialog>
  );
}
