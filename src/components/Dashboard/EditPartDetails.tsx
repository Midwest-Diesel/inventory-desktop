import Button from "../Library/Button";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Grid from "../Library/Grid/Grid";
import GridItem from "../Library/Grid/GridItem";
import { FormEvent, useState } from "react";
import Input from "@/components/Library/Input";
import { addAltParts, deletePartCostIn, editAltParts, editPart, editPartCostIn, getPartsInfoByAltParts, getPartsInfoByPartNum, searchAltParts } from "@/scripts/controllers/partsController";
import Table from "../Library/Table";
import { deleteEngineCostOut, editEngineCostOut } from "@/scripts/controllers/enginesController";
import { showSoldPartsAtom, userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { confirm } from "@/scripts/config/tauri";
import { PreventNavigation } from "../PreventNavigation";

interface Props {
  part: Part
  setPart: (part: Part) => void
  setIsEditingPart: (value: boolean) => void
  partCostInData: PartCostIn[]
  engineCostOutData: EngineCostOut[]
  setPartCostInData: (value: PartCostIn[]) => void
  setEngineCostOutData: (value: EngineCostOut[]) => void
}


export default function PartDetails({ part, setPart, setIsEditingPart, partCostInData, engineCostOutData, setPartCostInData, setEngineCostOutData }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [showSoldParts] = useAtom<boolean>(showSoldPartsAtom);
  const [desc, setDesc] = useState<string>(part.desc);
  const [qty, setQty] = useState<number>(part.qty);
  const [stockNum, setStockNum] = useState<string>(part.stockNum);
  const [location, setLocation] = useState<string>(part.location);
  const [manufacturer, setManufacturer] = useState<string>(part.manufacturer);
  const [purchasedFrom, setPurchasedFrom] = useState<string>(part.purchasedFrom);
  const [condition, setCondition] = useState<string>(part.condition);
  const [rating, setRating] = useState<number>(part.rating);
  const [entryDate, setEntryDate] = useState<Date>(part.entryDate);
  const [remarks, setRemarks] = useState<string>(part.remarks);
  const [listPrice, setListPrice] = useState<number>(part.listPrice);
  const [fleetPrice, setFleetPrice] = useState<number>(part.fleetPrice);
  const [remanListPrice, setRemanListPrice] = useState<number>(part.remanListPrice);
  const [remanFleetPrice, setRemanFleetPrice] = useState<number>(part.remanFleetPrice);
  const [corePrice, setCorePrice] = useState<number>(part.corePrice);
  const [engineStockNum, setEngineStockNum] = useState<number>(part.engineNum);
  const [purchasePrice, setPurchasePrice] = useState<number>(part.purchasePrice);
  const [altParts, setAltParts] = useState<string[]>(part.altParts);
  const [weightDims, setWeightDims] = useState<string>(part.weightDims);
  const [specialNotes, setSpecialNotes] = useState<string>(part.specialNotes);
  const [partCostIn, setPartCostIn] = useState<PartCostIn[]>(partCostInData);
  const [engineCostOut, setEngineCostOut] = useState<EngineCostOut[]>(engineCostOutData);
  const [changesSaved, setChangesSaved] = useState(true);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!await confirm('Are you sure you want to save these changes?')) return;
    setChangesSaved(false);
    const newPart = {
      id: part.id,
      partNum: part.partNum,
      desc,
      qty: Number(qty),
      stockNum,
      location,
      manufacturer,
      purchasedFrom,
      condition,
      rating: Number(rating),
      entryDate,
      remarks,
      listPrice: Number(listPrice),
      fleetPrice: Number(fleetPrice),
      remanListPrice: Number(remanListPrice),
      remanFleetPrice: Number(remanFleetPrice),
      corePrice: Number(corePrice),
      purchasePrice: Number(purchasePrice),
      engineNum: engineStockNum,
      altParts,
      weightDims,
      specialNotes
    } as Part;
    await editPart(newPart);
    if (JSON.stringify(partCostIn) !== JSON.stringify(partCostInData)) {
      for (let i = 0; i < partCostIn.length; i++) {
        const item = partCostIn[i];
        const newItem = {
          ...item,
          id: item.id,
          invoiceNum: Number(item.invoiceNum),
          cost: Number(item.cost),
          costType: item.costType,
          vendor: item.vendor,
          note: item.note,
        } as PartCostIn;
        await editPartCostIn(newItem);
        setPartCostInData(partCostIn);
      }
    }
    if (JSON.stringify(engineCostOut) !== JSON.stringify(engineCostOutData)) {
      for (let i = 0; i < engineCostOut.length; i++) {
        const item = engineCostOut[i];
        const newItem = {
          ...item,
          id: item.id,
          stockNum: item.stockNum,
          cost: Number(item.cost),
          costType: item.costType,
          note: item.note,
        } as EngineCostOut;
        await editEngineCostOut(newItem);
        setEngineCostOutData(engineCostOut);
      }
    }
    setPart(newPart);
    setIsEditingPart(false);
  };

  const handleChangePartCostIn = (item: PartCostIn, i: number) => {
    const newItems = [...partCostIn];
    newItems[i] = item;
    setPartCostIn(newItems);
  };

  const handleChangeEngineCostOut = (item: EngineCostOut, i: number) => {
    const newItems = [...engineCostOut];
    newItems[i] = item;
    setEngineCostOut(newItems);
  };

  const handleDeleteCostInItem = async (id: number) => {
    if (!await confirm('Are you sure you want to delete this item?')) return;
    const newItems = partCostIn.filter((i: PartCostIn) => i.id !== id);
    await deletePartCostIn(id);
    setPartCostIn(newItems);
  };

  const handleDeleteCostOutItem = async (id: number) => {
    if (!await confirm('Are you sure you want to delete this item?')) return;
    const newItems = engineCostOut.filter((i: EngineCostOut) => i.id !== id);
    await deleteEngineCostOut(id);
    setEngineCostOut(newItems);
  };

  const handleAddAltPart = async () => {
    const input = prompt('Enter part numbers seperated by comma');
    const value: string[] = input && input.toUpperCase().trim().replace(/\s*,\s*/g, ',').split(',');
    if (!input || !await confirm(`Are you sure you want to ADD: ${value.join(', ')}?`)) return;
    
    let altsToAdd = [];
    for (let i = 0; i < value.length; i++) {
      const partInfo = await getPartsInfoByPartNum(value[i]);
      altsToAdd.push(...partInfo[0].altParts.split(', '));
    }
    altsToAdd = Array.from(new Set(altsToAdd)).filter((a) => a !== part.partNum && !part.altParts.includes(a));

    await editAltParts(part.partNum, [...altParts, ...altsToAdd]);
    await addAltParts(part.partNum, [...altParts, ...altsToAdd]);
    setAltParts([...altParts, ...altsToAdd]);
    setPart({ ...part, altParts: [...altParts, ...altsToAdd] });
  };

  const handleRemoveAltPart = async () => {
    const input = prompt('Enter part numbers seperated by comma');
    const removedParts = input && input.toUpperCase().trim().replace(/\s*,\s*/g, ',').split(',');
    if (!input || !await confirm(`Are you sure you want to REMOVE: ${removedParts.join(', ')}?`)) return;

    const partsInfo = await getPartsInfoByAltParts(removedParts[0]);
    for (let i = 0; i < partsInfo.length; i++) {
      if (removedParts.includes(partsInfo[i].partNum)) {
        const filteredParts = partsInfo[i].altParts.split(', ').filter((alt) => !altParts.includes(alt) || alt === partsInfo[i].partNum);
        await editAltParts(partsInfo[i].partNum, filteredParts);
      } else {
        const filteredParts = altParts.filter((part) => !removedParts.includes(part));
        await editAltParts(partsInfo[i].partNum, filteredParts);
      }
    }

    const newAltParts = (await getPartsInfoByPartNum(part.partNum))[0].altParts.split(', ');
    setAltParts(newAltParts);
    setPart({ ...part, altParts: newAltParts });
  };

  
  return (
    <>
      <PreventNavigation shouldPrevent={!changesSaved} text="Leave without saving changes?" />
      
      <form className="edit-part-details" onSubmit={(e) => saveChanges(e)} onChange={() => setChangesSaved(false)}>
        <div className="edit-part-details__header">
          <div className="header__btn-container">
            <Button
              className="edit-part-details__close-btn"
              type="button"
              onClick={() => setIsEditingPart(false)}
              data-id="stop-editing"
            >
              Stop Editing
            </Button>
            <Button
              variant={['save']}
              className="edit-part-details__save-btn"
              type="submit"
              data-id="save-btn"
            >
              Save
            </Button>
          </div>

          <h2>{ part.partNum }</h2>
          <Input
            label="Description"
            variant={['md-text']}
            value={desc}
            onChange={(e: any) => setDesc(e.target.value.toUpperCase())}
            required
          />
        </div>

        <Grid rows={1} cols={12} gap={1}>
          <GridItem colStart={1} colEnd={7} rowStart={1} variant={['low-opacity-bg']}>
            <Table variant={['plain', 'edit-row-details']}>
              <tbody>
                <tr>
                  <th>Qty</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={qty}
                      type="number"
                      onChange={(e: any) => setQty(e.target.value)}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th>Stock Number</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={stockNum}
                      onChange={(e: any) => setStockNum(e.target.value)}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th>Location</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={location}
                      onChange={(e: any) => setLocation(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Manufacturer</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={manufacturer}
                      onChange={(e: any) => setManufacturer(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Purchased From</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={purchasedFrom}
                      onChange={(e: any) => setPurchasedFrom(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Condition</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={condition}
                      onChange={(e: any) => setCondition(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Rating</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={rating}
                      type="number"
                      onChange={(e: any) => setRating(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Entry Date</th>
                  <td>
                    <Input
                      variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      type="date"
                      value={parseDateInputValue(entryDate)}
                      onChange={(e: any) => setEntryDate(new Date(e.target.value))}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </GridItem>

          <GridItem colStart={1} colEnd={7} rowStart={2} variant={['low-opacity-bg']}>
            <Table variant={['plain', 'edit-row-details']}>
              <tbody>
                <tr>
                  <th>New List Price</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={listPrice}
                      onChange={(e: any) => setListPrice(e.target.value)}
                      type="number"
                    />
                  </td>
                </tr>
                <tr>
                  <th>New Fleet Price</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={fleetPrice}
                      onChange={(e: any) => setFleetPrice(e.target.value)}
                      type="number"
                    />
                  </td>
                </tr>
                <tr>
                  <th>Reman List Price</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={remanListPrice}
                      onChange={(e: any) => setRemanListPrice(e.target.value)}
                      type="number"
                    />
                  </td>
                </tr>
                <tr>
                  <th>Reman Fleet Price</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={remanFleetPrice}
                      onChange={(e: any) => setRemanFleetPrice(e.target.value)}
                      type="number"
                    />
                  </td>
                </tr>
                <tr>
                  <th>Core Price</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={corePrice}
                      onChange={(e: any) => setCorePrice(e.target.value)}
                      type="number"
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </GridItem>

          <GridItem colStart={7} colEnd={12} rowStart={1} variant={['low-opacity-bg']}>
            <Table variant={['plain', 'edit-row-details']}>
              <tbody>
                <tr>
                  <th>Alt Parts</th>
                  <td>
                    {user.accessLevel >= 2 ?
                      <>
                        <p style={{ margin: '0.8rem' }}>{ altParts.join(', ') }</p>
                        <div className="edit-part-details__alt-parts-btn-container">
                          <Button type="button" onClick={handleAddAltPart} data-id="add-alts">Add</Button>
                          <Button variant={['danger']} type="button" onClick={handleRemoveAltPart} data-id="remove-alts">Remove</Button>
                        </div>
                      </>
                      :
                      <p style={{ marginLeft: '0.8rem' }}>{ altParts.join(', ') }</p>
                    }
                  </td>
                </tr>
                <tr>
                  <th>Remarks</th>
                  <td>
                    <Input
                      variant={['label-stack', 'label-bold', 'text-area']}
                      rows={5}
                      cols={100}
                      value={remarks}
                      onChange={(e: any) => setRemarks(e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </GridItem>

          <GridItem colStart={7} colEnd={12} rowStart={2} variant={['low-opacity-bg']}>
            <Table variant={['plain', 'edit-row-details']}>
              <tbody>
                <tr>
                  <th>Engine Stock #</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={engineStockNum}
                      onChange={(e: any) => setEngineStockNum(e.target.value)}
                      type="number"
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </GridItem>

          <GridItem colStart={1} colEnd={7} rowStart={3} variant={['low-opacity-bg']}>
            <Table variant={['plain', 'edit-row-details']}>
              <tbody>
                <tr>
                  <th>Shipping Weights/Dims</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={weightDims}
                      onChange={(e: any) => setWeightDims(e.target.value)}
                    />  
                  </td>
                </tr>
                <tr>
                  <th>Sales Notes</th>
                  <td>
                    <Input
                      variant={['label-stack', 'label-bold', 'text-area']}
                      rows={5}
                      cols={100}
                      value={specialNotes}
                      onChange={(e: any) => setSpecialNotes(e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </GridItem>
        </Grid>
      </form>
    </>
  );
}
