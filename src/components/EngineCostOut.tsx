import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";

interface Props {
  engineCostOut: EngineCostOut[];
}


export default function EngineCostOutTable({ engineCostOut }: Props) {
  return (
    <div className="item-cost-table">
      <Table>
        <thead>
          <tr>
            <th>Stock Number</th>
            <th>Cost</th>
            <th>Cost Type</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {engineCostOut.map((item: EngineCostOut, i) => {
            return (
              <tr key={i}>
                <td>{ item.stockNum }</td>
                <td>{ formatCurrency(item.cost) }</td>
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