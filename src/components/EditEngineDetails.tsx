import { FormEvent, useEffect, useState } from "react";
import Input from "./Library/Input";
import Button from "./Library/Button";
import GridItem from "./Library/Grid/GridItem";
import Grid from "./Library/Grid/Grid";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { addEngineCostIn, addEngineCostOut, deleteEngineCostIn, deleteEngineCostOut, editEngine, editEngineCostIn, editEngineCostOut, editEnginePartsTable } from "@/scripts/services/enginesService";
import Checkbox from "./Library/Checkbox";
import Table from "./Library/Table";
import Select from "./Library/Select/Select";
import EditEnginePartsTable from "./EditEnginePartsTable";
import { enginePartsTableAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { PreventNavigation } from "./PreventNavigation";
import { ask } from "@tauri-apps/api/dialog";

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
  const [currentStatus, setCurrentStatus] = useState<EngineStatus>(engine.currentStatus ?? 'ToreDown');
  const [loginDate, setLoginDate] = useState<Date | null>(engine.loginDate);
  const [model, setModel] = useState<string>(engine.model ?? '');
  const [serialNum, setSerialNumber] = useState<string>(engine.serialNum ?? '');
  const [arrNum, setArrNum] = useState<string>(engine.arrNum ?? '');
  const [location, setLocation] = useState<string>(engine.location ?? '');
  const [horsePower, setHorsePower] = useState<string>(engine.horsePower ?? '');
  const [mileage, setMileage] = useState<string>(engine.mileage ?? '');
  const [purchasedFrom, setPurchasedFrom] = useState<string>(engine.purchasedFrom ?? '');
  const [toreDownDate, setToreDownDate] = useState<Date | null>(engine.toreDownDate);
  const [soldDate, setSoldDate] = useState<Date | null>(engine.soldDate);
  const [soldTo, setSoldTo] = useState<string>(engine.soldTo ?? '');
  const [sellPrice, setSellPrice] = useState<number | null>(engine.sellPrice);
  const [jakeBrake, setJakeBrake] = useState<boolean>(engine.jakeBrake);
  const [warranty, setWarranty] = useState<boolean>(engine.warranty);
  const [testRun, setTestRun] = useState<boolean>(engine.testRun);
  const [ecm, setEcm] = useState<boolean>(engine.ecm);
  const [askingPrice, setAskingPrice] = useState<number | null>(engine.askingPrice);
  const [torque, setTorque] = useState<string>(engine.torque ?? '');
  const [pan, setPan] = useState<string>(engine.pan ?? '');
  const [application, setApplication] = useState<string>(engine.application ?? '');
  const [turboHpNew, setTurboHP] = useState<string>(engine.turboHpNew ?? '');
  const [turboLpNew, setTurboLP] = useState<string>(engine.turboLpNew ?? '');
  const [fwhNumber, setFwhNumber] = useState<string>(engine.fwhNumber ?? '');
  const [comments, setComments] = useState<string>(engine.comments ?? '');
  const [partsPulled, setPartsPulled] = useState<string>(engine.partsPulled ?? '');
  const [engineCostIn, setEngineCostIn] = useState<EngineCostIn[]>(engineCostInData);
  const [engineCostOut, setEngineCostOut] = useState<EngineCostOut[]>(engineCostOutData);
  const [changesSaved, setChangesSaved] = useState(true);
  const blankEngineCostIn = { id: 0, cost: '', engineStockNum: engine.stockNum, vendor: '', invoiceNum: '', costType: '', note: '' };
  const blankEngineCostOut = { id: 0, stockNum: '', engineStockNum: Number(engine.stockNum), cost: '', costType: '', note: '' };
  const [newEngineCostInRow, setNewEngineCostInRow] = useState<any>(blankEngineCostIn);
  const [newEngineCostOutRow, setNewEngineCostOutRow] = useState<any>(blankEngineCostOut);
  const enginePartsData = {
    blockReman: engine.blockReman,
    blockNew: engine.blockNew,
    blockCasting: engine.blockCasting,
    blockActual: engine.blockActual,
    crankReman: engine.crankReman,
    crankNew: engine.crankNew,
    crankActual: engine.crankActual,
    camReman: engine.camReman,
    camNew: engine.camNew,
    camActual: engine.camActual,
    injReman: engine.injReman,
    injNew: engine.injNew,
    injActual: engine.injActual,
    turboReman: engine.turboReman,
    turboNew: engine.turboNew,
    turboActual: engine.turboActual,
    turboHpReman: engine.turboHpReman,
    turboHpNew: engine.turboHpNew,
    turboHpActual: engine.turboHpActual,
    turboLpReman: engine.turboLpReman,
    turboLpNew: engine.turboLpNew,
    turboLpActual: engine.turboLpActual,
    headReman: engine.headReman,
    headNew: engine.headNew,
    headActual: engine.headActual,
    pistonReman: engine.pistonReman,
    pistonNew: engine.pistonNew,
    pistonActual: engine.pistonActual,
    fwhNew: engine.fwhNew,
    fwhActual: engine.fwhActual,
    fwhReman: engine.fwhReman,
    flywheelNew: engine.flywheelNew,
    flywheelActual: engine.flywheelActual,
    ragNew: engine.ragNew,
    ragActual: engine.ragActual,
    oilPanReman: engine.oilPanReman,
    oilPanNew: engine.oilPanNew,
    oilPanActual: engine.oilPanActual,
    oilCoolerReman: engine.oilCoolerReman,
    oilCoolerNew: engine.oilCoolerNew,
    oilCoolerActual: engine.oilCoolerActual,
    frontHsngNew: engine.frontHsngNew,
    frontHsngActual: engine.frontHsngActual,
    heuiPumpReman: engine.heuiPumpReman,
    heuiPumpNew: engine.heuiPumpNew,
    heuiPumpActual: engine.heuiPumpActual,
    oilPumpReman: engine.oilPumpReman,
    oilPumpNew: engine.oilPumpNew,
    oilPumpActual: engine.oilPumpActual,
    waterPumpReman: engine.waterPumpReman,
    waterPump: engine.waterPumpNew,
    waterPumpActual: engine.waterPumpActual,
    exhMnfldNew: engine.exhMnfldNew,
    exhMnfldActual: engine.exhMnfldActual,
    exhMnfldReman: engine.exhMnfldReman
  };

  useEffect(() => {
    setEngineParts(enginePartsData);
  }, []);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!changesSaved && !await ask('Are you sure you want to save these changes?')) return;
    setChangesSaved(true);
    const newEngine = {
      id: engine.id,
      stockNum: engine.stockNum,
      currentStatus,
      loginDate,
      model,
      serialNum,
      arrNum,
      location,
      horsePower,
      mileage,
      purchasedFrom,
      toreDownDate,
      soldDate,
      soldTo,
      sellPrice: Number(sellPrice),
      jakeBrake,
      warranty,
      testRun,
      ecm,
      askingPrice,
      purchasePrice: engine.purchasePrice,
      torque,
      pan,
      application,
      turboHpNew,
      turboLpNew,
      fwhNumber,
      comments,
      partsPulled
    } as Engine;
    await editEngine(newEngine);

    // Edit rows
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

    // Add new rows
    if (engineCostInData.length !== engineCostIn.length) {
      for (let i = 0; i < engineCostIn.length; i++) {
        const item = engineCostIn[i];
        if (item.id === 0) {
          await addEngineCostIn(Number(item.engineStockNum), Number(item.cost), Number(item.invoiceNum), item.vendor ?? '', item.costType ?? '', item.note ?? '');
        }
      }
    }
    if (engineCostOutData.length !== engineCostOut.length) {
      for (let i = 0; i < engineCostOut.length; i++) {
        const item = engineCostOut[i];
        if (item.id === 0) {
          await addEngineCostOut(item.stockNum ?? '', Number(item.engineStockNum), Number(item.cost), item.costType ?? '', item.note ?? '');
        }
      }
    }

    if (JSON.stringify(engineParts) !== JSON.stringify(enginePartsData)) {
      await editEnginePartsTable(engineParts, engine.id);
    }
    setEngine({ ...newEngine, ...engineParts });
    setIsEditing(false);
  };

  const stopEditing = async () => {
    if (changesSaved) {
      setIsEditing(false);
    } else if (await ask('Do you want to leave without saving?')) {
      setIsEditing(false);
    }
  };

  const handleNewEngineCostInRowChange = (field: keyof EngineCostIn, value: string | number) => {
    setNewEngineCostInRow((prev : EngineCostIn) => ({ ...prev, [field]: value }));
  };

  const handleAddEngineCostInRow = () => {
    setEngineCostIn([...engineCostIn, newEngineCostInRow]);
    setNewEngineCostInRow(blankEngineCostIn);
  };

  const handleNewEngineCostOutRowChange = (field: keyof EngineCostOut, value: string | number) => {
    setNewEngineCostOutRow((prev: EngineCostOut) => ({ ...prev, [field]: value }));
  };

  const handleAddEngineCostOutRow = () => {
    setEngineCostOut([...engineCostOut, newEngineCostOutRow]);
    setNewEngineCostOutRow(blankEngineCostOut);
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

  const handleDeleteCostInItem = async (id: number, index: number) => {
    if (!await ask('Are you sure you want to delete this item?')) return;
    if (id > 0) {
      const newItems = engineCostIn.filter((costin: EngineCostIn) => costin.id !== id);
      await deleteEngineCostIn(id);
      setEngineCostIn(newItems);
    } else {
      const newItems = engineCostIn.filter((_: EngineCostIn, i) => i !== index);
      setEngineCostIn(newItems);
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


  return (
    <>
      <PreventNavigation shouldPrevent={!changesSaved} text="Leave without saving changes?" />

      {engine &&
        <form className="edit-engine-details" onSubmit={(e) => saveChanges(e)} onChange={() => setChangesSaved(false)}>
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
                onClick={stopEditing}
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
                        value={serialNum}
                        onChange={(e: any) => setSerialNumber(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Arr Number</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={arrNum}
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
                        value={turboHpNew}
                        onChange={(e: any) => setTurboHP(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Turbo LP</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={turboLpNew}
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
                        value={sellPrice ?? ''}
                        type="number"
                        step="any"
                        onChange={(e: any) => setSellPrice(e.target.value)}
                        
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Asking Price</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={askingPrice ?? ''}
                        type="number"
                        step="any"
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
                <EditEnginePartsTable />
              </GridItem>
            </GridItem>

            <GridItem colStart={1} colEnd={6} variant={['no-style']}>
              <h2>Engine Cost In</h2>
              <Table variant={['plain', 'edit-row-details']}>
                <thead>
                  <tr>
                    <th>Cost</th>
                    <th>Engine Stock Number</th>
                    <th>Vendor</th>
                    <th>Invoice Number</th>
                    <th>Cost Type</th>
                    <th>Note</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {engineCostIn.map((item, i) => {
                    return (
                      <tr key={item.id}>
                        <td>
                          <Input
                            variant={['x-small', 'thin', 'label-bold']}
                            value={item.cost ?? ''}
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, cost: e.target.value }, i)}
                            type="number"
                            step="any"
                          />
                        </td>
                        <td>
                          <Input
                            variant={['x-small', 'thin', 'label-bold']}
                            value={item.engineStockNum ?? ''}
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, engineStockNum: e.target.value }, i)}
                            type="number"
                          />
                        </td>
                        <td>
                          <Input
                            variant={['x-small', 'thin', 'label-bold']}
                            value={item.vendor ?? ''}
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, vendor: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            variant={['x-small', 'thin', 'label-bold']}
                            value={item.invoiceNum ?? ''}
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, invoiceNum: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            variant={['x-small', 'thin', 'label-bold']}
                            value={item.costType ?? ''}
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, costType: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            variant={['x-small', 'thin', 'label-bold']}
                            value={item.note ?? ''}
                            onChange={(e: any) => handleChangeEngineCostIn({ ...item, note: e.target.value }, i)}
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
                        value={newEngineCostInRow.cost}
                        onChange={(e: any) => handleNewEngineCostInRowChange('cost', e.target.value)}
                        type="number"
                        step="any"
                      />
                    </td>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-bold']}
                        value={newEngineCostInRow.engineStockNum}
                        onChange={(e: any) => handleNewEngineCostInRowChange('engineStockNum', e.target.value)}
                        type="number"
                      />
                    </td>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-bold']}
                        value={newEngineCostInRow.vendor}
                        onChange={(e: any) => handleNewEngineCostInRowChange('vendor', e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-bold']}
                        value={newEngineCostInRow.invoiceNum}
                        onChange={(e: any) => handleNewEngineCostInRowChange('invoiceNum', e.target.value)}
                        type="number"
                      />
                    </td>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-bold']}
                        value={newEngineCostInRow.costType}
                        onChange={(e: any) => handleNewEngineCostInRowChange('costType', e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-bold']}
                        value={newEngineCostInRow.note}
                        onChange={(e: any) => handleNewEngineCostInRowChange('note', e.target.value)}
                      />
                    </td>
                    <td>
                      <Button
                        onClick={() => handleAddEngineCostInRow()}
                        type="button"
                      >
                        Add
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem variant={['no-style']} colStart={7} colEnd={12}>
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
                        type="number"
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
      }
    </>
  );
}
