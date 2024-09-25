import React, { ChangeEvent, useEffect, useState } from 'react';
import Table from "./Library/Table";
import Input from './Library/Input';
import { useAtom } from 'jotai';
import { enginePartsTableAtom } from '@/scripts/atoms/state';

interface Props {
  engine: Engine;
}


export default function EditEnginePartsTable({ engine }: Props) {
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
          <th>Reman</th>
          <th>New</th>
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
              name="blockRemanPartNum"
              value={engineParts.blockRemanPartNum}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="blockPartNum"
              value={engineParts.blockPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Crankshaft</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="crankRemanPartNum"
              value={engineParts.crankRemanPartNum}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="crankPartNum"
              value={engineParts.crankPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Camshaft</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="camRemanPartNum"
              value={engineParts.camRemanPartNum}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="camPartNum"
              value={engineParts.camPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Injector</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="injRemanPartNum"
              value={engineParts.injRemanPartNum}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="injPartNum"
              value={engineParts.injPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Turbo</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboRemanPartNum"
              value={engineParts.turboRemanPartNum}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboPartNum"
              value={engineParts.turboPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Turbo HP</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboHPReman"
              value={engineParts.turboHPReman}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboHP"
              value={engineParts.turboHP}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Turbo LP</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboLPReman"
              value={engineParts.turboLPReman}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="turboLP"
              value={engineParts.turboLP}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Head</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="headRemanPartNum"
              value={engineParts.headRemanPartNum}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="headPartNum"
              value={engineParts.headPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Pist./Cyl Pk</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="pistonsRemanPartNum"
              value={engineParts.pistonsRemanPartNum}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="pistonsPartNum"
              value={engineParts.pistonsPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Flywheel Hsng</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Flywheel</th>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="flywheelPartNum"
              value={engineParts.flywheelPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Oil Pan</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilPanRemanPartNum"
              value={engineParts.oilPanRemanPartNum}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilPanPartNum"
              value={engineParts.oilPanPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Oil Cooler</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilCoolerRemanPartNum"
              value={engineParts.oilCoolerRemanPartNum}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilCoolerPartNum"
              value={engineParts.oilCoolerPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Front Hsng</th>
          <td></td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="frontHousingPartNum"
              value={engineParts.frontHousingPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>RA Group</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Heui Pump</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="heuiPumpRemanPartNum"
              value={engineParts.heuiPumpRemanPartNum}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="heuiPumpPartNum"
              value={engineParts.heuiPumpPartNum}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Oil Pump</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilPumpReman"
              value={engineParts.oilPumpReman}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="oilPumpNew"
              value={engineParts.oilPumpNew}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Water Pump</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="waterPumpReman"
              value={engineParts.waterPumpReman}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="waterPump"
              value={engineParts.waterPump}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>Exh Manifold</th>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="exhMnfldReman"
              value={engineParts.exhMnfldReman}
              onChange={handleChange}
            />
          </td>
          <td>
            <Input
              variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
              name="exhMnfldNew"
              value={engineParts.exhMnfldNew}
              onChange={handleChange}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </Table>
  );
}
