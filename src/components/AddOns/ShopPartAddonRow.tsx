import { useAtom } from "jotai";
import { shopAddOnsAtom } from "@/scripts/atoms/state";
import Button from "../library/Button";
import Checkbox from "../library/Checkbox";
import Table from "../library/Table";
import Select from "../library/select/Select";
import { addAddOn, deleteAddOn, editAddOnIsPoOpened, editAddOnPrintStatus } from "@/scripts/services/addOnsService";
import { getNextUPStockNum, getPartsByStockNum, getPartInfoByPartNum } from "@/scripts/services/partsService";
import { useEffect, useRef, useState } from "react";
import Input from "../library/Input";
import { getEngineByStockNum } from "@/scripts/services/enginesService";
import { formatDate } from "@/scripts/tools/stringUtils";
import { getPurchaseOrderByPoNum } from "@/scripts/services/purchaseOrderService";
import { getRatingFromRemarks } from "@/scripts/tools/utils";
import { getImagesFromPart } from "@/scripts/services/imagesService";
import { ask } from "@/scripts/config/tauri";
import { usePrintQue } from "@/hooks/usePrintQue";
import { selectedPoAddOnAtom } from "@/scripts/atoms/components";
import { useClickOutside } from "@/hooks/useClickOutside";
import { commonPrefixLength, getAddOnDateCode, getNextStockNumberSuffix } from "@/scripts/logic/addOns";
import { useQuery } from "@tanstack/react-query";
import { getVendors } from "@/scripts/services/vendorsService";
import { useNavState } from "@/hooks/useNavState";

interface Props {
  addOn: AddOn
  handleDuplicateAddOn: (addOn: AddOn, addOns: AddOn[]) => void
  partNumList: string[]
  onSave: () => Promise<void>
}


