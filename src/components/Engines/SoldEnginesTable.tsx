import Checkbox from "@/components/library/Checkbox";
import Loading from "@/components/library/Loading";
import Table from "@/components/library/Table";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Link from "@/components/library/Link";

interface Props {
  engines: Engine[];
  loading: boolean;
}


export default function SoldEnginesTable({ engines, loading }: Props) {
  return (
    <div className="engines__table-container">
      { loading && <Loading /> }
      <Table>
        <thead>
          <tr>
            <th>Stock Number</th>
            <th>Login Date</th>
            <th>Sell Date</th>
            <th>Model</th>
            <th>Serial Number</th>
            <th>Sold Engine Cost</th>
            <th>Sell Price</th>
            <th>Comments</th>
            <th>HP</th>
            <th>Jake Brake</th>
            <th>Purchased From</th>
            <th>Sold To</th>
            <th>Mileage</th>
            <th>Warranty</th>
            <th>Test Run</th>
          </tr>
        </thead>
        <tbody>
          {engines.map((engine: Engine) => {
            return (
              <tr key={engine.id}>
                <td><Link href={`/engines/${engine.stockNum}`}>{ engine.stockNum }</Link></td>
                <td>{ formatDate(engine.loginDate) }</td>
                <td>{ formatDate(engine.soldDate) }</td>
                <td>{ engine.model }</td>
                <td>{ engine.serialNum }</td>
                <td>{ formatCurrency(engine.costRemaining) }</td>
                <td>{ formatCurrency(engine.sellPrice) }</td>
                <td>{ engine.comments }</td>
                <td>{ engine.horsePower }</td>
                <td className="cbx-td"><Checkbox checked={engine.jakeBrake} disabled /></td>
                <td>{ engine.purchasedFrom }</td>
                <td>{ engine.soldTo }</td>
                <td>{ engine.mileage }</td>
                <td className="cbx-td"><Checkbox checked={Boolean(engine.warranty)} disabled /></td>
                <td className="cbx-td"><Checkbox checked={Boolean(engine.testRun)} disabled /></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
