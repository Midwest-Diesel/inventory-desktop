import { useAtom } from "jotai";
import Table from "../Library/Table";
import { recentQuotesAtom } from "@/scripts/atoms/state";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useState } from "react";


export default function RecentQuotes() {
  const [recentQuoteSearches] = useAtom<RecentQuoteSearch[]>(recentQuotesAtom);
  const [recentSearchesOpen, setRecentSearchesOpen] = useState(localStorage.getItem('recentQuotesOpen') === 'true');

  const toggleRecentSearches = () => {
    localStorage.setItem('recentQuotesOpen', `${!recentSearchesOpen}`);
    setRecentSearchesOpen(!recentSearchesOpen);
  };


  return (
    <div className="recent-quotes">
      {recentQuoteSearches.length > 0 &&
        <>
          <div className="recent-part-searches__header no-select" onClick={toggleRecentSearches}>
            <h2>Recent Quotes</h2>
            <img src={`/images/icons/arrow-${recentSearchesOpen ? 'up' : 'down'}.svg`} alt="arrow" width={25} height={25} />
          </div>
          <div className="recent-quotes__table-container">
            {recentSearchesOpen &&
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
            }
          </div>
        </>
      }
    </div>
  );
}
