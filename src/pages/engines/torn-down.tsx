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
import Link from "@/components/Library/Link";
import { useEffect, useState } from "react";


export default function EnginesTornDown() {
  const [openSearch, setOpenSearch] = useState(false);
  const [enginesData, setEnginesData] = useAtom<Engine[]>(enginesAtom);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [searchedEngines, setSearchedEngines] = useState<Engine[]>(enginesData);
  const [loading, setLoading] = useState(true);
  const LIMIT = 40;

  useEffect(() => {
    const fetchData = async () => {
      const res = await getEnginesByStatus('ToreDown');
      setEnginesData(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => setSearchedEngines(enginesData), [enginesData]);

  const handleChangePage = (data: Engine[]) => {
    setEngines(data);
  };


  return (
    <Layout>
      <div className="engines">
        <h1>Engines Torn Down</h1>
        <div className="engines__top-bar">
          <Button onClick={() => setOpenSearch(true)}>Search</Button>
        </div>

        <EngineSearchDialog
          open={openSearch}
          setOpen={setOpenSearch}
          engines={enginesData.map((e) => {
            return { ...e, loginDate: e.toreDownDate };
          })}
          setEngines={setSearchedEngines}
        />

        {engines &&
          <div className="engines__table-container">
            { loading && <Loading /> }
            <Table>
              <thead>
                <tr>
                  <th>Stock Number</th>
                  <th>T/D Date</th>
                  <th>Model</th>
                  <th>Serial Number</th>
                  <th>Location</th>
                  <th>HP</th>
                  <th>Jake Brake</th>
                  <th>Purchased From</th>
                  <th>Comments</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {engines.map((engine: Engine) => {
                  return (
                    <tr key={engine.id}>
                      <td><Link href={`/engines/${engine.stockNum}`}>{ engine.stockNum }</Link></td>
                      <td>{ formatDate(engine.toreDownDate) }</td>
                      <td>{ engine.model }</td>
                      <td>{ engine.serialNum }</td>
                      <td>{ engine.location }</td>
                      <td>{ engine.horsePower }</td>
                      <td className="cbx-td"><Checkbox checked={engine.jakeBrake} disabled /></td>
                      <td>{ engine.purchasedFrom }</td>
                      <td>{ engine.comments }</td>
                      <td>{ formatCurrency(engine.totalCostApplied) }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              data={searchedEngines}
              setData={handleChangePage}
              pageSize={LIMIT}
            />
          </div>
        }
      </div>
    </Layout>
  );
}
