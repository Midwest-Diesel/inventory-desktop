import EngineSearchDialog from "@/components/Dialogs/EngineSearchDialog";
import CoreEnginesTable from "@/components/Engines/CoreEnginesTable";
import LongBlockTable from "@/components/Engines/LongBlockTable";
import RunningEnginesTable from "@/components/Engines/RunningEnginesTable";
import ShortBlockTable from "@/components/Engines/ShortBlockTable";
import SoldEnginesTable from "@/components/Engines/SoldEnginesTable";
import ToreDownEnginesTable from "@/components/Engines/ToreDownEnginesTable";
import Button from "@/components/Library/Button";
import Pagination from "@/components/Library/Pagination";
import { getEnginesByStatus } from "@/scripts/services/enginesService";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

type EngineListType = 'running' | 'toreDown' | 'core' | 'sold' | 'shortBlock' | 'longBlock';

const LIMIT = 40;
const STATUS_MAP: Record<EngineListType, EngineStatus[]> = {
  running: ['RunnerReady', 'RunnerNotReady', 'HoldSoldRunner'],
  toreDown: ['ToreDown'],
  core: ['CoreEngine'],
  sold: ['Sold'],
  shortBlock: ['ShortBlock'],
  longBlock: ['LongBlock']
};


export default function EngineListContainer() {
  const [openSearch, setOpenSearch] = useState(false);
  const [listOpen, setListOpen] = useState<EngineListType>('running');
  const [displayEngines, setDisplayEngines] = useState<Engine[]>([]);

  const { data: engines = [], isFetching } = useQuery<Engine[]>({
    queryKey: ['engines', listOpen],
    queryFn: async () => {
      const statuses = STATUS_MAP[listOpen];
      const all = await Promise.all(statuses.map(getEnginesByStatus));
      return all.flat().sort((a, b) => b.loginDate - a.loginDate);
    },
    onSuccess: (data) => {
      setDisplayEngines(data);
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  const title = useMemo(() => {
    switch (listOpen) {
      case 'running':
        return 'Running Engines List';
      case 'toreDown':
        return 'Tore Down Engines List';
      case 'core':
        return 'Core Engines List';
      case 'sold':
        return 'Sold Engines List';
      case 'shortBlock':
        return 'Short Block List';
      case 'longBlock':
        return 'Long Block List';
      default:
        return 'Engines List';
    }
  }, [listOpen]);

  const onSearch = (status: EngineStatus | null, results: Engine[]) => {
    if (status) {
      const foundKey = Object.entries(STATUS_MAP).find(([_, statuses]) =>
        statuses.includes(status)
      )?.[0] as EngineListType;
      if (foundKey) setListOpen(foundKey);
    }
    setDisplayEngines(results);
  };

  const handlePageChange = (data: Engine[]) => {
    setDisplayEngines(data);
  };

  const renderTable = () => {
    const props = { engines: displayEngines, loading: isFetching };
    switch (listOpen) {
      case 'running':
        return <RunningEnginesTable {...props} />;
      case 'toreDown':
        return <ToreDownEnginesTable {...props} />;
      case 'core':
        return <CoreEnginesTable {...props} />;
      case 'sold':
        return <SoldEnginesTable {...props} />;
      case 'shortBlock':
        return <ShortBlockTable {...props} />;
      case 'longBlock':
        return <LongBlockTable {...props} />;
    }
  };

  return (
    <div className="engines">
      <h1>{ title }</h1>
      <div className="engines__top-bar">
        {Object.keys(STATUS_MAP).map((key) => {
          return (
            <Button key={key} onClick={() => setListOpen(key as EngineListType)}>
              { key.charAt(0).toUpperCase() + key.slice(1) }
            </Button>
          );
        })}
        <Button onClick={() => setOpenSearch(true)}>Search</Button>
      </div>

      <EngineSearchDialog
        open={openSearch}
        setOpen={setOpenSearch}
        engines={engines}
        setEngines={setDisplayEngines}
        onSearch={onSearch}
      />

      { renderTable() }
      <Pagination data={engines} setData={handlePageChange} pageSize={LIMIT} />
    </div>
  );
}
