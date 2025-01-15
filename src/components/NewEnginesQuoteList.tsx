import { getQuotesByEngine } from "@/scripts/controllers/quotesController";
import { useEffect, useState } from "react";
import Table from "./Library/Table";
import { formatCurrency, formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import Checkbox from "./Library/Checkbox";
import Link from "next/link";

interface Props {
  model: string
}


export default function NewEnginesQuoteList({ model }: Props) {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getQuotesByEngine(model);
      setQuotes(res);
    };
    fetchData();
  }, [model]);
  

  return (
    <div className="new-engines-quotes-list">
      <h2>Engine Quotes</h2>

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
              <th>St.</th>
              <th>Serial Number</th>
              <th>Description</th>
              <th>Stock Number</th>
              <th>Price</th>
              <th>Notes</th>
              <th>Sale</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote: Quote) => {
              return (
                <tr key={quote.id}>
                  <td>{ formatDate(quote.date) }</td>
                  <td>{ quote.salesman }</td>
                  <td>{ quote.source }</td>
                  <td>{ quote.customer && <Link href={`/customer/${quote.customer.id}`}>{quote.customer.company}</Link> }</td>
                  <td>{ quote.contact }</td>
                  <td>{ formatPhone(quote.phone) }</td>
                  <td>{ quote.state }</td>
                  <td>{ quote.stockNum }</td>
                  <td>{ quote.desc }</td>
                  <td>{ quote.stockNum }</td>
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
