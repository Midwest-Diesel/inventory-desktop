import EnginePartsTable from "@/components/Engines/EnginePartsTable";
import EngineCostInTable from "@/components/EngineCostIn";
import EngineCostOut from "@/components/EngineCostOut";
import Checkbox from "@/components/Library/Checkbox";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Table from "@/components/Library/Table";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { useNavState } from "@/hooks/useNavState";
import { deleteEngine } from "@/scripts/services/enginesService";

interface Props {
  engine: Engine
  setIsEditing: (value: boolean) => void
  setEngineProfitOpen: (value: boolean) => void
}


export default function EngineDetails({ engine, setIsEditing, setEngineProfitOpen }: Props) {
  const { backward } = useNavState();
  const [user] = useAtom<User>(userAtom);
  
  const getTotalCostIn = () => {
    return engine.costIn
      .filter((row) => row.cost !== 0.04 && row.cost !== 0.01 && !row.engineStockNum?.toString().startsWith('UP'))
      .reduce((acc, val) => acc + Number(val.cost), 0);
  };

  const getTotalCostOut = () => {
    return engine.costOut
      .filter((row) => row.cost !== 0.04 && row.cost !== 0.01 && !row.engineStockNum?.toString().startsWith('UP'))
      .reduce((acc, val) => acc + Number(val.cost), 0);
  };

  const getPurchaseCost = () => {
    return engine.costIn
      .filter((row) => row.costType === 'PurchasePrice' && row.cost !== 0.01 && !row.engineStockNum?.toString().startsWith('UP'))
      .reduce((acc, val) => acc + (val?.cost ?? 0), 0);
  };

  const handleDelete = async () => {
    if (!engine?.id || user.accessLevel <= 1 || prompt('Type "confirm" to delete this engine') !== 'confirm') return;
    await deleteEngine(engine.id);
    await backward();
  };


  return (
    <>
      <div className="engine-details__header">
        <div>
          <h2>Stock Number: { engine.stockNum }</h2>
          <h3>Current Status: { engine.currentStatus }</h3>
        </div>
        
        <div className="header__btn-container">
          <Button
            variant={['blue']}
            className="engine-details__edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
          <Button
            className="engine-details__close-btn"
            onClick={async () => await backward()}
          >
            Back
          </Button>
          {user.accessLevel > 1 &&
            <Button
              variant={['danger']}
              className="engine-details__delete-btn"
              onClick={handleDelete}
            >
              Delete
            </Button>
          }
        </div>
      </div>

      <div className="part-details__top-bar">
        <Button onClick={() => setEngineProfitOpen(true)}>Check Profit</Button>
      </div>

      <Grid rows={1} cols={12} gap={1}>
        <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
          <Table variant={['plain', 'row-details']}>
            <tbody>
              <tr>
                <th>Login Date</th>
                <td>{ formatDate(engine.loginDate) }</td>
              </tr>
              <tr>
                <th>Model</th>
                <td>{ engine.model }</td>
              </tr>
              <tr>
                <th>Serial Number</th>
                <td>{ engine.serialNum }</td>
              </tr>
              <tr>
                <th>Arr Number</th>
                <td>{ engine.arrNum }</td>
              </tr>
              <tr>
                <th>Location</th>
                <td>{ engine.location }</td>
              </tr>
              <tr>
                <th>Horse Power</th>
                <td>{ engine.horsePower }</td>
              </tr>
              <tr>
                <th>Mileage</th>
                <td>{ engine.mileage }</td>
              </tr>
              <tr>
                <th>Purchased From</th>
                <td>{ engine.purchasedFrom }</td>
              </tr>
              <tr>
                <th>Torn Down Date</th>
                <td>{ formatDate(engine.toreDownDate) }</td>
              </tr>
              <tr>
                <th>Sold to Date</th>
                <td>{ formatDate(engine.soldDate) }</td>
              </tr>
              <tr>
                <th>Sold to</th>
                <td>{ engine.soldTo }</td>
              </tr>
              <tr>
                <th>Jake Brake</th>
                <td>
                  <Checkbox
                    checked={engine.jakeBrake}
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <th>Warranty</th>
                <td>
                  <Checkbox
                    checked={Boolean(engine.warranty)}
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <th>Test Run</th>
                <td>
                  <Checkbox
                    checked={Boolean(engine.testRun)}
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <th>ECM</th>
                <td>
                  <Checkbox
                    checked={Boolean(engine.ecm)}
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <th>Torque</th>
                <td>{ engine.torque }</td>
              </tr>
              <tr>
                <th>Pan</th>
                <td>{ engine.pan }</td>
              </tr>
              <tr>
                <th>Application</th>
                <td>{ engine.application }</td>
              </tr>
              <tr>
                <th>Turbo HP</th>
                <td>{ engine.turboHpNew }</td>
              </tr>
              <tr>
                <th>Turbo LP</th>
                <td>{ engine.turboLpNew }</td>
              </tr>
              <tr>
                <th>FWH Number</th>
                <td>{ engine.fwhNumber }</td>
              </tr>
            </tbody>
          </Table>

          <GridItem colStart={1} colEnd={5} rowStart={2} variant={['low-opacity-bg', 'sub-table-item']} style={{ marginTop: '1.2rem' }}>
            <Table variant={['plain', 'row-details']}>
              <tbody>
                <tr>
                  <th>Sell Price</th>
                  <td>{ formatCurrency(engine.sellPrice) }</td>
                </tr>
                <tr>
                  <th>Asking Price</th>
                  <td>{ formatCurrency(engine.askingPrice) }</td>
                </tr>
                <tr>
                  <th>Purchase Cost</th>
                  <td>{ formatCurrency(getPurchaseCost()) }</td>
                </tr>
                <tr>
                  <th>Total Cost In</th>
                  <td>{ formatCurrency(getTotalCostIn()) }</td>
                </tr>
                <tr>
                  <th>Total Cost Out</th>
                  <td>{ formatCurrency(getTotalCostOut()) }</td>
                </tr>
                <tr>
                  <th style={(engine.costRemaining ?? 0) > 0 ? { color: 'var(--red-2)' } : { color: 'var(--green-light-1)' }}>Cost Remaining</th>
                  <td>{ formatCurrency(engine.costRemaining) }</td>
                </tr>
              </tbody>
            </Table>
          </GridItem>
        </GridItem>

        <GridItem colStart={5} colEnd={12} rowStart={1} variant={['no-style']}>
          <GridItem colStart={5} colEnd={12} rowStart={1} variant={['low-opacity-bg']}>
            <Table variant={['plain', 'row-details']}>
              <tbody>
                <tr style={{ height: '4rem' }}>
                  <th>Comments</th>
                  <td>{ engine.comments }</td>
                </tr>
                <tr style={{ height: '4rem' }}>
                  <th>Parts Pulled</th>
                  <td>{ engine.partsPulled }</td>
                </tr>
              </tbody>
            </Table>
          </GridItem>
          <br />

          <GridItem colStart={5} colEnd={12} variant={['low-opacity-bg']}>
            <EnginePartsTable engine={engine} />
          </GridItem>
        </GridItem>

        <GridItem variant={['no-style']} rowStart={2} colStart={1} colEnd={6} breakpoints={[
          { width: 1520, colStart: 1, colEnd: 12 }
        ]}>
          <h2>Engine Cost In</h2>
          {engine.costIn.length > 0 ? <EngineCostInTable EngineCostInData={engine.costIn} /> : <p>Empty</p> }
        </GridItem>

        <GridItem variant={['no-style']} rowStart={2} colStart={6} colEnd={12} breakpoints={[
          { width: 1520, rowStart: 3, rowEnd: 3, colStart: 1, colEnd: 12 }
        ]}>
          <h2>Engine Cost Out</h2>
          {engine.costOut.length > 0 ? <EngineCostOut engineCostOut={engine.costOut} /> : <p>Empty</p> }
        </GridItem>
      </Grid>
    </>
  );
}
