import { useAtom } from "jotai";
import { shopAddOnsAtom } from "@/scripts/atoms/state";
import { deleteAddOn, editAddOnAltParts, getAddOnById } from "@/scripts/services/addOnsService";
import { addPart, addPartCostIn, getPartsByStockNum, getPartInfoByPartNum } from "@/scripts/services/partsService";
import { useEffect, useRef, useState } from "react";
import { getEngineCostRemaining } from "@/scripts/services/enginesService";
import { getRatingFromRemarks } from "@/scripts/tools/utils";
import { ask } from "@/scripts/config/tauri";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Checkbox from "../Library/Checkbox";
import Table from "../Library/Table";
import Select from "../Library/Select/Select";
import Input from "../Library/Input";
import Loading from "../Library/Loading";
import VendorSelect from "../Library/Select/VendorSelect";
import Link from "../Library/Link";

interface Props {
  addOn: AddOn
  onSave: () => Promise<void>
  onModifyAddOnData: (addOn: AddOn | null) => void
}


export default function OfficePartAddonRow({ addOn, onSave, onModifyAddOnData }: Props) {
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [engineCostRemaining, setEngineCostRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [showVendorSelect, setShowVendorSelect] = useState(false);
  const [isDuplicateStockNum, setIsDuplicateStockNum] = useState(false);
  const [highlightPurchasePrice, setHighlightPurchasePrice] = useState(false);
  const [isNewPart, setIsNewPart] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!addOn.engineNum) return;
      const cost = await getEngineCostRemaining(addOn.engineNum);
      setEngineCostRemaining(cost);
    };
    fetchData();
  }, [addOn.engineNum]);

  useEffect(() => {
    const fetchData = async () => {
      if (!addOn.stockNum) {
        setIsDuplicateStockNum(false);
      } else {
        const parts = await getPartsByStockNum(addOn.stockNum);
        const addOnStockNums = addOns
          .filter((a) => a.id !== addOn.id && a.stockNum)
          .map((a) => a.stockNum);
        const isDuplicated = parts.length > 0 || addOnStockNums.some((s) => s === addOn.stockNum);
        setIsDuplicateStockNum(isDuplicated);
      }
    };
    fetchData();
  }, [addOn.stockNum]);

  useEffect(() => {
    const fetchData = async () => {
      const partsInfo = await getPartInfoByPartNum(addOn.partNum ?? '');
      setIsNewPart(partsInfo === null);
    };
    fetchData();
  }, [addOn.partNum]);

  useEffect(() => {
    if (!showVendorSelect) return;
    setTimeout(() => {
      if (!ref.current) return;
      const select = ref.current.querySelectorAll('select');
      if (select.length > 0) select[select.length - 1].focus();
    }, 30);
  }, [showVendorSelect]);

  useEffect(() => {
    setHighlightPurchasePrice(Boolean(engineCostRemaining > 0 || addOn.purchasedFrom) && !addOn.purchasePrice);
  }, [addOn.purchasedFrom, addOn.purchasePrice, engineCostRemaining]);

  const handleEditAddOn = async (newAddOn: AddOn) => {
    const updatedAddOns = addOns.map((a: AddOn) => {
      if (a.id === newAddOn.id) return newAddOn;
      return a;
    });
    setAddons(updatedAddOns);
  };

  const handleDeleteAddOn = async () => {
    if (!await ask('Are you sure you want to delete this part?')) return;
    await deleteAddOn(addOn.id);
    setAddons(addOns.filter((a) => a.id !== addOn.id));
  };

  const handleAddToInventory = async () => {
    await onSave();
    const updatedAddOn = await getAddOnById(addOn.id);
    if (!updatedAddOn) {
      alert('Failed to add part to inventory');
      return;
    }
    if (highlightPurchasePrice) {
      alert('Fill in purchase price');
      return;
    }
    if (isDuplicateStockNum) {
      alert(`Duplicate stock number ${addOn.stockNum}`);
      return;
    }
    if (!addOn.stockNum) {
      alert('Empty stock number');
      return;
    }

    const partsInfo = await getPartInfoByPartNum(updatedAddOn.partNum ?? '');
    const currentAlts = partsInfo ? partsInfo.altParts.split(', ') : [updatedAddOn.partNum];
    const altParts = [...currentAlts, ...updatedAddOn.altParts];
    if (!await ask(`Are you sure you want to add this item?\n\nAlt Parts:\n${altParts.join(', ')}`)) return;
    setLoading(true);

    // Create part
    const newPart = {
      ...updatedAddOn,
      altParts
    } as any;
    await addPart(newPart, partsInfo !== null, updateLoading);

    // Add purchase price
    if (newPart.purchasePrice > 0) await addPartCostIn(newPart.stockNum, newPart.purchasePrice, null, newPart.purchasedFrom, 'PurchasePrice', '');

    // Clean up
    await deleteAddOn(updatedAddOn.id);
    setAddons(addOns.filter((a) => a.id !== updatedAddOn.id));
    setLoading(false);
  };

  const updateLoading = (i: number, total: number) => {
    setLoadingProgress(`${i}/${total}`);
  };

  const loadAddOnAltParts = async () => {
    const res = await getAddOnById(addOn.id);
    onModifyAddOnData(res);
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
              {isNewPart && <th>Prefix</th> }
              <th>Cost Remaining</th>
              <th>Type</th>
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
                  value={addOn.qty ?? ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, qty: e.target.value })}
                />
              </td>
              <td>
                <Input
                  style={isNewPart ? { backgroundColor: 'var(--red-1)' } : {}}
                  variant={['small', 'thin']}
                  value={addOn.partNum ?? ''}
                  onClick={loadAddOnAltParts}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, partNum: e.target.value.toUpperCase() })}
                  onBlur={async (e: any) => {
                    const newPartNum = e.target.value.toUpperCase();
                    if (addOn.partNum !== newPartNum) {
                      await editAddOnAltParts(addOn.id, '');
                    }
                  }}
                  data-testid="part-num"
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.desc ?? ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, desc: e.target.value })}
                />
              </td>
              {isNewPart &&
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.prefix ?? ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, prefix: e.target.value })}
                  />
                </td>
              }
              <td style={engineCostRemaining > 0 ? { backgroundColor: 'var(--red-1)', padding: '0 0.3rem' } : { padding: '0 0.3rem' }}>
                { formatCurrency(engineCostRemaining) }
              </td>
              <td>
                <Select
                  style={{ width: '100%' }}
                  value={addOn.type ?? ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, type: e.target.value })}
                >
                  <option value="">-- SELECT --</option>
                  <option>Truck</option>
                  <option>Industrial</option>
                </Select>
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  type="number"
                  value={addOn.engineNum !== null ? addOn.engineNum : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, engineNum: e.target.value })}
                />
              </td>
              <td>
                <Input
                  style={isDuplicateStockNum ? { backgroundColor: 'var(--red-1)' } : {}}
                  variant={['small', 'thin']}
                  value={addOn.stockNum !== null ? addOn.stockNum : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, stockNum: e.target.value })}
                  data-testid="stock-num"
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
                  variant={['small', 'thin']}
                  value={addOn.remarks !== null ? addOn.remarks : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, remarks: e.target.value })}
                  onBlur={(e: any) => handleEditAddOn({ ...addOn, rating: getRatingFromRemarks(e.target.value) })}
                />
              </td>
              <td>
                <Select
                  style={{ width: '100%' }}
                  value={addOn.manufacturer ?? ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, manufacturer: e.target.value })}
                >
                  <option value="">-- SELECT --</option>
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
                  value={addOn.condition ?? ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, condition: e.target.value })}
                >
                  <option value="">-- SELECT --</option>
                  <option value="Core">Core</option>
                  <option value="Good Used">Good Used</option>
                  <option value="New">New</option>
                  <option value="Recon">Recon</option>
                </Select>
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  value={addOn.hp !== null ? addOn.hp : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, hp: e.target.value })}
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
                  type="number"
                  value={addOn.rating !== null ? addOn.rating : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, rating: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  type="number"
                  value={addOn.po !== null ? addOn.po : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, po: e.target.value })}
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
              <th>Purchase Price</th>
              <th>Purchased From</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Input
                  variant={['small', 'thin']}
                  type="number"
                  step="any"
                  value={addOn.newPrice !== null ? addOn.newPrice : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, newPrice: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  type="number"
                  step="any"
                  value={addOn.remanPrice !== null ? addOn.remanPrice : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, remanPrice: e.target.value })}
                />
              </td>
              <td>
                <Input
                  variant={['small', 'thin']}
                  type="number"
                  step="any"
                  value={addOn.dealerPrice !== null ? addOn.dealerPrice : ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, dealerPrice: e.target.value })}
                />
              </td>
              <td>
                <Select
                  style={{ width: '100%' }}
                  value={addOn.priceStatus ?? ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, priceStatus: e.target.value })}
                >
                  <option value="">-- SELECT --</option>
                  <option>We have pricing</option>
                  <option>No pricing</option>
                </Select>
              </td>
              <td>
                <Input
                  style={highlightPurchasePrice ? { backgroundColor: 'var(--red-1)' } : {}}
                  variant={['small', 'thin']}
                  type="number"
                  step="any"
                  value={addOn.purchasePrice ?? ''}
                  onChange={(e: any) => handleEditAddOn({ ...addOn, purchasePrice: e.target.value })}
                />
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
            { addOn.po && <Link href={`/purchase-orders/${addOn.po}`}>View PO</Link> }
            <Button type="button" onClick={handleAddToInventory} data-testid="add-to-inventory-btn">Add to Inventory</Button>
          </>
        }
        <Button type="button" variant={['danger']} onClick={handleDeleteAddOn}>Delete</Button>
      </div>
    </div>
  );
}
