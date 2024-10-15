import Image from "next/image";
import { useEffect, useState } from "react";
import Table from "../Library/Table";
import Button from "../Library/Button";
import { extractStatusColors, formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import { partsQtyAtom, picturesAtom, quotesAtom, selectedCustomerAtom, snPicturesAtom, userAtom } from "@/scripts/atoms/state";
import Pagination from "../Library/Pagination";
import PartsSearchDialog from "../Dialogs/dashboard/PartsSearchDialog";
import AltPartsSearchDialog from "../Dialogs/dashboard/AltPartsSearchDialog";
import { getAltsByPartNum, getPartsQty, getSomeParts } from "@/scripts/controllers/partsController";
import { checkImageExists, getImagesFromPart, getImagesFromStockNum } from "@/scripts/controllers/imagesController";
import SalesInfoDialog from "../Dialogs/dashboard/SalesInfoDialog";
import Link from "next/link";
import Loading from "../Library/Loading";
import { isObjectNull } from "@/scripts/tools/utils";
import PartPicturesDialog from "../Dialogs/PartPicturesDialog";
import { getPartsOnEngines } from "@/scripts/controllers/compareConsistController";
import PartsOnEnginesDialog from "../Dialogs/dashboard/PartsOnEnginesDialog";
import { getSearchedPartNum } from "@/scripts/tools/search";
import StockNumPicturesDialog from "../Dialogs/StockNumPicturesDialog";
import PiggybackQuoteDialog from "../Dialogs/dashboard/PiggybackQuoteDialog";
import { addQuote } from "@/scripts/controllers/quotesController";

interface Props {
  selectHandwrittenOpen: boolean
  setSelectHandwrittenOpen: (value: boolean) => void
  setSelectedHandwrittenPart: (part: Part) => void
}


export default function PartSearch({ selectHandwrittenOpen, setSelectHandwrittenOpen, setSelectedHandwrittenPart }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [partsQty, setPartsQty] = useAtom<number[]>(partsQtyAtom);
  const [quotesData, setQuotesData] = useAtom<Quote[]>(quotesAtom);
  const [pictures] = useAtom(picturesAtom);
  const [snPictures] = useAtom(snPicturesAtom);
  const [selectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [partsData, setPartsData] = useState<Part[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [partsOpen, setPartsOpen] = useState(localStorage.getItem('partsOpen') === 'true' || localStorage.getItem('partsOpen') === null ? true : false);
  const [partsSearchOpen, setPartsSearchOpen] = useState(false);
  const [altPartsSearchOpen, setAltPartsSearchOpen] = useState(false);
  const [salesInfoOpen, setSalesInfoOpen] = useState(false);
  const [piggybackQuoteOpen, setPiggybackQuoteOpen] = useState(false);
  const [piggybackQuotePart, setPiggybackQuotePart] = useState<Part>(null);
  const [loading, setLoading] = useState(true);
  const [partImages, setPartImages] = useState<Picture[]>([]);
  const [snImages, setSnImages] = useState<Picture[]>([]);
  const [partImagesOpen, setPartImagesOpen] = useState(false);
  const [snImagesOpen, setSnImagesOpen] = useState(false);
  const [partsOnEngsOpen, setPartsOnEngsOpen] = useState(false);
  const [partsOnEngs, setPartsOnEngs] = useState<{ partNum: string, engines: Engine[] }[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const getTotalQty = () => partsQty.reduce((acc, part) => acc + part, 0);

  useEffect(() => {
    const fetchData = async () => {
      if (searchInputExists() || pageLoaded) return;
      setLoading(true);
      const res = await getSomeParts(1, 26);
      setPartsData(res);
      setParts(res);
      setPartsQty((await getPartsQty()));
      setLoading(false);
      setPageLoaded(true);
    };
    fetchData();
  }, []);

  const searchInputExists = () => {
    const altSearch = JSON.parse(localStorage.getItem('altPartSearches'));
    return (
      !isObjectNull(altSearch ? altSearch.partNum.replace('*', '') : []) ||
      !isObjectNull(JSON.parse(localStorage.getItem('partSearches')) || [])
    );
  };

  const handleSearchData = async (parts: Part[]) => {
    if (!parts) {
      setParts(null);
      setPartsQty((await getPartsQty()));
      setParts(await getSomeParts(1, 26));
    } else if (parts.length === 0) {
      setParts([]);
      setParts([]);
      setPartsQty([]);
    } else {
      setParts(parts);
      setPartsQty(parts.map((part) => part.qty));
      setParts(parts);
    }
    setLoading(false);
  };

  const findPartsOnEngines = async () => {
    const partNum = getSearchedPartNum();
    const alts = await getAltsByPartNum(partNum);
    const engines = [];
    
    for (let i = 0; i < alts.length; i++) {
      const res = await getPartsOnEngines(alts[i]);
      engines.push(res);
    }
    setPartsOnEngs(engines);
    setPartsOnEngsOpen(true);
  };

  const togglePartsOpen = () => {
    localStorage.setItem('partsOpen', `${!partsOpen}`);
    setPartsOpen(!partsOpen);
  };

  const quotePart = async (part: Part) => {
    const newQuote = {
      source: null,
      customer: selectedCustomer,
      contact: selectedCustomer.contact,
      phone: '',
      state: '',
      partNum: part.partNum,
      desc: part.desc,
      stockNum: part.stockNum,
      price: 0,
      notes: '',
      salesman: '',
      date: new Date(),
      sale: false,
      partId: part.id
    } as any;
    await addQuote(newQuote, user.id);
    setQuotesData([newQuote, ...quotesData]);
  };

  const quotePiggyback = (part: Part) => {
    setPiggybackQuoteOpen(true);
    setPiggybackQuotePart(part);
  };
  
  const openPartImages = async (part: Part) => {
    setPartImages(await getImagesFromPart(part.partNum));
    setPartImagesOpen(true);
  };

  const openStockNumImages = async (part: Part) => {
    setSnImages(await getImagesFromStockNum(part.stockNum));
    setSnImagesOpen(true);
  };

  const handleOpenSelectHandwrittenDialog = (part: Part) => {
    if (selectHandwrittenOpen) setSelectHandwrittenOpen(false);
    setTimeout(() => setSelectHandwrittenOpen(true), 1);
    setSelectedHandwrittenPart(part);
  };

  const handleChangePage = async (data: any, page: number) => {
    if (page === currentPage || !pageLoaded) return;
    setLoading(true);
    const res = await getSomeParts(page, 26);
    setParts(res);
    setCurrentPage(page);
    setLoading(false);
  };


  return (
    <div>
      <div className="parts-search__header no-select" onClick={togglePartsOpen}>
        <h2>Parts Search</h2>
        <Image src={`/images/icons/arrow-${partsOpen ? 'up' : 'down'}.svg`} alt="arrow" width={25} height={25} />
      </div>

      <PartsOnEnginesDialog open={partsOnEngsOpen} setOpen={setPartsOnEngsOpen} searchResults={partsOnEngs} />

      {partsOpen &&
        <>
          { loading && <Loading /> }
          <PartPicturesDialog open={partImagesOpen} setOpen={setPartImagesOpen} pictures={partImages} />
          <StockNumPicturesDialog open={snImagesOpen} setOpen={setSnImagesOpen} pictures={snImages} />

          <div className="parts-search-top-bar">
            <Button
              onClick={findPartsOnEngines}
              disabled={!getSearchedPartNum()}
            >
              On Engines
            </Button>
            <Button
              onClick={() => setSalesInfoOpen(true)}
              disabled={!getSearchedPartNum()}
            >
              Sales Info
            </Button>
            <Button
              onClick={() => setPartsSearchOpen(true)}
              data-cy="part-search-btn"
            >
              Parts Search
            </Button>
            <Button
              onClick={() => setAltPartsSearchOpen(true)}
            >
              Alt Parts Search
            </Button>
            <Link
              className="parts-search-top-bar__link"
              href={`/compare-consist${!isObjectNull(selectedCustomer) ? `?c=${selectedCustomer.id}` : ''}`}
            >
              Compare / Consist
            </Link>
            {user.accessLevel >= 2 &&
              <Link
                className="parts-search-top-bar__link"
                href="/part/new"
                data-cy="new-part-btn"
              >
                New Part
              </Link>
            }
          </div>

          {/* Dialogs */}
          <SalesInfoDialog open={salesInfoOpen} setOpen={setSalesInfoOpen} />
          <PartsSearchDialog open={partsSearchOpen} setOpen={setPartsSearchOpen} setParts={handleSearchData} setLoading={setLoading} />
          <AltPartsSearchDialog open={altPartsSearchOpen} setOpen={setAltPartsSearchOpen} setParts={handleSearchData} setLoading={setLoading} />
          { piggybackQuotePart && <PiggybackQuoteDialog open={piggybackQuoteOpen} setOpen={setPiggybackQuoteOpen} part={piggybackQuotePart} /> }

          <div style={{ width:'fit-content', overflow: 'auto', maxHeight: '68vh' }}>
            <Table data-cy="part-search-table">
              <thead>
                <tr>
                  <th>Total Qty <span className="parts-search__total-qty">{ getTotalQty() }</span></th>
                  <th>Part Number</th>
                  <th>Entry Date</th>
                  <th>Qty</th>
                  <th>Description</th>
                  <th>Stock Number</th>
                  <th>Location</th>
                  <th>Remarks</th>
                  <th>Our Cost</th>
                  <th>New Price</th>
                  <th>Remaining Price</th>
                </tr>
              </thead>
              <tbody className="parts-list">
                {parts && parts.map((part: Part, i) => {
                  const status = extractStatusColors(part.remarks);
                  const imageExists = checkImageExists(pictures, part.partNum);
                  const snImageExists = checkImageExists(snPictures, part.stockNum);
                  
                  return (
                    <tr key={i}>
                      <td className="parts-list__left-col table-buttons">
                        <div style={{ display: 'flex' }}>
                          <Button variant={['x-small']} onClick={() => quotePart(part)} data-cy="quote-part-btn">Quote Part</Button>
                          <Button variant={['x-small']} onClick={() => quotePiggyback(part)}>Quote Piggyback</Button>
                        </div>
                        <Button variant={['x-small']} onClick={() => handleOpenSelectHandwrittenDialog(part)}>Add to Handwritten</Button>
                      </td>
                      <td>
                        <div className="parts-list__left-content">
                          {imageExists &&
                            <Button
                              variant={['plain','hover-move']}
                              style={{ padding: '0.1rem' }}
                              onClick={() => openPartImages(part)}
                            >
                              <Image src="/images/icons/image.svg" alt="detail" width={20} height={20} style={{ alignSelf: 'center' }} />
                            </Button>
                          }
                          <Link href={`/part/${part.id}`} data-cy="part-num-link">{ part.partNum }</Link>
                        </div>  
                      </td>
                      <td>{ formatDate(part.entryDate) }</td>
                      <td>{ part.qty }</td>
                      <td style={{ width:'16rem' }}>{ part.desc }</td>
                      <td>
                        <div className="parts-list__left-content">
                          {snImageExists &&
                            <Button
                              variant={['plain','hover-move']}
                              style={{ padding: '0.1rem' }}
                              onClick={() => openStockNumImages(part)}
                            >
                              <Image src="/images/icons/image.svg" alt="detail" width={20} height={20} style={{ alignSelf: 'center' }} />
                            </Button>
                          }
                          { part.stockNum }
                        </div>
                      </td>
                      <td>{ part.location }</td>
                      <td style={{ width:'22rem', fontSize:'var(--font-xsm)', backgroundColor:`var(--status-${status})`, color: `${status ? 'black' : 'white'}` }}>
                        { part.remarks }
                      </td>
                      <td>{ formatCurrency(part.purchasePrice) }</td>
                      <td style={{ fontSize: 'var(--font-xsm)' }}>
                        <strong>List:</strong> { formatCurrency(part.listPrice) }<br />
                        <strong>Fleet:</strong> { formatCurrency(part.fleetPrice) }
                      </td>
                      <td>{ formatCurrency(part.remainingPrice) }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <Pagination
              data={partsData}
              setData={handleChangePage}
              minData={partsQty}
              pageSize={26}
            />
          </div>
          { parts.length === 0 && <p>No parts data found...</p> }
        </>
      }
    </div>
  );
}
