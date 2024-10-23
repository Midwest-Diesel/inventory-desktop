import Table from "@/components/Library/Table";
import Dialog from "../../Library/Dialog";
import Link from "next/link";
import { getSearchedPartNum } from "@/scripts/tools/search";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  searchResults: { partNum: string, engines: Engine[] }[]
}


export default function PartsOnEnginesDialog({ open, setOpen, searchResults }: Props) {
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Parts on Engines"
      width={850}
      x={400}
    >
      <div className="on-eng">
        <h3>Part Searched: { getSearchedPartNum() }</h3>

        <div className="on-eng__table">
          <Table>
            <thead>
              <tr>
                <th>Stock Number</th>
                <th>Part Referenced</th>
                <th>Casting Number</th>
                <th>Date Entered</th>
                <th>Purchased From</th>
                <th>Purchase Price</th>
                <th>Cost Remaining</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((res) => {
                return (
                  res.engines.map((eng, i) => {
                    return (
                      <tr key={i}>
                        <td><Link href={`engines/${eng.stockNum}`}>{ eng.stockNum }</Link></td>
                        <td>{ res.partNum }</td>
                        <td></td>
                        <td>{ formatDate(eng.loginDate) }</td>
                        <td>{ eng.purchasedFrom }</td>
                        <td>{ formatCurrency(eng.purchasePrice) }</td>
                        <td>{ formatCurrency(eng.costRemaining) }</td>
                      </tr>
                    );
                  })
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </Dialog>
  );
}
