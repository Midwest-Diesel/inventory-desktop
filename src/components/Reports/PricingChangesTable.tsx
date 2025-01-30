import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Loading from "../Library/Loading";
import Table from "../Library/Table";

interface Props {
  setTableOpen: (open: boolean) => void
  data: PricingChangesReport[]
  setReportsOpen: (open: boolean) => void
}


export default function PricingChangesTable({ setTableOpen, data, setReportsOpen }: Props) {
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
            <th>Part Number</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Sales Model</th>
            <th>Major Class Code</th>
            <th>Price</th>
            <th>Percent</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.partNum }</td>
                <td>{ row.desc }</td>
                <td>{ row.qty }</td>
                <td>{ row.salesModel }</td>
                <td>{ row.classCode }</td>
                <td>{ formatCurrency(row.price) }</td>
                <td>{ row.percent }%</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { data.length == 0 && <Loading /> }
    </div>
  );
}
