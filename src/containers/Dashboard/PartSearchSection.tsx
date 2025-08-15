import { useEffect, useState } from "react";
import Button from "@/components/Library/Button";
import { useAtom } from "jotai";
import { quickPickItemIdAtom, recentQuotesAtom, selectedCustomerAtom, showSoldPartsAtom } from "@/scripts/atoms/state";
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
import { addHandwrittenItemChild, deleteHandwrittenItemChild, editHandwrittenItemChild, getHandwrittenItemById } from "@/scripts/services/handwrittensService";
import { useToast } from "@/hooks/useToast";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { detectAlerts } from "@/scripts/services/alertsService";
import { getQuotesByPartNum } from "@/scripts/services/recentSearchesService";

interface Props {
  selectHandwrittenOpen: boolean
  setSelectHandwrittenOpen: (value: boolean) => void
  setSelectedHandwrittenPart: (part: Part) => void
  handleNewQuote: (part?: Part) => Promise<void>
}

export interface PartSearchParams {
  partNum: string
  stockNum: string
  desc: string
  location: string
  qty: number
  remarks: string
  rating: number
  purchasedFrom: string
  serialNum: string
  hp: string
  page: number
  isAltSearch: boolean
}

const LIMIT = 52;
const getStoredSearch = (key: string) => JSON.parse(localStorage.getItem(key) || 'null') || {};

const hasSearchInput = () => {
  const altSearch = getStoredSearch('altPartSearches');
  const partSearch = getStoredSearch('partSearches');
  return (
    !isObjectNull(
      altSearch?.partNum ? { ...altSearch, partNum: altSearch.partNum.replace('*', '') } : {}
    ) || !isObjectNull(partSearch)
  );
};


