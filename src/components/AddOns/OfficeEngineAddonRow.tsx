import Button from "../library/Button";
import Checkbox from "../library/Checkbox";
import Table from "../library/Table";
import Select from "../library/select/Select";
import { useEffect, useRef } from "react";
import Input from "../library/Input";
import { addEngine, addEngineCostIn, getAllEngineModels, getEngineByStockNum } from "@/scripts/services/enginesService";
import { deleteEngineAddOn, editEngineAddOnUserEditing } from "@/scripts/services/engineAddOnsService";
import { useAtom } from "jotai";
import { engineAddOnsAtom, userAtom } from "@/scripts/atoms/state";
import { ask } from "@/scripts/config/tauri";
import { useQuery } from "@tanstack/react-query";
import InputDropdown from "../library/InputDropdown";
import DropdownOption from "../library/dropdown/DropdownOption";
import { emitServerEvent, offServerEvent, onServerEvent } from "@/scripts/config/websockets";
import { cap } from "@/scripts/tools/stringUtils";

interface Props {
  addOn: EngineAddOn
  onSave: () => Promise<void>
}


export default function OfficeEngineAddOnRow({ addOn, onSave }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [addOns, setAddons] = useAtom<EngineAddOn[]>(engineAddOnsAtom);
  const ref = useRef<HTMLDivElement | null>(null);
  
  const { data: models = [] } = useQuery<string[]>({
    queryKey: ['models', addOn.engineNum],
    queryFn: getAllEngineModels
  });

  useEffect(() => {
    const handlePrintEvent = (printedAddOns: EngineAddOn[]) => {
      const updates = Array.isArray(printedAddOns) ? printedAddOns : [printedAddOns];
      if (updates.some((a) => a.id === addOn.id)) {
        setAddons((prev) =>
          prev.map((a) =>
            a.id === addOn.id ? { ...a, isPrinted: true } : a
          )
        );
      }
    };
    onServerEvent('PRINT_ENGINE_ADDON', handlePrintEvent);

    return () => {
      offServerEvent('PRINT_ENGINE_ADDON', handlePrintEvent);
    };
  }, [addOn.id, setAddons]);

  const handleEditAddOn = async (newAddOn: EngineAddOn) => {
    if (!addOn.userEditing) {
      await setUserEditing();
    }
    if (addOn.userEditing && addOn.userEditing.id !== user.id) return;

    const updatedAddOns = addOns.map((a: EngineAddOn) => a.id === newAddOn.id ? newAddOn : a);
    setAddons(updatedAddOns);
  };

  const onClickDeleteAddOn = async () => {
    if (!await ask('Are you sure you want to delete this?')) return;
    await deleteEngineAddOn(addOn.id);
    emitServerEvent('DELETE_ENGINE_ADDON', [addOn.id]);
  };

  const handleAddToInventory = async () => {
    if (addOn.userEditing && addOn.userEditing.id !== user.id) {
      alert('Cannot submit add on that is being edited');
      return;
    }

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

  const setUserEditing = async () => {
    if (user.id === addOn.userEditing?.id) return;
    await editEngineAddOnUserEditing(addOn.id, user.id);
    const userEditing = { id: user.id, username: user.username };
    emitServerEvent('UPDATE_ENGINE_ADDON_OWNERSHIP', [{ id: addOn.id, userEditing }]);
  };


  return (
    <div>
      {addOn.userEditing &&
        <h4 style={{ display: 'flex', color: user.id === addOn.userEditing.id ? 'var(--green-light-2)' : 'var(--orange-1)' }}>
          <img style={{ width: '0.7rem', marginRight: '0.3rem' }} src="/images/icons/lock.svg" alt="Locked" />
          { cap(addOn.userEditing.username) }
        </h4>
      }

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
                    variant={['small', 'thin']}
                    value={addOn.engineNum !== null ? addOn.engineNum : ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, engineNum: e.target.value })}
                    type="number"
                  />
                </td>
                <td>
                  <InputDropdown
                    variant={['no-margin', 'fill']}
                    value={addOn.model !== null ? addOn.model?.trim() : ''}
                    onChange={(value) => handleEditAddOn({ ...addOn, model: value })}
                    maxHeight="25rem"
                  >
                    {models.map((model) => {
                      return <DropdownOption key={model} value={model}>{ model }</DropdownOption>;
                    })}
                  </InputDropdown>
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
                    value={addOn.location !== null ? addOn.location?.trim() : ''}
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
                    value={addOn.currentStatus?.trim()}
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
    </div>
  );
}
