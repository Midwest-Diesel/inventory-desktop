import EngineSearchDialog from "@/components/Dialogs/EngineSearchDialog";
import CoreEnginesTable from "@/components/Engines/CoreEnginesTable";
import LongBlockTable from "@/components/Engines/LongBlockTable";
import RunningEnginesTable from "@/components/Engines/RunningEnginesTable";
import ShortBlockTable from "@/components/Engines/ShortBlockTable";
import SoldEnginesTable from "@/components/Engines/SoldEnginesTable";
import ToreDownEnginesTable from "@/components/Engines/ToreDownEnginesTable";
import Button from "@/components/Library/Button";
import Pagination from "@/components/Library/Pagination";
import { enginesAtom } from "@/scripts/atoms/state";
import { getEnginesByStatus } from "@/scripts/services/enginesService";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

type EngineListType = 'running' | 'toreDown' | 'core' | 'sold' | 'shortBlock' | 'longBlock';


export default function EngineListContainer() {
  const [openSearch, setOpenSearch] = useState(false);
  const [listOpen, setListOpen] = useState<EngineListType>('running');
  const [enginesData, setEnginesData] = useAtom<Engine[]>(enginesAtom);
  const [searchedEngines, setSearchedEngines] = useState<Engine[]>([]);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [loading, setLoading] = useState(true);

  const LIMIT = 40;

  const getListTypeFromStatus = (status: EngineStatus | null): EngineListType => {
    switch (status) {
      case 'ToreDown': return 'toreDown';
      case 'CoreEngine': return 'core';
      case 'Sold': return 'sold';
      case 'ShortBlock': return 'shortBlock';
      case 'LongBlock': return 'longBlock';
      default: return 'running';
    }
  };

  const getTitle = () => {
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
  };

  useEffect(() => {
    const loadEngines = async () => {
      setLoading(true);
      let results: Engine[] = [];
      switch (listOpen) {
        case 'running': {
          const r1 = await getEnginesByStatus('RunnerReady');
          const r2 = await getEnginesByStatus('RunnerNotReady');
          const r3 = await getEnginesByStatus('HoldSoldRunner');
          results = [...r1, ...r2, ...r3];
          break;
        }
        case 'toreDown': {
          const toreDown = await getEnginesByStatus('ToreDown');
          results = toreDown;
          break;
        }
        case 'core': {
          const core = await getEnginesByStatus('CoreEngine');
          results = core;
          break;
        }
        case 'sold': {
          const sold = await getEnginesByStatus('Sold');
          results = sold;
          break;
        }
        case 'shortBlock': {
          const shortBlock = await getEnginesByStatus('ShortBlock');
          results = shortBlock;
          break;
        }
        case 'longBlock': {
          const longBlock = await getEnginesByStatus('LongBlock');
          results = longBlock;
          break;
        }
      }
      results = results.sort((a: any, b: any) => b.loginDate - a.loginDate);
      setEnginesData(results);
      setSearchedEngines(results);
      setLoading(false);
    };

    loadEngines();
  }, [listOpen]);

  const onSearch = (status: EngineStatus | null, results: Engine[]) => {
    const newList = getListTypeFromStatus(status);
    setListOpen(newList);
    setSearchedEngines(results);
  };

  const handlePageChange = (data: Engine[]) => {
    setEngines(data);
  };

  const renderTable = () => {
    const props = { engines, loading };
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
      <h1>{ getTitle() }</h1>
      <div className="engines__top-bar">
        <Button onClick={() => setListOpen('running')}>Running</Button>
        <Button onClick={() => setListOpen('toreDown')}>Tore Down</Button>
        <Button onClick={() => setListOpen('core')}>Core</Button>
        <Button onClick={() => setListOpen('sold')}>Sold</Button>
        <Button onClick={() => setListOpen('shortBlock')}>Short Block</Button>
        <Button onClick={() => setListOpen('longBlock')}>Long Block</Button>
        <Button onClick={() => setOpenSearch(true)}>Search</Button>
      </div>

      <EngineSearchDialog
        open={openSearch}
        setOpen={setOpenSearch}
        engines={enginesData}
        setEngines={setSearchedEngines}
        onSearch={onSearch}
      />

      { renderTable() }
      <Pagination
        data={searchedEngines}
        setData={handlePageChange}
        pageSize={LIMIT}
      />
    </div>
  );
}
