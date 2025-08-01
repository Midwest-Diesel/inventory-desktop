import { useEffect, useState } from "react";
import Button from "@/components/Library/Button";
import { useAtom } from "jotai";
import { quickPickItemIdAtom, recentQuotesAtom, selectedCustomerAtom, showSoldPartsAtom, userAtom } from "@/scripts/atoms/state";
import PartsSearchDialog from "@/components/Dialogs/dashboard/PartsSearchDialog";
import AltPartsSearchDialog from "@/components/Dialogs/dashboard/AltPartsSearchDialog";
import { getAltsByPartNum, getSomeParts, searchAltParts, searchParts } from "@/scripts/services/partsService";
import SalesInfoDialog from "@/components/Dialogs/dashboard/SalesInfoDialog";
import Link from "@/components/Library/Link";
import Loading from "@/components/Library/Loading";
import { isObjectNull } from "@/scripts/tools/utils";
import { getPartsOnEngines } from "@/scripts/services/compareConsistService";
import PartsOnEnginesDialog from "@/components/Dialogs/dashboard/PartsOnEnginesDialog";
import { getSearchedPartNum } from "@/scripts/tools/search";
import CoreFamilySearchDialog from "@/components/Dialogs/dashboard/SearchCoreFamilyDialog";
import PartsTable from "@/components/Dashboard/PartsTable";
import { selectedAlertsAtom } from "@/scripts/atoms/components";
import { detectAlerts } from "@/scripts/services/alertsService";
import { getQuotesByPartNum } from "@/scripts/services/recentSearchesService";
import { addHandwrittenItemChild, deleteHandwrittenItemChild, editHandwrittenItemChild, getHandwrittenItemById } from "@/scripts/services/handwrittensService";
import { useToast } from "@/hooks/useToast";

interface Props {
  selectHandwrittenOpen: boolean
  setSelectHandwrittenOpen: (value: boolean) => void
  setSelectedHandwrittenPart: (part: Part) => void
  handleNewQuote: (part?: Part) => Promise<void>
}


