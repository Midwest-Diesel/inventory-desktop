import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Table from "../library/Table";

interface Props {
  data: {
    salesman: string
    date: string
    quotes: Quote[]
    total: number
  }
}


export default function QuoteListTemplate({ data }: Props) {
  return (
    <div className="quotes-list-template">
      <h2>{ data.salesman } Quotes { data.date }</h2>

      <Table variant={['plain']}>
        <thead>
          <tr>
            <th>Date</th>
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
          {data.quotes.map((quote) => {
            return (
              <tr key={quote.id}>
                <td>{ formatDate(quote.date) }</td>
                <td>{ quote.source }</td>
                <td>{ quote.customer?.company }</td>
                <td>{ quote.contact }</td>
                <td>{ quote.phone }</td>
                <td>{ quote.state }</td>
                <td>{ quote.partNum }</td>
                <td>{ quote.desc }</td>
                <td>{ quote.stockNum }</td>
                <td>{ formatCurrency(quote.price) }</td>
                <td>{ quote.notes }</td>
                <td>{ quote.sale ? 'Yes' : 'No' }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <p><strong>Total:</strong> { formatCurrency(data.total) }</p>
    </div>
  );
}
