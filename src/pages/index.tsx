import CustomerSearch from "@/components/Dashboard/CustomerSearch";
import PartSearch from "@/components/Dashboard/PartSearch";
import QuoteList from "@/components/Dashboard/QuoteList";
import { Layout } from "@/components/Layout";
import { recentPartSearchesAtom, recentQuotesAtom, userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { isObjectNull } from "@/scripts/tools/utils";
import { getRecentPartSearches } from "@/scripts/controllers/recentSearchesController";
import RecentPartSearches from "@/components/Dashboard/RecentPartSearches";
import RecentQuotes from "@/components/Dashboard/RecentQuotes";
import { addHandwrittenItem, editHandwrittenOrderNotes } from "@/scripts/controllers/handwrittensController";
import SelectHandwrittenDialog from "@/components/Dialogs/dashboard/SelectHandwrittenDialog";
import { listen } from '@tauri-apps/api/event';


export default function Home() {
  const [user] = useAtom<User>(userAtom);
  const [recentPartSearches, setRecentPartSearches] = useAtom<RecentPartSearch[]>(recentPartSearchesAtom);
  const [recentQuoteSearches, setRecentQuoteSearches] = useAtom<RecentQuoteSearch[]>(recentQuotesAtom);
  const [selectHandwrittenOpen, setSelectHandwrittenOpen] = useState(false);
  const [selectedHandwrittenPart, setSelectedHandwrittenPart] = useState<Part>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user || isObjectNull(user)) return;
      setRecentPartSearches(await getRecentPartSearches());
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    listen<string>('change-page', (e) => {
      location.replace(e.payload);
    });
  }, []);

  const handleAddToHandwritten = async (id: number, desc: string, qty: number, price: number, warranty: string) => {
    const newItem = {
      handwrittenId: id,
      date: new Date(),
      desc: desc,
      partNum: selectedHandwrittenPart.partNum,
      stockNum: selectedHandwrittenPart.stockNum,
      unitPrice: price,
      qty: qty,
      cost: 0.04,
      location: selectedHandwrittenPart.location,
      partId: selectedHandwrittenPart.id,
    } as HandwrittenItem;
    await addHandwrittenItem(newItem);
    if (warranty) await editHandwrittenOrderNotes(id, warranty);
  };


  return (
    <Layout title="Dashboard">
      <main>
        {selectedHandwrittenPart &&
          <SelectHandwrittenDialog open={selectHandwrittenOpen} setOpen={setSelectHandwrittenOpen} handleAddToHandwritten={handleAddToHandwritten} part={selectedHandwrittenPart} />
        }

        <CustomerSearch />
        <div className="dashboard__row">
          { recentPartSearches && <RecentPartSearches /> }
          { recentQuoteSearches && <RecentQuotes /> }
        </div>
        <QuoteList selectHandwrittenOpen={selectHandwrittenOpen} setSelectHandwrittenOpen={setSelectHandwrittenOpen} setSelectedHandwrittenPart={setSelectedHandwrittenPart} />
        <PartSearch selectHandwrittenOpen={selectHandwrittenOpen} setSelectHandwrittenOpen={setSelectHandwrittenOpen} setSelectedHandwrittenPart={setSelectedHandwrittenPart} />
      </main>
    </Layout>
  );
}
