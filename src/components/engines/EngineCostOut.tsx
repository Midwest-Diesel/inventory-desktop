import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "@/components/library/Table";

interface Props {
  engineCostOut: EngineCostOut[];
}


export default function EngineCostOutTable({ engineCostOut }: Props) {
  return (
    <div className="item-cost-table">
      <Table>
        <thead>
          <tr>
            <th>Cost</th>
            <th>Engine Stock Number</th>
            <th>Stock Number</th>
            <th>Cost Type</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {engineCostOut.sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0)).map((item: EngineCostOut, i) => {
            return (
              <tr key={i}>
                <td>{ formatCurrency(item.cost) }</td>
                <td>{ item.engineStockNum }</td>
                <td>{ item.stockNum }</td>
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