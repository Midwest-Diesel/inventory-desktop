import Checkbox from "@/components/Library/Checkbox";
import Dialog from "@/components/Library/Dialog";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { getAllQuotesCount, getSomeUnsoldQuotes, toggleQuoteSold } from "@/scripts/controllers/quotesController";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}


export default function SalesEndOfDayDialog({ open, setOpen }: Props) {
  const [quotesData, setQuotesData] = useState<Quote[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesMin, setQuotesMin] = useState<number[]>([]);
  const LIMIT = 26;
  
  useEffect(() => {
    const fetchData = async () => {
      setQuotesMin(await getAllQuotesCount());
      const res = await getSomeUnsoldQuotes(1, LIMIT);
      setQuotesData(res);
    };
    fetchData();
  }, []);

  const handleChangePage = async (data: any, page: number) => {
    const res = await getSomeUnsoldQuotes(page, LIMIT);
    setQuotes(res);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Sales End of Day"
      maxHeight="30rem"
      width={600}
    >
      <Table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Part Number</th>
            <th>Description</th>
            <th>Unit Price</th>
            <th>Sale</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => {
            return (
              <tr key={quote.id}>
                <td>{ quote.customer && quote.customer.company }</td>
                <td>{ quote.part ? <Link href={`/part/${quote.part.id}`}>{quote.partNum}</Link> : quote.partNum }</td>
                <td>{ quote.desc }</td>
                <td>{ formatCurrency(quote.price) }</td>
                <td className="cbx-td" style={ quote.sale ? { backgroundColor: 'var(--green-dark-2)' } : null}>
                  <Checkbox
                    checked={quote.sale}
                    onChange={(e: any) => {
                      toggleQuoteSold({ ...quote, sale: e.target.checked });
                      const filteredQuotes = quotes.filter((q) => q.id !== quote.id);
                      setQuotes(filteredQuotes);
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination
        data={quotesData}
        setData={handleChangePage}
        minData={quotesMin}
        pageSize={LIMIT}
      />
    </Dialog>
  );
}
