import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";
import Loading from "../Library/Loading";

interface Props {
  setTableOpen: (open: boolean) => void
  data: SingleCompanyParts[]
  setReportsOpen: (open: boolean) => void
}


export default function SingleCompanyPartsTable({ setTableOpen, data, setReportsOpen }: Props) {
  const handleGoBack = () => {
    setTableOpen(false);
    setReportsOpen(true);
  };


  return (
    <div className="reports-table">
      <Button onClick={handleGoBack}>Back</Button>
      <Table>
        <thead>
          <tr>
            <th>EntryDate</th>
            <th>PurchasedFrom</th>
            <th>PartNum</th>
            <th>Desc</th>
            <th>PurchasePrice</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ formatDate(row.entryDate) }</td>
                <td>{ row.purchasedFrom }</td>
                <td>{ row.partNum }</td>
                <td>{ row.desc }</td>
                <td>{ formatCurrency(row.purchasePrice) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
