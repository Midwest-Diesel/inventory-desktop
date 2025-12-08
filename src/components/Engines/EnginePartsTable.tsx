import Table from "../library/Table";

interface Props {
  engine: Engine
}


export default function EnginePartsTable({ engine }: Props) {
  return (
    <Table className="engine-parts-table" variant={['plain']}>
      <thead>
        <tr>
          <th></th>
          <th>New</th>
          <th>Reman</th>
          <th>Casting</th>
          <th>Actual Numbers</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>Block</th>
          <td>{ engine.blockNew }</td>
          <td>{ engine.blockReman }</td>
          <td>{ engine.blockCasting }</td>
          <td>{ engine.blockActual }</td>
        </tr>
        <tr>
          <th>Crankshaft</th>
          <td>{ engine.crankNew }</td>
          <td>{ engine.crankReman }</td>
          <td></td>
          <td>{ engine.crankActual }</td>
        </tr>
        <tr>
          <th>Camshaft</th>
          <td>{ engine.camNew }</td>
          <td>{ engine.camReman }</td>
          <td></td>
          <td>{ engine.camActual }</td>
        </tr>
        <tr>
          <th>Injector</th>
          <td>{ engine.injNew }</td>
          <td>{ engine.injReman }</td>
          <td></td>
          <td>{ engine.injActual }</td>
        </tr>
        <tr>
          <th>Turbo</th>
          <td>{ engine.turboNew }</td>
          <td>{ engine.turboReman }</td>
          <td></td>
          <td>{ engine.turboActual }</td>
        </tr>
        <tr>
          <th>Turbo HP</th>
          <td>{ engine.turboHpNew }</td>
          <td>{ engine.turboHpReman }</td>
          <td></td>
          <td>{ engine.turboHpActual }</td>
        </tr>
        <tr>
          <th>Turbo LP</th>
          <td>{ engine.turboLpNew }</td>
          <td>{ engine.turboLpReman }</td>
          <td></td>
          <td>{ engine.turboLpActual }</td>
        </tr>
        <tr>
          <th>Head</th>
          <td>{ engine.headNew }</td>
          <td>{ engine.headReman }</td>
          <td></td>
          <td>{ engine.headActual }</td>
        </tr>
        <tr>
          <th>Pist./Cyl Pk</th>
          <td>{ engine.pistonNew }</td>
          <td>{ engine.pistonReman }</td>
          <td></td>
          <td>{ engine.pistonActual }</td>
        </tr>
        <tr>
          <th>Flywheel Hsng</th>
          <td>{ engine.fwhNew }</td>
          <td>{ engine.fwhReman }</td>
          <td></td>
          <td>{ engine.fwhActual }</td>
        </tr>
        <tr>
          <th>Flywheel</th>
          <td>{ engine.flywheelNew }</td>
          <td></td>
          <td></td>
          <td>{ engine.flywheelActual }</td>
        </tr>
        <tr>
          <th>Oil Pan</th>
          <td>{ engine.oilPanNew }</td>
          <td>{ engine.oilPanReman }</td>
          <td></td>
          <td>{ engine.oilPanActual }</td>
        </tr>
        <tr>
          <th>Oil Cooler</th>
          <td>{ engine.oilCoolerNew }</td>
          <td>{ engine.oilCoolerReman }</td>
          <td></td>
          <td>{ engine.oilCoolerActual }</td>
        </tr>
        <tr>
          <th>Front Housing</th>
          <td>{ engine.frontHsngNew }</td>
          <td></td>
          <td></td>
          <td>{ engine.frontHsngActual }</td>
        </tr>
        <tr>
          <th>RA Group</th>
          <td>{ engine.ragNew }</td>
          <td></td>
          <td></td>
          <td>{ engine.ragActual }</td>
        </tr>
        <tr>
          <th>Heui Pump</th>
          <td>{ engine.heuiPumpNew }</td>
          <td>{ engine.heuiPumpReman }</td>
          <td></td>
          <td>{ engine.heuiPumpActual }</td>
        </tr>
        <tr>
          <th>Oil Pump</th>
          <td>{ engine.oilPumpNew }</td>
          <td>{ engine.oilPumpReman }</td>
          <td></td>
          <td>{ engine.oilPumpActual }</td>
        </tr>
        <tr>
          <th>Water Pump</th>
          <td>{ engine.waterPumpNew }</td>
          <td>{ engine.waterPumpReman }</td>
          <td></td>
          <td>{ engine.waterPumpActual }</td>
        </tr>
        <tr>
          <th>Exh Manifold</th>
          <td>{ engine.exhMnfldReman }</td>
          <td>{ engine.exhMnfldNew }</td>
          <td></td>
          <td>{ engine.exhMnfldActual }</td>
        </tr>
      </tbody>
    </Table>
  );
}
