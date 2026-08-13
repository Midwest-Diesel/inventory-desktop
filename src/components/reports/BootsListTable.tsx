import { formatDate } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Loading from "../library/Loading";
import Table from "../library/Table";

interface Props {
  closeTable: () => void
  data: BootsListReport[]
}


export default function BootsListTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
  };

  const copyToClipboard = () => {
    const rowsText = data.map((row) =>
      [row.partNum, row.desc, row.qty, null, null, null, row.ourStock, row.soldYTD, row.soldAllTime, formatDate(row.lastSoldDate), null, null, null].join('\t')
    ).join('\n');
    navigator.clipboard.writeText(rowsText);
  };


  return (
    <div className="reports-table">
      <div className="reports-table__top-bar">
        <Button onClick={handleGoBack}>Back</Button>
        <Button onClick={copyToClipboard}>Copy</Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Engine Type</th>
            <th>CAT $</th>
            <th>CAT AV</th>
            <th>Our Stock</th>
            <th>Sold YTD</th>
            <th>Sold All Time</th>
            <th>Date of Last Sold</th>
            <th>MT</th>
            <th>MT $</th>
            <th>Pert Info</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.partNum }</td>
                <td>{ row.desc }</td>
                <td>{ row.qty }</td>
                <td></td>
                <td></td>
                <td></td>
                <td>{ row.ourStock }</td>
                <td>{ row.soldYTD }</td>
                <td>{ row.soldAllTime }</td>
                <td>{ formatDate(row.lastSoldDate) }</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
