import Button from "../Library/Button";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Grid from "../Library/Grid/Grid";
import GridItem from "../Library/Grid/GridItem";
import { FormEvent, useState } from "react";
import Input from "@/components/Library/Input";
import { addAltParts, addPartCostIn, deletePartCostIn, editAltParts, editPart, editPartCostIn, getPartsInfoByAltParts, getPartsInfoByPartNum } from "@/scripts/services/partsService";
import Table from "../Library/Table";
import { addEngineCostOut, deleteEngineCostOut, editEngineCostOut } from "@/scripts/services/enginesService";
import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { PreventNavigation } from "../PreventNavigation";
import Loading from "../Library/Loading";
import { ask } from "@/scripts/config/tauri";

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
  const [desc, setDesc] = useState<string>(part.desc ?? '');
  const [qty, setQty] = useState<number>(part.qty);
  const [stockNum, setStockNum] = useState<string>(part.stockNum ?? '');
  const [location, setLocation] = useState<string>(part.location ?? '');
  const [manufacturer, setManufacturer] = useState<string>(part.manufacturer ?? '');
  const [purchasedFrom, setPurchasedFrom] = useState<string>(part.purchasedFrom ?? '');
  const [condition, setCondition] = useState<string>(part.condition ?? '');
  const [rating, setRating] = useState<number>(part.rating ?? 0);
  const [entryDate, setEntryDate] = useState<Date | null>(part.entryDate);
  const [remarks, setRemarks] = useState<string>(part.remarks ?? '');
  const [listPrice, setListPrice] = useState<number | null>(part.listPrice);
  const [fleetPrice, setFleetPrice] = useState<number | null>(part.fleetPrice);
  const [remanListPrice, setRemanListPrice] = useState<number | null>(part.remanListPrice);
  const [remanFleetPrice, setRemanFleetPrice] = useState<number | null>(part.remanFleetPrice);
  const [corePrice, setCorePrice] = useState<number | null>(part.corePrice);
  const [engineStockNum, setEngineStockNum] = useState<number | null>(part.engineNum);
  const [purchasePrice] = useState<number | null>(part.purchasePrice);
  const [altParts, setAltParts] = useState<string[]>(part.altParts);
  const [weightDims, setWeightDims] = useState<string>(part.weightDims ?? '');
  const [specialNotes, setSpecialNotes] = useState<string>(part.specialNotes ?? '');
  const [coreFam, setCoreFamily] = useState<string>(part.coreFam ?? '');
  const [partCostIn, setPartCostIn] = useState<PartCostIn[]>(partCostInData);
  const [engineCostOut, setEngineCostOut] = useState<EngineCostOut[]>(engineCostOutData);
  const [changesSaved, setChangesSaved] = useState(true);
  const [loadingAlts, isLoadingAlts] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const blankPartCostIn = { id: 0, stockNum: part.stockNum, invoiceNum: '', cost: '', vendor: '', costType: '', note: '' };
  const blankEngineCostOut = { id: 0, stockNum: part.stockNum, engineStockNum: Number(part.engineNum), cost: '', costType: '', note: '' };
  const [newPartCostInRow, setNewPartCostInRow] = useState<any>(blankPartCostIn);
  const [newEngineCostOutRow, setNewEngineCostOutRow] = useState<any>(blankEngineCostOut);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!changesSaved && !await ask('Are you sure you want to save these changes?')) return;
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
      specialNotes,
      coreFam
    } as Part;
    await editPart(newPart);

    // Edit rows
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

    // Add new rows
    if (partCostInData.length !== partCostIn.length) {
      for (let i = 0; i < partCostIn.length; i++) {
        const item = partCostIn[i];
        if (item.id === 0) {
          await addPartCostIn(part.stockNum ?? '', Number(item.cost), Number(item.invoiceNum), item.vendor ?? '', item.costType ?? '', item.note ?? '');
        }
      }
    }
    if (engineCostOutData.length !== engineCostOut.length) {
      for (let i = 0; i < engineCostOut.length; i++) {
        const item = engineCostOut[i];
        if (item.id === 0) {
          await addEngineCostOut(part.stockNum ?? '', item.engineStockNum ?? 0, item.cost ?? 0, item.costType ?? '', item.note ?? '');
        }
      }
    }

    setPart(newPart);
    setIsEditingPart(false);
  };

  const stopEditing = async () => {
    if (changesSaved) {
      setIsEditingPart(false);
    } else if (await ask('Do you want to leave without saving?')) {
      setIsEditingPart(false);
    }
  };

  const handleNewPartCostInRowChange = (field: keyof PartCostIn, value: string | number) => {
    setNewPartCostInRow((prev: PartCostIn) => ({ ...prev, [field]: value }));
  };

  const handleAddPartCostInRow = () => {
    setPartCostIn([...partCostIn, newPartCostInRow]);
    setNewPartCostInRow(blankPartCostIn);
  };

  const handleNewEngineCostOutRowChange = (field: keyof EngineCostOut, value: string | number) => {
    setNewEngineCostOutRow((prev: EngineCostOut) => ({ ...prev, [field]: value }));
  };

  const handleAddEngineCostOutRow = () => {
    setEngineCostOut([...engineCostOut, newEngineCostOutRow]);
    setNewEngineCostOutRow(blankEngineCostOut);
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

  const handleDeleteCostInItem = async (id: number, index: number) => {
    if (!await ask('Are you sure you want to delete this item?')) return;
    if (id > 0) {
      const newItems = partCostIn.filter((costin: PartCostIn) => costin.id !== id);
      await deletePartCostIn(id);
      setPartCostIn(newItems);
    } else {
      const newItems = partCostIn.filter((_: PartCostIn, i) => i !== index);
      setPartCostIn(newItems);
    }
  };

  const handleDeleteCostOutItem = async (id: number, index: number) => {
    if (!await ask('Are you sure you want to delete this item?')) return;
    if (id > 0) {
      const newItems = engineCostOut.filter((costin: EngineCostOut) => costin.id !== id);
      await deleteEngineCostOut(id);
      setEngineCostOut(newItems);
    } else {
      const newItems = engineCostOut.filter((_: EngineCostOut, i) => i !== index);
      setEngineCostOut(newItems);
    }
  };

  const handleAddAltPart = async () => {
    const input = prompt('Enter part numbers separated by a comma');
    if (!input) return;
    const values = input.toUpperCase().trim().replace(/\s*,\s*/g, ',').split(',');
  
    let altsToAdd: any = new Set();
    for (const value of values) {
      const partInfo = await getPartsInfoByPartNum(value);
      if (partInfo.length > 0) {
        partInfo[0].altParts.split(', ').forEach((alt: string) => altsToAdd.add(alt));
      }
    }
    altsToAdd = Array.from(altsToAdd);
  
    const uniqueAlts = [...altsToAdd].filter((a) => a !== part.partNum && !part.altParts.includes(a));
    if (!await ask(`Are you sure you want to add: ${input}?\n\nNew Alt Parts:\n${[...part.altParts, ...uniqueAlts].join(', ')}`)) return;
    if (uniqueAlts.length === 0) return;
    isLoadingAlts(true);
    await editAltParts(part.partNum, [...altParts, ...uniqueAlts]);
    await addAltParts(part.partNum, [...altParts, ...uniqueAlts], updateLoading);
  
    isLoadingAlts(false);
    setAltParts([...altParts, ...uniqueAlts]);
    setPart({ ...part, altParts: [...altParts, ...uniqueAlts] });
  };

  const handleRemoveAltPart = async () => {
    const input = prompt('Enter part numbers seperated by comma');
    const removedParts = input?.toUpperCase().trim().replace(/\s*,\s*/g, ',').split(',') ?? [];
    const updatedAltString = altParts.filter((a) => !removedParts.includes(a));
    if (!input || !await ask(`Are you sure you want to remove: ${removedParts.join(', ')}?\n\nNew Alt Parts:\n${updatedAltString.join(', ')}`)) return;

    const partsInfo = await getPartsInfoByAltParts(removedParts[0]);
    for (let i = 0; i < partsInfo.length; i++) {
      if (removedParts.includes(partsInfo[i].partNum)) {
        await editAltParts(partsInfo[i].partNum, [partsInfo[i].partNum]);
      } else {
        const filteredParts = altParts.filter((part) => !removedParts.includes(part));
        await editAltParts(partsInfo[i].partNum, filteredParts);
      }
    }

    const newAltParts = (await getPartsInfoByPartNum(part.partNum))[0].altParts.split(', ');
    setAltParts(newAltParts);
    setPart({ ...part, altParts: newAltParts });
  };

  const updateLoading = (i: number, total: number) => {
    setLoadingProgress(`${i}/${total}`);
  };

  
  return (
    <>
      <PreventNavigation shouldPrevent={!changesSaved} text="Leave without saving changes?" />
      
      <form className="edit-part-details" onSubmit={(e) => saveChanges(e)} onChange={() => setChangesSaved(false)}>
        <div className="edit-part-details__header">
          <div className="header__btn-container">
            <Button
              variant={['save']}
              className="edit-part-details__save-btn"
              type="submit"
              data-testid="save-btn"
            >
              Save
            </Button>
            <Button
              className="edit-part-details__close-btn"
              type="button"
              onClick={stopEditing}
              data-testid="stop-editing"
            >
              Stop Editing
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
                      data-testid="qty"
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
                <tr>
                  <th>Core Family</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={coreFam ?? ''}
                      onChange={(e: any) => setCoreFamily(e.target.value)}
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
                      value={listPrice ?? ''}
                      onChange={(e: any) => setListPrice(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </td>
                </tr>
                <tr>
                  <th>Dealer Price</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={fleetPrice ?? ''}
                      onChange={(e: any) => setFleetPrice(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </td>
                </tr>
                <tr>
                  <th>Reman List Price</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={remanListPrice ?? ''}
                      onChange={(e: any) => setRemanListPrice(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </td>
                </tr>
                <tr>
                  <th>Reman Fleet Price</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={remanFleetPrice ?? ''}
                      onChange={(e: any) => setRemanFleetPrice(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </td>
                </tr>
                <tr>
                  <th>Core Price</th>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                      value={corePrice ?? ''}
                      onChange={(e: any) => setCorePrice(e.target.value)}
                      type="number"
                      step="any"
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
                    {!loadingAlts ?
                      user.accessLevel >= 2 ?
                        <>
                          <p style={{ margin: '0.8rem' }}>{ altParts.join(', ') }</p>
                          <div className="edit-part-details__alt-parts-btn-container">
                            <Button type="button" onClick={handleAddAltPart} data-testid="add-alts">Add</Button>
                            <Button variant={['danger']} type="button" onClick={handleRemoveAltPart} data-testid="remove-alts">Remove</Button>
                          </div>
                        </>
                        :
                        <p style={{ marginLeft: '0.8rem' }}>{ altParts.join(', ') }</p>
                      :
                      <center>
                        <p>Modifying Alts</p>
                        <p>DO NOT exit</p>
                        <p>{ loadingProgress }</p>
                        <Loading />
                      </center>
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
                      value={engineStockNum ?? ''}
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

          <GridItem variant={['no-style']} rowStart={4} colStart={1} colEnd={6}>
            <h2>Part Cost In</h2>
            <Table variant={['plain', 'edit-row-details']}>
              <thead>
                <tr>
                  <th>Cost</th>
                  <th>Cost Type</th>
                  <th>Vendor</th>
                  <th>Handwritten ID</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {partCostIn.map((item, i) => {
                  return (
                    <tr key={item.id}>
                      <td>
                        <Input
                          variant={['x-small', 'thin', 'label-bold']}
                          value={item.cost ?? ''}
                          onChange={(e: any) => handleChangePartCostIn({ ...item, cost: e.target.value }, i)}
                          type="number"
                          step="any"
                        />
                      </td>
                      <td>
                        <Input
                          variant={['x-small', 'thin', 'label-bold']}
                          value={item.costType ?? ''}
                          onChange={(e: any) => handleChangePartCostIn({ ...item, costType: e.target.value }, i)}
                        />
                      </td>
                      <td>
                        <Input
                          variant={['x-small', 'thin', 'label-bold']}
                          value={item.vendor ?? ''}
                          onChange={(e: any) => handleChangePartCostIn({ ...item, vendor: e.target.value }, i)}
                        />
                      </td>
                      <td>
                        <Input
                          variant={['x-small', 'thin', 'label-bold']}
                          value={item.invoiceNum ?? ''}
                          onChange={(e: any) => handleChangePartCostIn({ ...item, invoiceNum: e.target.value }, i)}
                          type="number"
                        />
                      </td>
                      <td>
                        <Input
                          variant={['x-small', 'thin', 'label-bold']}
                          value={item.note ?? ''}
                          onChange={(e: any) => handleChangePartCostIn({ ...item, note: e.target.value }, i)}
                        />
                      </td>
                      <td>
                        <Button
                          variant={['danger']}
                          onClick={() => handleDeleteCostInItem(item.id, i)}
                          type="button"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {/* Blank row for new entry */}
                <tr>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-bold']}
                      value={newPartCostInRow.cost}
                      onChange={(e: any) => handleNewPartCostInRowChange('cost', e.target.value)}
                      type="number"
                      step="any"
                    />
                  </td>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-bold']}
                      value={newPartCostInRow.costType}
                      onChange={(e: any) => handleNewPartCostInRowChange('costType', e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-bold']}
                      value={newPartCostInRow.vendor}
                      onChange={(e: any) => handleNewPartCostInRowChange('vendor', e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-bold']}
                      value={newPartCostInRow.invoiceNum}
                      onChange={(e: any) => handleNewPartCostInRowChange('invoiceNum', e.target.value)}
                      type="number"
                    />
                  </td>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-bold']}
                      value={newPartCostInRow.note}
                      onChange={(e: any) => handleNewPartCostInRowChange('note', e.target.value)}
                    />
                  </td>
                  <td>
                    <Button
                      onClick={() => handleAddPartCostInRow()}
                      type="button"
                    >
                      Add
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </GridItem>

          <GridItem variant={['no-style']} rowStart={4} colStart={8} colEnd={12}>
            <h2>Engine Cost Out</h2>
            <Table variant={['plain', 'edit-row-details']}>
              <thead>
                <tr>
                  <th>Cost</th>
                  <th>Engine Stock Number</th>
                  <th>Stock Number</th>
                  <th>Cost Type</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {engineCostOut.map((item: EngineCostOut, i) => {
                  return (
                    <tr key={i}>
                      <td>
                        <Input
                          variant={['x-small', 'thin', 'label-bold']}
                          value={item.cost ?? ''}
                          onChange={(e: any) => handleChangeEngineCostOut({ ...item, cost: e.target.value }, i)}
                          type="number"
                          step="any"
                        />
                      </td>
                      <td>
                        <Input
                          variant={['x-small', 'thin', 'label-bold']}
                          value={item.engineStockNum ?? ''}
                          onChange={(e: any) => handleChangeEngineCostOut({ ...item, engineStockNum: e.target.value }, i)}
                          type="number"
                        />
                      </td>
                      <td>
                        <Input
                          variant={['x-small', 'thin', 'label-bold']}
                          value={item.stockNum ?? ''}
                          onChange={(e: any) => handleChangeEngineCostOut({ ...item, stockNum: e.target.value }, i)}
                        />
                      </td>
                      <td>
                        <Input
                          variant={['x-small', 'thin', 'label-bold']}
                          value={item.costType ?? ''}
                          onChange={(e: any) => handleChangeEngineCostOut({ ...item, costType: e.target.value }, i)}
                        />
                      </td>
                      <td>
                        <Input
                          variant={['x-small', 'thin', 'label-bold']}
                          value={item.note ?? ''}
                          onChange={(e: any) => handleChangeEngineCostOut({ ...item, note: e.target.value }, i)}
                        />
                      </td>
                      <td>
                        <Button
                          variant={['danger']}
                          onClick={() => handleDeleteCostOutItem(item.id, i)}
                          type="button"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {/* Blank row for new entry */}
                <tr>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-bold']}
                      value={newEngineCostOutRow.cost}
                      onChange={(e: any) => handleNewEngineCostOutRowChange('cost', e.target.value)}
                      type="number"
                      step="any"
                    />
                  </td>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-bold']}
                      value={newEngineCostOutRow.engineStockNum}
                      onChange={(e: any) => handleNewEngineCostOutRowChange('engineStockNum', e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-bold']}
                      value={newEngineCostOutRow.stockNum}
                      onChange={(e: any) => handleNewEngineCostOutRowChange('stockNum', e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-bold']}
                      value={newEngineCostOutRow.costType}
                      onChange={(e: any) => handleNewEngineCostOutRowChange('costType', e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      variant={['x-small', 'thin', 'label-bold']}
                      value={newEngineCostOutRow.note}
                      onChange={(e: any) => handleNewEngineCostOutRowChange('note', e.target.value)}
                    />
                  </td>
                  <td>
                    <Button
                      onClick={() => handleAddEngineCostOutRow()}
                      type="button"
                    >
                      Add
                    </Button>
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
