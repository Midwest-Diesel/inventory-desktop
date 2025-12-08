import Checkbox from "@/components/library/Checkbox";
import Loading from "@/components/library/Loading";
import Table from "@/components/library/Table";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Link from "@/components/library/Link";

interface Props {
  engines: Engine[];
  loading: boolean;
}


export default function ToreDownEnginesTable({ engines, loading }: Props) {
  return (
    <div className="engines__table-container">
      { loading && <Loading /> }
      <Table>
        <thead>
          <tr>
            <th>Stock Number</th>
            <th>T/D Date</th>
            <th>Model</th>
            <th>Serial Number</th>
            <th>Location</th>
            <th>HP</th>
            <th>Jake Brake</th>
            <th>Purchased From</th>
            <th>Comments</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {engines.map((engine: Engine) => {
            return (
              <tr key={engine.id}>
                <td><Link href={`/engines/${engine.stockNum}`}>{ engine.stockNum }</Link></td>
                <td>{ formatDate(engine.toreDownDate) }</td>
                <td>{ engine.model }</td>
                <td>{ engine.serialNum }</td>
                <td>{ engine.location }</td>
                <td>{ engine.horsePower }</td>
                <td className="cbx-td"><Checkbox checked={engine.jakeBrake} disabled /></td>
                <td>{ engine.purchasedFrom }</td>
                <td>{ engine.comments }</td>
                <td>{ formatCurrency(engine.totalCostApplied) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
