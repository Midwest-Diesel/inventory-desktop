import { formatDate, formatTime } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Loading from "../Library/Loading";
import Table from "../Library/Table";

interface Props {
  closeTable: () => void
  data: RecentPartSearch[]
}


export default function RecentSearchesTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
  };


  return (
    <div className="reports-table">
      <Button onClick={handleGoBack}>Back</Button>
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Salesman</th>
            <th>PartNum</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ formatDate(row.date) }</td>
                <td>{ formatTime(row.date) }</td>
                <td>{ row.salesman }</td>
                <td>{ row.partNum }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
