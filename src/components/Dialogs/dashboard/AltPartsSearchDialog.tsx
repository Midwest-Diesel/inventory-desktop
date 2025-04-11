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
import { detectAlerts } from "@/scripts/controllers/alertsController";


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
  const prevSearches = JSON.parse(localStorage.getItem('altPartSearches')!);
  const [partNum, setPartNum] = useState('*');
  const [stockNum, setStockNum] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [qty, setQty] = useState('' as any);
  const [remarks, setRemarks] = useState('');
  const [rating, setRating] = useState<number>('' as any);
  const [purchasedFrom, setPurchasedFrom] = useState('');
  const [serialNum, setSerialNum] = useState('');
  const [hp, setHp] = useState('');

  useEffect(() => {
    if (prevSearches){
      const { partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, serialNum, hp } = prevSearches;
      setPartNum(partNum);
      setStockNum(stockNum);
      setDesc(desc);
      setLocation(location);
      setQty(qty);
      setRemarks(remarks);
      setRating(rating);
      setPurchasedFrom(purchasedFrom);
      setSerialNum(serialNum);
      setHp(hp);

      const hasValidSearchCriteria = (partNum && partNum !== '*') || stockNum || desc || location || qty || remarks || rating || purchasedFrom || serialNum || hp;
      if (hasValidSearchCriteria) {
        handleSearch(partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, serialNum, hp);
      }
    }
  }, [showSoldParts]);

  useEffect(() => {
    document.getElementById('alt-part-search-input')?.focus();
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
    setSerialNum('');
    setHp('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOpen(false);
    localStorage.setItem('altPartSearches', JSON.stringify({ partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, serialNum, hp }));
    localStorage.removeItem('partSearches');
    if (isObjectNull({ stockNum, desc, location, qty, remarks, rating, purchasedFrom, serialNum, hp }) && (partNum === '*' || partNum === '')) {
      window.location.reload();
    } else {
      await handleSearch(partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, serialNum, hp);
      if (partNum && partNum !== '*') await addRecentSearch({ partNum: partNum.replace('*', ''), salespersonId: user.id });
    }
    setLastSearch(partNum.replace('*', ''));
  };

  const handleSearch = async (partNum: string, stockNum: string, desc: string, location: string, qty: number, remarks: string, rating: number, purchasedFrom: string, serialNum: string, hp: string) => {
    setLoading(true);
    setRecentQuoteSearches(await getQuotesByPartNum(partNum));
    const results = await searchAltParts({ partNum, stockNum, desc, location, qty, remarks, rating, purchasedFrom, showSoldParts, serialNum, hp }) as Part[] || [];
    setPartsQty(results.map((part) => part.qty));
    const alerts = await detectAlerts(partNum);
    setSelectedAlerts([...selectedAlerts, ...alerts]);
    setParts(results);
    setLoading(false);
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
      <form onSubmit={handleSubmit}>
        <Input
          label="Alternate Part Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={partNum.replaceAll(' ', '')}
          onChange={(e: any) => setPartNum(`*${e.target.value.toUpperCase().replace('*', '')}`)}
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

        <Input
          label="Serial Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={serialNum}
          onChange={(e: any) => setSerialNum(e.target.value)}
        />

        <Input
          label="HP"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={hp}
          onChange={(e: any) => setHp(e.target.value)}
        />

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
