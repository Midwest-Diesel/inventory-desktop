import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import Loading from "../library/Loading";

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
