import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";
import Loading from "../Library/Loading";

interface Props {
  closeTable: () => void
  data: SingleCompanyEngines[]
}


export default function SingleCompanyEnginesTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
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
      { data.length == 0 && <Loading /> }
    </div>
  );
}
