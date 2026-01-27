import Dialog from "../../library/Dialog";
import Button from "../../library/Button";
import { useEffect, useState } from "react";
import { formatDate } from "@/scripts/tools/stringUtils";
import Table from "../../library/Table";
import { useNavState } from "../../../hooks/useNavState";
import { deleteCompareData } from "@/scripts/services/compareConsistService";
import { ask } from "@/scripts/config/tauri";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  searchData: CompareConsist[]
  setSearchData: (data: CompareConsist[]) => void
}


export default function CompareConsistHistoryDialog({ open, setOpen, searchData, setSearchData }: Props) {
  const [page, setPage] = useState(0);
  const { push } = useNavState();

  useEffect(() => {
    if (open) setPage(0);
  }, [open]);

  useEffect(() => {
    if (searchData.length === 0) setOpen(false);
  }, [searchData]);

  const prevPage = () => {
    if (page === 0) {
      setPage(searchData.length - 1);
    } else {
      setPage(page - 1);
    }
  };

  const nextPage = () => {
    if (page === searchData.length - 1) {
      setPage(0);
    } else {
      setPage(page + 1);
    }
  };

  const handleLoad = () => {
    const url = new URL(location.href);
    url.searchParams.set('r', searchData[page].id.toString());
    push('Compare Consist', `${url.pathname}${url.search}`);
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!await ask('Delete this search?')) return;
    await deleteCompareData(searchData[page].id);
    setSearchData(searchData.filter((s) => s.id !== searchData[page].id));
    setPage(0);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title={`Previous Searches (${searchData.length} ${searchData.length > 1 ? 'results' : 'result'})`}
      width={800}
      y={180}
      className="compare-consist-history-dialog"
    >
      <div className="div__footer">
        <Button type="submit" variant={['small']} onClick={prevPage} disabled={searchData.length === 1}>Prev</Button>
        <Button type="submit" variant={['small']} onClick={handleLoad}>Load</Button>
        <Button type="submit" variant={['small']} onClick={nextPage} disabled={searchData.length === 1}>Next</Button>
      </div>
        
      {searchData && searchData[page] &&
        <div className="compare-consist-history-dialog__table-container">
          <div className="compare-consist-history-dialog__top-content">
            <h3>Company: <span>{ searchData[page].customer?.company }</span></h3>
            <h3>Serial Number: <span>{ searchData[page].serialNum }</span></h3>
            <h3>Arrangement Number: <span>{ searchData[page].arrNum }</span></h3>
          </div>

          <h4>{ formatDate(searchData[page].dateCreated) }</h4>
          <div style={{ overflow: 'auto', maxHeight: '38rem' }}>
            <Table>
              <tbody>
                <tr>
                  <th>Head New</th>
                  <td>{ searchData[page].headNew }</td>
                  <th>Head Reman</th>
                  <td>{ searchData[page].headReman }</td>
                </tr>
                <tr>
                  <th>Block</th>
                  <td>{ searchData[page].blockNew }</td>
                  <th>Block Reman</th>
                  <td>{ searchData[page].blockReman }</td>
                </tr>
                <tr>
                  <th>Crank</th>
                  <td>{ searchData[page].crankNew }</td>
                  <th>Crank Reman</th>
                  <td>{ searchData[page].crankReman }</td>
                </tr>
                <tr>
                  <th>Pistons</th>
                  <td>{ searchData[page].pistonNew }</td>
                  <th>Pistons Reman</th>
                  <td>{ searchData[page].pistonReman }</td>
                </tr>
                <tr>
                  <th>Cam</th>
                  <td>{ searchData[page].camNew }</td>
                  <th>Cam Reman</th>
                  <td>{ searchData[page].camReman }</td>
                </tr>
                <tr>
                  <th>Injectors</th>
                  <td>{ searchData[page].injNew }</td>
                  <th>Injectors Reman</th>
                  <td>{ searchData[page].injReman }</td>
                </tr>
                <tr>
                  <th>Turbo</th>
                  <td>{ searchData[page].turboNew }</td>
                  <th>Turbo Reman</th>
                  <td>{ searchData[page].turboReman }</td>
                </tr>
                <tr>
                  <th>FWH</th>
                  <td>{ searchData[page].fwhNew }</td>
                  <th>FWH Reman</th>
                  <td>{ searchData[page].fwhReman }</td>
                </tr>
                <tr>
                  <th>Front Hsng</th>
                  <td>{ searchData[page].frontHsngNew }</td>
                  <th>Front Hsng Reman</th>
                  <td>{ searchData[page].frontHsngReman }</td>
                </tr>
                <tr>
                  <th>Oil Pan</th>
                  <td>{ searchData[page].oilPanNew }</td>
                  <th>Oil Pan Reman</th>
                  <td>{ searchData[page].oilPanReman }</td>
                </tr>
                <tr>
                  <th>HP Turbo</th>
                  <td>{ searchData[page].turboHpNew }</td>
                  <th>HP Turbo Reman</th>
                  <td>{ searchData[page].turboHpReman }</td>
                </tr>
                <tr>
                  <th>LP Turbo</th>
                  <td>{ searchData[page].turboLpNew }</td>
                  <th>LP Turbo Reman</th>
                  <td>{ searchData[page].turboLpReman }</td>
                </tr>
                <tr>
                  <th>HEUI Pump</th>
                  <td>{ searchData[page].heuiPumpNew }</td>
                  <th>HEUI Pump Reman</th>
                  <td>{ searchData[page].heuiPumpReman }</td>
                </tr>
                <tr>
                  <th>ExhMnfld</th>
                  <td>{ searchData[page].exhMnfldNew }</td>
                  <th>ExhMnfld Reman</th>
                  <td>{ searchData[page].exhMnfldReman }</td>
                </tr>
                <tr>
                  <th>Oil Pump</th>
                  <td>{ searchData[page].oilPumpNew }</td>
                  <th>Oil Pump Reman</th>
                  <td>{ searchData[page].oilPumpReman }</td>
                </tr>
                <tr>
                  <th>Water Pump</th>
                  <td>{ searchData[page].waterPumpNew }</td>
                  <th>Water Pump Reman</th>
                  <td>{ searchData[page].waterPumpReman }</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      }

      <Button style={{ marginTop: '0.5rem' }} variant={['danger']} onClick={handleDelete}>Delete</Button>
    </Dialog>
  );
}
