import { useAtom } from "jotai";
import Table from "../library/Table";
import { recentQuotesAtom } from "@/scripts/atoms/state";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";


export default function RecentQuotes() {
  const [recentQuoteSearches] = useAtom<RecentQuoteSearch[]>(recentQuotesAtom);


  return (
    <div className="recent-quotes">
      {recentQuoteSearches.length > 0 &&
        <>
          <h2>Recent Quotes</h2>
          <div className="recent-quotes__table-container">
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Part Number</th>
                  <th>Salesman</th>
                  <th>Customer</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {recentQuoteSearches.map((quote, i) => {
                  return (
                    <tr key={i} style={ quote.sale ? { backgroundColor: 'var(--green-dark-2)' } : {}}>
                      <td>{ formatDate(quote.date) }</td>
                      <td>{ quote.partNum }</td>
                      <td>{ quote.salesman }</td>
                      <td>{ quote.company }</td>
                      <td>{ formatCurrency(quote.price) }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </>
      }
    </div>
  );
}
