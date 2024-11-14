import Dialog from "../Library/Dialog";
import Button from "../Library/Button";
import { useEffect, useState } from "react";
import { getCompareDataByCustomer } from "@/scripts/controllers/compareConsistController";
import { formatDate } from "@/scripts/tools/stringUtils";
import Table from "../Library/Table";
import { useRouter } from "next/router";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  customerId: number
}


export default function CompareConsistHistoryDialog({ open, setOpen, customerId }: Props) {
  const router = useRouter();
  const [compareData, setCompareData] = useState<CompareConsist[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!customerId) return;
    const fetchData = async () => {
      const res = await getCompareDataByCustomer(customerId);
      setCompareData(res);
    };
    fetchData();
  }, []);

  const prevPage = () => {
    if (page === 0) {
      setPage(compareData.length - 1);
    } else {
      setPage(page - 1);
    }
  };

  const nextPage = () => {
    if (page === compareData.length - 1) {
      setPage(0);
    } else {
      setPage(page + 1);
    }
  };

  const handleLoad = () => {
    const url = new URL(location.href);
    url.searchParams.set("r", compareData[page].id.toString());
    router.replace(url.href);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Previous Records"
      width={600}
      height={600}
      className="compare-consist-history-dialog"
      maxHeight="32rem"
    >
      <div className="div__footer">
        <Button type="submit" variant={['small']} onClick={prevPage}>Prev</Button>
        <Button type="submit" variant={['small']} onClick={handleLoad}>Load</Button>
        <Button type="submit" variant={['small']} onClick={nextPage}>Next</Button>
      </div>
        
      {compareData && compareData[page] &&
        <>
          <h4>{ formatDate(compareData[page].dateCreated) }</h4>
          <Table>
            <tbody>
              <tr>
                <th>Head New</th>
                <td>{ compareData[page].headNew }</td>
                <th>Head Reman</th>
                <td>{ compareData[page].headReman }</td>
              </tr>
              <tr>
                <th>Block</th>
                <td>{ compareData[page].blockNew }</td>
                <th>Head Reman</th>
                <td>{ compareData[page].blockReman }</td>
              </tr>
              <tr>
                <th>Crank</th>
                <td>{ compareData[page].crankNew }</td>
                <th>Crank Reman</th>
                <td>{ compareData[page].crankReman }</td>
              </tr>
              <tr>
                <th>Pistons</th>
                <td>{ compareData[page].pistonNew }</td>
                <th>Pistons Reman</th>
                <td>{ compareData[page].pistonReman }</td>
              </tr>
              <tr>
                <th>Cam</th>
                <td>{ compareData[page].camNew }</td>
                <th>Cam Reman</th>
                <td>{ compareData[page].camReman }</td>
              </tr>
              <tr>
                <th>Injectors</th>
                <td>{ compareData[page].injNew }</td>
                <th>Injectors Reman</th>
                <td>{ compareData[page].injReman }</td>
              </tr>
              <tr>
                <th>Turbo</th>
                <td>{ compareData[page].turboNew }</td>
                <th>Turbo Reman</th>
                <td>{ compareData[page].turboReman }</td>
              </tr>
              <tr>
                <th>FWH</th>
                <td>{ compareData[page].fwhNew }</td>
                <th>FWH Reman</th>
                <td>{ compareData[page].fwhReman }</td>
              </tr>
              <tr>
                <th>Front Hsng</th>
                <td>{ compareData[page].frontHsngNew }</td>
                <th>Front Hsng Reman</th>
                <td>{ compareData[page].frontHsngReman }</td>
              </tr>
              <tr>
                <th>Oil Pan</th>
                <td>{ compareData[page].oilPanNew }</td>
                <th>Oil Pan Reman</th>
                <td>{ compareData[page].oilPanReman }</td>
              </tr>
              <tr>
                <th>HP Turbo</th>
                <td>{ compareData[page].turboHpNew }</td>
                <th>HP Turbo Reman</th>
                <td>{ compareData[page].turboHpReman }</td>
              </tr>
              <tr>
                <th>LP Turbo</th>
                <td>{ compareData[page].turboLpNew }</td>
                <th>LP Turbo Reman</th>
                <td>{ compareData[page].turboLpReman }</td>
              </tr>
              <tr>
                <th>HEUI Pump</th>
                <td>{ compareData[page].heuiPumpNew }</td>
                <th>HEUI Pump Reman</th>
                <td>{ compareData[page].heuiPumpReman }</td>
              </tr>
              <tr>
                <th>ExhMnfld</th>
                <td>{ compareData[page].exhMnfldNew }</td>
                <th>ExhMnfld Reman</th>
                <td>{ compareData[page].exhMnfldReman }</td>
              </tr>
              <tr>
                <th>Oil Pump</th>
                <td>{ compareData[page].oilPumpNew }</td>
                <th>Oil Pump Reman</th>
                <td>{ compareData[page].oilPumpReman }</td>
              </tr>
              <tr>
                <th>Water Pump</th>
                <td>{ compareData[page].waterPumpNew }</td>
                <th>Water Pump Reman</th>
                <td>{ compareData[page].waterPumpReman }</td>
              </tr>
            </tbody>
          </Table>
        </>
      }
    </Dialog>
  );
}
