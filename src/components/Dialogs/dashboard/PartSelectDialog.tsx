import { useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import Table from "@/components/Library/Table";
import Pagination from "@/components/Library/Pagination";
import Button from "@/components/Library/Button";
import { getPartById, getPartsQty, getSomeParts, searchAltParts } from "@/scripts/services/partsService";
import Loading from "@/components/Library/Loading";
import PiggybackPartSearchDialog from "./PiggybackPartSearchDialog";
import { useAtom } from "jotai";
import { showSoldPartsAtom } from "@/scripts/atoms/state";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (part: Part) => void
}


export default function PartSelectDialog({ open, setOpen, onSubmit }: Props) {
  const [showSoldParts] = useAtom<boolean>(showSoldPartsAtom);
  const [partsData, setPartsData] = useState<Part[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [partCount, setPartCount] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPartId, setSelectedPartId] = useState(0);
  const [partSearchOpen, setPartSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showRemarksList, setShowRemarksList] = useState<{ [id: number]: boolean }>({});
  const [searchData, setSearchData] = useState<PartSearchData>({ showSoldParts: true });
  const LIMIT = 26;

  useEffect(() => {
    const fetchData = async () => {
      resetPartsList();
    };
    fetchData();
  }, [open]);

  const handleMouseOver = (partId: number) => {
    setShowRemarksList({});
    setShowRemarksList((prevState) => ({ ...prevState, [partId]: true }));
  };

  const handleMouseOut = (partId: number) => {
    setShowRemarksList((prevState) => ({ ...prevState, [partId]: false }));
  };

  const resetPartsList = async () => {
    const pageCount = await getPartsQty(showSoldParts);
    setPartCount(pageCount);
    const res = await getSomeParts(1, LIMIT, showSoldParts);
    setPartsData(res);
    setParts(res);
  };
  
  const handleChangePage = async (_: any, page: number) => {
    if (page === currentPage) return;
    if (isSearchMode) {
      await handleSearch(searchData);
    } else {
      const res = await getSomeParts(page, LIMIT, showSoldParts);
      setParts(res);
    }
    setCurrentPage(page);
  };

  const handleSubmit = async () => {
    const part = await getPartById(selectedPartId);
    if (part) onSubmit(part);
    setOpen(false);
  };

  const handleSearch = async (search: PartSearchData) => {
    setLoading(true);
    setIsSearchMode(true);
    setSearchData(search);
    const results = await searchAltParts(search, currentPage, LIMIT);
    setParts(results.rows);
    setPartCount(results.minItems);
    setCurrentPage(1);
    setLoading(false);
  };


  return (
    <>
      <PiggybackPartSearchDialog open={partSearchOpen} setOpen={setPartSearchOpen} handleSearch={handleSearch} />

      <Dialog
        open={open}
        setOpen={setOpen}
        title="Select Part"
        width={660}
        className="piggyback-quote-dialog"
      >
        <div className="piggyback-quote-dialog__top-bar">
          <Button onClick={() => setPartSearchOpen(true)}>Search</Button>
        </div>
        {loading ?
          <Loading />
          :
          <>
            <div className="select-handwritten-dialog">
              <Table>
                <thead>
                  <tr>
                    <th>Qty</th>
                    <th>PartNum</th>
                    <th>Desc</th>
                    <th>StockNum</th>
                    <th>Location</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((part: Part) => {
                    return (
                      <tr key={part.id} onClick={() => setSelectedPartId(part.id)} className={part.id === selectedPartId ? 'select-handwritten-dialog--selected' : ''} style={{ position: 'relative' }}>
                        <td>{ part.qty }</td>
                        <td>{ part.partNum }</td>
                        <td>{ part.desc }</td>
                        <td>{ part.stockNum }</td>
                        <td>{ part.location }</td>
                        <td
                          onMouseOver={() => handleMouseOver(part.id)}
                          onMouseOut={() => handleMouseOut(part.id)}
                        >
                          {showRemarksList[part.id] ?
                            <div className="piggyback-quote-dialog__remarks">
                              <p>{ part.remarks }</p>
                            </div>
                            :
                            <p style={{ textAlign: 'center' }}>
                              ?
                            </p>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <Pagination
                data={partsData}
                setData={handleChangePage}
                minData={partCount}
                pageSize={LIMIT}
              />
            </div>
            <Button onClick={handleSubmit} className="piggyback-quote-dialog__submit-btn">Submit</Button>
          </>
        }
      </Dialog>
    </>
  );
}
