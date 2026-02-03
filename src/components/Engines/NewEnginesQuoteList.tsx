import Table from "../library/Table";
import { formatCurrency, formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import Checkbox from "../library/Checkbox";
import Link from "@/components/library/Link";
import { useQuery } from "@tanstack/react-query";
import Button from "../library/Button";
import { EngineQuoteSearchData, searchEngineQuotes } from "@/scripts/services/quotesService";
import { useState } from "react";
import EngineQuoteSearchDialog from "./dialogs/EngineQuoteSearchDialog";

interface Props {
  model: string
  setEngine: (engine: Engine | null) => void
  setNewQuoteDialogOpen: (value: boolean) => void
}


export default function NewEnginesQuoteList({ model, setEngine, setNewQuoteDialogOpen }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchData, setSearchData] = useState<EngineQuoteSearchData>({ page: 1, limit: 99999, model });

  const { data: quotes = [] } = useQuery<EngineQuote[]>({
    queryKey: ['quotes', searchData, model],
    queryFn: async () => {
      const res = await searchEngineQuotes({ ...searchData, model });
      return res.rows;
    }
  });
  

  return (
    <div className="new-engines-quotes-list">
      <EngineQuoteSearchDialog
        open={searchOpen}
        setOpen={setSearchOpen}
        onSearch={setSearchData}
      />

      <h2>Engine Quotes</h2>
      <div className="new-engines-quotes-list__top-bar">
        <Button
          onClick={() => {
            setEngine(null);
            setNewQuoteDialogOpen(true);
          }}
        >
          New Quote
        </Button>
        <Button onClick={() => setSearchOpen(true)}>Search</Button>
      </div>

      <div className="new-engines-quotes-list__container">
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Qtd By</th>
              <th>Source</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Phone</th>
              <th>State</th>
              <th>Serial Number</th>
              <th>Description</th>
              <th>Stock Number</th>
              <th>Price</th>
              <th>Notes</th>
              <th>Sale</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote: EngineQuote) => {
              return (
                <tr key={quote.id}>
                  <td>{ formatDate(quote.date) }</td>
                  <td>{ quote.salesman }</td>
                  <td>{ quote.source }</td>
                  <td>{ quote.customer && <Link href={`/customer/${quote.customer.id}`}>{quote.customer.company}</Link> }</td>
                  <td>{ quote.contact }</td>
                  <td>{ formatPhone(quote.phone) }</td>
                  <td>{ quote.state }</td>
                  <td>{ quote.serialNum }</td>
                  <td>{ quote.desc }</td>
                  <td><Link href={`/engines/${quote.stockNum}`}>{ quote.stockNum }</Link></td>
                  <td>{ formatCurrency(quote.price) }</td>
                  <td>{ quote.notes }</td>
                  <td className="cbx-td"><Checkbox checked={quote.sale} disabled /></td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
