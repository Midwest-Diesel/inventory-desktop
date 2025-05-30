import Image from "next/image";
import { useEffect, useState } from "react";
import Table from "../Library/Table";
import Button from "../Library/Button";
import { extractStatusColors, formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import { partsQtyAtom, quotesAtom, selectedCustomerAtom, showSoldPartsAtom, userAtom } from "@/scripts/atoms/state";
import Pagination from "../Library/Pagination";
import PartsSearchDialog from "../Dialogs/dashboard/PartsSearchDialog";
import AltPartsSearchDialog from "../Dialogs/dashboard/AltPartsSearchDialog";
import { getAltsByPartNum, getPartsQty, getSomeParts, searchAltParts, searchParts } from "@/scripts/controllers/partsController";
import { getImagesFromPart, getImagesFromStockNum } from "@/scripts/controllers/imagesController";
import SalesInfoDialog from "../Dialogs/dashboard/SalesInfoDialog";
import Link from "../Library/Link";
import Loading from "../Library/Loading";
import { isObjectNull } from "@/scripts/tools/utils";
import PartPicturesDialog from "../Dialogs/PartPicturesDialog";
import { getPartsOnEngines } from "@/scripts/controllers/compareConsistController";
import PartsOnEnginesDialog from "../Dialogs/dashboard/PartsOnEnginesDialog";
import { getSearchedPartNum } from "@/scripts/tools/search";
import StockNumPicturesDialog from "../Dialogs/StockNumPicturesDialog";
import { addQuote } from "@/scripts/controllers/quotesController";
import CoreFamilySearchDialog from "../Dialogs/dashboard/SearchCoreFamilyDialog";

interface Props {
  selectHandwrittenOpen: boolean
  setSelectHandwrittenOpen: (value: boolean) => void
  setSelectedHandwrittenPart: (part: Part) => void
}


export default function PartSearch({ selectHandwrittenOpen, setSelectHandwrittenOpen, setSelectedHandwrittenPart }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [partsQty, setPartsQty] = useAtom<number[]>(partsQtyAtom);
  const [quotesData, setQuotesData] = useAtom<Quote[]>(quotesAtom);
  const [selectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [showSoldParts, setShowSoldParts] = useAtom<boolean>(showSoldPartsAtom);
  const [partsData, setPartsData] = useState<Part[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [partsOpen, setPartsOpen] = useState(localStorage.getItem('partsOpen') === 'true' || localStorage.getItem('partsOpen') === null ? true : false);
  const [partsSearchOpen, setPartsSearchOpen] = useState(false);
  const [altPartsSearchOpen, setAltPartsSearchOpen] = useState(false);
  const [salesInfoOpen, setSalesInfoOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [partImages, setPartImages] = useState<Picture[]>([]);
  const [picturesPartNum, setPicturesPartNum] = useState<string>('');
  const [snImages, setSnImages] = useState<Picture[]>([]);
  const [picturesStockNum, setPicturesStockNum] = useState<string>('');
  const [partImagesOpen, setPartImagesOpen] = useState(false);
  const [snImagesOpen, setSnImagesOpen] = useState(false);
  const [coreFamilyOpen, setCoreFamilyOpen] = useState(false);
  const [partsOnEngsOpen, setPartsOnEngsOpen] = useState(false);
  const [partsOnEngs, setPartsOnEngs] = useState<{ partNum: string, engines: Engine[] }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isValidSearch, setIsValidSearch] = useState(false);
  const getTotalQty = () => partsQty.reduce((acc, part) => acc + part, 0);
  const LIMIT = 26;

  useEffect(() => {
    const fetchData = async () => {
      if (searchInputExists() || pageLoaded) return;
      setLoading(true);
      const res = await getSomeParts(1, LIMIT, showSoldParts);
      setPartsData(res);
      setParts(res);
      setPartsQty((await getPartsQty(showSoldParts)));
      setLoading(false);
    };
    fetchData();
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    if (searchInputExists() || !pageLoaded) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await getSomeParts(1, LIMIT, showSoldParts);
      setPartsData(res);
      setParts(res);
      setPartsQty((await getPartsQty(showSoldParts)));
      setLoading(false);
    };
    fetchData();
  }, [showSoldParts]);

  useEffect(() => {
    const prevSearches = JSON.parse(localStorage.getItem('altPartSearches')!) ?? JSON.parse(localStorage.getItem('partSearches')!);
    if (!prevSearches) {
      setIsValidSearch(false);
      return;
    }
    setIsValidSearch(Object.values(prevSearches).map((value: any) => value.replace('*', '')).some((value) => value));
  }, [parts]);

  const searchInputExists = () => {
    const altSearch = JSON.parse(localStorage.getItem('altPartSearches')!);
    return (
      !isObjectNull(altSearch ? { ...altSearch, partNum: altSearch.partNum.replace('*', '')} : {}) ||
      !isObjectNull(JSON.parse(localStorage.getItem('partSearches')!) ?? {})
    );
  };

  const handleSearchData = async (parts: Part[]) => {
    if (!parts) {
      setParts([]);
      setPartsQty((await getPartsQty(showSoldParts)));
      setParts(await getSomeParts(1, LIMIT, showSoldParts));
    } else if (parts.length === 0) {
      setParts([]);
      setParts([]);
      setPartsQty([]);
    } else {
      setPartsData(parts);
      setPartsQty(parts.map((part) => part.qty));
      setParts(parts.slice((currentPage - 1) * LIMIT, LIMIT));
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
    setPartsOnEngs(engines as any);
    setPartsOnEngsOpen(true);
  };

  const togglePartsOpen = () => {
    localStorage.setItem('partsOpen', `${!partsOpen}`);
    setPartsOpen(!partsOpen);
  };

  const quotePart = async (part: Part) => {
    const newQuote = {
      source: null,
      customerId: selectedCustomer.id,
      contact: selectedCustomer.contact,
      phone: selectedCustomer.phone,
      state: selectedCustomer.billToState,
      partNum: part.partNum,
      desc: part.desc,
      stockNum: part.stockNum,
      price: 0,
      notes: '',
      salesmanId: user.id,
      date: new Date(),
      rating: part.rating,
      email: selectedCustomer.email,
      partId: part.id
    } as any;
    await addQuote(newQuote);
    setQuotesData([{ ...newQuote, customer: selectedCustomer, part: part, salesman: user }, ...quotesData]);
  };
  
  const openPartImages = async (part: Part) => {
    setPartImages(await getImagesFromPart(part.partNum));
    setPicturesPartNum(part.partNum);
    setPartImagesOpen(true);
  };

  const openStockNumImages = async (part: Part) => {
    setSnImages(await getImagesFromStockNum(part.stockNum ?? ''));
    setPicturesStockNum(part.stockNum ?? '');
    setSnImagesOpen(true);
  };

  const handleOpenSelectHandwrittenDialog = (part: Part) => {
    if (selectHandwrittenOpen) setSelectHandwrittenOpen(false);
    setTimeout(() => setSelectHandwrittenOpen(true), 1);
    setSelectedHandwrittenPart(part);
  };

  const handleChangePage = async (_: any, page: number) => {
    if (page === currentPage || !pageLoaded) return;
    setLoading(true);
    const altSearch = JSON.parse(localStorage.getItem('altPartSearches')!);
    const partSearch = JSON.parse(localStorage.getItem('partSearches')!);

    if (!isObjectNull(altSearch ? { ...altSearch, partNum: altSearch.partNum.replace('*', '')} : {}) || !isObjectNull(partSearch || {})) {
      setParts(partsData.slice((page - 1) * LIMIT, (page - 1) * LIMIT + LIMIT));
    } else {
      const res = await getSomeParts(page, LIMIT, showSoldParts);
      setParts(res);
    }
    setCurrentPage(page);
    setLoading(false);
  };

  const partCostStyles = (part: Part) => {
    return part.purchasePrice > 0.01 && part.stockNum?.slice(0, 2) !== 'UP' ? { color: 'var(--orange-1)', fontWeight: 'bold' } : {};
  };


  return (
    <div className="part-search">
      <div className="parts-search__header no-select" onClick={togglePartsOpen}>
        <h2>Parts Search</h2>
        <Image src={`/images/icons/arrow-${partsOpen ? 'up' : 'down'}.svg`} alt="arrow" width={25} height={25} />
      </div>

      <PartsOnEnginesDialog open={partsOnEngsOpen} setOpen={setPartsOnEngsOpen} searchResults={partsOnEngs} />
      <CoreFamilySearchDialog open={coreFamilyOpen} setOpen={setCoreFamilyOpen} />

      {partsOpen &&
        <>
          { loading && <Loading /> }
          <PartPicturesDialog open={partImagesOpen} setOpen={setPartImagesOpen} pictures={partImages} partNum={picturesPartNum} />
          <StockNumPicturesDialog open={snImagesOpen} setOpen={setSnImagesOpen} pictures={snImages} stockNum={picturesStockNum} />

          <div className="parts-search-top-bar">
            <Button
              onClick={findPartsOnEngines}
              disabled={!getSearchedPartNum()}
            >
              On Engines
            </Button>
            <Button
              onClick={() => setSalesInfoOpen(true)}
              disabled={!isValidSearch}
            >
              Sales Info
            </Button>
            <Button
              onClick={() => setPartsSearchOpen(true)}
              data-testid="part-search-btn"
            >
              Parts Search
            </Button>
            <Button
              onClick={() => setAltPartsSearchOpen(true)}
              data-testid="alt-search-btn"
            >
              Alt Parts Search
            </Button>
            <Button
              onClick={() => setShowSoldParts(!showSoldParts)}
            >
              {showSoldParts ? 'Hide' : 'Show'} Sold Parts
            </Button>
            <Button
              onClick={() => setCoreFamilyOpen(true)}
            >
              Search Core Family
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
                data-testid="new-part-btn"
              >
                New Part
              </Link>
            }
          </div>

          {/* Dialogs */}
          { isValidSearch && <SalesInfoDialog open={salesInfoOpen} setOpen={setSalesInfoOpen} /> }
          <PartsSearchDialog open={partsSearchOpen} setOpen={setPartsSearchOpen} setParts={handleSearchData} setLoading={setLoading} />
          <AltPartsSearchDialog open={altPartsSearchOpen} setOpen={setAltPartsSearchOpen} setParts={handleSearchData} setLoading={setLoading} />

          <div style={{ width:'fit-content', overflow: 'auto', maxHeight: '68vh' }}>
            <Table data-testid="part-search-table">
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
                  <th>Reman Price</th>
                  <th>Serial Number</th>
                  <th>HP</th>
                </tr>
              </thead>
              <tbody className="parts-list">
                {parts && parts.map((part: Part, i) => {
                  const status = extractStatusColors(part.remarks);
                  return (
                    <tr key={i}>
                      <td className="parts-list__left-col table-buttons">
                        <Button variant={['x-small']} onClick={() => quotePart(part)} data-testid="quote-part-btn">Quote Part</Button>
                        <Button variant={['x-small']} onClick={() => handleOpenSelectHandwrittenDialog(part)} data-testid="add-item-btn">Add to Handwritten</Button>
                      </td>
                      <td>
                        <div className="parts-list__left-content">
                          {part.imageExists &&
                            <Button
                              variant={['plain', 'hover-move']}
                              style={{ padding: '0.1rem' }}
                              onClick={() => openPartImages(part)}
                            >
                              <Image src="/images/icons/image.svg" alt="detail" width={20} height={20} style={{ alignSelf: 'center' }} />
                            </Button>
                          }
                          <Link href={`/part/${part.id}`} data-testid="part-num-link">{ part.partNum }</Link>
                        </div>  
                      </td>
                      <td>{ formatDate(part.entryDate) }</td>
                      <td style={part.qty > 0 ? {} : { color: 'var(--red-2)', fontWeight: 'bold' }} data-testid="qty">{ part.qty }</td>
                      <td style={{ width: '16rem' }}>{ part.desc }</td>
                      <td>
                        <div className="parts-list__left-content">
                          {part.snImageExists &&
                            <Button
                              variant={['plain', 'hover-move']}
                              style={{ padding: '0.1rem' }}
                              onClick={() => openStockNumImages(part)}
                            >
                              <Image src="/images/icons/image.svg" alt="detail" width={20} height={20} style={{ alignSelf: 'center' }} />
                            </Button>
                          }
                          <span data-testid="stock-num">{ part.stockNum }</span>
                        </div>
                      </td>
                      <td>{ part.location }</td>
                      <td style={{ width:'22rem', fontSize:'var(--font-xsm)', backgroundColor:`var(--status-${status})`, color: `${status ? 'black' : 'white'}` }}>
                        { part.remarks }
                      </td>
                      <td style={partCostStyles(part)}>{ formatCurrency(part.purchasePrice) }</td>
                      <td style={{ fontSize: 'var(--font-xsm)' }}>
                        <strong>List:</strong> { formatCurrency(part.listPrice) }<br />
                        <strong>Fleet:</strong> { formatCurrency(part.fleetPrice) }
                      </td>
                      <td>{ formatCurrency(part.remanListPrice) }</td>
                      <td>{ (part as any).serialNum }</td>
                      <td>{ (part as any).horsePower }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <Pagination
              data={partsData}
              setData={handleChangePage}
              minData={partsQty}
              pageSize={LIMIT}
            />
          </div>
          { parts.length === 0 && <p>No parts data found...</p> }
        </>
      }
    </div>
  );
}
