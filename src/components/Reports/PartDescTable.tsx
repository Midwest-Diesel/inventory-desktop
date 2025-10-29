import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Table from "../Library/Table";
import Loading from "../Library/Loading";

interface Props {
  closeTable: () => void
  data: PartDescReport[]
}


export default function PartDescTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
  };


  return (
    <div className="reports-table">
      <Button onClick={handleGoBack}>Back</Button>
      <Table>
        <thead>
          <tr>
            <th>AltParts</th>
            <th>FirstOfDescription</th>
            <th>SumOfQtySold</th>
            <th>Sales</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.altParts }</td>
                <td>{ row.firstOfDesc }</td>
                <td>{ row.sumOfQtySold }</td>
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
