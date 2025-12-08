import Checkbox from "../library/Checkbox";
import Table from "../library/Table";
import Button from "../library/Button";
import Select from "../library/select/Select";
import Link from "../library/Link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { useTooltip } from "@/hooks/useTooltip";

interface Props {
  engines: Engine[]
  setEngine: (engine: Engine) => void
  engineModel: string
  setEngineModel: (model: string) => void
  setNewQuoteDialogOpen: (value: boolean) => void
}


export default function NewEnginesList({ engines, setEngine, engineModel, setEngineModel, setNewQuoteDialogOpen }: Props) {
  const tooltip = useTooltip();
  const [filter, setFilter] = useState('all-runner');

  const isEngineResNotNull = (engine: Engine) => {
    const { turboReman, headNew, headReman, pistonNew, pistonReman, fwhNew, fwhReman, oilPanNew, oilPanReman, oilCoolerNew, oilCoolerReman, frontHsngNew, flywheelNew, ragNew, heuiPumpNew, heuiPumpReman } = engine;
    return ![turboReman, headNew, headReman, pistonNew, pistonReman, fwhNew, fwhReman, oilPanNew, oilPanReman, oilCoolerNew, oilCoolerReman, frontHsngNew, flywheelNew, ragNew, heuiPumpNew, heuiPumpReman].includes(null);
  };

  const getEngineModels = useMemo(() => {
    const models = Array.from(new Set(engines.map((e) => e.model ?? ''))).sort((a, b) => {
      const numA = parseFloat(a.match(/[\d]+/)?.[0] || 'Infinity');
      const numB = parseFloat(b.match(/[\d]+/)?.[0] || 'Infinity');
      const textA = a.match(/[a-zA-Z]+/)?.[0] || '';
      const textB = b.match(/[a-zA-Z]+/)?.[0] || '';
      const startsWithNumberA = /^\d/.test(a);
      const startsWithNumberB = /^\d/.test(b);
      if (startsWithNumberA === startsWithNumberB) {
        if (textA < textB) return -1;
        if (textA > textB) return 1;
        if (numA < numB) return -1;
        if (numA > numB) return 1;
        return 0;
      }
      return startsWithNumberA ? 1 : -1;
    });
    return models;
  }, [engines]);

  const filteredEngines = useMemo(() => {
    return engines.filter((e) => {
      if (e.model !== engineModel) return false;
      if (filter === "all-runner" && !["RunnerNotReady", "RunnerReady", "HoldSoldRunner"].includes(e.currentStatus ?? '')) return false;
      if (filter === "only-runner" && e.currentStatus !== "RunnerReady") return false;
      if (filter === "short-block" && e.currentStatus !== "ShortBlock") return false;
      if (filter === "long-block" && e.currentStatus !== "LongBlock") return false;
      if (filter === "sold" && e.currentStatus !== "Sold") return false;
      return true;
    });
  }, [engines, engineModel, filter]);

  
  return (
    <div className="new-engines-list">
      <div className="new-engines-list__top-bar">
        {getEngineModels.map((model: string) => {
          if (!model) return null;
          return (
            <Button key={model} onClick={() => setEngineModel(model)} data-testid="model-btn">{ model }</Button>
          );
        })}
      </div>

      <Select
        className="new-engines-list__filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="all-runner">All Runner Engines</option>
        <option value="only-runner">Only Runner Ready Engines</option>
        <option value="short-block">Short Block</option>
        <option value="long-block">Long Block</option>
        <option value="sold">Sold</option>
      </Select>

      <div className="new-engines-list__table-container">
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>Stock Number</th>
              <th>Res</th>
              <th>ECM</th>
              <th>Warranty</th>
              <th>Model</th>
              <th>Serial Number</th>
              <th>Arrangement Number</th>
              <th>Location</th>
              <th>HP</th>
              <th>Torque</th>
              <th>Oil Pan</th>
              <th>Turbo</th>
              <th>Turbo HP</th>
              <th>Turbo LP</th>
              <th>Application</th>
              <th>Cost</th>
              <th>Purchased From</th>
              <th>Status</th>
              <th>FWH Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredEngines.map((engine: Engine) => {
              return (
                <tr key={engine.id}>
                  <td>
                    <Button
                      variant={['x-small', 'fit']}
                      onClick={() => {
                        setEngine(engine);
                        setNewQuoteDialogOpen(true);
                      }}
                      data-testid="quote-btn"
                      onMouseEnter={() => tooltip.set('Quote Engine')}
                      onMouseLeave={() => tooltip.set('')}
                    >
                      <img alt="Quote Engine" src="/images/icons/clipboard.svg" width={17} height={17} />
                    </Button>
                  </td>
                  <td><Link href={`/engines/${engine.stockNum}`} data-testid="stock-num-link">{ engine.stockNum }</Link></td>
                  <td className="cbx-td"><Checkbox checked={isEngineResNotNull(engine)} disabled /></td>
                  <td className="cbx-td"><Checkbox checked={Boolean(engine.ecm)} disabled /></td>
                  <td className="cbx-td"><Checkbox checked={Boolean(engine.warranty)} disabled /></td>
                  <td>{ engine.model }</td>
                  <td>{ engine.serialNum }</td>
                  <td>{ engine.arrNum }</td>
                  <td>{ engine.location }</td>
                  <td>{ engine.horsePower }</td>
                  <td>{ engine.torque }</td>
                  <td>{ engine.oilPanNew }</td>
                  <td>{ engine.turboArr }</td>
                  <td>{ engine.turboHpNew }</td>
                  <td>{ engine.turboLpNew }</td>
                  <td>{ engine.application }</td>
                  <td>{ formatCurrency(engine.totalCostApplied) }</td>
                  <td>{ engine.purchasedFrom }</td>
                  <td>{ engine.currentStatus }</td>
                  <td>{ engine.fwhNumber }</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