export default function PartSearchSection({ selectHandwrittenOpen, setSelectHandwrittenOpen, setSelectedHandwrittenPart, handleNewQuote }: Props) {
  const toast = useToast();
  const [user] = useAtom<User>(userAtom);
  const [selectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [selectedAlerts, setSelectedAlerts] = useAtom<Alert[]>(selectedAlertsAtom);
  const [showSoldParts, setShowSoldParts] = useAtom<boolean>(showSoldPartsAtom);
  const [, setRecentQuoteSearches] = useAtom<RecentQuoteSearch[]>(recentQuotesAtom);
  const [quickPickItemId] = useAtom<number>(quickPickItemIdAtom);
  const [partsData, setPartsData] = useState<Part[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [partsQty, setPartsQty] = useState(0);
  const [rowsHidden, setRowsHidden] = useState<number | null>(null);
  const [partsOpen, setPartsOpen] = useState(localStorage.getItem('partsOpen') === 'true' || localStorage.getItem('partsOpen') === null ? true : false);
  const [partsSearchOpen, setPartsSearchOpen] = useState(false);
  const [altPartsSearchOpen, setAltPartsSearchOpen] = useState(false);
  const [salesInfoOpen, setSalesInfoOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coreFamilyOpen, setCoreFamilyOpen] = useState(false);
  const [partsOnEngsOpen, setPartsOnEngsOpen] = useState(false);
  const [partsOnEngs, setPartsOnEngs] = useState<{ partNum: string, engines: Engine[] }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isValidSearch, setIsValidSearch] = useState(false);
  const LIMIT = 52;

  useEffect(() => {
    const fetchData = async () => {
      if (searchInputExists() || pageLoaded) return;
      setLoading(true);
      const res = await getSomeParts(1, LIMIT, showSoldParts);
      setPartsData(res.rows);
      setParts(res.rows);
      setPageCount(res.pageCount);
      setPartsQty(res.totalQty);  
      setRowsHidden(res.rowsHidden);
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
      setPartsData(res.rows);
      setParts(res.rows);
      setPageCount(res.pageCount);
      setPartsQty(res.totalQty);
      setRowsHidden(res.rowsHidden);
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
    await handleNewQuote(part);
  };

  const onOpenSelectHandwrittenDialog = (part: Part) => {
    if (selectHandwrittenOpen) setSelectHandwrittenOpen(false);
    setTimeout(() => setSelectHandwrittenOpen(true), 1);
    setSelectedHandwrittenPart(part);
  };

  const handleSearch = async (partNum: string, stockNum: string, desc: string, location: string, qty: number, remarks: string, rating: number, purchasedFrom: string, serialNum: string, hp: string, page: number, isAltSearch: boolean, showAlerts = true) => {
    setLoading(true);
    setRecentQuoteSearches(await getQuotesByPartNum(partNum));
    const results = (isAltSearch ?
      await searchAltParts({ partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, serialNum, hp, showSoldParts }, page, LIMIT)
      :
      await searchParts({ partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, serialNum, hp, showSoldParts }, page, LIMIT)
    );
    if (showAlerts) {
      const alerts = await detectAlerts(partNum);
      setSelectedAlerts([...selectedAlerts, ...alerts]);
    }
    setParts(results.rows);
    setPageCount(results.pageCount);
    setPartsQty(results.totalQty);
    setRowsHidden(results.rowsHidden);
    setLoading(false);
  };

  const onChangePage = async (_: any, page: number) => {
    if (page === currentPage || !pageLoaded) return;
    setLoading(true);
    const altSearch = JSON.parse(localStorage.getItem('altPartSearches')!);
    const partSearch = JSON.parse(localStorage.getItem('partSearches')!);

    if (!isObjectNull(altSearch ? { ...altSearch, partNum: altSearch.partNum.replace('*', '')} : {}) || !isObjectNull(partSearch || {})) {
      const { partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, serialNum, hp } = (partSearch || altSearch);
      await handleSearch(partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, serialNum, hp, page, isObjectNull(partSearch || {}), false);
    } else {
      const res = await getSomeParts(page, LIMIT, showSoldParts);
      setParts(res.rows);
      setPageCount(res.pageCount);
      setPartsQty(res.totalQty);
      setRowsHidden(res.rowsHidden);
    }
    setCurrentPage(page);
    setLoading(false);
  };

  const onQuickPick = async (part: Part) => {
    if (quickPickItemId === 0) {
      alert('No line item selected for quick pick');
      return;
    }
    toast.sendToast('Quick picked item', 'success');
    await addHandwrittenItemChild(quickPickItemId, { partId: part.id, qty: part.qty, cost: part.purchasePrice });
    const item = await getHandwrittenItemById(quickPickItemId);
    const child = item?.invoiceItemChildren.find((i) => i.stockNum === 'In/Out');
    if (!child) return;
    if (child.qty! - part.qty <= 0) {
      await deleteHandwrittenItemChild(child.id);
    } else {
      await editHandwrittenItemChild({ ...child, qty: child.qty! - part.qty });
    }
  };


  return (
    <div className="part-search">
      { isValidSearch && <SalesInfoDialog open={salesInfoOpen} setOpen={setSalesInfoOpen} /> }
      <PartsSearchDialog open={partsSearchOpen} setOpen={setPartsSearchOpen} handleSearch={handleSearch} />
      <AltPartsSearchDialog open={altPartsSearchOpen} setOpen={setAltPartsSearchOpen} handleSearch={handleSearch} />
      <PartsOnEnginesDialog open={partsOnEngsOpen} setOpen={setPartsOnEngsOpen} searchResults={partsOnEngs} />
      <CoreFamilySearchDialog open={coreFamilyOpen} setOpen={setCoreFamilyOpen} />

      <div className="parts-search__header no-select" onClick={togglePartsOpen}>
        <h2>Parts Search</h2>
        <img src={`/images/icons/arrow-${partsOpen ? 'up' : 'down'}.svg`} alt="arrow" width={25} height={25} />
      </div>

      {partsOpen &&
        <>
          { loading && <Loading /> }

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

          <PartsTable
            parts={parts}
            partsData={partsData}
            pageCount={pageCount}
            partsQty={partsQty}
            rowsHidden={rowsHidden}
            quotePart={quotePart}
            onChangePage={onChangePage}
            onOpenSelectHandwrittenDialog={onOpenSelectHandwrittenDialog}
            onQuickPick={onQuickPick}
            limit={LIMIT}
          />
        </>
      }
    </div>
  );
}
