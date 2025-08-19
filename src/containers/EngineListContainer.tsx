import EngineSearchDialog from "@/components/Dialogs/EngineSearchDialog";
import CoreEnginesTable from "@/components/Engines/CoreEnginesTable";
import LongBlockTable from "@/components/Engines/LongBlockTable";
import RunningEnginesTable from "@/components/Engines/RunningEnginesTable";
import ShortBlockTable from "@/components/Engines/ShortBlockTable";
import SoldEnginesTable from "@/components/Engines/SoldEnginesTable";
import ToreDownEnginesTable from "@/components/Engines/ToreDownEnginesTable";
import Button from "@/components/Library/Button";
import Pagination from "@/components/Library/Pagination";
import { EngineSearch, getEnginesByStatus, searchEngines } from "@/scripts/services/enginesService";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState<EngineSearch | null>(null);

  const { data: engines, isFetching } = useQuery<EngineRes>({
    queryKey: ['engines', listOpen, search, currentPage],
    queryFn: async () => {
      if (search) {
        return await searchEngines({ ...search, page: currentPage, limit: LIMIT });
      }
      return await getEnginesByStatus(STATUS_MAP[listOpen][0], currentPage, LIMIT);
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

  const onSearch = (search: EngineSearch) => {
    const foundKey = Object.entries(STATUS_MAP).find(([_, statuses]) => statuses.includes(search.status))?.[0] as EngineListType;
    if (foundKey) setListOpen(foundKey);
    setSearch(search);
    setCurrentPage(1);
  };

  const handlePageChange = (_: any, page: number) => {
    setCurrentPage(page);
  };

  const handleOpenList = (key: EngineListType) => {
    setCurrentPage(1);
    setSearch(null);
    setListOpen(key);
  };

  const renderTable = () => {
    if (!engines) return null;
    const props = { engines: engines.rows, loading: isFetching };
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
      default:
        return null;
    }
  };


  return (
    <div className="engines">
      <h1>{ title }</h1>
      <div className="engines__top-bar">
        {Object.keys(STATUS_MAP).map((key) => {
          return (
            <Button key={key} onClick={() => handleOpenList(key as EngineListType)}>
              { key.charAt(0).toUpperCase() + key.slice(1) }
            </Button>
          );
        })}
        <Button onClick={() => setOpenSearch(true)}>Search</Button>
      </div>

      <EngineSearchDialog
        open={openSearch}
        setOpen={setOpenSearch}
        onSearch={onSearch}
        page={currentPage}
        limit={LIMIT}
      />

      { renderTable() }

      <Pagination
        data={engines?.rows ?? []}
        setData={handlePageChange}
        pageCount={engines?.pageCount}
        pageSize={LIMIT}
      />
    </div>
  );
}
