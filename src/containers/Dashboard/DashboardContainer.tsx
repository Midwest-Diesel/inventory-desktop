import { recentPartSearchesAtom, recentQuotesAtom, selectedCustomerAtom, userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { isObjectNull } from "@/scripts/tools/utils";
import { getRecentPartSearches } from "@/scripts/services/recentSearchesService";
import RecentPartSearches from "@/components/Dashboard/RecentPartSearches";
import RecentQuotes from "@/components/Dashboard/RecentQuotes";
import { addHandwrittenItem, addHandwrittenItemChild, editHandwrittenItems, editHandwrittenOrderNotes } from "@/scripts/services/handwrittensService";
import SelectHandwrittenDialog from "@/components/Dialogs/dashboard/SelectHandwrittenDialog";
import { listen } from '@tauri-apps/api/event';
import { addQuote, getSomeQuotes, toggleQuoteSold } from "@/scripts/services/quotesService";
import { useNavState } from "@/components/Navbar/useNavState";
import { getPartById, getPartCostIn } from "@/scripts/services/partsService";
import { ask } from "@tauri-apps/api/dialog";
import CustomerSection from "./CustomerSection";
import QuotesSection from "./QuotesSection";
import PartSearchSection from "./PartSearchSection";
import Toast from "@/components/Library/Toast";


export default function DashboardContainer() {
  const { push, newTab, tabs, handleChangeTab } = useNavState();
  const [user] = useAtom<User>(userAtom);
  const [recentPartSearches, setRecentPartSearches] = useAtom<RecentPartSearch[]>(recentPartSearchesAtom);
  const [recentQuoteSearches] = useAtom<RecentQuoteSearch[]>(recentQuotesAtom);
  const [customer] = useAtom<Customer>(selectedCustomerAtom);
  const [handwrittenCustomer, setHandwrittenCustomer] = useState<Customer | null>(null);
  const [selectHandwrittenOpen, setSelectHandwrittenOpen] = useState(false);
  const [selectedHandwrittenPart, setSelectedHandwrittenPart] = useState<Part | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [handwrittenQuote, setHandwrittenQuote] = useState<Quote | null>(null);
  const [quoteEdited, setQuoteEdited] = useState<Quote | null>(null);
  const [newQuoteToastOpen, setNewQuoteToastOpen] = useState(false);
  const [filterByCustomer, setFilterByCustomer] = useState(false);
  const [filterByPart, setFilterByPart] = useState(false);
  const [quoteListType, setQuoteListType] = useState<'part' | 'engine'>('part');
  
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

  const handleNewQuote = async (part?: Part) => {
    const newQuote: any = {
      date: new Date(),
      source: null,
      customerId: customer?.id,
      contact: customer ? customer.contact : '',
      phone: customer ? customer.phone : '',
      state: customer ? customer.billToState : '',
      partNum: part?.partNum,
      desc: part?.desc,
      stockNum: part?.stockNum,
      price: 0,
      notes: null,
      salesmanId: user.id,
      partId: part?.id
    };
    await addQuote(newQuote);
    const res = await getSomeQuotes(1, 26, '', 0, false);
    setQuotes(res.rows);
    setNewQuoteToastOpen(true);
    setFilterByCustomer(false);
    setFilterByPart(false);
    setQuoteListType('part');
    setQuoteEdited(res.rows[0]);
  };


  return (
    <main>
      <Toast msg="Created quote" type="success" open={newQuoteToastOpen} setOpen={setNewQuoteToastOpen} />

      {selectedHandwrittenPart &&
        <SelectHandwrittenDialog
          open={selectHandwrittenOpen}
          setOpen={setSelectHandwrittenOpen}
          part={selectedHandwrittenPart}
          onSubmit={handleSubmitNewHandwritten}
        />
      }

      <CustomerSection />
      <div className="dashboard__row">
        { recentPartSearches && <RecentPartSearches /> }
        { recentQuoteSearches && <RecentQuotes /> }
      </div>

      <QuotesSection
        quotes={quotes}
        setQuotes={setQuotes}
        setHandwrittenQuote={setHandwrittenQuote}
        setHandwrittenCustomer={setHandwrittenCustomer}
        setSelectHandwrittenOpen={setSelectHandwrittenOpen}
        setSelectedHandwrittenPart={setSelectedHandwrittenPart}
        setFilterByCustomer={setFilterByCustomer}
        setFilterByPart={setFilterByPart}
        setQuoteListType={setQuoteListType}
        setQuoteEdited={setQuoteEdited}
        quoteEdited={quoteEdited}
        filterByCustomer={filterByCustomer}
        filterByPart={filterByPart}
        quoteListType={quoteListType}
        handleNewQuote={handleNewQuote}
      />
      <PartSearchSection
        selectHandwrittenOpen={selectHandwrittenOpen}
        setSelectHandwrittenOpen={setSelectHandwrittenOpen}
        setSelectedHandwrittenPart={setSelectedHandwrittenPart}
        handleNewQuote={handleNewQuote}
      />
    </main>
  );
}
