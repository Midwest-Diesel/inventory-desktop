import Button from "../library/Button";
import Checkbox from "../library/Checkbox";
import Table from "../library/Table";
import Select from "../library/select/Select";
import { useEffect, useRef, useState } from "react";
import Input from "../library/Input";
import { getAllEngineModels } from "@/scripts/services/enginesService";
import { deleteEngineAddOn, editEngineAddOnPrintStatus, editEngineAddOnUserEditing } from "@/scripts/services/engineAddOnsService";
import { useAtom } from "jotai";
import { engineAddOnsAtom, userAtom } from "@/scripts/atoms/state";
import { ask } from "@/scripts/config/tauri";
import { usePrintQue } from "@/hooks/usePrintQue";
import { cap, formatDate } from "@/scripts/tools/stringUtils";
import DropdownOption from "../library/dropdown/DropdownOption";
import { useQuery } from "@tanstack/react-query";
import InputDropdown from "../library/InputDropdown";
import { emitServerEvent, offServerEvent, onServerEvent } from "@/scripts/config/websockets";

interface Props {
  addOn: EngineAddOn
  onSave: () => Promise<void>
}


export default function ShopEngineAddOnRow({ addOn, onSave }: Props) {
  const [user] = useAtom<User>(userAtom);
  const { addToQue, printQue } = usePrintQue();
  const [addOns, setAddons] = useAtom<EngineAddOn[]>(engineAddOnsAtom);
  const [printQty, setPrintQty] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

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
            a.id === addOn.id
              ? { ...a, isPrinted: true }
              : a
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

  const handlePrint = async () => {
    if (!addOn.engineNum) {
      alert('Engine Num cannot be empty');
      return;
    }

    await onSave();
    await editEngineAddOnPrintStatus(addOn.id, true);
    emitServerEvent('PRINT_ENGINE_ADDON', [addOn]);

    for (let i = 0; i < printQty; i++) {
      const args = {
        date: formatDate(addOn.entryDate),
        location: addOn.location ?? '',
        serialNum: addOn.serialNum ?? '',
        model: addOn.model ?? '',
        arrNum: addOn.arrNum ?? '',
        horsePower: addOn.hp ?? '',
        comments: addOn.notes ?? '',
        currentStatus: addOn.currentStatus ?? '',
        stockNum: addOn.engineNum.toString()
      };
      addToQue('engineTag', 'print_engine_tag', args, '700px', '1500px');
    }
    addToQue('engineChecklist', 'print_engine_checklist', null, '1500px', '1000px');
    printQue();
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

      <div className={`add-ons__list-row ${addOn.isPrinted ? 'add-ons__list-row--completed' : ''}`} ref={ref}>
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
                    value={addOn.model !== null ? addOn.model.trim() : ''}
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
                    onChange={(e: any) => handleEditAddOn({ ...addOn, serialNum: e.target.value })}
                  />
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.arrNum !== null ? addOn.arrNum : ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, arrNum: e.target.value })}
                  />
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.location !== null ? addOn.location.trim() : ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, location: e.target.value })}
                  />
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.hp !== null ? addOn.hp : ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, hp: e.target.value })}
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
                    value={addOn.currentStatus ? addOn.currentStatus.trim() : ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, currentStatus: e.target.value })}
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
                    onChange={(e: any) => handleEditAddOn({ ...addOn, notes: e.target.value })}
                  />
                </td>
                <td>
                  <Select
                    style={{ width: '100%' }}
                    value={addOn.oilPan}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, oilPan: e.target.value })}
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
            onChange={(e: any) => handleEditAddOn({ ...addOn, ecm: e.target.checked })}
          />
          <Checkbox
            variant={['label-align-center', 'label-bold']}
            label="Jake Brake"
            checked={addOn.jakeBrake}
            onChange={(e: any) => handleEditAddOn({ ...addOn, jakeBrake: e.target.checked })}
          />
        </div>

        <div className="add-ons__list-row-buttons">
          <Input
            style={{ width: '3rem' }}
            variant={['x-small', 'search']}
            value={printQty}
            onChange={(e: any) => setPrintQty(e.target.value)}
            type="number"
          >
            <Button type="button" variant={['search']} onClick={handlePrint}>Print</Button>
          </Input>
          <Button variant={['danger']} type="button" onClick={onClickDeleteAddOn}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
