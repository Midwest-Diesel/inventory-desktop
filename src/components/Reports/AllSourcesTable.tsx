import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import Loading from "../library/Loading";

interface Props {
  closeTable: () => void
  data: AllSourcesReport[]
}


export default function AllSourcesTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
  };

  const copyToClipboard = () => {
    const rowsText = data.map((row) =>
      [row.source, row.sales].join('\t')
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
      </div>

      <Table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Sales</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.source }</td>
                <td>{ formatCurrency(row.sales) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
