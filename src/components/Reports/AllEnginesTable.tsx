import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";
import Loading from "../Library/Loading";

interface Props {
  closeTable: () => void
  data: AllEnginesReport[]
  setReportsOpen: (open: boolean) => void
}


export default function AllEnginesTable({ closeTable, data, setReportsOpen }: Props) {
  const handleGoBack = () => {
    closeTable();
    setReportsOpen(true);
  };


  return (
    <div className="reports-table">
      <Button onClick={handleGoBack}>Back</Button>
      <Table>
        <thead>
          <tr>
            <th>SoldTo</th>
            <th>Model</th>
            <th>SellPrice</th>
            <th>SerialNum</th>
            <th>EngineStockNum</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.soldTo }</td>
                <td>{ row.model }</td>
                <td>{ formatCurrency(row.sellPrice) }</td>
                <td>{ row.serialNum }</td>
                <td>{ row.engineStockNum }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
