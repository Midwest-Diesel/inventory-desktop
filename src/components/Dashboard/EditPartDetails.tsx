import Button from "../Library/Button";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Grid from "../Library/Grid/Grid";
import GridItem from "../Library/Grid/GridItem";
import { FormEvent, useState } from "react";
import Input from "@/components/Library/Input";
import { addAltParts, deletePartCostIn, editAltParts, editPart, editPartCostIn, getPartsInfoByPartNum, searchAltParts } from "@/scripts/controllers/partsController";
import Table from "../Library/Table";
import { deleteEngineCostOut, editEngineCostOut } from "@/scripts/controllers/enginesController";
import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";

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
  const [remainingPrice, setRemainingPrice] = useState<number>(part.remainingPrice);
  const [listPrice, setListPrice] = useState<number>(part.listPrice);
  const [fleetPrice, setFleetPrice] = useState<number>(part.fleetPrice);
  const [engineStockNum, setEngineStockNum] = useState<number>(part.engineNum);
  // const [serialNum, setSerialNum] = useState<string>(part.serialNum);
  // const [horsePower, setHorsePower] = useState<string>(part.horsePower);
  const [purchasePrice, setPurchasePrice] = useState<number>(part.purchasePrice);
  const [altParts, setAltParts] = useState<string[]>(part.altParts);
  const [partCostIn, setPartCostIn] = useState<PartCostIn[]>(partCostInData);
  const [engineCostOut, setEngineCostOut] = useState<EngineCostOut[]>(engineCostOutData);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to save these changes?')) return;
    const newPart = {
      id: part.id,
      partNum: part.partNum,
      desc,
      qty,
      stockNum,
      location,
      manufacturer,
      purchasedFrom,
      condition,
      rating: Number(rating),
      entryDate,
      remarks,
      remainingPrice: Number(remainingPrice),
      listPrice,
      fleetPrice,
      purchasePrice: Number(purchasePrice),
      engineNum: engineStockNum,
      altParts: altParts,
    } as Part;
    await editPart(newPart);
    // if (JSON.stringify(altParts) !== JSON.stringify(part.altParts)) {
    //   await editAltParts(newPart.partNum, altParts, part.altParts);
    // }
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
          cost: item.cost,
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
    if (!confirm('Are you sure you want to delete this item?')) return;
    const newItems = partCostIn.filter((i: PartCostIn) => i.id !== id);
    await deletePartCostIn(id);
    setPartCostIn(newItems);
  };

  const handleDeleteCostOutItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const newItems = engineCostOut.filter((i: EngineCostOut) => i.id !== id);
    await deleteEngineCostOut(id);
    setEngineCostOut(newItems);
  };

  const handleAddAltPart = async () => {
    const input = prompt('Enter part numbers seperated by comma');
    const value = input && input.toUpperCase().trim().split(',');
    if (!input || !confirm(`Are you sure you want to ADD: ${value.join(', ')}?`)) return;
    const altRes = await getPartsInfoByPartNum(value[0]);
    const altString = altRes[0].altParts;
    await editAltParts(part.partNum, [...altParts, altString]);
    await addAltParts(part.partNum, [...altParts, ...value]);
    setAltParts([...altParts, altString]);
  };

  const handleRemoveAltPart = async () => {
    const input = prompt('Enter part numbers seperated by comma');
    let altsToDelete = [];
    const deletedParts = [];
    if (!input || !confirm(`Are you sure you want to REMOVE: ${input.toUpperCase().trim().split(',').join(', ')}?`)) return;
    // Remove alt parts from currently edited part record
    const removedParts = input.toUpperCase().trim().split(',').map((p) => p.trim());

    for (let i = 0; i < removedParts.length; i++) {
      const res = await searchAltParts({ partNum: `*${removedParts[i]}` });
      for (let j = 0; j < res.length; j++) {
        if (res[j].partNum !== removedParts[i]) {
          const filteredParts = altParts.filter((part) => !removedParts.includes(part));
          await editAltParts(res[j].partNum, filteredParts);
          altsToDelete.push(...filteredParts);
        } else {
          deletedParts.push(res[j]);
        }
      }
    }
    altsToDelete = Array.from(new Set(altsToDelete));

    // Remove alt parts from connected part records
    for (let i = 0; i < deletedParts.length; i++) {
      const filteredParts = altParts.filter((part) => !altsToDelete.includes(part));
      await editAltParts(deletedParts[i].partNum, filteredParts);
    }
    window.location.reload();
  };

  
  return (
    <form className="edit-part-details" onSubmit={(e) => saveChanges(e)}>
      <div className="edit-part-details__header">
        <div className="header__btn-container">
          <Button
            className="edit-part-details__close-btn"
            type="button"
            onClick={() => setIsEditingPart(false)}
          >
            Stop Editing
          </Button>
          <Button
            variant={['save']}
            className="edit-part-details__save-btn"
            type="submit"
            data-cy="save-btn"
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
        <GridItem colStart={1} colEnd={5} rowStart={1} variant={['low-opacity-bg']}>
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

        <GridItem colStart={1} colEnd={5} rowStart={2} variant={['low-opacity-bg']}>
          <Table variant={['plain', 'edit-row-details']}>
            <tbody>
              <tr>
                <th>New List Price</th>
                <td>
                  <Input
                    variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={listPrice}
                    type="number"
                    onChange={(e: any) => setListPrice(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>New Fleet Price</th>
                <td>
                  <Input
                    variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={fleetPrice}
                    type="number"
                    onChange={(e: any) => setFleetPrice(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Reman List Price</th>
                <td></td>
              </tr>
              <tr>
                <th>Reman Fleet Price</th>
                <td></td>
              </tr>
              <tr>
                <th>Core Price</th>
                <td></td>
              </tr>
            </tbody>
          </Table>
        </GridItem>

        <GridItem colStart={5} colEnd={10} rowStart={1} variant={['low-opacity-bg']}>
          <Table variant={['plain', 'edit-row-details']}>
            <tbody>
              <tr>
                <th>Alt Parts</th>
                <td>
                  {user.accessLevel >= 2 ?
                    <>
                      <p style={{ margin: '0.8rem' }}>{ altParts.join(', ') }</p>
                      <div className="edit-part-details__alt-parts-btn-container">
                        <Button type="button" onClick={handleAddAltPart}>Add</Button>
                        <Button variant={['danger']} type="button" onClick={handleRemoveAltPart}>Remove</Button>
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

        <GridItem colStart={5} colEnd={10} rowStart={2} variant={['low-opacity-bg']}>
          <Table variant={['plain', 'edit-row-details']}>
            <tbody>
              <tr>
                <th>Engine Stock #</th>
                <td>
                  <Input
                    variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={engineStockNum}
                    type="number"
                    onChange={(e: any) => setEngineStockNum(e.target.value)}
                  />  
                </td>
              </tr>
              <tr>
                <th>Serial Number</th>
                <td>
                  <Input
                    variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  />  
                </td>
              </tr>
              <tr>
                <th>Horse Power</th>
                <td>
                  <Input
                    variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                  />  
                </td>
              </tr>
            </tbody>
          </Table>
        </GridItem>

        <GridItem colStart={1} colEnd={12} variant={['no-style']}>
          <h2>Part Cost In</h2>
          <Table>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Cost</th>
                <th>Cost Type</th>
                <th>Vendor</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {partCostIn.map((item: PartCostIn, i: number) => { 
                return (
                  <tr key={i}>
                    <td>
                      <Input
                        value={item.invoiceNum}
                        type="number"
                        onChange={(e: any) => handleChangePartCostIn({ ...item, invoiceNum: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.cost}
                        type="number"
                        onChange={(e: any) => handleChangePartCostIn({ ...item, cost: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.costType}
                        onChange={(e: any) => handleChangePartCostIn({ ...item, costType: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.vendor}
                        onChange={(e: any) => handleChangePartCostIn({ ...item, vendor: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.note}
                        onChange={(e: any) => handleChangePartCostIn({ ...item, note: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Button
                        variant={['red-color']}
                        onClick={() => handleDeleteCostInItem(item.id)}
                        type="button"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </GridItem>

        <GridItem colStart={1} colEnd={12} variant={['no-style']}>
          <h2>Engine Cost Out</h2>
          <Table>
            <thead>
              <tr>
                <th>Stock Number</th>
                <th>Cost</th>
                <th>Cost Type</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {engineCostOut.map((item: EngineCostOut, i: number) => { 
                return (
                  <tr key={i}>
                    <td>
                      <Input
                        value={item.stockNum}
                        onChange={(e: any) => handleChangeEngineCostOut({ ...item, stockNum: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.cost}
                        type="number"
                        onChange={(e: any) => handleChangeEngineCostOut({ ...item, cost: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.costType}
                        onChange={(e: any) => handleChangeEngineCostOut({ ...item, costType: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.note}
                        onChange={(e: any) => handleChangeEngineCostOut({ ...item, note: e.target.value }, i)}
                      />
                    </td>
                    <td>
                      <Button
                        variant={['red-color']}
                        onClick={() => handleDeleteCostOutItem(item.id)}
                        type="button"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </GridItem>
      </Grid>
    </form>
  );
}
