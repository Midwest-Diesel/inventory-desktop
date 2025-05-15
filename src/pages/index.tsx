import CustomerSearch from "@/components/Dashboard/CustomerSearch";
import PartSearch from "@/components/Dashboard/PartSearch";
import QuoteList from "@/components/Dashboard/QuoteList";
import { Layout } from "@/components/Layout";
import { recentPartSearchesAtom, recentQuotesAtom, selectedCustomerAtom, userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { isObjectNull } from "@/scripts/tools/utils";
import { getRecentPartSearches } from "@/scripts/controllers/recentSearchesController";
import RecentPartSearches from "@/components/Dashboard/RecentPartSearches";
import RecentQuotes from "@/components/Dashboard/RecentQuotes";
import { addHandwrittenItem, addHandwrittenItemChild, editHandwrittenItems, editHandwrittenOrderNotes, getHandwrittenById } from "@/scripts/controllers/handwrittensController";
import SelectHandwrittenDialog from "@/components/Dialogs/dashboard/SelectHandwrittenDialog";
import { listen } from '@tauri-apps/api/event';
import { toggleQuoteSold } from "@/scripts/controllers/quotesController";
import { useNavState } from "@/components/Navbar/useNavState";
import { getPartById, getPartCostIn } from "@/scripts/controllers/partsController";
import { ask } from "@tauri-apps/api/dialog";


export default function Home() {
  const { push, newTab, tabs, handleChangeTab } = useNavState();
  const [user] = useAtom<User>(userAtom);
  const [recentPartSearches, setRecentPartSearches] = useAtom<RecentPartSearch[]>(recentPartSearchesAtom);
  const [recentQuoteSearches] = useAtom<RecentQuoteSearch[]>(recentQuotesAtom);
  const [customer] = useAtom<Customer>(selectedCustomerAtom);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [handwrittenCustomer, setHandwrittenCustomer] = useState<Customer | null>(null);
  const [handwrittenQuote, setHandwrittenQuote] = useState<Quote | null>(null);
  const [selectHandwrittenOpen, setSelectHandwrittenOpen] = useState(false);
  const [selectedHandwrittenPart, setSelectedHandwrittenPart] = useState<Part | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user || isObjectNull(user)) return;
      const prevSearch: any = localStorage.getItem('altPartSearches') || localStorage.getItem('partSearches');
      const partNum = JSON.parse(prevSearch)?.partNum.replace('*', '');
      setRecentPartSearches(await getRecentPartSearches((partNum && partNum !== '') ? partNum : '*'));
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!window?.__TAURI_IPC__) return;
    listen<string>('change-page', (e) => {
      push(e.payload, e.payload);
    });
  }, []);

  useEffect(() => {
    setHandwrittenCustomer(customer);
  }, [customer]);

  const handleAddToHandwritten = async (id: number, desc: string, qty: number, price: number, warranty: string, stockNum: string) => {
    const partCostIn = await getPartCostIn(stockNum);
    const cost = partCostIn.reduce((acc, val) => acc + (val.cost ?? 0), 0) || 0.01;
    const newItem = {
      handwrittenId: id,
      date: new Date(),
      desc: desc,
      partNum: selectedHandwrittenPart?.partNum,
      stockNum: selectedHandwrittenPart?.stockNum,
      unitPrice: price,
      qty: qty,
      cost,
      location: selectedHandwrittenPart?.location,
      partId: selectedHandwrittenPart?.id,
    } as HandwrittenItem;
    await addHandwrittenItem(newItem);
    if (warranty) await editHandwrittenOrderNotes(id, warranty);
  };

  const handleSubmitNewHandwritten = async (handwritten: Handwritten, warranty: string, qty: number, desc: string, price: number, stockNum: string, cost: number) => {
    const part = selectedHandwrittenPart;
    let newItem: HandwrittenItem | null = null;
    for (const item of handwritten.handwrittenItems) {
      if (!item.partId) continue;
      const itemPart = await getPartById(item.partId);
      if (!itemPart) continue;
      if (itemPart.altParts.includes(part?.partNum ?? '')) newItem = item;
    }
    if (newItem) {
      if (await ask('Part already exists do you want to add qty?')) {
        await editHandwrittenItems({ ...newItem, qty: newItem.qty ?? 0 + qty, handwrittenId: handwritten.id });
        await addHandwrittenItemChild(newItem.id, { partId: part?.id, qty, cost } as HandwrittenItemChild);
        await editHandwrittenOrderNotes(handwritten.id, warranty);
      } else {
        handleAddToHandwritten(handwritten.id, desc, qty, price, warranty, stockNum);
      }
    } else {
      handleAddToHandwritten(handwritten.id, desc, qty, price, warranty, stockNum);
    }

    const updatedQuote = { ...handwrittenQuote, sale: true };
    await toggleQuoteSold(updatedQuote as any);
    setQuotes(quotes.map((q) => (q.id === handwrittenQuote?.id) && (updatedQuote as any)));

    const tab: Tab | null = tabs.find((tab: Tab) => tab.history.find((t) => t.url === `/handwrittens/${handwritten.id}`)) ?? null;
    if (tab) {
      await handleChangeTab(tab.id);
    } else {
      await newTab([{ name: 'Handwritten', url: `/handwrittens/${handwritten.id}` }]);
    }
  };


  return (
    <Layout title="Dashboard">
      <main>
        {selectedHandwrittenPart &&
          <SelectHandwrittenDialog
            open={selectHandwrittenOpen}
            setOpen={setSelectHandwrittenOpen}
            part={selectedHandwrittenPart}
            customer={handwrittenCustomer}
            setHandwrittenCustomer={setHandwrittenCustomer}
            onSubmit={handleSubmitNewHandwritten}
          />
        }

        <CustomerSearch />
        <div className="dashboard__row">
          { recentPartSearches && <RecentPartSearches /> }
          { recentQuoteSearches && <RecentQuotes /> }
        </div>

        <QuoteList
          quotes={quotes}
          setQuotes={setQuotes}
          setSelectHandwrittenOpen={setSelectHandwrittenOpen}
          setSelectedHandwrittenPart={setSelectedHandwrittenPart}
          setHandwrittenCustomer={setHandwrittenCustomer}
          setHandwrittenQuote={setHandwrittenQuote}
        />
        <PartSearch selectHandwrittenOpen={selectHandwrittenOpen} setSelectHandwrittenOpen={setSelectHandwrittenOpen} setSelectedHandwrittenPart={setSelectedHandwrittenPart} />
      </main>
    </Layout>
  );
}
