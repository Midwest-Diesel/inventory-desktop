import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";

interface Props {
  setTableOpen: (open: boolean) => void
  data: SingleCompanyEngines[]
  setReportsOpen: (open: boolean) => void
}


export default function SingleCompanyEnginesTable({ setTableOpen, data, setReportsOpen }: Props) {
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
            <th>LoginDate</th>
            <th>PurchasedFrom</th>
            <th>EngineStockNum</th>
            <th>Model</th>
            <th>PurchasePrice</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ formatDate(row.loginDate) }</td>
                <td>{ row.purchasedFrom }</td>
                <td>{ row.stockNum }</td>
                <td>{ row.model }</td>
                <td>{ formatCurrency(row.purchasePrice) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
