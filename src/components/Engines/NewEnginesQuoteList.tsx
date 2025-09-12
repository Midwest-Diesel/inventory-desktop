import { getQuotesByEngineModel } from "@/scripts/services/quotesService";
import Table from "../Library/Table";
import { formatCurrency, formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import Checkbox from "../Library/Checkbox";
import Link from "@/components/Library/Link";
import { useQuery } from "@tanstack/react-query";
import Button from "../Library/Button";

interface Props {
  model: string
  setEngine: (engine: Engine | null) => void
  setNewQuoteDialogOpen: (value: boolean) => void
}


export default function NewEnginesQuoteList({ model, setEngine, setNewQuoteDialogOpen }: Props) {
  const { data: quotes = [] } = useQuery<EngineQuote[]>({
    queryKey: ['quotes', model],
    queryFn: () => getQuotesByEngineModel(model)
  });
  

  return (
    <div className="new-engines-quotes-list">
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
