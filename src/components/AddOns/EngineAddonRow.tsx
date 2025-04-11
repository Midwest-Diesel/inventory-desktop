import Button from "../Library/Button";
import Checkbox from "../Library/Checkbox";
import Table from "../Library/Table";
import Select from "../Library/Select/Select";
import { useEffect, useRef, useState } from "react";
import Input from "../Library/Input";
import { addEngine, getAutofillEngine } from "@/scripts/controllers/enginesController";
import { deleteEngineAddOn } from "@/scripts/controllers/engineAddOnsController";
import { useAtom } from "jotai";
import { engineAddOnsAtom } from "@/scripts/atoms/state";
import { formatDate } from "@/scripts/tools/stringUtils";
import VendorSelect from "../Library/Select/VendorSelect";
import { invoke, confirm } from "@/scripts/config/tauri";
import { getEngineImages } from "@/scripts/controllers/imagesController";

interface Props {
  addOn: EngineAddOn
  handleDuplicateAddOn: (addOn: EngineAddOn) => void
}


export default function EngineAddOnRow({ addOn, handleDuplicateAddOn }: Props) {
  const [addOns, setAddons] = useAtom<EngineAddOn[]>(engineAddOnsAtom);
  const [autofillEngineNum, setAutofillEngineNum] = useState('');
  const [showVendorSelect, setShowVendorSelect] = useState(false);
  const [printQty, setPrintQty] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showVendorSelect) return;
    setTimeout(() => {
      if (!ref.current) return;
      const select = ref.current.querySelectorAll('select');
      select.length > 0 && select[select.length - 2].focus();
    }, 30);
  }, [showVendorSelect]);
  
  const handleEditAddOn = (newAddOn: EngineAddOn) => {
    const updatedAddOns = addOns.map((a: EngineAddOn) => {
      if (a.id === newAddOn.id) {
        return newAddOn;
      }
      return a;
    });
    setAddons(updatedAddOns);
  };

  const handleDeleteAddOn = async () => {
    if (!await confirm('Are you sure you want to delete this part?')) return;
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
      notes: res.comments,
    } as EngineAddOn;
    const updatedAddOns = addOns.map((a: EngineAddOn) => {
      if (a.id === addOn.id) {
        return newAddOn;
      }
      return a;
    });
    setAddons(updatedAddOns);
    setAutofillEngineNum('');
  };

  const handleAddToInventory = async () => {
    if (!await confirm('Are you sure you want to add this engine?')) return;
    await addEngine(addOn);
    await deleteEngineAddOn(addOn.id);
    setAddons(addOns.filter((a) => a.id !== addOn.id));
  };

  const handlePrint = async () => {
    const pictures = await getEngineImages(addOn.engineNum);
    const args = {
      stockNum: addOn.engineNum?.toString() ?? '',
      model: addOn.model ?? '',
      serialNum: addOn.serialNum ?? '',
      hp: addOn.hp ?? '',
      location: addOn.location ?? '',
      remarks: addOn.notes ?? '',
      date: formatDate(addOn.entryDate) ?? '',
      partNum: addOn.arrNum ?? '',
      rating: '0',
      hasPictures: pictures.length > 0,
      copies: Number(printQty)
    };
    await invoke('print_part_tag', { args });
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
                  onChange={(e: any) => {
                    handleEditAddOn({ ...addOn, engineNum: e.target.value });
                    autofillFromEngineNum(Number(e.target.value));
                  }}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.model !== null ? addOn.model.trim() : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, model: e.target.value })}
                />
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
                <div style={{ width: '21rem' }}>
                  {showVendorSelect ?
                    <VendorSelect
                      variant={['label-full-width']}
                      value={addOn.purchasedFrom ?? ''}
                      onChange={(e: any) => handleEditAddOn({ ...addOn, purchasedFrom: e.target.value })}
                      onBlur={() => setShowVendorSelect(false)}
                    />
                    :
                    <Button
                      type="button"
                      style={{ marginLeft: '0.3rem', width: '100%', textAlign: 'start' }}
                      variant={['no-style', 'x-small']}
                      onFocus={() => setShowVendorSelect(true)}
                    >
                      { addOn.purchasedFrom || 'Select Vendor' }
                    </Button>
                  }
                </div>
              </td>
              <td>
                <Input
                  variant={['small', 'thin', 'text-area']}
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
        <Button type="button" onClick={handleAddToInventory}>Add to Inventory</Button>
        <Button type="button" onClick={() => handleDuplicateAddOn(addOn)}>Duplicate</Button>
        <Input
          style={{ width: '3rem' }}
          variant={['x-small', 'search']}
          value={printQty}
          onChange={(e: any) => setPrintQty(e.target.value)}
          type="number"
        >
          <Button type="button" variant={['search']} onClick={handlePrint}>Print</Button>
        </Input>
        <Button variant={['danger']} type="button" onClick={handleDeleteAddOn}>Delete</Button>
      </div>
    </div>
  );
}
