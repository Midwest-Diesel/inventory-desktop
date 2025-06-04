import { MouseEvent, useEffect, useRef, useState } from "react";
import Dialog from "../../Library/Dialog";
import Table from "@/components/Library/Table";
import Pagination from "@/components/Library/Pagination";
import { useAtom } from "jotai";
import { showSoldPartsAtom, userAtom } from "@/scripts/atoms/state";
import Button from "@/components/Library/Button";
import { getCustomerById } from "@/scripts/services/customerService";
import { getPartById, getPartsQty, getSomeParts } from "@/scripts/services/partsService";
import PiggybackPartSearchDialog from "./PiggybackPartSearchDialog";
import Loading from "@/components/Library/Loading";
import { addQuote, piggybackQuote } from "@/scripts/services/quotesService";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  quote: Quote
  handleChangeQuotesPage: (_: any, page: number) => void
  quotesPage: number
}


export default function PiggybackQuoteDialog({ open, setOpen, quote, handleChangeQuotesPage, quotesPage }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [showSoldParts, setShowSoldParts] = useAtom<boolean>(showSoldPartsAtom);
  const [partsData, setPartsData] = useState<Part[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [partCount, setPartCount] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPartId, setSelectedPartId] = useState(0);
  const [partSearchOpen, setPartSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showRemarksList, setShowRemarksList] = useState<{ [id: number]: boolean }>({});
  
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
    const res = await getSomeParts(1, 26, showSoldParts);
    setPartsData(res);
    setParts(res);
  };
  
  const handleChangePage = async (data: any, page: number) => {
    if (page === currentPage) return;
    if (isSearchMode) {
      const start = (page - 1) * 26;
      const end = start + 26;
      setParts(partsData.slice(start, end));
    } else {
      const res = await getSomeParts(page, 26, showSoldParts);
      setParts(res);
    }
    setCurrentPage(page);
  };

  const handlePiggybackQuote = async () => {
    const customerId = Number(localStorage.getItem('customerId'));
    const customer = await getCustomerById(customerId) as Customer;
    const part = await getPartById(selectedPartId);
    const newQuote: any = {
      date: new Date(),
      source: null,
      customerId: customer?.id,
      contact: customer?.contact,
      phone: customer?.phone,
      state: customer?.billToState,
      partNum: part?.partNum,
      desc: part?.desc,
      stockNum: part?.stockNum,
      price: 0,
      notes: part?.desc,
      salesmanId: user.id,
      rating: part?.rating,
      email: customer?.email,
      partId: part?.id
    };
    const id = await addQuote(newQuote) as any;
    await piggybackQuote(quote.id, id);
    await handleChangeQuotesPage(null, quotesPage);
    setOpen(false);
  };

  const handleSearchParts = async (results: Part[]) => {
    setIsSearchMode(true);
    setPartsData(results);
    setParts(results.slice(0, 26));
    setPartCount(results.map((part) => part.qty));
    setCurrentPage(1);
  };


  return (
    <>
      <PiggybackPartSearchDialog open={partSearchOpen} setOpen={setPartSearchOpen} setLoading={setLoading} setParts={handleSearchParts} />

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
                pageSize={26}
              />
            </div>
            <Button onClick={handlePiggybackQuote} className="piggyback-quote-dialog__submit-btn">Submit</Button>
          </>
        }
      </Dialog>
    </>
  );
}
