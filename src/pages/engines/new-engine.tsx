import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Loading from "@/components/Library/Loading";
import Select from "@/components/Library/Select/Select";
import Table from "@/components/Library/Table";
import NewEnginesQuoteList from "@/components/NewEnginesQuoteList";
import { enginesAtom } from "@/scripts/atoms/state";
import { getEnginesByStatus } from "@/scripts/services/enginesService";
import { useAtom } from "jotai";
import Link from "@/components/Library/Link";
import { useEffect, useState } from "react";
import NewEngineQuoteDialog from "@/components/Dialogs/NewEngineQuoteDialog";


export default function NewEnginesList() {
  const [enginesData, setEnginesData] = useAtom<Engine[]>(enginesAtom);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [engineModel, setEngineModel] = useState<string>('C-7');
  const [filter, setFilter] = useState<string>('all-runner');
  const [engine, setEngine] = useState<Engine | null>(null);
  const [newQuoteDialogOpen, setNewQuoteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showButtons, setShowButtons] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setEngines(filterEngines(enginesData, filter));
    setShowButtons(true);
  }, [enginesData, engineModel]);

  const fetchData = async () => {
    const running = await getEnginesByStatus('RunnerReady');
    const notRunning = await getEnginesByStatus('RunnerNotReady');
    const holdRunning = await getEnginesByStatus('HoldSoldRunner');
    setEnginesData([...running, ...notRunning, ...holdRunning].sort((a: any, b: any) => b.loginDate - a.loginDate));
    setLoading(false);
  };

  const isEngineResNotNull = (engine: Engine) => {
    const { turboReman, headNew, headReman, pistonNew, pistonReman, fwhNew, fwhReman, oilPanNew, oilPanReman, oilCoolerNew, oilCoolerReman, frontHsngNew, flywheelNew, ragNew, heuiPumpNew, heuiPumpReman } = engine;
    return ![turboReman, headNew, headReman, pistonNew, pistonReman, fwhNew, fwhReman, oilPanNew, oilPanReman, oilCoolerNew, oilCoolerReman, frontHsngNew, flywheelNew, ragNew, heuiPumpNew, heuiPumpReman].includes(null);
  };

  const getEngineModels = () => {
    const engineModels: any = enginesData.reduce((acc: string[], engine: Engine) => {
      if (!acc.includes(engine.model ?? '')) {
        acc.push(engine.model ?? '');
      }
      return acc;
    }, []);

    engineModels.sort((a: string, b: string) => {
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
      if (startsWithNumberA) return 1;
      if (startsWithNumberB) return -1;
    });
    return engineModels;
  };

  const filterEngines = (data: Engine[], filter: string) => {
    return data.filter((engine: Engine) => {
      if (![engine.model].includes(engineModel)) return false;
      if (filter === 'all-runner' && engine.currentStatus !== 'RunnerNotReady' && engine.currentStatus !== 'RunnerReady' && engine.currentStatus !== 'HoldSoldRunner') return false;
      if (filter === 'only-runner' && engine.currentStatus !== 'RunnerReady') return false;
      if (filter === 'short-block' && engine.currentStatus !== 'ShortBlock') return false;
      if (filter === 'long-block' && engine.currentStatus !== 'LongBlock') return false;
      if (filter === 'sold' && engine.currentStatus !== 'Sold') return false;
      return true;
    });
  };

  const onNewQuote = async () => {
    await fetchData();
  };

  const handleFilterModel = (model: string) => {
    setShowButtons(false);
    setEngineModel(model);
  };

  
  return (
    <Layout title="New Engines List">
      {engine &&
        <NewEngineQuoteDialog
          open={newQuoteDialogOpen}
          setOpen={setNewQuoteDialogOpen}
          engine={engine}
          onNewQuote={onNewQuote}
        />
      }

      <div className="new-engines-list">
        <div className="new-engines-list__top-bar">
          {showButtons && getEngineModels().map((model: string) => {
            return (
              <Button key={model} onClick={() => handleFilterModel(model)}>{ model }</Button>
            );
          })}
        </div>

        <Select
          className="new-engines-list__filter"
          onChange={(e: any) => {
            setFilter(e.target.value);
            setEngines(filterEngines(enginesData, e.target.value));
          }}
        >
          <option value="all-runner">All Runner Engines</option>
          <option value="only-runner">Only Runner Ready Engines</option>
          <option value="short-block">Short Block</option>
          <option value="long-block">Long Block</option>
          <option value="sold">Sold</option>
        </Select>

        { loading && <Loading /> }
  
        <div className="new-engines-list__table-container">
          <Table>
            <thead>
              <tr>
                {/* <th></th> */}
                <th></th>
                <th>Stock Number</th>
                <th>Res</th>
                <th>ECM</th>
                <th>Warranty</th>
                <th>Model</th>
                <th>Ser No</th>
                <th>HP</th>
                <th>Torque</th>
                <th>Oil Pan</th>
                <th>Turbo</th>
                <th>Turbo HP</th>
                <th>Turbo LP</th>
                <th>Application</th>
                <th>Purchased From</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {engines.map((engine: Engine) => {
                return (
                  <tr key={engine.id}>
                    {/* <td>
                      <Button>Hdw</Button>
                    </td> */}
                    <td>
                      <Button
                        onClick={() => {
                          setEngine(engine);
                          setNewQuoteDialogOpen(true);
                        }}
                        data-testid="quote-btn"
                      >
                        Quote
                      </Button>
                    </td>
                    <td><Link href={`/engines/${engine.stockNum}`} data-testid="stock-num-link">{ engine.stockNum }</Link></td>
                    <td className="cbx-td"><Checkbox checked={isEngineResNotNull(engine)} disabled /></td>
                    <td className="cbx-td"><Checkbox checked={Boolean(engine.ecm)} disabled /></td>
                    <td className="cbx-td"><Checkbox checked={Boolean(engine.warranty)} disabled /></td>
                    <td>{ engine.model }</td>
                    <td>{ engine.serialNum }</td>
                    <td>{ engine.horsePower }</td>
                    <td>{ engine.torque }</td>
                    <td>{ engine.oilPanNew }</td>
                    <td>{ engine.turboArr }</td>
                    <td>{ engine.turboHpNew }</td>
                    <td>{ engine.turboLpNew }</td>
                    <td>{ engine.application }</td>
                    <td>{ engine.purchasedFrom }</td>
                    <td>{ engine.currentStatus }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>

      <NewEnginesQuoteList model={engineModel} />
    </Layout>
  );
}
