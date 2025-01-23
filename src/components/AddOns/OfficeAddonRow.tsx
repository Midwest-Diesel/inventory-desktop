import { useAtom } from "jotai";
import { shopAddOnsAtom } from "@/scripts/atoms/state";
import Button from "../Library/Button";
import Checkbox from "../Library/Checkbox";
import Table from "../Library/Table";
import Select from "../Library/Select/Select";
import { deleteAddOn } from "@/scripts/controllers/addOnsController";
import { addPart, getAutofillPart, getPartByEngineNum, getPartByPartNum, getPartsInfoByPartNum } from "@/scripts/controllers/partsController";
import { useEffect, useRef, useState } from "react";
import Input from "../Library/Input";
import { getAutofillEngine } from "@/scripts/controllers/enginesController";
import Loading from "../Library/Loading";
import { confirm } from '@tauri-apps/api/dialog';
import VendorSelect from "../Library/Select/VendorSelect";
import Link from "next/link";
import { getPurchaseOrderByPoNum } from "@/scripts/controllers/purchaseOrderController";

interface Props {
  addOn: AddOn
}


export default function OfficeAddonRow({ addOn }: Props) {
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [poLink, setPoLink] = useState<number>(addOn.po);
  const [autofillPartNum, setAutofillPartNum] = useState('');
  const [autofillEngineNum, setAutofillEngineNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [showVendorSelect, setShowVendorSelect] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handlePoLink(Number(addOn.po));
  }, []);

  useEffect(() => {
    if (!showVendorSelect) return;
    setTimeout(() => {
      const select = ref.current.querySelectorAll('select');
      select.length > 0 && select[select.length - 1].focus();
    }, 30);
  }, [showVendorSelect]);

  const handleEditAddOn = (newAddOn: AddOn) => {
    const updatedAddOns = addOns.map((a: AddOn) => {
      if (a.id === newAddOn.id) {
        return newAddOn;
      }
      return a;
    });
    setAddons(updatedAddOns);
  };

  const handleDeleteAddOn = async () => {
    if (!await confirm('Are you sure you want to delete this part?')) return;
    await deleteAddOn(addOn.id);
    setAddons(addOns.filter((a) => a.id !== addOn.id));
  };

  const autofillFromPartNum = async (partNum: string) => {
    if (!partNum) {
      setAutofillPartNum('');
      return;
    }
    const autofill = await getAutofillPart(partNum);
    setAutofillPartNum(autofill);
  };

  const autofillFromEngineNum = async (engineNum: number) => {
    if (!engineNum) {
      setAutofillEngineNum('');
      return;
    }
    const autofill = await getAutofillEngine(engineNum);
    setAutofillEngineNum(autofill && autofill.stockNum);
  };

  const updateAutofillPartNumData = async (value: string) => {
    const res = await getPartByPartNum(value);
    const newAddOn = {
      ...addOn,
      qty: Number(res.qty),
      partNum: res.partNum,
      desc: res.desc,
      stockNum: res.stockNum,
      location: res.location,
      remarks: res.remarks,
      entryDate: res.entryDate,
      rating: Number(res.rating),
      engineNum: Number(res.engineNum),
      condition: res.condition,
      purchasePrice: Number(res.purchasePrice),
      purchasedFrom: res.purchasedFrom,
      po: Number(res.po),
      manufacturer: res.manufacturer,
      isSpecialCost: res.isSpecialCost,
      newPrice: Number(res.newPrice),
      remanPrice: Number(res.remanPrice),
      dealerPrice: Number(res.dealerPrice),
      pricingType: res.pricingType,
      priceStatus: res.priceStatus,
      hp: res.hp,
      serialNum: res.serialNum,
    } as AddOn;
    const updatedAddOns = addOns.map((a: AddOn) => {
      if (a.id === addOn.id) {
        return newAddOn;
      }
      return a;
    });
    setAddons(updatedAddOns);
    setAutofillPartNum('');
  };

  const updateAutofillEngineNumData = async (value: number) => {
    const res = await getAutofillEngine(value);
    const part = await getPartByEngineNum(value);
    const newAddOn = {
      ...addOn,
      stockNum: part && part.stockNum,
      engineNum: Number(res.stockNum),
      hp: res.horsePower,
      serialNum: res.serialNum,
    } as AddOn;
    const updatedAddOns = addOns.map((a: AddOn) => {
      if (a.id === addOn.id) {
        return newAddOn;
      }
      return a;
    });
    setAddons(updatedAddOns);
    setAutofillEngineNum('');
  };

  const handleAddToInventory = async () => {
    if (!await confirm('Are you sure you want to add this item?')) return;
    setLoading(true);
    const partsInfo = await getPartsInfoByPartNum(addOn.partNum);
    const newPart = {
      ...addOn,
      altParts: partsInfo.length > 0 ? partsInfo[0].altParts.split(', ') : [],
    } as any;
    const testSearch = await getPartsInfoByPartNum(addOn.partNum);
    await addPart(newPart, testSearch.length > 0, updateLoading);
    await deleteAddOn(addOn.id);
    setAddons(addOns.filter((a) => a.id !== addOn.id));
    setLoading(false);
  };

  const updateLoading = (i: number, total: number) => {
    setLoadingProgress(`${i}/${total}`);
  };

  const handlePoLink = async (poNum: number) => {
    const po: PO = await getPurchaseOrderByPoNum(poNum);
    if (!po) return;
    setPoLink(po.poNum);
  };


  return (
    <div className="add-ons__list-row" ref={ref}>
      <div className="add-ons__list-row-content">
        <Table variant={['plain', 'edit-row-details']} style={{ width: 'fit-content' }}>
          <thead>
            <tr>
              <th>Qty</th>
              <th>Part Number</th>
              <th>Description</th>
              <th>Engine #</th>
              <th>Stock Number</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Input
                  variant={['x-small', 'thin']}
                  type="number"
                  value={addOn.qty !== null ? addOn.qty : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, qty: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin', 'autofill-input']}
                  value={addOn.partNum !== null ? addOn.partNum : ''}
                  autofill={autofillPartNum}
                  onAutofill={(value) => updateAutofillPartNumData(value)}
                  onChange={(e: any) => {
                    handleEditAddOn({ ...addOn, partNum: e.target.value.toUpperCase() });
                    autofillFromPartNum(e.target.value.toUpperCase());
                  }}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.desc !== null ? addOn.desc : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, desc: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin', 'autofill-input']}
                  type="number"
                  autofill={autofillEngineNum}
                  onAutofill={(value) => updateAutofillEngineNumData(Number(value))}
                  value={addOn.engineNum !== null ? addOn.engineNum : ''}
                  onChange={(e: any) => {
                    handleEditAddOn({ ...addOn, engineNum: e.target.value ? e.target.value : '' as any });
                    autofillFromEngineNum(Number(e.target.value));
                  }}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.stockNum !== null ? addOn.stockNum : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, stockNum: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.location !== null ? addOn.location : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, location: e.target.value })}
                />
              </td>
            </tr>
          </tbody>
        </Table>

        <Table variant={['plain', 'edit-row-details']} style={{ width: 'fit-content' }}>
          <thead>
            <tr>
              <th>Remarks</th>
              <th>OEM</th>
              <th>Condition</th>
              <th>Horse Power</th>
              <th>Serial Number</th>
              <th>Rating</th>
              <th>PO Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Input
                  variant={['small', 'thin', 'text-area']}
                  value={addOn.remarks !== null ? addOn.remarks : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, remarks: e.target.value })}
                />
              </td>
              <td>
                <Select
                  style={{ width: '100%' }}
                  value={addOn.manufacturer}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, manufacturer: e.target.value })}
                >
                  <option value="CAT">CAT</option>
                  <option value="Cummins">Cummins</option>
                  <option value="Detroit Diesel">Detroit Diesel</option>
                  <option value="New CAT">New CAT</option>
                  <option value="Perkins">Perkins</option>
                  <option value="New">New</option>
                </Select>
              </td>
              <td>
                <Select
                  style={{ width: '100%' }}
                  value={addOn.condition}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, condition: e.target.value })}
                >
                  <option value="Core">Core</option>
                  <option value="Good Used">Good Used</option>
                  <option value="New">New</option>
                  <option value="Recon">Recon</option>
                </Select>
              </td>
              <td>
                <Input
                  variant={['small', 'thin', 'text-area']}
                  value={addOn.hp !== null ? addOn.hp : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, hp: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin', 'text-area']}
                  value={addOn.serialNum !== null ? addOn.serialNum : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, serialNum: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin', 'text-area']}
                  type="number"
                  value={addOn.rating !== null ? addOn.rating : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, rating: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin', 'text-area']}
                  type="number"
                  value={addOn.po !== null ? addOn.po : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, po: e.target.value })}
                  onBlur={(e: any) => handlePoLink(Number(e.target.value))}
                />
              </td>
            </tr>
          </tbody>
        </Table>

        <Table variant={['plain', 'edit-row-details']} style={{ width: 'fit-content' }}>
          <thead>
            <tr>
              <th>New List Price</th>
              <th>Reman List Price</th>
              <th>Dealer Price</th>
              <th>Price Status</th>
              <th>Purchased From</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Input
                  variant={['small', 'thin']}
                  type="number"
                  value={addOn.newPrice !== null ? addOn.newPrice : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, newPrice: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  type="number"
                  value={addOn.remanPrice !== null ? addOn.remanPrice : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, remanPrice: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  type="number"
                  value={addOn.dealerPrice !== null ? addOn.dealerPrice : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, dealerPrice: e.target.value })}
                />
              </td>
              <td>
                <Select
                  style={{ width: '100%' }}
                  value={addOn.priceStatus}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, priceStatus: e.target.value })}
                >
                  <option>We have pricing</option>
                  <option>No pricing</option>
                </Select>
              </td>
              <td>
                <div style={{ width: '21rem' }}>
                  {showVendorSelect ?
                    <VendorSelect
                      variant={['label-full-width']}
                      value={addOn.purchasedFrom}
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
            </tr>
          </tbody>
        </Table>

        <Checkbox
          variant={['label-align-center', 'label-bold']}
          label="Is Special Cost"
          checked={addOn.isSpecialCost}
          onChange={(e: any) => handleEditAddOn({ ...addOn, isSpecialCost: e.target.checked })}
        />
      </div>

      <div className="add-ons__list-row-buttons">
        {loading ?
          <>
            <p>Modifying Alts</p>
            <p>{ loadingProgress }</p>
            <Loading />
          </>
          :
          <>
            { poLink && <Link href={`/purchase-orders/${poLink}`}>View PO</Link> }
            <Button type="button" onClick={handleAddToInventory}>Add to Inventory</Button>
          </>
        }
        <Button type="button" variant={['danger']} onClick={handleDeleteAddOn}>Delete</Button>
      </div>
    </div>
  );
}
