import { useEffect, useState } from "react";
import Dialog from "../../library/Dialog";
import Table from "@/components/library/Table";
import Pagination from "@/components/library/Pagination";
import { useAtom } from "jotai";
import { showSoldPartsAtom, userAtom } from "@/scripts/atoms/state";
import Button from "@/components/library/Button";
import { getCustomerById } from "@/scripts/services/customerService";
import { getPartById, searchAltParts, searchParts } from "@/scripts/services/partsService";
import Loading from "@/components/library/Loading";
import { addQuote, piggybackQuote } from "@/scripts/services/quotesService";
import { useQuery } from "@tanstack/react-query";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  quote: Quote
  handleChangeQuotesPage: (data: any, page: number) => Promise<void>
  quotesPage: number
}


const LIMIT = 26;

export default function PiggybackQuoteDialog({ open, setOpen, quote, handleChangeQuotesPage, quotesPage }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [showSoldParts] = useAtom<boolean>(showSoldPartsAtom);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [showRemarksList, setShowRemarksList] = useState<{ [id: number]: boolean }>({});
  const [searchParams, setSearchParams] = useState(JSON.parse(localStorage.getItem('altPartSearches') || JSON.parse(localStorage.getItem('partSearches')!)));
  
  useEffect(() => {
    setSearchParams(JSON.parse(localStorage.getItem('altPartSearches') || JSON.parse(localStorage.getItem('partSearches')!)));
  }, [open, showSoldParts, quote]);

  const { data: parts, isFetching: isSearchFetching } = useQuery<PartsRes>({
    queryKey: ['searchParts', searchParams, currentPage],
    queryFn: () => {
      if (!searchParams) throw new Error('No search params');
      return searchParams.isAltSearch
        ? searchAltParts({ ...searchParams, showSoldParts }, currentPage, LIMIT)
        : searchParts({ ...searchParams, showSoldParts }, currentPage, LIMIT);
    },
    enabled: !!searchParams
  });

  const handleMouseOver = (partId: number) => {
    setShowRemarksList({});
    setShowRemarksList((prevState) => ({ ...prevState, [partId]: true }));
  };

  const handleMouseOut = (partId: number) => {
    setShowRemarksList((prevState) => ({ ...prevState, [partId]: false }));
  };
  
  const handleChangePage = (_: any, page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    if (searchParams) setSearchParams({ ...searchParams, page });
  };

  const handlePiggybackQuote = async () => {
    if (!selectedPartId) return;
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
      notes: null,
      salesmanId: user.id,
      rating: part?.rating,
      email: customer?.email,
      partId: part?.id
    };
    const id = await addQuote(newQuote);
    await piggybackQuote(quote.id, Number(id));
    await handleChangeQuotesPage(null, quotesPage);
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Select Part"
      className="piggyback-quote-dialog"
      maxHeight="30rem"
    >
      { isSearchFetching && <Loading /> }
      {parts ?
        <>
          <Button onClick={handlePiggybackQuote} className="piggyback-quote-dialog__submit-btn">Submit</Button>

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
              {parts.rows.map((part: Part) => {
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
            data={parts?.rows ?? []}
            setData={handleChangePage}
            pageCount={parts?.pageCount ?? 0}
            pageSize={LIMIT}
          />
        </>
        :
        !isSearchFetching && <p>Failed searching parts</p>
      }
    </Dialog>
  );
}
