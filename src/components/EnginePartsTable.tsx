import Table from "./Library/Table";

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
          <td>{ engine.blockPartNum }</td>
          <td>{ engine.blockRemanPartNum }</td>
          <td>{ engine.blockCasting }</td>
          <td>{ engine.blockActual }</td>
        </tr>
        <tr>
          <th>Crankshaft</th>
          <td>{ engine.crankPartNum }</td>
          <td>{ engine.crankRemanPartNum }</td>
          <td></td>
          <td>{ engine.crankActual }</td>
        </tr>
        <tr>
          <th>Camshaft</th>
          <td>{ engine.camPartNum }</td>
          <td>{ engine.camRemanPartNum }</td>
          <td></td>
          <td>{ engine.camActual }</td>
        </tr>
        <tr>
          <th>Injector</th>
          <td>{ engine.injPartNum }</td>
          <td>{ engine.injRemanPartNum }</td>
          <td></td>
          <td>{ engine.injActual }</td>
        </tr>
        <tr>
          <th>Turbo</th>
          <td>{ engine.turboPartNum }</td>
          <td>{ engine.turboRemanPartNum }</td>
          <td></td>
          <td>{ engine.turboActual }</td>
        </tr>
        <tr>
          <th>Turbo HP</th>
          <td>{ engine.turboHP }</td>
          <td>{ engine.turboHPReman }</td>
          <td></td>
          <td>{ engine.turboHPActual }</td>
        </tr>
        <tr>
          <th>Turbo LP</th>
          <td>{ engine.turboLP }</td>
          <td>{ engine.turboLPReman }</td>
          <td></td>
          <td>{ engine.turboLPActual }</td>
        </tr>
        <tr>
          <th>Head</th>
          <td>{ engine.headPartNum }</td>
          <td>{ engine.headRemanPartNum }</td>
          <td></td>
          <td>{ engine.headActual }</td>
        </tr>
        <tr>
          <th>Pist./Cyl Pk</th>
          <td>{ engine.pistonsPartNum }</td>
          <td>{ engine.pistonsRemanPartNum }</td>
          <td></td>
          <td>{ engine.pistonsActual }</td>
        </tr>
        <tr>
          <th>Flywheel Hsng</th>
          <td>{ engine.fwhPartNum }</td>
          <td>{ engine.fwhRemanPartNum }</td>
          <td></td>
          <td>{ engine.fwhActual }</td>
        </tr>
        <tr>
          <th>Flywheel</th>
          <td>{ engine.flywheelPartNum }</td>
          <td></td>
          <td></td>
          <td>{ engine.flywheelActual }</td>
        </tr>
        <tr>
          <th>Oil Pan</th>
          <td>{ engine.oilPanPartNum }</td>
          <td>{ engine.oilPanRemanPartNum }</td>
          <td></td>
          <td>{ engine.oilPanActual }</td>
        </tr>
        <tr>
          <th>Oil Cooler</th>
          <td>{ engine.oilCoolerPartNum }</td>
          <td>{ engine.oilCoolerRemanPartNum }</td>
          <td></td>
          <td>{ engine.oilCoolerActual }</td>
        </tr>
        <tr>
          <th>Front Housing</th>
          <td>{ engine.frontHousingPartNum }</td>
          <td></td>
          <td></td>
          <td>{ engine.frontHousingActual }</td>
        </tr>
        <tr>
          <th>RA Group</th>
          <td>{ engine.ragPartNum }</td>
          <td></td>
          <td></td>
          <td>{ engine.ragActual }</td>
        </tr>
        <tr>
          <th>Heui Pump</th>
          <td>{ engine.heuiPumpPartNum }</td>
          <td>{ engine.heuiPumpRemanPartNum }</td>
          <td></td>
          <td>{ engine.heuiActual }</td>
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
          <td>{ engine.waterPump }</td>
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
