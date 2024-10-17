import EngineSearchDialog from "@/components/Dialogs/EngineSearchDialog";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { enginesAtom } from "@/scripts/atoms/state";
import { getEnginesByStatus } from "@/scripts/controllers/enginesController";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function EnginesRunning() {
  const [openSearch, setOpenSearch] = useState(false);
  const [enginesData, setEnginesData] = useAtom<Engine[]>(enginesAtom);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [searchedEngines, setSearchedEngines] = useState<Engine[]>(enginesData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const running = await getEnginesByStatus('RunnerReady');
      const notRunning = await getEnginesByStatus('RunnerNotReady');
      const holdRunning = await getEnginesByStatus('HoldSoldRunner');
      setEnginesData([...running, ...notRunning, ...holdRunning].sort((a: any, b: any) => b.loginDate - a.loginDate));
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => setSearchedEngines(enginesData), [enginesData]);

  const handleChangePage = (data: Engine[]) => {
    setEngines(data);
  };
  
  const isResearched = (engine: Engine) => {
    const { blockPartNum, blockRemanPartNum, crankPartNum, crankRemanPartNum, headPartNum, headRemanPartNum, camPartNum, camRemanPartNum, injPartNum, injRemanPartNum, turboPartNum, turboRemanPartNum, pistonsPartNum, pistonsRemanPartNum, cylPacksPartNum, cylPacksRemanPartNum, fwhPartNum, fwhRemanPartNum, oilPanPartNum, oilPanRemanPartNum, oilCoolerPartNum, oilCoolerRemanPartNum, frontHousingPartNum, flywheelPartNum, ragPartNum, heuiPumpPartNum, heuiPumpRemanPartNum } = engine;
    if (blockPartNum || blockRemanPartNum || crankPartNum || crankRemanPartNum || headPartNum || headRemanPartNum || camPartNum || camRemanPartNum || injPartNum || injRemanPartNum || turboPartNum || turboRemanPartNum || pistonsPartNum || pistonsRemanPartNum || cylPacksPartNum || cylPacksRemanPartNum || fwhPartNum || fwhRemanPartNum || oilPanPartNum || oilPanRemanPartNum || oilCoolerPartNum || oilCoolerRemanPartNum || frontHousingPartNum || flywheelPartNum || ragPartNum || heuiPumpPartNum || heuiPumpRemanPartNum) {
      return true;
    }
    return false;
  };
  
  const handleSearch = (results: Engine[]) => {
    setSearchedEngines(results);
  };


  return (
    <Layout>
      <div className="engines">
        <h1>Running Engines</h1>
        <div className="engines__top-bar">
          <Button onClick={() => setOpenSearch(true)}>Search</Button>
        </div>

        <EngineSearchDialog open={openSearch} setOpen={setOpenSearch} engines={enginesData} setEngines={handleSearch} />

        {engines &&
          <div className="engines__table-container">
            { loading && <Loading /> }
            <Table>
              <thead>
                <tr>
                  <th>Stock Number</th>
                  <th>Login Date</th>
                  <th>Model</th>
                  <th>Serial Number</th>
                  <th>Location</th>
                  <th>Comments</th>
                  <th>HP</th>
                  <th>Jake Brake</th>
                  <th>Warrenty</th>
                  <th>Test Run</th>
                  <th>ECM</th>
                  <th>Mileage</th>
                  <th>Cost Remaining</th>
                  <th>Parts Researched</th>
                </tr>
              </thead>
              <tbody>
                {engines.map((engine: Engine) => {
                  return (
                    <tr key={engine.id}>
                      <td><a href={`/engines/${engine.stockNum}`}>{ engine.stockNum }</a></td>
                      <td>{ formatDate(engine.loginDate) }</td>
                      <td>{ engine.model }</td>
                      <td>{ engine.serialNumber }</td>
                      <td>{ engine.location }</td>
                      <td>{ engine.comments }</td>
                      <td>{ engine.horsePower }</td>
                      <td className="cbx-td"><Checkbox checked={engine.jakeBrake} disabled /></td>
                      <td className="cbx-td"><Checkbox checked={engine.warranty} disabled /></td>
                      <td className="cbx-td"><Checkbox checked={engine.testRun} disabled /></td>
                      <td className="cbx-td"><Checkbox checked={engine.ecm} disabled /></td>
                      <td>{ engine.mileage }</td>
                      <td>{ formatCurrency(engine.costRemaining) }</td>
                      <td className="cbx-td"><Checkbox checked={isResearched(engine)} disabled /></td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              data={searchedEngines}
              setData={handleChangePage}
              pageSize={35}
            />
          </div>
        }
      </div>
    </Layout>
  );
}