export default function ShopPartAddonRow({ addOn, handleDuplicateAddOn, partNumList, onSave }: Props) {
  const [, setSelectedPoData] = useAtom<{ selectedPoAddOn: PO | null, addOn: AddOn | null, receivedItemsDialogOpen: boolean }>(selectedPoAddOnAtom);
  const { addToQue, printQue } = usePrintQue();
  const { newTab } = useNavState();
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [poLink, setPoLink] = useState<string>(addOn.po ? `${addOn.po}` : '');
  const [partNum, setPartNum] = useState<string>(addOn.partNum ?? '');
  const [engineNum, setEngineNum] = useState<string>(addOn.engineNum?.toString() ?? '');
  const [engineNumLink, setEngineNumLink] = useState(addOn.engineNum);
  const [purchasedFrom, setPurchasedFrom] = useState<string>(addOn.purchasedFrom?.toString() ?? '');
  const [showPartNumSelect, setShowPartNumSelect] = useState(false);
  const [printQty, setPrintQty] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const partNumListRefs = useRef<(HTMLLIElement | null)[]>([]);
  const partNumRef = useRef<HTMLDivElement>(null);
  const prevEngineNum = useRef<string | null>(null);
  const qtyRef = useRef<HTMLInputElement | null>(null);
  const isEngineNumInvalid = !engineNumLink || engineNumLink <= 1;
  useClickOutside(partNumRef, () => setShowPartNumSelect(false));

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: getVendors
  });

  useEffect(() => {
    if (!showPartNumSelect) return;
    const partNumMatch = (addOn.partNum ?? '').toUpperCase();
    let bestIndex = -1;
    let bestScore = -1;

    partNumList.forEach((num, i) => {
      const score = commonPrefixLength(partNumMatch, num.toUpperCase());
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    });

    if (bestIndex >= 0 && partNumListRefs.current[bestIndex]) {
      const listEl: any = document.querySelector('.add-ons__list-select');
      const item = partNumListRefs.current[bestIndex];
      if (listEl && item) {
        listEl.scrollTop = item.offsetTop - listEl.offsetTop + 24;
      }
    }
  }, [showPartNumSelect, addOn.partNum, partNumList]);

  useEffect(() => {
    checkDuplicateStockNum(addOn.stockNum ?? '', false);
  }, [addOn.stockNum]);

  useEffect(() => {
    if (addOns[0].id === addOn.id) qtyRef.current?.focus();
  }, []);

  const handleEditAddOn = async (newAddOn: AddOn) => {
    const updatedAddOns = addOns.map((a: AddOn) => {
      if (a.id === newAddOn.id) {
        return newAddOn;
      }
      return a;
    });
    setAddons(updatedAddOns);
  };

  const onClickDeleteAddOn = async () => {
    if (!await ask('Are you sure you want to delete this part?')) return;
    await deleteAddOn(addOn.id);
    setAddons(addOns.filter((a) => a.id !== addOn.id));
  };
  
  const autofillFromPartNum = (partNum: string) => {
    if (!partNum) {
      setPartNum('');
    } else {
      setPartNum(partNumList.find((p) => p.startsWith(partNum)) ?? '');
    }
  };

  const autofillFromPurchasedFrom = (value: string) => {
    if (!value) {
      setPurchasedFrom('');
    } else {
      setPurchasedFrom(vendors.find((v: Vendor) => v.name?.toLowerCase().startsWith(value))?.name ?? '');
    }
  };

  const updateAutofillPartNumData = async (value: string) => {
    const partInfo = await getPartInfoByPartNum(value);
    if (!partInfo) return;
    const newAddOn = {
      ...addOn,
      partNum: partInfo.partNum,
      desc: partInfo.desc
    } as AddOn;
    const updatedAddOns = addOns.map((a: AddOn) => {
      if (a.id === addOn.id) {
        return newAddOn;
      }
      return a;
    });
    setAddons(updatedAddOns);
    setPartNum('');
  };

  const updateAutofillEngineNumData = async (value: number) => {
    if (addOn.engineNum?.toString() === engineNum || value === 99) return;
    if (value === 0) {
      await autofillNextAvailableUP();
    } else if (value === 1) {
      await autofillDateCodeStockNum();
    } else {
      await autofillUsingEngineNum(value);
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

  const autofillNextAvailableUP = async () => {
    const latestUP = await getNextUPStockNum();
    if (!latestUP) {
      alert('Failed to fetch latest UP stock number');
      clearStockNumber();
      return;
    }
    const latestNum = parseInt(latestUP.slice(2), 10);
    const queueUPNumbers = addOns
      .map((a) => addOn.id !== a.id && a.stockNum)
      .filter((stockNum): stockNum is string => typeof stockNum === 'string' && /^UP\d+$/.test(stockNum))
      .map((stockNum) => parseInt(stockNum.slice(2), 10));

    const maxNum = Math.max(latestNum, ...queueUPNumbers);
    const nextUP = `UP${maxNum + 1}`;

    const updatedAddOns = addOns.map((a: AddOn) => (a.id === addOn.id ? { ...addOn, stockNum: nextUP } : a));
    setAddons(updatedAddOns);
    setEngineNum('');
  };

  const autofillDateCodeStockNum = async () => {
    const partsInfo = await getPartInfoByPartNum(addOn.partNum ?? '');
    const date = getAddOnDateCode();
    const dateStockNum = `${partsInfo?.prefix ?? ''}${date}`;
    const newStockNum = `${dateStockNum}${await getNextStockNumberSuffix(dateStockNum, addOns)}`;

    const updatedAddOns = addOns.map((a: AddOn) => (a.id === addOn.id ? { ...addOn, stockNum: newStockNum } : a));
    setAddons(updatedAddOns);
    setEngineNum('');
    return;
  };

  const autofillUsingEngineNum = async (value: number) => {
    const res = await getEngineByStockNum(value);
    const partsInfo = await getPartInfoByPartNum(addOn.partNum ?? '');
    const newStockNum = `${partsInfo?.prefix ?? ''}${addOn.engineNum}`;

    const newAddOn = {
      ...addOn,
      stockNum: newStockNum,
      hp: res?.horsePower ?? '',
      serialNum: res?.serialNum ?? ''
    } as AddOn;

    const updatedAddOns = addOns.map((a: AddOn) => (a.id === addOn.id ? newAddOn : a));
    setAddons(updatedAddOns);
    setEngineNum('');
  };

  const checkDuplicateStockNum = async (stockNum: string, clearField = true): Promise<boolean> => {
    const parts = await getPartsByStockNum(stockNum);
    const addOnStockNums = addOns
      .filter((a) => a.id !== addOn.id && a.stockNum)
      .map((a) => a.stockNum);
    
    const isDuplicated = parts.length > 0 || addOnStockNums.some((s) => s === stockNum);
    if (isDuplicated) {
      alert(`[ERROR: Duplicate stock number ${stockNum}] located in ${addOnStockNums.some((s) => s === stockNum) ? 'add on list' : ''}${parts.length > 0 ? 'inventory' : ''}`);
      if (clearField) clearStockNumber();
      return true;
    }
    return false;
  };

  const clearStockNumber = () => {
    const updatedAddOns = addOns.map((a: AddOn) => (a.id === addOn.id ? { ...a, stockNum: '' } : a));
    setAddons(updatedAddOns);
  };

  const isBlankAddOn = (addOn: AddOn) => (
    addOn.qty === null &&
    addOn.partNum === null &&
    addOn.desc === null &&
    addOn.stockNum === null &&
    addOn.location === null &&
    addOn.remarks === null &&
    addOn.rating === null &&
    addOn.engineNum === null &&
    addOn.condition === "New" &&
    addOn.purchasePrice === null &&
    addOn.purchasedFrom === null &&
    addOn.po === null &&
    addOn.manufacturer === null &&
    addOn.isSpecialCost === null &&
    addOn.type === "Truck" &&
    addOn.hp === null &&
    addOn.serialNum === null &&
    addOn.newPrice === null &&
    addOn.remanPrice === null &&
    addOn.dealerPrice === null &&
    addOn.priceStatus === "We have pricing" &&
    addOn.altParts.length === 0 &&
    addOn.isPrinted === false &&
    addOn.isPoOpened === false &&
    addOn.prefix === null
  );

  const handlePrint = async () => {
    if (!addOn.stockNum) {
      alert('Missing stock number');
      return;
    }
    if (await checkDuplicateStockNum(addOn.stockNum)) {
      alert(`Duplicate stock number: ${addOn.stockNum}`);
      return;
    }
    await onSave();
    if (!isBlankAddOn(addOns[0])) await addAddOn();
    const engine = await getEngineByStockNum(addOn.engineNum);
    const pictures = await getImagesFromPart(addOn.partNum);
    await editAddOnPrintStatus(addOn.id, true);

    for (let i = 0; i < printQty; i++) {
      const args = {
        stockNum: addOn.stockNum,
        model: engine?.model ?? '',
        serialNum: engine?.serialNum ?? '',
        hp: engine?.horsePower ?? '',
        location: addOn.location ?? '',
        remarks: addOn.remarks ?? '',
        date: formatDate(addOn.entryDate) ?? '',
        partNum: addOn.partNum ?? '',
        rating: addOn.rating,
        hasPictures: pictures.length > 0
      };
      if (addOn.stockNum?.toString().toUpperCase().includes('UP')) {
        addToQue('partTagUP', 'print_part_tag', args, '1500px', '1000px');
      } else {
        addToQue('partTag', 'print_part_tag', args, '1500px', '1000px');
      }
    }
    printQue();
  };

  const handlePOItemsReceived = async (e: any) => {
    if (!e.target.value || addOn.isPoOpened) return;
    const po = await getPurchaseOrderByPoNum(e.target.value);
    if (!po || po.poItems.length === 0) return;
    onSave();
    await editAddOnIsPoOpened(addOn.id, true);
    setAddons(addOns.map((a) => {
      if (a.id === addOn.id) return { ...a, isPoOpened: true };
      return a;
    }));
    setPoLink(`${po.poNum}`);
    setSelectedPoData({ selectedPoAddOn: po, addOn, receivedItemsDialogOpen: true });
  };

  const handlePartNumSelectClick = (num: string) => {
    handleEditAddOn({ ...addOn, partNum: num });
    autofillFromPartNum(num.toUpperCase());
    updateAutofillPartNumData(num);
    setShowPartNumSelect(false);
  };

  const onClickOpenPO = () => {
    if (!poLink) return;
    newTab([{ name: `PO ${poLink}`, url: `/purchase-orders/${poLink}` }]);
  };

  const onClickOpenEngine = () => {
    if (isEngineNumInvalid) return;
    newTab([{ name: `Engine ${engineNumLink}`, url: `/engines/${engineNumLink}` }]);
  };


  return (
    <>
      <div className={`add-ons__list-row ${addOn.isPrinted ? 'add-ons__list-row--completed' : ''}`} ref={ref}>
        <div className="add-ons__list-row-content">
          <Table variant={['plain', 'edit-row-details']} style={{ width: 'fit-content' }}>
            <thead>
              <tr>
                <th>Qty</th>
                <th>Part Number</th>
                <th>Description</th>
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
                    ref={qtyRef}
                    variant={['x-small', 'thin']}
                    type="number"
                    value={addOn.qty !== null ? addOn.qty : ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, qty: e.target.value })}
                    data-testid="qty"
                  />
                </td>
                <td>
                  <div ref={partNumRef} style={{ position: 'relative' }}>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold', 'search', 'autofill-input']}
                      value={addOn.partNum ?? ''}
                      autofill={partNum}
                      onAutofill={(value) => updateAutofillPartNumData(value)}
                      onChange={(e: any) => {
                        handleEditAddOn({ ...addOn, partNum: e.target.value.toUpperCase() });
                        autofillFromPartNum(e.target.value.toUpperCase());
                      }}
                      data-testid="part-num"
                    >
                      <Button variant={['x-small']} type="button" onClick={() => setShowPartNumSelect(!showPartNumSelect)} tabIndex={-1}>
                        <img src={`/images/icons/arrow-${showPartNumSelect ? 'up' : 'down'}.svg`} alt="Part number dropdown" width="10rem" />
                      </Button>
                    </Input>

                    {showPartNumSelect &&
                      <ul className="add-ons__list-select" tabIndex={-1}>
                        {partNumList.map((num, i) => {
                          return (
                            <li
                              key={i}
                              ref={(el) => partNumListRefs.current[i] = el}
                              onClick={() => handlePartNumSelectClick(num)}
                            >
                              { num }
                            </li>
                          );
                        })}
                      </ul>
                    }
                  </div>
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.desc !== null ? addOn.desc : ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, desc: e.target.value })}
                    onFocus={() => setShowPartNumSelect(false)}
                    data-testid="desc"
                  />
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
                    autofill={engineNum}
                    value={addOn.engineNum !== null ? addOn.engineNum : ''}
                    onChange={(e: any) => {
                      setEngineNumLink(e.target.value);
                      handleEditAddOn({ ...addOn, engineNum: e.target.value });
                    }}
                    onBlur={(e) => {
                      const currentVal = e.target.value;
                      if (prevEngineNum.current !== currentVal) {
                        updateAutofillEngineNumData(Number(currentVal));
                        prevEngineNum.current = currentVal;
                      }
                    }}
                    data-testid="engine-num"
                  />
                </td>
                <td>
                  <Input
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
                <th style={poLink ? { textDecoration: 'underline', cursor: 'pointer' } : {}} onClick={onClickOpenPO}>PO Number</th>
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
                    data-testid="remarks"
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
                    data-testid="hp"
                  />
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    value={addOn.serialNum !== null ? addOn.serialNum : ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, serialNum: e.target.value })}
                    data-testid="serial-num"
                  />
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    type="number"
                    value={addOn.rating !== null ? addOn.rating : ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, rating: e.target.value })}
                    data-testid="rating"
                  />
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    type="number"
                    value={addOn.po !== null ? addOn.po : ''}
                    onChange={(e) => {
                      handleEditAddOn({ ...addOn, po: e.target.value });
                      setPoLink(e.target.value);
                    }}
                    onBlur={(e) => handlePOItemsReceived(e)}
                    data-testid="po"
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
          <Button type="button" onClick={() => handleDuplicateAddOn(addOn, addOns)} data-testid="duplicate-btn">Duplicate</Button>
          <Input
            style={{ width: '3rem' }}
            variant={['x-small', 'search']}
            value={printQty}
            onChange={(e: any) => setPrintQty(e.target.value)}
            type="number"
          >
            <Button type="button" variant={['search']} onClick={handlePrint} data-testid="print-btn">Print</Button>
          </Input>
          <Button type="button" variant={['danger']} onClick={onClickDeleteAddOn}>Delete</Button>
        </div>
      </div>
    </>
  );
}
