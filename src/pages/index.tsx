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
import { useRouter } from 'next/router';
import { confirm } from "@tauri-apps/api/dialog";
import { toggleQuoteSold } from "@/scripts/controllers/quotesController";


export default function Home() {
  const router = useRouter();
  const [user] = useAtom<User>(userAtom);
  const [recentPartSearches, setRecentPartSearches] = useAtom<RecentPartSearch[]>(recentPartSearchesAtom);
  const [recentQuoteSearches] = useAtom<RecentQuoteSearch[]>(recentQuotesAtom);
  const [customer] = useAtom<Customer>(selectedCustomerAtom);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [handwrittenCustomer, setHandwrittenCustomer] = useState<Customer>(null);
  const [handwrittenQuote, setHandwrittenQuote] = useState<Quote>();
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
    if (!window.__TAURI_IPC__) return;
    listen<string>('change-page', (e) => {
      router.replace(e.payload);
    });
  }, []);

  useEffect(() => {
    setHandwrittenCustomer(customer);
  }, [customer]);

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

  const handleSubmitNewHandwritten = async (handwritten: Handwritten, warranty: string, qty: number, desc: string, price: number) => {
    const part = selectedHandwrittenPart;
    const newItem = handwritten.handwrittenItems.find((item) => item.partNum === part.partNum);
    if (newItem) {
      if (await confirm('Part already exists do you want to add qty?')) {
        await editHandwrittenItems({ ...newItem, qty: newItem.qty + qty, handwrittenId: handwritten.id });
        await addHandwrittenItemChild(newItem.id, { partId: part.id, qty: qty, cost: price } as HandwrittenItemChild);
        await editHandwrittenOrderNotes(handwritten.id, warranty);
      } else {
        handleAddToHandwritten(handwritten.id, desc, qty, price, warranty);
      }
    } else {
      handleAddToHandwritten(handwritten.id, desc, qty, price, warranty);
    }

    const updatedQuote = { ...handwrittenQuote, sale: true };
    await toggleQuoteSold(updatedQuote);
    setQuotes(quotes.map((q) => q.id === handwrittenQuote.id && updatedQuote));
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
