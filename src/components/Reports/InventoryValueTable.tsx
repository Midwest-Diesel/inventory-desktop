import Button from "../Library/Button";
import Loading from "../Library/Loading";
import Table from "../Library/Table";
import { useState } from "react";
import { reportInventoryValueCoreEngines, reportInventoryValueParts, reportInventoryValueRunningEngines, reportInventoryValueShortBlocks, reportInventoryValueSurplus, reportInventoryValueToreDownEngines } from "@/scripts/controllers/reportsController";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";

interface Props {
  setTableOpen: (open: boolean) => void
  setReportsOpen: (open: boolean) => void
}


export default function PricingChangesTable({ setTableOpen, setReportsOpen }: Props) {
  const [table, setTable] = useState<'parts' | 'coreEngines' | 'toreDownEngines' | 'runningEngines' | 'shortBlocks' | 'surplus' | ''>('');
  const [parts, setParts] = useState<InventoryValueReportPartsData[]>([]);
  const [coreEngines, setCoreEngines] = useState<InventoryValueReportCoreEnginesData[]>([]);
  const [toreDownEngines, setToreDownEngines] = useState<InventoryValueReportToreDownEnginesData[]>([]);
  const [runningEngines, setRunningEngines] = useState<InventoryValueReportRunningEnginesData[]>([]);
  const [shortBlocks, setShortBlocks] = useState<InventoryValueReportShortBlocksData[]>([]);
  const [surplus, setSurplus] = useState<InventoryValueReportSurplusData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    setTableOpen(false);
    setReportsOpen(true);
  };

  const loadPartsData = async () => {
    setLoading(true);
    const res = await reportInventoryValueParts();
    setTotal(res.combinedTotal);
    setParts(res.data);
    setTable('parts');
    setLoading(false);
  };

  const loadCoreEnginesData = async () => {
    setLoading(true);
    const res = await reportInventoryValueCoreEngines();
    setTotal(res.combinedTotal);
    setCoreEngines(res.data);
    setTable('coreEngines');
    setLoading(false);
  };

  const loadToreDownEnginesData = async () => {
    setLoading(true);
    const res = await reportInventoryValueToreDownEngines();
    setTotal(res.combinedTotal);
    setToreDownEngines(res.data);
    setTable('toreDownEngines');
    setLoading(false);
  };

  const loadRunningEnginesData = async () => {
    setLoading(true);
    const res = await reportInventoryValueRunningEngines();
    setTotal(res.combinedTotal);
    setRunningEngines(res.data);
    setTable('runningEngines');
    setLoading(false);
  };

  const loadShortBlocksData = async () => {
    setLoading(true);
    const res = await reportInventoryValueShortBlocks();
    setTotal(res.combinedTotal);
    setShortBlocks(res.data);
    setTable('shortBlocks');
    setLoading(false);
  };

  const loadSurplusData = async () => {
    setLoading(true);
    const res = await reportInventoryValueSurplus();
    setTotal(res.combinedTotal);
    setSurplus(res.data);
    setTable('surplus');
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (table === 'parts') {
      const rowsText = parts.map((part) =>
        [part.partNum, part.stockNum, part.desc, part.qty, part.purchasePrice, part.totalCost].join('\t')
      ).join('\n');
      navigator.clipboard.writeText(rowsText);    
    } else if (table === 'coreEngines') {
      const rowsText = coreEngines.map((engine) =>
        [engine.stockNum, engine.loginDate, engine.model, engine.serialNum, engine.costRemaining].join('\t')
      ).join('\n');
      navigator.clipboard.writeText(rowsText);    
    } else if (table === 'toreDownEngines') {
      const rowsText = toreDownEngines.map((engine) =>
        [engine.stockNum, engine.loginDate, engine.model, engine.serialNum, engine.costRemaining, engine.toreDownDate].join('\t')
      ).join('\n');
      navigator.clipboard.writeText(rowsText);    
    } else if (table === 'runningEngines') {
      const rowsText = runningEngines.map((engine) =>
        [engine.stockNum, engine.serialNum, engine.loginDate, engine.costRemaining, engine.currentStatus].join('\t')
      ).join('\n');
      navigator.clipboard.writeText(rowsText);    
    } else if (table === 'shortBlocks') {
      const rowsText = shortBlocks.map((block) =>
        [block.stockNum, block.model, block.serialNum, block.loginDate, block.currentStatus, block.costRemaining].join('\t')
      ).join('\n');
      navigator.clipboard.writeText(rowsText);    
    } else {
      const rowsText = surplus.map((purchase) =>
        [purchase.code, purchase.name, purchase.date, purchase.price, purchase.costRemaining].join('\t')
      ).join('\n');
      navigator.clipboard.writeText(rowsText.toString());    
    }
  };


  return (
    <div className="reports-table">
      <div className="reports-table__top-bar">
        <Button onClick={loadPartsData}>Parts</Button>
        <Button onClick={loadCoreEnginesData}>Core Engines</Button>
        <Button onClick={loadToreDownEnginesData}>Tore Down Engines</Button>
        <Button onClick={loadRunningEnginesData}>Running Engines</Button>
        <Button onClick={loadShortBlocksData}>Short Blocks</Button>
        <Button onClick={loadSurplusData}>Surplus</Button>
      </div>

      <div className="reports-table__top-bar">
        <Button onClick={handleGoBack}>Back</Button>
        <Button onClick={copyToClipboard}>Copy</Button>
      </div>

      <h3 style={{ textAlign: 'end' }}>{ total > 0 && `Total: ${formatCurrency(total)}` }</h3>

      { loading && <Loading /> }
      {table === 'parts' &&
        <>
          <Table>
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Stock Number</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Purchase Price</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((row, i) => {
                return (
                  <tr key={i}>
                    <td>{ row.partNum }</td>
                    <td>{ row.stockNum }</td>
                    <td>{ row.desc }</td>
                    <td>{ row.qty }</td>
                    <td>{ formatCurrency(row.purchasePrice) }</td>
                    <td>{ formatCurrency(row.totalCost) }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      }

      {table === 'coreEngines' &&
        <>
          <Table>
            <thead>
              <tr>
                <th>Stock Number</th>
                <th>Login Date</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Cost Remaining</th>
              </tr>
            </thead>
            <tbody>
              {coreEngines.map((row, i) => {
                return (
                  <tr key={i}>
                    <td>{ row.stockNum }</td>
                    <td>{ formatDate(row.loginDate) }</td>
                    <td>{ row.model }</td>
                    <td>{ row.serialNum }</td>
                    <td>{ formatCurrency(row.costRemaining) }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      }

      {table === 'toreDownEngines' &&
        <>
          <Table>
            <thead>
              <tr>
                <th>Stock Number</th>
                <th>Login Date</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Cost Remaining</th>
                <th>Tore Down Date</th>
              </tr>
            </thead>
            <tbody>
              {toreDownEngines.map((row, i) => {
                return (
                  <tr key={i}>
                    <td>{ row.stockNum }</td>
                    <td>{ formatDate(row.loginDate) }</td>
                    <td>{ row.model }</td>
                    <td>{ row.serialNum }</td>
                    <td>{ formatCurrency(row.costRemaining) }</td>
                    <td>{ formatDate(row.toreDownDate) }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      }

      {table === 'runningEngines' &&
        <>
          <Table>
            <thead>
              <tr>
                <th>Stock Number</th>
                <th>Serial Number</th>
                <th>Login Date</th>
                <th>Cost Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {runningEngines.map((row, i) => {
                return (
                  <tr key={i}>
                    <td>{ row.stockNum }</td>
                    <td>{ row.serialNum }</td>
                    <td>{ formatDate(row.loginDate) }</td>
                    <td>{ formatCurrency(row.costRemaining) }</td>
                    <td>{ row.currentStatus }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      }

      {table === 'shortBlocks' &&
        <>
          <Table>
            <thead>
              <tr>
                <th>Stock Number</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Login Date</th>
                <th>Status</th>
                <th>Cost Remaining</th>
              </tr>
            </thead>
            <tbody>
              {shortBlocks.map((row, i) => {
                return (
                  <tr key={i}>
                    <td>{ row.stockNum }</td>
                    <td>{ row.model }</td>
                    <td>{ row.serialNum }</td>
                    <td>{ formatDate(row.loginDate) }</td>
                    <td>{ row.currentStatus }</td>
                    <td>{ formatCurrency(row.costRemaining) }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      }

      {table === 'surplus' &&
        <>
          <Table>
            <thead>
              <tr>
                <th>Purchase Code</th>
                <th>Purchase Name</th>
                <th>Purchase Date</th>
                <th>Total Purchase Price</th>
                <th>Cost Remaining</th>
              </tr>
            </thead>
            <tbody>
              {surplus.map((row, i) => {
                return (
                  <tr key={i}>
                    <td>{ row.code }</td>
                    <td>{ row.name }</td>
                    <td>{ formatDate(row.date) }</td>
                    <td>{ formatCurrency(row.price) }</td>
                    <td>{ formatCurrency(row.costRemaining) }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      }
    </div>
  );
}
