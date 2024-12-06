import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { userAtom } from "@/scripts/atoms/state";
import { getSomeUnsoldItems } from "@/scripts/controllers/handwrittensController";
import { getSomeUnsoldQuotesByPartNum, toggleQuoteSold } from "@/scripts/controllers/quotesController";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}


export default function SalesEndOfDayDialog({ open, setOpen }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [itemsData, setItemsData] = useState<SalesEndOfDayItem[]>([]);
  const [items, setItems] = useState<SalesEndOfDayItem[]>([]);
  const [itemsMin, setItemsMin] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<SalesEndOfDayItem>(null);
  const [quotesData, setQuotesData] = useState<Quote[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesMin, setQuotesMin] = useState<number[]>([]);
  const [showAlts, setShowAlts] = useState(true);
  const [openNewQuoteDialog, setOpenNewQuoteDialog] = useState(false);
  const LIMIT = 40;
  
  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      const res = await getSomeUnsoldItems(1, LIMIT, user.id);
      setItemsMin(res.minItems);
      setItemsData(res.rows);
    };
    fetchData();
  }, [open]);

  useEffect(() => {
    const fetchData = async () => {
      if (!open || !selectedItem) return;
      const res = await getSomeUnsoldQuotesByPartNum(1, LIMIT, selectedItem.partNum, showAlts);
      setQuotesData(res.rows);
      setQuotesMin(res.minQuotes);
    };
    fetchData();
  }, [open, showAlts]);

  const handleChangeItemsPage = async (data: any, page: number) => {
    if (!open) return;
    const res = await getSomeUnsoldItems(page, LIMIT, user.id);
    setItems(res.rows);
  };

  const handleChangeQuotesPage = async (data: any, page: number) => {
    if (!open) return;
    const res = await getSomeUnsoldQuotesByPartNum(page, LIMIT, selectedItem.partNum, showAlts);
    setQuotes(res.rows);
  };

  const handleMarkQuoteSold = async (quote: Quote) => {
    await toggleQuoteSold({ ...quote, sale: true });
    setQuotes(quotes.filter((q) => q.id !== quote.id));
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Sales End of Day"
      maxHeight="30rem"
      width={800}
      className="sales-end-of-day-dialog"
    >
      {!selectedItem ?
        <>
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill to Company</th>
                <th>Part Number</th>
                <th>Description</th>
                <th>Unit Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                return (
                  <tr key={item.id}>
                    <td>{ formatDate(item.date) }</td>
                    <td>{ item.billToCompany }</td>
                    <td>{ item.partNum }</td>
                    <td>{ item.desc }</td>
                    <td>{ formatCurrency(item.unitPrice) }</td>
                    <td><Button onClick={() => setSelectedItem(item)}>Open</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination
            data={itemsData}
            setData={handleChangeItemsPage}
            minData={itemsMin}
            pageSize={LIMIT}
          />
        </>
        :
        <>
          <div className="sales-end-of-day-dialog__top-buttons">
            <Button onClick={() => setSelectedItem(null)}>Back</Button>
            <Button onClick={() => setShowAlts(!showAlts)}>{ showAlts ? 'Hide' : 'Show' } Alternates</Button>
            <Button onClick={() => setOpenNewQuoteDialog(true)}>New Quote</Button>
          </div>
          <h2>{ selectedItem.billToCompany }</h2>
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Salesman</th>
                <th>Contact</th>
                <th>Part Number</th>
                <th>Description</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => {
                return (
                  <tr key={quote.id}>
                    <td>{ formatDate(quote.date) }</td>
                    <td>{ quote.salesman }</td>
                    <td>{ quote.contact }</td>
                    <td>{ quote.partNum }</td>
                    <td>{ quote.desc }</td>
                    <td>{ formatCurrency(quote.price) }</td>
                    <td><Button onClick={() => handleMarkQuoteSold(quote)}>Sold</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination
            data={quotesData}
            setData={handleChangeQuotesPage}
            minData={quotesMin}
            pageSize={LIMIT}
          />
        </>
      }
    </Dialog>
  );
}