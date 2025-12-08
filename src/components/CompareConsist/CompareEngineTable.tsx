import { useEffect, useState, useCallback } from "react";
import Table from "../library/Table";
import Link from "../library/Link";
import Checkbox from "../library/Checkbox";
import Button from "../library/Button";
import Pagination from "../library/Pagination";
import Loading from "../library/Loading";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { getAllEngines, getEnginesByEngineData } from "@/scripts/services/enginesService";

interface Props {
  openSideBySide: (engine: Engine) => void
  getEngineData: () => CustomerEngineData
}


export default function CompareEngineTable({ openSideBySide, getEngineData }: Props) {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [paginatedEngines, setPaginatedEngines] = useState<Engine[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComparableEngines = useCallback(async () => {
    const engineData = getEngineData();
    const comparableEngines = await getEnginesByEngineData(engineData);
    const sortedEngines = comparableEngines.sort((a: Engine, b: Engine) => b.stockNum - a.stockNum);
    setEngines(sortedEngines);
    setPaginatedEngines(sortedEngines.slice(0, 35));
  }, [getEngineData]);

  useEffect(() => {
    const fetchEngines = async () => {
      const allEngines = (await getAllEngines()).sort((a: Engine, b: Engine) => b.stockNum - a.stockNum);
      setEngines(allEngines);
      setLoading(false);
      await loadComparableEngines();
    };
    fetchEngines();
  }, [loadComparableEngines]);


  if (loading) return <Loading />;

  return (
    <div className="compare-engine-table">
      <Table>
        <thead>
          <tr>
            <th></th>
            <th>Engine</th>
            <th>ECM</th>
            <th>Warr</th>
            <th>Model</th>
            <th>Serial Number</th>
            <th>Arrange Number</th>
            <th>Location</th>
            <th>HP</th>
            <th>Oil Pan</th>
            <th>HP Turbo</th>
            <th>LP Turbo</th>
            <th>Cost</th>
            <th>Purchased From</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEngines.map((engine) => (
            <tr key={engine.id}>
              <td>
                <Button variant={['x-small']} onClick={() => openSideBySide(engine)}>
                  Side by Side
                </Button>
              </td>
              <td><Link href={`/engines/${engine.stockNum}`}>{engine.stockNum}</Link></td>
              <td className="cbx-td"><Checkbox checked={engine.ecm} disabled /></td>
              <td className="cbx-td"><Checkbox checked={engine.warranty} disabled /></td>
              <td>{engine.model}</td>
              <td>{engine.serialNum}</td>
              <td>{engine.arrNum}</td>
              <td>{engine.location}</td>
              <td>{engine.horsePower}</td>
              <td>{engine.oilPanNew}</td>
              <td>{engine.turboHpNew}</td>
              <td>{engine.turboLpNew}</td>
              <td>{formatCurrency(engine.costRemaining)}</td>
              <td>{engine.purchasedFrom}</td>
              <td>{engine.currentStatus}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination
        data={engines}
        setData={setPaginatedEngines}
        pageSize={35}
      />
    </div>
  );
}
