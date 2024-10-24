import { FormEvent, useEffect, useState } from "react";
import Input from "./Library/Input";
import Button from "./Library/Button";
import GridItem from "./Library/Grid/GridItem";
import Grid from "./Library/Grid/Grid";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { deleteEngineCostIn, deleteEngineCostOut, editEngine, editEngineCostIn, editEngineCostOut, editEnginePartsTable } from "@/scripts/controllers/enginesController";
import Checkbox from "./Library/Checkbox";
import Table from "./Library/Table";
import Select from "./Library/Select/Select";
import EditEnginePartsTable from "./EditEnginePartsTable";
import { enginePartsTableAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";

interface Props {
  engine: Engine
  setEngine: (engine: Engine) => void
  setIsEditing: (value: boolean) => void
  engineCostInData: EngineCostIn[]
  engineCostOutData: EngineCostOut[]
  setEngineCostInData: (value: EngineCostIn[]) => void
  setEngineCostOutData: (value: EngineCostOut[]) => void
}


export default function EditEngineDetails({ engine, setEngine, setIsEditing, engineCostInData, engineCostOutData, setEngineCostInData, setEngineCostOutData }: Props) {
  const [engineParts, setEngineParts] = useAtom<EnginePartsTable>(enginePartsTableAtom);
  const [currentStatus, setCurrentStatus] = useState<EngineStatus>(engine.currentStatus);
  const [loginDate, setLoginDate] = useState<Date>(engine.loginDate);
  const [model, setModel] = useState<string>(engine.model);
  const [serialNumber, setSerialNumber] = useState<string>(engine.serialNumber);
  const [arrangementNumber, setArrNum] = useState<string>(engine.arrangementNumber);
  const [location, setLocation] = useState<string>(engine.location);
  const [horsePower, setHorsePower] = useState<string>(engine.horsePower);
  const [mileage, setMileage] = useState<string>(engine.mileage);
  const [purchasedFrom, setPurchasedFrom] = useState<string>(engine.purchasedFrom);
  const [toreDownDate, setToreDownDate] = useState<Date>(engine.toreDownDate);
  const [soldDate, setSoldDate] = useState<Date>(engine.soldDate);
  const [soldTo, setSoldTo] = useState<string>(engine.soldTo);
  const [sellPrice, setSellPrice] = useState<number>(engine.sellPrice);
  const [jakeBrake, setJakeBrake] = useState<boolean>(engine.jakeBrake);
  const [warranty, setWarranty] = useState<boolean>(engine.warranty);
  const [testRun, setTestRun] = useState<boolean>(engine.testRun);
  const [ecm, setEcm] = useState<boolean>(engine.ecm);
  const [askingPrice, setAskingPrice] = useState<number>(engine.askingPrice);
  const [purchasePrice, setPurchasePrice] = useState<number>(engine.purchasePrice);
  const [torque, setTorque] = useState<string>(engine.torque);
  const [pan, setPan] = useState<string>(engine.pan);
  const [application, setApplication] = useState<string>(engine.application);
  const [turboHP, setTurboHP] = useState<string>(engine.turboHP);
  const [turboLP, setTurboLP] = useState<string>(engine.turboLP);
  const [fwhNumber, setFwhNumber] = useState<string>(engine.fwhNumber);
  const [comments, setComments] = useState<string>(engine.comments);
  const [partsPulled, setPartsPulled] = useState<string>(engine.partsPulled);
  const [engineCostIn, setEngineCostIn] = useState<EngineCostIn[]>(engineCostInData);
  const [engineCostOut, setEngineCostOut] = useState<EngineCostOut[]>(engineCostOutData);
  const enginePartsData = {
    blockRemanPartNum: engine.blockRemanPartNum,
    blockPartNum: engine.blockPartNum,
    crankRemanPartNum: engine.crankRemanPartNum,
    crankPartNum: engine.crankPartNum,
    camRemanPartNum: engine.camRemanPartNum,
    camPartNum: engine.camPartNum,
    injRemanPartNum: engine.injRemanPartNum,
    injPartNum: engine.injPartNum,
    turboRemanPartNum: engine.turboRemanPartNum,
    turboPartNum: engine.turboPartNum,
    turboHPReman: engine.turboHPReman,
    turboHP: engine.turboHP,
    turboLPReman: engine.turboLPReman,
    turboLP: engine.turboLP,
    headRemanPartNum: engine.headRemanPartNum,
    headPartNum: engine.headPartNum,
    pistonsRemanPartNum: engine.pistonsRemanPartNum,
    pistonsPartNum: engine.pistonsPartNum,
    flywheelPartNum: engine.flywheelPartNum,
    oilPanRemanPartNum: engine.oilPanRemanPartNum,
    oilPanPartNum: engine.oilPanPartNum,
    oilCoolerRemanPartNum: engine.oilCoolerRemanPartNum,
    oilCoolerPartNum: engine.oilCoolerPartNum,
    frontHousingPartNum: engine.frontHousingPartNum,
    heuiPumpRemanPartNum: engine.heuiPumpRemanPartNum,
    heuiPumpPartNum: engine.heuiPumpPartNum,
    oilPumpReman: engine.oilPumpReman,
    oilPumpNew: engine.oilPumpNew,
    waterPumpReman: engine.waterPumpReman,
    waterPump: engine.waterPump,
    exhMnfldNew: engine.exhMnfldNew,
    exhMnfldReman: engine.exhMnfldReman
  };

  useEffect(() => {
    setEngineParts(enginePartsData);
  }, []);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!await confirm('Are you sure you want to save these changes?')) return;
    const newEngine = {
      id: engine.id,
      stockNum: engine.stockNum,
      currentStatus,
      loginDate,
      model,
      serialNumber,
      arrangementNumber,
      location,
      horsePower,
      mileage,
      purchasedFrom,
      toreDownDate,
      soldDate,
      soldTo,
      sellPrice,
      jakeBrake,
      warranty,
      testRun,
      ecm,
      askingPrice,
      purchasePrice,
      torque,
      pan,
      application,
      turboHP,
      turboLP,
      fwhNumber,
      comments,
      partsPulled
    } as Engine;
    await editEngine(newEngine);
    if (JSON.stringify(engineCostIn) !== JSON.stringify(engineCostInData)) {
      for (let i = 0; i < engineCostIn.length; i++) {
        const item = engineCostIn[i];
        if (typeof item.engineStockNum === 'string') {
          const newItem = {
            ...item,
            id: item.id,
            stockNum: item.engineStockNum,
            cost: item.cost,
            costType: item.costType,
            note: item.note,
          } as EngineCostOut;
          await editEngineCostOut(newItem);
        } else {
          const newItem = {
            id: item.id,
            engineStockNum: item.engineStockNum,
            cost: item.cost,
            invoiceNum: item.invoiceNum,
            costType: item.costType,
            vendor: item.vendor,
            note: item.note,
          } as EngineCostIn;
          await editEngineCostIn(newItem);
        }
        setEngineCostInData(engineCostIn);
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
    if (JSON.stringify(engineParts) !== JSON.stringify(enginePartsData)) {
      await editEnginePartsTable(engineParts, engine.id);
    }
    setEngine({ ...newEngine, ...engineParts });
    setIsEditing(false);
  };

  const handleChangeEngineCostIn = (item: EngineCostIn, i: number) => {
    const newItems = [...engineCostIn];
    newItems[i] = item;
    setEngineCostIn(newItems);
  };

  const handleChangeEngineCostOut = (item: EngineCostOut, i: number) => {
    const newItems = [...engineCostOut];
    newItems[i] = item;
    setEngineCostOut(newItems);
  };

  const handleDeleteCostInItem = async (id: number) => {
    if (!await confirm('Are you sure you want to delete this item?')) return;
    const newItems = engineCostIn.filter((i: EngineCostIn) => i.id !== id);
    await deleteEngineCostIn(id);
    setEngineCostIn(newItems);
  };

  const handleDeleteCostOutItem = async (id: number) => {
    if (!await confirm('Are you sure you want to delete this item?')) return;
    const newItems = engineCostOut.filter((i: EngineCostOut) => i.id !== id);
    const newCostInItems = engineCostIn.filter((i: EngineCostIn) => i.id !== id);
    await deleteEngineCostOut(id);
    setEngineCostOut(newItems);
    setEngineCostIn(newCostInItems);
  };
  

  return (
    <>
      {engine &&
        <form className="edit-engine-details" onSubmit={(e) => saveChanges(e)}>
          <div className="edit-engine-details__header">
            <div>
              <h2>Stock Number: { engine.stockNum }</h2>
              <Select
                value={currentStatus}
                label="Current Status"
                variant={['label-stack']}
                onChange={(e: any) => setCurrentStatus(e.target.value)} 
              >
                <option value="ToreDown">Torn Down</option>
                <option value="RunnerReady">Runner Ready</option>
                <option value="HoldSoldRunner">Hold Sold Runner</option>
                <option value="RunnerNotReady">Runner Not Ready</option>
                <option value="CoreEngine">Core Engine</option>
                <option value="Sold">Sold</option>
              </Select>
            </div>
          
            <div className="header__btn-container">
              <Button
                variant={['save']}
                className="edit-engine-details__save-btn"
                type="submit"
              >
                Save
              </Button>
              <Button
                className="edit-engine-details__close-btn"
                type="button"
                onClick={() => setIsEditing(false)}
              >
                Stop Editing
              </Button>
            </div>
          </div>

          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Login Date</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={parseDateInputValue(loginDate)}
                        type="date"
                        onChange={(e: any) => setLoginDate(new Date(e.target.value))}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Model</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={model}
                        onChange={(e: any) => setModel(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Serial Number</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={serialNumber}
                        onChange={(e: any) => setSerialNumber(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Arr Number</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={arrangementNumber}
                        onChange={(e: any) => setArrNum(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Location</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={location}
                        onChange={(e: any) => setLocation(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Horse Power</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={horsePower}
                        onChange={(e: any) => setHorsePower(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Mileage</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={mileage}
                        onChange={(e: any) => setMileage(e.target.value)}
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
                    <th>Torn Down Date</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={parseDateInputValue(toreDownDate)}
                        type="date"
                        onChange={(e: any) => setToreDownDate(new Date(e.target.value))}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Sold to Date</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={parseDateInputValue(soldDate)}
                        type="date"
                        onChange={(e: any) => setSoldDate(new Date(e.target.value))}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Sold to</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={soldTo}
                        onChange={(e: any) => setSoldTo(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Jake Brake</th>
                    <td>
                      <Checkbox
                        variant={['label-space-between', 'label-full-width', 'label-bold']}
                        checked={jakeBrake}
                        onChange={(e: any) => setJakeBrake(e.target.checked)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Warranty</th>
                    <td>
                      <Checkbox
                        variant={['label-space-between', 'label-full-width', 'label-bold']}
                        checked={warranty}
                        onChange={(e: any) => setWarranty(e.target.checked)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Test Run</th>
                    <td>
                      <Checkbox
                        variant={['label-space-between', 'label-full-width', 'label-bold']}
                        checked={testRun}
                        onChange={(e: any) => setTestRun(e.target.checked)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>ECM</th>
                    <td>
                      <Checkbox
                        variant={['label-space-between', 'label-full-width', 'label-bold']}
                        checked={ecm}
                        onChange={(e: any) => setEcm(e.target.checked)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Torque</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={torque}
                        onChange={(e: any) => setTorque(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Pan</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={pan}
                        onChange={(e: any) => setPan(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Application</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={application}
                        onChange={(e: any) => setApplication(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Turbo HP</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={turboHP}
                        onChange={(e: any) => setTurboHP(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Turbo LP</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={turboLP}
                        onChange={(e: any) => setTurboLP(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>FWH Number</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={fwhNumber}
                        onChange={(e: any) => setFwhNumber(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Sell Price</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={sellPrice}
                        type="number"
                        onChange={(e: any) => setSellPrice(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Asking Price</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={askingPrice}
                        type="number"
                        onChange={(e: any) => setAskingPrice(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={5} colEnd={12} rowStart={1} variant={['no-style']}>
              <GridItem colStart={5} colEnd={12} rowStart={1} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Comments</th>
                      <td>
                        <Input
                          variant={['label-stack', 'label-bold', 'text-area']}
                          rows={5}
                          cols={100}
                          value={comments}
                          onChange={(e: any) => setComments(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Parts Pulled</th>
                      <td>
                        <Input
                          variant={['label-stack', 'label-bold', 'text-area']}
                          rows={5}
                          cols={100}
                          value={partsPulled}
                          onChange={(e: any) => setPartsPulled(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>
              <br />

              <GridItem colStart={5} colEnd={12} variant={['low-opacity-bg']}>
                <EditEnginePartsTable engine={engine} />
              </GridItem>
            </GridItem>

            <GridItem colStart={1} colEnd={12} variant={['no-style']}>
              <Table>
                <thead>
                  <tr>
                    <th>Stock Number</th>
                    <th>Cost</th>
                    <th>Invoice Number</th>
                    <th>Cost Type</th>
                    <th>Vendor</th>
                    <th>Note</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {engineCostIn.map((item: EngineCostIn, i: number) => {
                    return (
                      <tr key={i}>
                        <td>
                          <Input
                            value={item.engineStockNum}
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, engineStockNum: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.cost}
                            type="number"
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, cost: Number(e.target.value) }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.invoiceNum}
                            type="number"
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, invoiceNum: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.costType}
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, costType: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.vendor}
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, vendor: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.note}
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, note: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Button
                            variant={['red-color']}
                            onClick={() => typeof item.engineStockNum === 'string' ? handleDeleteCostOutItem(item.id) : handleDeleteCostInItem(item.id)}
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
      }
    </>
  );
}
