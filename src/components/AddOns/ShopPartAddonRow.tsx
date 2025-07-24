import { useAtom } from "jotai";
import { shopAddOnsAtom } from "@/scripts/atoms/state";
import Button from "../Library/Button";
import Checkbox from "../Library/Checkbox";
import Table from "../Library/Table";
import Select from "../Library/Select/Select";
import { deleteAddOn, editAddOnIsPoOpened, editAddOnPrintStatus } from "@/scripts/services/addOnsService";
import { getNextUPStockNum, getPartByEngineNum, getPartsByStockNum, getPartInfoByPartNum } from "@/scripts/services/partsService";
import { useEffect, useRef, useState } from "react";
import Input from "../Library/Input";
import Link from "../Library/Link";
import { getEngineByStockNum } from "@/scripts/services/enginesService";
import { formatDate } from "@/scripts/tools/stringUtils";
import VendorSelect from "../Library/Select/VendorSelect";
import { getPurchaseOrderByPoNum } from "@/scripts/services/purchaseOrderService";
import { getRatingFromRemarks } from "@/scripts/tools/utils";
import { getImagesFromPart } from "@/scripts/services/imagesService";
import { ask } from "@/scripts/config/tauri";
import { usePrintQue } from "@/hooks/usePrintQue";
import { selectedPoAddOnAtom } from "@/scripts/atoms/components";
import { useClickOutside } from "@/hooks/useClickOutside";
import { commonPrefixLength } from "@/scripts/logic/addOns";

interface Props {
  addOn: AddOn
  handleDuplicateAddOn: (addOn: AddOn) => void
  partNumList: string[]
  onSave: () => Promise<void>
}


export default function ShopPartAddonRow({ addOn, handleDuplicateAddOn, partNumList, onSave }: Props) {
  const [, setSelectedPoData] = useAtom<{ selectedPoAddOn: PO | null, addOn: AddOn | null, receivedItemsDialogOpen: boolean }>(selectedPoAddOnAtom);
  const { addToQue, printQue } = usePrintQue();
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [poLink, setPoLink] = useState<string>(addOn.po ? `${addOn.po}` : '');
  const [partNum, setPartNum] = useState<string>(addOn.partNum ?? '');
  const [engineNum, setEngineNum] = useState<string>(addOn.engineNum?.toString() ?? '');
  const [showPartNumSelect, setShowPartNumSelect] = useState(false);
  const [showVendorSelect, setShowVendorSelect] = useState(false);
  const [isDuplicateStockNum, setIsDuplicateStockNum] = useState(false);
  const [printQty, setPrintQty] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const partNumListRefs = useRef<(HTMLLIElement | null)[]>([]);
  const partNumRef = useRef<HTMLDivElement>(null);
  useClickOutside(partNumRef, () => setShowPartNumSelect(false));

  useEffect(() => {
    if (!showVendorSelect) return;
    setTimeout(() => {
      if (!ref.current) return;
      const select = ref.current.querySelectorAll('select');
      if (select.length > 0) select[select.length - 1].focus();
    }, 30);
  }, [showVendorSelect]);

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
    const fetchData = async () => {
      if (!addOn.stockNum) {
        setIsDuplicateStockNum(false);
      } else {
        const res = await getPartsByStockNum(addOn.stockNum);
        setIsDuplicateStockNum(res.length > 0);
      }
    };
    fetchData();
  }, [addOn.stockNum]);

  const handleEditAddOn = async (newAddOn: AddOn) => {
    const updatedAddOns = addOns.map((a: AddOn) => {
      if (a.id === newAddOn.id) {
        return newAddOn;
      }
      return a;
    });
    setAddons(updatedAddOns);
  };

  const handleDeleteAddOn = async () => {
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

  const updateAutofillPartNumData = async (value: string) => {
    const res = await getPartInfoByPartNum(value);
    if (res.length === 0) return;
    const partInfo = res[0];
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
    if (value === 1 || value === 99) return;
    // Engine number 0 autofills to the next available UP stockNum
    if (value === 0) {
      const latestUP = await getNextUPStockNum();
      if (!latestUP) {
        alert('UP stock number failed to auto-increment');
        return;
      }
      const updatedAddOns = addOns.map((a: AddOn) => (a.id === addOn.id ? { ...addOn, stockNum: latestUP } : a));
      setAddons(updatedAddOns);
      setEngineNum('');
      return;
    }

    // Otherwise, autofill with associated engine data
    try {
      const res = await getEngineByStockNum(value);
      const part = await getPartByEngineNum(value);
      if (!res) {
        alert("Engine not in inventory, please notify Matt!");
        return;
      }
      if (!part) {
        alert("Part not in inventory, please notify Matt!");
        return;
      }
  
      const newAddOn = {
        ...addOn,
        stockNum: part.stockNum ?? '',
        engineNum: Number(res.stockNum),
        hp: res.horsePower ?? '',
        serialNum: res.serialNum ?? '',
      } as AddOn;
  
      const updatedAddOns = addOns.map((a: AddOn) => (a.id === addOn.id ? newAddOn : a));
      setAddons(updatedAddOns);
      setEngineNum('');
    } catch (error) {
      console.error("Error updating autofill engine number:", error);
    }
  };

  const handlePrint = async () => {
    await onSave();
    const engine = await getEngineByStockNum(addOn.engineNum);
    const pictures = await getImagesFromPart(addOn.partNum);
    await editAddOnPrintStatus(addOn.id, true);

    for (let i = 0; i < printQty; i++) {
      const args = {
        stockNum: addOn.stockNum ?? '',
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
      addToQue('partTag', 'print_part_tag', args, '1500px', '1000px');
    }
    printQue();
  };

  const handleOpenPO = async (e: any) => {
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


  return (
    <>
      <div className="add-ons__list-row" ref={ref}>
        <div className="add-ons__list-row-content">
          <Table variant={['plain', 'edit-row-details']} style={{ width: 'fit-content' }}>
            <thead>
              <tr>
                <th>Qty</th>
                <th>Part Number</th>
                <th>Description</th>
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
                    value={addOn.qty !== null ? addOn.qty : ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, qty: e.target.value })}
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
                  />
                </td>
                <td>
                  <Select
                    style={{ width: '100%' }}
                    value={addOn.type ?? ''}
                    onChange={(e: any) => handleEditAddOn({ ...addOn, type: e.target.value })}
                  >
                    <option>Truck</option>
                    <option>Industrial</option>
                  </Select>
                </td>
                <td>
                  <Input
                    variant={['small', 'thin']}
                    type="number"
                    autofill={engineNum}
                    onBlur={(e) => updateAutofillEngineNumData(Number(e.target.value))}
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
                    onBlur={(e: any) => handleEditAddOn({ ...addOn, rating: getRatingFromRemarks(e.target.value) })}
                  />
                </td>
                <td>
                  <Select
                    style={{ width: '100%' }}
                    value={addOn.manufacturer ?? ''}
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
                    value={addOn.condition ?? ''}
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
                    onChange={(e: any) => {
                      handleEditAddOn({ ...addOn, po: e.target.value });
                      setPoLink(e.target.value);
                    }}
                    onBlur={(e: any) => handleOpenPO(e)}
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
          { poLink && <Link href={`/purchase-orders/${poLink}`}>View PO</Link> }
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
          <Button type="button" variant={['danger']} onClick={handleDeleteAddOn}>Delete</Button>
        </div>
      </div>
    </>
  );
}
