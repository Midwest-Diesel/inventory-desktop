import React, { ChangeEvent } from 'react';
import Table from "./Library/Table";
import Input from './Library/Input';
import { useAtom } from 'jotai';
import { enginePartsTableAtom } from '@/scripts/atoms/state';


export default function EditEnginePartsTable() {
  const [engineParts, setEngineParts] = useAtom<EnginePartsTable>(enginePartsTableAtom);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEngineParts({
      ...engineParts,
      [name]: value
    });
  };


  return (
    <Table className="edit-engine-parts-table" variant={['plain', 'edit-row-details']}>
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
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="blockNew"
              value={engineParts.blockNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="blockReman"
              value={engineParts.blockReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="blockCasting"
              value={engineParts.blockCasting ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="blockActual"
              value={engineParts.blockActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Crankshaft</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="crankNew"
              value={engineParts.crankNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="crankReman"
              value={engineParts.crankReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="crankActual"
              value={engineParts.crankActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Camshaft</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="camNew"
              value={engineParts.camNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="camReman"
              value={engineParts.camReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="camActual"
              value={engineParts.camActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Injector</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="injNew"
              value={engineParts.injNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="injReman"
              value={engineParts.injReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="injActual"
              value={engineParts.injActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Turbo</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboNew"
              value={engineParts.turboNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboReman"
              value={engineParts.turboReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboActual"
              value={engineParts.turboActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Turbo HP</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboHpNew"
              value={engineParts.turboHpNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboHpReman"
              value={engineParts.turboHpReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboHpActual"
              value={engineParts.turboHpActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Turbo LP</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboLpNew"
              value={engineParts.turboLpNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboLpReman"
              value={engineParts.turboLpReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboLpActual"
              value={engineParts.turboLpActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Head</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="headNew"
              value={engineParts.headNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="headReman"
              value={engineParts.headReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="headActual"
              value={engineParts.headActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Pist./Cyl Pk</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="pistonNew"
              value={engineParts.pistonNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="pistonReman"
              value={engineParts.pistonReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="pistonActual"
              value={engineParts.pistonActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Flywheel Hsng</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="fwhNew"
              value={engineParts.fwhNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="fwhReman"
              value={engineParts.fwhReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="fwhActual"
              value={engineParts.fwhActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Flywheel</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="flywheelNew"
              value={engineParts.flywheelNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="flywheelActual"
              value={engineParts.flywheelActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Oil Pan</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilPanNew"
              value={engineParts.oilPanNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilPanReman"
              value={engineParts.oilPanReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilPanActual"
              value={engineParts.oilPanActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Oil Cooler</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilCoolerNew"
              value={engineParts.oilCoolerNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilCoolerReman"
              value={engineParts.oilCoolerReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilCoolerActual"
              value={engineParts.oilCoolerActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Front Hsng</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="frontHsngNew"
              value={engineParts.frontHsngNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="frontHsngActual"
              value={engineParts.frontHsngActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>RA Group</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="ragNew"
              value={engineParts.ragNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="ragActual"
              value={engineParts.ragActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Heui Pump</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="heuiPumpNew"
              value={engineParts.heuiPumpNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="heuiPumpReman"
              value={engineParts.heuiPumpReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="heuiPumpActual"
              value={engineParts.heuiPumpActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Oil Pump</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilPumpNew"
              value={engineParts.oilPumpNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilPumpReman"
              value={engineParts.oilPumpReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilPumpActual"
              value={engineParts.oilPumpActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Water Pump</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="waterPump"
              value={engineParts.waterPump ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="waterPumpReman"
              value={engineParts.waterPumpReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="waterPumpActual"
              value={engineParts.waterPumpActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
        <tr>
          <th>Exh Manifold</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="exhMnfldNew"
              value={engineParts.exhMnfldNew ?? ''}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="exhMnfldReman"
              value={engineParts.exhMnfldReman ?? ''}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="exhMnfldActual"
              value={engineParts.exhMnfldActual ?? ''}
              onChange={handleChange}
            />
          </td>
        </tr>
      </tbody>
    </Table>
  );
}
