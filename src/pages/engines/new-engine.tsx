import { Layout } from "@/components/Layout";
import Loading from "@/components/library/Loading";
import NewEnginesQuoteList from "@/components/engines/NewEnginesQuoteList";
import { useState } from "react";
import NewEngineQuoteDialog from "@/components/engines/dialogs/NewEngineQuoteDialog";
import NewEnginesList from "@/components/engines/NewEnginesList";
import { useQuery } from "@tanstack/react-query";
import { getAllEngines } from "@/scripts/services/enginesService";
import AddEngineToHandwrittenDialog from "@/components/engines/dialogs/AddEngineToHandwrittenDialog";
import { addHandwrittenItem, editHandwrittenOrderNotes } from "@/scripts/services/handwrittensService";
import { useNavState } from "@/hooks/useNavState";


export default function NewEnginesListPage() {
  const [engineModel, setEngineModel] = useState('C-7');
  const [engine, setEngine] = useState<Engine | null>(null);
  const [newQuoteDialogOpen, setNewQuoteDialogOpen] = useState(false);
  const [selectedHandwrittenItem, setSelectedHandwrittenItem] = useState<Engine | null>(null);
  const { newTab, tabs, changeTab } = useNavState();

  const { data: engines = [], isFetching, refetch } = useQuery<Engine[]>({
    queryKey: ['engines'],
    queryFn: async () => {
      const engines = await getAllEngines();
      return [...engines].sort(
        (a: any, b: any) => b.loginDate - a.loginDate
      );
    }
  });

  const onSubmitNewHandwrittenItem = async (handwritten: Handwritten, warranty: string, qty: number, desc: string, price: number, stockNum: number, cost: number) => {
    const newItem = {
      handwrittenId: handwritten.id,
      date: new Date(),
      desc,
      partNum: selectedHandwrittenItem?.model ? `${selectedHandwrittenItem.model} Engine` : 'Engine',
      stockNum: stockNum.toString(),
      unitPrice: price,
      qty,
      cost,
      location: selectedHandwrittenItem?.location ?? null,
      partId: selectedHandwrittenItem?.id ?? null
    };
    await addHandwrittenItem(newItem);
    if (warranty) await editHandwrittenOrderNotes(handwritten.id, warranty);

    const tab: Tab | null = tabs.find((tab: Tab) => tab.history[tab.history.length - 1].url === `/handwrittens/${handwritten.id}`) ?? null;
    if (tab) {
      await changeTab(tab.id);
    } else {
      await newTab([{ name: 'Handwritten', url: `/handwrittens/${handwritten.id}` }]);
    }
  };

  
  return (
    <Layout title="New Engines List">
      <NewEngineQuoteDialog
        open={newQuoteDialogOpen}
        setOpen={setNewQuoteDialogOpen}
        engine={engine}
        onNewQuote={refetch}
      />

      {selectedHandwrittenItem &&
        <AddEngineToHandwrittenDialog
          open={selectedHandwrittenItem !== null}
          setOpen={() => setSelectedHandwrittenItem(null)}
          engine={selectedHandwrittenItem}
          onSubmit={onSubmitNewHandwrittenItem}
        />
      }

      { isFetching && <Loading /> }
      <NewEnginesList
        engines={engines}
        setEngine={setEngine}
        engineModel={engineModel}
        setEngineModel={setEngineModel}
        setNewQuoteDialogOpen={setNewQuoteDialogOpen}
        setSelectedHandwrittenItem={setSelectedHandwrittenItem}
      />
      <NewEnginesQuoteList
        model={engineModel}
        setEngine={setEngine}
        setNewQuoteDialogOpen={setNewQuoteDialogOpen}
      />
    </Layout>
  );
}
