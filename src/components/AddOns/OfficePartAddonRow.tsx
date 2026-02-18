import { useAtom } from "jotai";
import { shopAddOnsAtom, userAtom } from "@/scripts/atoms/state";
import { deleteAddOn, editAddOnAltParts, editAddOnUserEditing, getAddOnById } from "@/scripts/services/addOnsService";
import { addPart, addPartCostIn, getPartsByStockNum, getPartInfoByPartNum } from "@/scripts/services/partsService";
import { useEffect, useRef, useState } from "react";
import { addEngineCostOut, getEngineCostRemaining } from "@/scripts/services/enginesService";
import { getRatingFromRemarks } from "@/scripts/tools/utils";
import { ask } from "@/scripts/config/tauri";
import { cap, formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Checkbox from "../library/Checkbox";
import Table from "../library/Table";
import Select from "../library/select/Select";
import Input from "../library/Input";
import Loading from "../library/Loading";
import { useQuery } from "@tanstack/react-query";
import { getVendors } from "@/scripts/services/vendorsService";
import { useNavState } from "@/hooks/useNavState";
import { emitServerEvent } from "@/scripts/config/websockets";

interface Props {
  addOn: AddOn
  onSave: () => Promise<void>
  onModifyAddOnData: (addOn: AddOn | null) => void
}


export default function OfficePartAddonRow({ addOn, onSave, onModifyAddOnData }: Props) {
  const [user] = useAtom<User>(userAtom);
  const { newTab } = useNavState();
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [engineCostRemaining, setEngineCostRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDuplicateStockNum, setIsDuplicateStockNum] = useState(false);
  const [highlightPurchasePrice, setHighlightPurchasePrice] = useState(false);
  const [purchasedFrom, setPurchasedFrom] = useState<string>(addOn.purchasedFrom?.toString() ?? '');
  const [isNewPart, setIsNewPart] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const isEngineNumInvalid = !addOn.engineNum || addOn.engineNum <= 1;

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: getVendors
  });

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
    setHighlightPurchasePrice(Boolean(engineCostRemaining > 0 || addOn.purchasedFrom) && !addOn.purchasePrice);
  }, [addOn.purchasedFrom, addOn.purchasePrice, engineCostRemaining]);

  const handleEditAddOn = async (newAddOn: AddOn) => {
    if (!addOn.userEditing) {
      await setUserEditing();
    }
    if (addOn.userEditing && addOn.userEditing.id !== user.id) return;

    const updatedAddOns = addOns.map((a: AddOn) => a.id === newAddOn.id ? newAddOn : a);
    setAddons(updatedAddOns);
  };

  const onClickDeleteAddOn = async () => {
    if (!await ask('Are you sure you want to delete this part?')) return;
    await deleteAddOn(addOn.id);
    emitServerEvent('DELETE_ADDON', [addOn.id]);
  };

  const handleAddToInventory = async () => {
    if (addOn.userEditing && addOn.userEditing.id !== user.id) {
      alert('Cannot submit add on that is being edited');
      return;
    }

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
      soldToDate: new Date(),
      altParts
    } as AddOn;
    await addPart(newPart as any, partsInfo !== null);

    // Add purchase price
    if (newPart.engineNum && newPart.engineNum > 1) {
      await addEngineCostOut(newPart.stockNum ?? '', newPart.engineNum, Number(newPart.purchasePrice), 'Parts', '');
    } else if (Number(newPart.purchasePrice) > 0) {
      await addPartCostIn(newPart.stockNum ?? '', Number(newPart.purchasePrice), newPart.invoiceNum, newPart.purchasedFrom ?? '', 'PurchasePrice', '');
    }

    // Clean up
    await deleteAddOn(updatedAddOn.id);
    setAddons(addOns.filter((a) => a.id !== updatedAddOn.id));
    setLoading(false);
  };

  const autofillFromPurchasedFrom = (value: string) => {
    if (!value) {
      setPurchasedFrom('');
    } else {
      setPurchasedFrom(vendors.find((v: Vendor) => v.name?.toLowerCase().startsWith(value))?.name ?? '');
    }
  };

  const updateAutofillPurchasedFromData = async (value: string) => {
    const newAddOn = {
      ...addOn,
      purchasedFrom: value
    } as AddOn;
    const updatedAddOns = addOns.map((a: AddOn) => {
      if (a.id === addOn.id) return newAddOn;
      return a;
    });
    setAddons(updatedAddOns);
    setPurchasedFrom('');
  };

  const loadAddOnAltParts = async () => {
    const res = await getAddOnById(addOn.id);
    onModifyAddOnData(res);
  };

  const onClickOpenPO = () => {
    if (!addOn.po) return;
    newTab([{ name: `PO ${addOn.po}`, url: `/purchase-orders/${addOn.po}` }]);
  };

  const onClickOpenEngine = () => {
    if (isEngineNumInvalid) return;
    newTab([{ name: `Engine ${addOn.engineNum}`, url: `/engines/${addOn.engineNum}` }]);
  };
  
  const setUserEditing = async () => {
    if (user.id === addOn.userEditing?.id) return;
    await editAddOnUserEditing(addOn.id, user.id);
    const userEditing = { id: user.id, username: user.username };
    emitServerEvent('UPDATE_ADDON_OWNERSHIP', [{ id: addOn.id, userEditing }]);
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
                <th>Qty</th>
                <th>Part Number</th>
                <th>Description</th>
                {isNewPart && <th>Prefix</th> }
                <th>Cost Remaining</th>
                <th>Type</th>
                <th style={!isEngineNumInvalid ? { textDecoration: 'underline', cursor: 'pointer' } : {}} onClick={onClickOpenEngine}>Engine #</th>
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
                <th style={addOn.po ? { textDecoration: 'underline', cursor: 'pointer' } : {}} onClick={onClickOpenPO}>PO Number</th>
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
                    <option value="Caterpillar">Caterpillar</option>
                    <option value="Cummins">Cummins</option>
                    <option value="Detriot Diesel">Detriot Diesel</option>
                    <option value="New Cat">New Cat</option>
                    <option value="Perkins">Perkins</option>
                    <option value="New">New</option>
                    <option value="John Deere">John Deere</option>
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
                    <option value="Reconditioned">Reconditioned</option>
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
                <th>Invoice Number</th>
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
                    <Input
                      variant={['small', 'thin', 'label-bold', 'search', 'autofill-input']}
                      value={addOn.purchasedFrom ?? ''}
                      autofill={purchasedFrom}
                      onAutofill={(value) => updateAutofillPurchasedFromData(value)}
                      onChange={(e) => {
                        handleEditAddOn({ ...addOn, purchasedFrom: e.target.value });
                        autofillFromPurchasedFrom(e.target.value.toLowerCase());
                      }}
                    />
                  </div>
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.invoiceNum ?? ''}
                    onChange={(e) => handleEditAddOn({ ...addOn, invoiceNum: e.target.value })}
                  />
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
              <Loading />
            </>
            :
            <Button type="button" onClick={handleAddToInventory} data-testid="add-to-inventory-btn">Add to Inventory</Button>
          }
          <Button type="button" variant={['danger']} onClick={onClickDeleteAddOn}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
