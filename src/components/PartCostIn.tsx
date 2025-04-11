import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";

interface Props {
  partCostInData: PartCostIn[];
}


export default function PartCostIn({ partCostInData }: Props) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Cost</th>
          <th>Cost Type</th>
          <th>Vendor</th>
          <th>Invoice Number</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
        {partCostInData.sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0)).map((item) => {
          return (
            <tr key={item.id}>
              <td>{ formatCurrency(item.cost) }</td>
              <td>{ item.costType }</td>
              <td>{ item.vendor }</td>
              <td>{ item.invoiceNum }</td>
              <td>{ item.note }</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
