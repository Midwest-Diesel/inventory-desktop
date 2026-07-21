import { useQuery } from "@tanstack/react-query";
import Button from "../library/Button";
import Table from "../library/Table";
import { reportRemanPartsInStock } from "@/scripts/services/reportsService";

interface Props {
  closeTable: () => void
}


export default function RemanPartsInStockTable({ closeTable }: Props) {
  const { data: parts = [] } = useQuery<RemanPartsInStockReport[]>({
    queryKey: ['parts'],
    queryFn: () => reportRemanPartsInStock()
  });

  const handleGoBack = () => {
    closeTable();
  };

  const copyToClipboard = () => {
    const rowsText = parts.map((part) =>
      [part.altParts, part.qty].join('\t')
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
            <th>Alt Parts</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ row.altParts }</td>
                <td>{ row.qty }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
