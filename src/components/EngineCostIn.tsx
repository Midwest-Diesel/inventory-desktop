import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";

interface Props {
  EngineCostInData: EngineCostIn[]
}


export default function EngineCostInTable({ EngineCostInData }: Props) {
  return (
    <div className="item-cost-table">
      <Table>
        <thead>
          <tr>
            <th>Cost</th>
            <th>Engine Stock Number</th>
            <th>Vendor</th>
            <th>Invoice Number</th>
            <th>Cost Type</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {EngineCostInData.sort((a, b) => b.cost - a.cost).map((item, i) => {
            return (
              <tr key={i}>
                <td>{ formatCurrency(item.cost) }</td>
                <td>{ item.engineStockNum }</td>
                <td>{ item.vendor }</td>
                <td>{ item.invoiceNum }</td>
                <td>{ item.costType }</td>
                <td>{ item.note }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
