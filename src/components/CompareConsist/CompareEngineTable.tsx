import { getAllEngines, getEnginesByEngineData } from "@/scripts/controllers/enginesController";
import { useEffect, useState } from "react";
import Table from "../Library/Table";
import Link from "next/link";
import Checkbox from "../Library/Checkbox";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Pagination from "../Library/Pagination";
import Loading from "../Library/Loading";
import CompareConsistHistoryDialog from "../Dialogs/CompareConsistHistoryDialog";
import { useRouter } from "next/router";
import { addCompareData } from "@/scripts/controllers/compareConsistController";

interface Props {
  openSideBySide: (engine: Engine) => void
  getEngineData: () => CustomerEngineData
  customerId: number
  setEnginesData: (engines: Engine[]) => void
  engines: Engine[]
  setEngines: (engines: Engine[]) => void
}


export default function CompareEngineTable({ openSideBySide, getEngineData, customerId, setEnginesData, engines, setEngines }: Props) {
  const router = useRouter();
  const [paginatedEngines, setPaginatedEngines] = useState<Engine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = (await getAllEngines()).sort((a: any, b: any) => b.stockNum - a.stockNum);
      setEnginesData(res);
      setEngines(res);
      setLoading(false);
      await findComparableEngines();
    };
    fetchData();
  }, []);

  const handleCompareableEngines = async () => {
    const data = {
      customerId,
      hp: '',
      model: '',
      notes: '',
      dateCreated: new Date(),
      ...getEngineData()
    } as CompareConsist;
    await addCompareData(data);
    await findComparableEngines();
  };

  const findComparableEngines = async () => {
    const newEngineData = await getEnginesByEngineData(getEngineData());
    setEngines(newEngineData.sort((a: any, b: any) => b.stockNum - a.stockNum));
  };

  const handleLoadBlankRecord = () => {
    const url = new URL(location.href);
    url.searchParams.delete('r');
    router.replace(url.href);
  };


  return (
    <div className="compare-engine-table">
      {loading ?
        <Loading />
        :
        <>
          <div className="compare-engine-table__top-bar">
            <Button
              className="compare-consist__compare-section--compare-btn"
              variant={['x-small']}
              onClick={handleCompareableEngines}
            >
              Find Comparable Engines
            </Button>

            {/* <Button
              className="compare-consist__compare-section--compare-btn"
              variant={['x-small']}
              onClick={() => setDialogOpen(true)}
            >
              Load Previous Record
            </Button>

            <Button
              className="compare-consist__compare-section--compare-btn"
              variant={['x-small']}
              onClick={handleLoadBlankRecord}
            >
              Load Blank Record
            </Button> */}
          </div>

          <CompareConsistHistoryDialog open={dialogOpen} setOpen={setDialogOpen} customerId={customerId} />

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
              {paginatedEngines.map((engine: Engine) => {
                return (
                  <tr key={engine.id}>
                    <td><Button variant={['x-small']} onClick={() => openSideBySide(engine)}>Side by Side</Button></td>
                    <td><Link href={`/engines/${engine.stockNum}`}>{ engine.stockNum }</Link></td>
                    <td className="cbx-td"><Checkbox checked={engine.ecm} disabled /></td>
                    <td className="cbx-td"><Checkbox checked={engine.warranty} disabled /></td>
                    <td>{ engine.model }</td>
                    <td>{ engine.serialNum }</td>
                    <td>{ engine.arrNum }</td>
                    <td>{ engine.location }</td>
                    <td>{ engine.horsePower }</td>
                    <td>{ engine.oilPanNew }</td>
                    <td>{ engine.turboHpNew }</td>
                    <td>{ engine.turboLpNew }</td>
                    <td>{ formatCurrency(engine.costRemaining) }</td>
                    <td>{ engine.purchasedFrom }</td>
                    <td>{ engine.currentStatus }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination
            data={engines}
            setData={setPaginatedEngines}
            pageSize={35}
          />
        </>
      }
    </div>
  );
}
