import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Pagination from "@/components/library/Pagination";
import Table from "@/components/library/Table";
import { useToast } from "@/hooks/useToast";
import { userAtom } from "@/scripts/atoms/state";
import { getSomeUnsoldItems } from "@/scripts/services/handwrittensService";
import { addQuote, editQuote, getSomeUnsoldQuotesByPartNum, toggleQuoteSold } from "@/scripts/services/quotesService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}


const LIMIT = 80;

export default function SalesEndOfDayDialog({ open, setOpen }: Props) {
  const toast = useToast();
  const [user] = useAtom<User>(userAtom);
  const [selectedItem, setSelectedItem] = useState<SalesEndOfDayItem | null>(null);
  const [showAlts, setShowAlts] = useState(true);
  const [itemsPage, setItemsPage] = useState(1);
  const [quotesPage, setQuotesPage] = useState(1);

  const { data: items = { pageCount: 0, rows: [] }, refetch: refetchItems } = useQuery<{ pageCount: number, rows: SalesEndOfDayItem[] }>({
    queryKey: ['items', open, itemsPage],
    queryFn: () => getSomeUnsoldItems(itemsPage, LIMIT, user.id),
    enabled: !!open
  });

  const { data: quotes = { pageCount: 0, rows: [] }, refetch: refetchQuotes } = useQuery<{ pageCount: number, rows: Quote[] }>({
    queryKey: ['quotes', open, selectedItem, showAlts, quotesPage],
    queryFn: () => getSomeUnsoldQuotesByPartNum(quotesPage, LIMIT, selectedItem!.partNum, selectedItem!.customer.id, showAlts),
    enabled: !!open && !!selectedItem
  });

  useEffect(() => {
    handleChangeItemsPage(null, 1);
  }, [open]);

  const handleChangeItemsPage = async (_: any, page: number) => {
    if (!open) return;
    setItemsPage(page);
  };

  const handleChangeQuotesPage = async (_: any, page: number) => {
    if (!open) return;
    setQuotesPage(page);
  };

  const handleMarkQuoteSold = async (quote: Quote) => {
    await editQuote({ ...quote, sale: true, handwrittenItemId: selectedItem?.id } as Quote);
    refetchQuotes();
    refetchItems();
    setSelectedItem(null);
  };

  const handleNewQuote = async () => {
    const quote: any = {
      date: new Date(),
      source: null,
      customerId: selectedItem?.customer.id,
      contact: selectedItem?.customer.contact,
      phone: selectedItem?.customer.phone,
      state: selectedItem?.customer.billToState,
      partNum: selectedItem?.partNum,
      desc: selectedItem?.desc,
      stockNum: selectedItem?.part?.stockNum,
      price: selectedItem?.unitPrice,
      notes: '',
      rating: selectedItem?.part?.rating ?? 0,
      email: selectedItem?.customer.email,
      salesmanId: user.id,
      partId: selectedItem?.part?.id,
      handwrittenItemId: selectedItem?.id
    };
    const id = await addQuote(quote);
    await toggleQuoteSold(id, true);
    refetchQuotes();
    refetchItems();
    setSelectedItem(null);
    toast.sendToast('Created quote', 'success');
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Sales End of Day"
      width={800}
      className="sales-end-of-day-dialog"
    >
      {!selectedItem ?
        <>
          <div className="sales-end-of-day-dialog__table-container">
            <h4>Sold Items</h4>
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
                {items.rows.map((item) => {
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
          </div>

          <Pagination
            data={items.rows}
            setData={handleChangeItemsPage}
            pageCount={items.pageCount}
            pageSize={LIMIT}
          />
        </>
        :
        <>
          <div className="sales-end-of-day-dialog__top-buttons">
            <Button onClick={() => setSelectedItem(null)}>Back</Button>
            <Button onClick={() => setShowAlts(!showAlts)}>{ showAlts ? 'Hide' : 'Show' } Alternates</Button>
            <Button onClick={handleNewQuote}>New Quote</Button>
          </div>
          <h2>{ selectedItem.billToCompany }</h2>
          <h4>Quotes</h4>
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
              {quotes.rows.map((quote) => {
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
            data={quotes.rows}
            setData={handleChangeQuotesPage}
            pageCount={quotes.pageCount}
            pageSize={LIMIT}
          />
        </>
      }
    </Dialog>
  );
}
