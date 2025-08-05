import Checkbox from "@/components/Library/Checkbox";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import { formatDate } from "@/scripts/tools/stringUtils";
import Link from "@/components/Library/Link";

interface Props {
  engines: Engine[];
  loading: boolean;
}


export default function CoreEnginesTable({ engines, loading }: Props) {
  return (
    <div className="engines__table-container">
      { loading && <Loading /> }
      <Table>
        <thead>
          <tr>
            <th>Stock Number</th>
            <th>Login Date</th>
            <th>Model</th>
            <th>Serial Number</th>
            <th>Location</th>
            <th>Comments</th>
            <th>HP</th>
            <th>Jake Brake</th>
            <th>Purchased From</th>
          </tr>
        </thead>
        <tbody>
          {engines.map((engine: Engine) => {
            return (
              <tr key={engine.id}>
                <td><Link href={`/engines/${engine.stockNum}`}>{ engine.stockNum }</Link></td>
                <td>{ formatDate(engine.loginDate) }</td>
                <td>{ engine.model }</td>
                <td>{ engine.serialNum }</td>
                <td>{ engine.location }</td>
                <td>{ engine.comments }</td>
                <td>{ engine.horsePower }</td>
                <td className="cbx-td"><Checkbox checked={engine.jakeBrake} disabled /></td>
                <td>{ engine.purchasedFrom }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
