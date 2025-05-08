import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { FormEvent, useState } from "react";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Table from "@/components/Library/Table";
import { Layout } from "@/components/Layout";
import { addPart, getPartsInfoByPartNum } from "@/scripts/controllers/partsController";
import Error from "@/components/Errors/Error";
import Input from "@/components/Library/Input";
import { useNavState } from "@/components/Navbar/useNavState";
import { ask } from "@tauri-apps/api/dialog";


export default function NewPart() {
  const { push } = useNavState();
  const [partNum, setPartNum] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [stockNum, setStockNum] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [purchasedFrom, setPurchasedFrom] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [remarks, setRemarks] = useState<string>('');
  const [listPrice, setListPrice] = useState<number>(0);
  const [fleetPrice, setFleetPrice] = useState<number>(0);
  const [engineStockNum, setEngineStockNum] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [altParts, setAltParts] = useState<string[]>([]);
  const [partCostIn, setPartCostIn] = useState<PartCostIn[]>([]);
  const [engineCostOut, setEngineCostOut] = useState<EngineCostOut[]>([]);
  const [error, setError] = useState('');

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!await ask('Are you sure you want to create this part?')) return;
    const newPart = {
      partNum,
      desc,
      qty,
      stockNum,
      location,
      manufacturer,
      purchasedFrom,
      condition,
      rating,
      entryDate,
      remarks,
      listPrice,
      fleetPrice,
      purchasePrice,
      altParts: altParts.reverse(),
      engineNum: engineStockNum,
    } as Part;

    const testSearch = await getPartsInfoByPartNum(partNum);
    await addPart(newPart, testSearch.length > 0);
    await push('Home', '/');
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

  
  return (
    <Layout title="New Part">
      <form className="edit-part-details" onSubmit={(e) => saveChanges(e)}>
        <Error msg={error} />

        <div className="edit-part-details__header">
          <Button
            variant={['X', 'save']}
            className="edit-part-details__save-btn"
            type="submit"
            data-testid="save-btn"
          >
            Save
          </Button>

          <Input
            label="Part Number"
            variant={['md-text']}
            value={partNum}
            onChange={(e: any) => setPartNum(e.target.value.toUpperCase())}
            data-testid="part-num"
            required
          />
          <Input
            label="Description"
            variant={['md-text']}
            value={desc}
            onChange={(e: any) => setDesc(e.target.value.toUpperCase())}
            data-testid="desc"
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
                      data-testid="stock-num"
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
                  <th>Dealer Price</th>
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
                    <Input
                      variant={['label-stack', 'label-bold', 'text-area']}
                      rows={5}
                      cols={100}
                      value={altParts.join(', ')}
                      onChange={(e: any) => setAltParts(e.target.value.split(', '))}
                      data-testid="alt-parts"
                    />
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

          {/* <GridItem colStart={1} colEnd={12} variant={['no-style']}>
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
          </GridItem> */}
        </Grid>
      </form>
    </Layout>
  );
}
