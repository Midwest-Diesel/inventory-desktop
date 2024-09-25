import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";

interface Props {
  EngineCostInData: EngineCostIn[];
}


export default function EngineCostInTable({ EngineCostInData }: Props) {
  return (
    <div className="item-cost-table">
      <Table>
        <thead>
          <tr>
            <th>Stock Number</th>
            <th>Cost</th>
            <th>Invoice Number</th>
            <th>Cost Type</th>
            <th>Vendor</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {EngineCostInData.map((item, i) => {
            return (
              <tr key={i}>
                <td>{ item.engineStockNum }</td>
                <td>{ formatCurrency(item.cost) }</td>
                <td>{ item.invoiceNum }</td>
                <td>{ item.costType }</td>
                <td>{ item.vendor }</td>
                <td>{ item.note }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
