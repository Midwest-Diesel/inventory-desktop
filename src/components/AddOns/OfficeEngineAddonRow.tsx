import Button from "../library/Button";
import Checkbox from "../library/Checkbox";
import Table from "../library/Table";
import Select from "../library/select/Select";
import { useRef, useState } from "react";
import Input from "../library/Input";
import { addEngine, addEngineCostIn, getAutofillEngine, getEngineByStockNum } from "@/scripts/services/enginesService";
import { deleteEngineAddOn } from "@/scripts/services/engineAddOnsService";
import { useAtom } from "jotai";
import { engineAddOnsAtom } from "@/scripts/atoms/state";
import { ask } from "@/scripts/config/tauri";

interface Props {
  addOn: EngineAddOn
  onSave: () => Promise<void>
}


export default function OfficeEngineAddOnRow({ addOn, onSave }: Props) {
  const [addOns, setAddons] = useAtom<EngineAddOn[]>(engineAddOnsAtom);
  const [autofillEngineNum, setAutofillEngineNum] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);
  
  const handleEditAddOn = (newAddOn: EngineAddOn) => {
    const updatedAddOns = addOns.map((a: EngineAddOn) => {
      if (a.id === newAddOn.id) return newAddOn;
      return a;
    });
    setAddons(updatedAddOns);
  };

  const onClickDeleteAddOn = async () => {
    if (!await ask('Are you sure you want to delete this?')) return;
    await deleteEngineAddOn(addOn.id);
    setAddons(addOns.filter((a) => a.id !== addOn.id));
  };

  const autofillFromEngineNum = async (engineNum: number) => {
    if (!engineNum) {
      setAutofillEngineNum('');
      return;
    }
    const autofill = await getAutofillEngine(engineNum);
    setAutofillEngineNum(autofill && autofill.stockNum);
  };

  const updateAutofillEngineNumData = async (value: number) => {
    const res = await getAutofillEngine(value);
    const newAddOn = {
      ...addOn,
      engineNum: res.stockNum,
      hp: res.horsePower,
      serialNum: res.serialNum,
      model: res.model,
      arrNum: res.arrNum,
      currentStatus: res.currentStatus,
      location: res.location,
      notes: res.comments
    } as EngineAddOn;
    const updatedAddOns = addOns.map((a: EngineAddOn) => {
      if (a.id === addOn.id) return newAddOn;
      return a;
    });
    setAddons(updatedAddOns);
    setAutofillEngineNum('');
  };

  const handleAddToInventory = async () => {
    const res = await getEngineByStockNum(addOn.engineNum);
    if (res) {
      alert('Engine is already inside inventory');
      return;
    }
    if (Number(addOn.engineCostInCost) === 0) {
      alert('Enter a value for "cost"');
      return;
    }

    await onSave();
    if (!await ask('Are you sure you want to add this engine?')) return;
    await addEngine(addOn);

    const { engineCostInCost, engineCostInInvoiceNum, engineCostInVendor, engineCostInCostType, engineCostInNote } = addOn;
    await addEngineCostIn(
      Number(addOn.engineNum),
      Number(engineCostInCost),
      engineCostInInvoiceNum ?? '',
      engineCostInVendor ?? '',
      engineCostInCostType ?? 'PurchasePrice',
      engineCostInNote ?? ''
    );

    await deleteEngineAddOn(addOn.id);
    setAddons(addOns.filter((a) => a.id !== addOn.id));
  };


  return (
    <div className="add-ons__list-row" ref={ref}>
      <div className="add-ons__list-row-content">
        <Table variant={['plain', 'edit-row-details']} style={{ width: 'fit-content' }}>
          <thead>
            <tr>
              <th>Engine Num</th>
              <th>Model</th>
              <th>Serial Num</th>
              <th>Arr Num</th>
              <th>Location</th>
              <th>HP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Input
                  type="number"
                  variant={['small', 'thin', 'autofill-input']}
                  value={addOn.engineNum !== null ? addOn.engineNum : ''}
                  autofill={autofillEngineNum}
                  onAutofill={(value) => updateAutofillEngineNumData(Number(value))}
                  onChange={(e) => {
                    handleEditAddOn({ ...addOn, engineNum: e.target.value as any });
                    autofillFromEngineNum(Number(e.target.value));
                  }}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.model !== null ? addOn.model.trim() : ''}
                  onChange={(e) => handleEditAddOn({ ...addOn, model: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.serialNum !== null ? addOn.serialNum : ''}
                  onChange={(e) => handleEditAddOn({ ...addOn, serialNum: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.arrNum !== null ? addOn.arrNum : ''}
                  onChange={(e) => handleEditAddOn({ ...addOn, arrNum: e.target.value as any })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.location !== null ? addOn.location.trim() : ''}
                  onChange={(e) => handleEditAddOn({ ...addOn, location: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.hp !== null ? addOn.hp : ''}
                  onChange={(e) => handleEditAddOn({ ...addOn, hp: e.target.value })}
                />
              </td>
            </tr>
          </tbody>
        </Table>

        <Table variant={['plain', 'edit-row-details']} style={{ width: 'fit-content' }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Purchased From</th>
              <th>Notes</th>
              <th>Oil Pan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Select
                  style={{ width: '100%' }}
                  value={addOn.currentStatus.trim()}
                  onChange={(e) => handleEditAddOn({ ...addOn, currentStatus: e.target.value as any })}
                >
                  <option>ToreDown</option>
                  <option>RunnerReady</option>
                  <option>RunnerNotReady</option>
                  <option>HoldSoldRunner</option>
                  <option>CoreEngine</option>
                  <option>Sold</option>
                  <option>ShortBlock</option>
                  <option>LongBlock</option>
                </Select>
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.purchasedFrom ?? ''}
                  onChange={(e) => handleEditAddOn({ ...addOn, purchasedFrom: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  style={{ width: '18rem' }}
                  value={addOn.notes !== null ? addOn.notes : ''}
                  onChange={(e) => handleEditAddOn({ ...addOn, notes: e.target.value })}
                />
              </td>
              <td>
                <Select
                  style={{ width: '100%' }}
                  value={addOn.oilPan}
                  onChange={(e) => handleEditAddOn({ ...addOn, oilPan: e.target.value as any })}
                >
                  <option value="">-- OIL PAN --</option>
                  <option>FS</option>
                  <option>RS</option>
                  <option>CS</option>
                </Select>
              </td>
            </tr>
          </tbody>
        </Table>

        <Checkbox
          variant={['label-align-center', 'label-bold']}
          label="ECM"
          checked={addOn.ecm}
          onChange={(e) => handleEditAddOn({ ...addOn, ecm: e.target.checked })}
        />
        <Checkbox
          variant={['label-align-center', 'label-bold']}
          label="Jake Brake"
          checked={addOn.jakeBrake}
          onChange={(e) => handleEditAddOn({ ...addOn, jakeBrake: e.target.checked })}
        />

        <div>
          <h3 style={{ marginBottom: '0.3rem' }}>Engine Cost In</h3>
          <Table variant={['plain', 'edit-row-details']} style={{ width: 'fit-content' }}>
            <thead>
              <tr>
                <th>Cost</th>
                <th>Vendor</th>
                <th>Invoice Number</th>
                <th>Cost Type</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.engineCostInCost ?? ''}
                    onChange={(e) => handleEditAddOn({ ...addOn, engineCostInCost: e.target.value as any })}
                    type="number"
                  />
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.engineCostInVendor ?? ''}
                    onChange={(e) => handleEditAddOn({ ...addOn, engineCostInVendor: e.target.value })}
                  />
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.engineCostInInvoiceNum ?? ''}
                    onChange={(e) => handleEditAddOn({ ...addOn, engineCostInInvoiceNum: e.target.value })}
                  />
                </td>
                <td>
                  <Select
                    value={addOn.engineCostInCostType ?? ''}
                    onChange={(e) => handleEditAddOn({ ...addOn, engineCostInCostType: e.target.value as any })}
                  >
                    <option>PurchasePrice</option>
                    <option>ReconPrice</option>
                    <option>Other</option>
                  </Select>
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.engineCostInNote ?? ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, engineCostInNote: e.target.value })}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>

      <div className="add-ons__list-row-buttons">
        <Button type="button" onClick={handleAddToInventory}>Add to Inventory</Button>
        <Button variant={['danger']} type="button" onClick={onClickDeleteAddOn}>Delete</Button>
      </div>
    </div>
  );
}
