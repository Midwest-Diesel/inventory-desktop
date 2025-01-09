import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import Input from "../../Library/Input";
import Button from "../../Library/Button";
import { searchAltParts } from "@/scripts/controllers/partsController";
import { useAtom } from "jotai";
import { alertsAtom, lastPartSearchAtom, partsQtyAtom, recentQuotesAtom, showSoldPartsAtom, userAtom } from "@/scripts/atoms/state";
import { addRecentSearch, getQuotesByPartNum } from "@/scripts/controllers/recentSearchesController";
import { selectedAlertsAtom } from "@/scripts/atoms/components";
import { isObjectNull } from "@/scripts/tools/utils";


interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setParts: (parts: Part[]) => void
  setLoading: (loading: boolean) => void
}

export default function AltPartsSearchDialog({ open, setOpen, setParts, setLoading }: Props) {
  const [partsQty, setPartsQty] = useAtom<number[]>(partsQtyAtom);
  const [recentQuoteSearches, setRecentQuoteSearches ] = useAtom<RecentQuoteSearch[]>(recentQuotesAtom);
  const [lastSearch, setLastSearch] = useAtom<string>(lastPartSearchAtom);
  const [selectedAlerts, setSelectedAlerts] = useAtom<Alert[]>(selectedAlertsAtom);
  const [alertsData] = useAtom<Alert[]>(alertsAtom);
  const [user] = useAtom<User>(userAtom);
  const [showSoldParts] = useAtom<boolean>(showSoldPartsAtom);
  const prevSearches = JSON.parse(localStorage.getItem('altPartSearches'));
  const [partNum, setPartNum] = useState('*');
  const [stockNum, setStockNum] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [qty, setQty] = useState('' as any);
  const [remarks, setRemarks] = useState('');
  const [rating, setRating] = useState<number>('' as any);
  const [purchasedFrom, setPurchasedFrom] = useState('');

  useEffect(() => {
    if (prevSearches){
      const { partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom } = prevSearches;
      setPartNum(partNum);
      setStockNum(stockNum);
      setDesc(desc);
      setLocation(location);
      setQty(qty);
      setRemarks(remarks);
      setRating(rating);
      setPurchasedFrom(purchasedFrom);

      const hasValidSearchCriteria = (partNum && partNum !== '*') || stockNum || desc || location || qty || remarks || rating || purchasedFrom;
      if (hasValidSearchCriteria) {
        handleSearch(partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom);
      }
    }
  }, [showSoldParts]);

  useEffect(() => {
    document.getElementById('alt-part-search-input').focus();
  }, [open]);


  const clearInputs = () => {
    setPartNum('*');
    setStockNum('');
    setDesc('');
    setLocation('');
    setQty('' as any);
    setRemarks('');
    setRating('' as any);
    setPurchasedFrom('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOpen(false);
    localStorage.setItem('altPartSearches', JSON.stringify({ partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom }));
    localStorage.removeItem('partSearches');
    if (isObjectNull({ stockNum, desc, location, qty, remarks, rating, purchasedFrom }) && (partNum === '*' || partNum === '')) {
      window.location.reload();
    } else {
      await handleSearch(partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom);
      if (partNum && partNum !== '*') await addRecentSearch({ partNum, salespersonId: user.id });
    }
    setLastSearch(partNum.replace('*', ''));
  };

  const handleSearch = async (partNum: string, stockNum: string, desc: string, location: string, qty: number, remarks: string, rating: number, purchasedFrom: string) => {
    setLoading(true);
    setRecentQuoteSearches(await getQuotesByPartNum(partNum));
    const results = await searchAltParts({ partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, showSoldParts }) as Part[];
    setPartsQty(results.map((part) => part.qty));
    detectAlerts(results);
    setParts(results);
    setLoading(false);
  };

  const detectAlerts = (results: Part[]) => {
    if (!results) return;
    const alertQue = new Array<Alert>();
    alertsData.forEach((alert: Alert) => {
      if (alert.partNum === partNum.replace('*', '') || results.some((part) => part.altParts.includes(alert.partNum)) && !selectedAlerts.includes(alert)) {
        alertQue.push(alert);
      }
    });
    setSelectedAlerts([...selectedAlerts, ...alertQue]);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Alternate Parts Search"
      width={400}
      height={520}
      className="parts-search-dialog"
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Alternate Part Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={partNum}
          onChange={(e: any) => setPartNum(e.target.value.toUpperCase())}
          id="alt-part-search-input"
        />

        <Input
          label="Stock Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={stockNum}
          onChange={(e: any) => setStockNum(e.target.value)}
        />

        <Input
          label="Description"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={desc}
          onChange={(e: any) => setDesc(e.target.value)}
        />

        <Input
          label="Location"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={location}
          onChange={(e: any) => setLocation(e.target.value)}
        />

        <Input
          label="Qty"
          type="number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={qty}
          onChange={(e: any) => setQty(e.target.value)}
        />

        <Input
          label="Remarks"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={remarks}
          onChange={(e: any) => setRemarks(e.target.value)}
        />

        <Input
          label="Rating"
          type="number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={rating}
          onChange={(e: any) => setRating(e.target.value)}
        />

        <Input
          label="Purchased From"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={purchasedFrom}
          onChange={(e: any) => setPurchasedFrom(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
