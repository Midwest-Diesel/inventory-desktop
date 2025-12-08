import Checkbox from "@/components/library/Checkbox";
import Loading from "@/components/library/Loading";
import Table from "@/components/library/Table";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Link from "@/components/library/Link";

interface Props {
  engines: Engine[];
  loading: boolean;
}


export default function RunningEnginesTable({ engines, loading }: Props) {  
  const isResearched = (engine: Engine) => {
    const { blockNew, blockReman, crankNew, crankReman, headNew, headReman, camNew, camReman, injNew, injReman, turboNew, turboReman, pistonNew, pistonReman, cylPacksNew, cylPacksReman, fwhNew, fwhReman, oilPanNew, oilPanReman, oilCoolerNew, oilCoolerReman, frontHsngNew, flywheelNew, ragNew, heuiPumpNew, heuiPumpReman } = engine;
    if (blockNew || blockReman || crankNew || crankReman || headNew || headReman || camNew || camReman || injNew || injReman || turboNew || turboReman || pistonNew || pistonReman || cylPacksNew || cylPacksReman || fwhNew || fwhReman || oilPanNew || oilPanReman || oilCoolerNew || oilCoolerReman || frontHsngNew || flywheelNew || ragNew || heuiPumpNew || heuiPumpReman) {
      return true;
    }
    return false;
  };


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
            <th>Warranty</th>
            <th>Test Run</th>
            <th>ECM</th>
            <th>Mileage</th>
            <th>Cost Remaining</th>
            <th>Parts Researched</th>
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
                <td className="cbx-td"><Checkbox checked={Boolean(engine.jakeBrake)} disabled /></td>
                <td className="cbx-td"><Checkbox checked={Boolean(engine.warranty)} disabled /></td>
                <td className="cbx-td"><Checkbox checked={Boolean(engine.testRun)} disabled /></td>
                <td className="cbx-td"><Checkbox checked={Boolean(engine.ecm)} disabled /></td>
                <td>{ engine.mileage }</td>
                <td>{ formatCurrency(engine.costRemaining) }</td>
                <td className="cbx-td"><Checkbox checked={isResearched(engine)} disabled /></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