export default function PartSearchSection({ selectHandwrittenOpen, setSelectHandwrittenOpen, setSelectedHandwrittenPart, handleNewQuote }: Props) {
  const toast = useToast();
  const [selectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [selectedAlerts, setSelectedAlerts] = useAtom<Alert[]>(selectedAlertsAtom);
  const [, setRecentQuoteSearches] = useAtom<RecentQuoteSearch[]>(recentQuotesAtom);
  const [quickPickItemId] = useAtom<number>(quickPickItemIdAtom);
  const [showSoldParts, setShowSoldParts] = useAtom<boolean>(showSoldPartsAtom);
  const [currentPage, setCurrentPage] = useState(1);
  const [partsOpen, setPartsOpen] = useState(localStorage.getItem('partsOpen') !== 'false');
  const [partsSearchOpen, setPartsSearchOpen] = useState(false);
  const [altPartsSearchOpen, setAltPartsSearchOpen] = useState(false);
  const [salesInfoOpen, setSalesInfoOpen] = useState(false);
  const [coreFamilyOpen, setCoreFamilyOpen] = useState(false);
  const [partsOnEngsOpen, setPartsOnEngsOpen] = useState(false);
  const [partsOnEngs, setPartsOnEngs] = useState<{ partNum: string; engines: Engine[] }[]>([]);
  const [isValidSearch, setIsValidSearch] = useState(false);
  const [searchParams, setSearchParams] = useState<PartSearchParams | null>(null);
  const queryClient = new QueryClient();

  const { data: parts, isFetching } = useQuery<PartsRes>({
    queryKey: ['parts', currentPage, showSoldParts],
    queryFn: () => getSomeParts(currentPage, LIMIT, showSoldParts),
    enabled: !hasSearchInput(),
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  const { data: search, refetch: refetchSearch, isFetching: isSearchFetching } = useQuery<PartsRes>({
    queryKey: ['searchParts', searchParams?.partNum, searchParams?.isAltSearch, searchParams?.page, showSoldParts],
    queryFn: () => {
      if (!searchParams) throw new Error('No search params');
      return searchParams.isAltSearch
        ? searchAltParts({ ...searchParams, showSoldParts }, searchParams.page, LIMIT)
        : searchParts({ ...searchParams, showSoldParts }, searchParams.page, LIMIT);
    },
    enabled: !!searchParams,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  useEffect(() => {
    const prevSearches = getStoredSearch('altPartSearches') || getStoredSearch('partSearches');
    setIsValidSearch(
      !!prevSearches && Object.values(prevSearches)
        .map((v: any) => v.replace?.('*', ''))
        .some(Boolean)
    );
  }, [parts]);

  const findPartsOnEngines = async () => {
    const partNum = getSearchedPartNum();
    const alts = await getAltsByPartNum(partNum);
    const engines = await Promise.all(alts.map(getPartsOnEngines));
    setPartsOnEngs(engines as any);
    setPartsOnEngsOpen(true);
  };

  const handleSearch = async (params: PartSearchParams | null, showAlerts = true) => {
    if (!params) return;
    setSearchParams(params);
    const results = params.isAltSearch
      ? await searchAltParts({ ...params, showSoldParts }, params.page, LIMIT)
      : await searchParts({ ...params, showSoldParts }, params.page, LIMIT);
      
    setRecentQuoteSearches(await getQuotesByPartNum(params.partNum));
    if (showAlerts) {
      const alerts = await detectAlerts(params.partNum);
      setSelectedAlerts([...selectedAlerts, ...alerts]);
    }
    queryClient.setQueryData<PartsRes>(['searchParts', params], results);
    await refetchSearch();
  };

  const onChangePage = (_: any, page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    if (searchParams) setSearchParams({ ...searchParams, page });
  };

  const onQuickPick = async (part: Part) => {
    if (!quickPickItemId) {
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

      <div
        className="parts-search__header no-select"
        onClick={() => {
          localStorage.setItem("partsOpen", String(!partsOpen));
          setPartsOpen(!partsOpen);
        }}
      >
        <h2>Parts Search</h2>
        <img src={`/images/icons/arrow-${partsOpen ? "up" : "down"}.svg`} alt="arrow" width={25} height={25} />
        { (isFetching || isSearchFetching) && <Loading size={28} /> }
      </div>

      {partsOpen && (
        <>
          <div className="parts-search-top-bar">
            <Button onClick={findPartsOnEngines} disabled={!getSearchedPartNum()}>On Engines</Button>
            <Button onClick={() => setSalesInfoOpen(true)} disabled={!isValidSearch}>Sales Info</Button>
            <Button onClick={() => setPartsSearchOpen(true)} data-testid="part-search-btn">Parts Search</Button>
            <Button onClick={() => setAltPartsSearchOpen(true)} data-testid="alt-search-btn">Alt Parts Search</Button>
            <Button onClick={() => setShowSoldParts(!showSoldParts)}>{showSoldParts ? "Hide" : "Show"} Sold Parts</Button>
            <Button onClick={() => setCoreFamilyOpen(true)}>Search Core Family</Button>
            <Link className="parts-search-top-bar__link"
              href={`/compare-consist${!isObjectNull(selectedCustomer) ? `?c=${selectedCustomer.id}` : ""}`}>
              Compare / Consist
            </Link>
          </div>

          <PartsTable
            parts={searchParams ? search?.rows ?? [] : parts?.rows ?? []}
            partsData={searchParams ? search?.rows ?? [] : parts?.rows ?? []}
            pageCount={searchParams ? search?.pageCount ?? 0 : parts?.pageCount ?? 0}
            partsQty={searchParams ? search?.totalQty ?? 0 : parts?.totalQty ?? 0}
            rowsHidden={searchParams ? search?.rowsHidden ?? null : parts?.rowsHidden ?? null}
            quotePart={handleNewQuote}
            onChangePage={onChangePage}
            onOpenSelectHandwrittenDialog={(part) => {
              if (selectHandwrittenOpen) setSelectHandwrittenOpen(false);
              setTimeout(() => setSelectHandwrittenOpen(true), 1);
              setSelectedHandwrittenPart(part);
            }}
            onQuickPick={onQuickPick}
            limit={LIMIT}
          />
        </>
      )}
    </div>
  );
}
