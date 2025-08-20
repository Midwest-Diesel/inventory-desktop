import Loading from "@/components/Library/Loading";
import NewEnginesQuoteList from "@/components/Engines/NewEnginesQuoteList";
import { useState } from "react";
import NewEngineQuoteDialog from "@/components/Dialogs/NewEngineQuoteDialog";
import NewEnginesList from "@/components/Engines/NewEnginesList";
import { useQuery } from "@tanstack/react-query";
import { getEnginesByStatus } from "@/scripts/services/enginesService";


export default function NewEnginesListContainer() {
  const [engineModel, setEngineModel] = useState('C-7');
  const [engine, setEngine] = useState<Engine | null>(null);
  const [newQuoteDialogOpen, setNewQuoteDialogOpen] = useState(false);

  const { data: engines = [], isFetching, refetch } = useQuery<Engine[]>({
    queryKey: ['engines', 'runner-list'],
    queryFn: async () => {
      const running = await getEnginesByStatus('RunnerReady', 1, 999999);
      const notRunning = await getEnginesByStatus('RunnerNotReady', 1, 999999);
      const holdRunning = await getEnginesByStatus('HoldSoldRunner', 1, 999999);
      return [...running.rows, ...notRunning.rows, ...holdRunning.rows].sort(
        (a: any, b: any) => b.loginDate - a.loginDate
      );
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  
  return (
    <>
      <NewEngineQuoteDialog
        open={newQuoteDialogOpen}
        setOpen={setNewQuoteDialogOpen}
        engine={engine}
        onNewQuote={refetch}
      />

      { isFetching && <Loading /> }
      <NewEnginesList
        engines={engines}
        setEngine={setEngine}
        engineModel={engineModel}
        setEngineModel={setEngineModel}
        setNewQuoteDialogOpen={setNewQuoteDialogOpen}
      />
      <NewEnginesQuoteList model={engineModel} />
    </>
  );
}
