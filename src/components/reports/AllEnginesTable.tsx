import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import Loading from "../library/Loading";
import { useMemo } from "react";

interface Props {
  closeTable: () => void
  data: AllEnginesReport[]
}


export default function AllEnginesTable({ closeTable, data }: Props) {
  const total = useMemo(() => data.reduce((prev, row) => prev + row.sellPrice, 0), [data]);

  const handleGoBack = () => {
    closeTable();
  };

  const copyToClipboard = () => {
    const rowsText = data.map((row) =>
      [row.soldTo, row.model, row.serialNum, row.engineStockNum, row.sellPrice].join('\t')
    ).join('\n');
    navigator.clipboard.writeText(rowsText);
  };


  return (
    <div className="reports-table">
      <div className="reports-table__top-row">
        <div className="reports-table__top-bar">
          <Button onClick={handleGoBack}>Back</Button>
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
        <h3>Total: { formatCurrency(total) }</h3>
      </div>

      <Table>
        <thead>
          <tr>
            <th>SoldTo</th>
            <th>Model</th>
            <th>SerialNum</th>
            <th>EngineStockNum</th>
            <th>SellPrice</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.soldTo }</td>
                <td>{ row.model }</td>
                <td>{ row.serialNum }</td>
                <td>{ row.engineStockNum }</td>
                <td>{ formatCurrency(row.sellPrice) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
