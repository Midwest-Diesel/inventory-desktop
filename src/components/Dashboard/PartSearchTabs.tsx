import { useEffect } from "react";
import Button from "../library/Button";
import PartSearchTab from "./PartSearchTab";
import { altPartSearchAtom, partSearchAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";

interface Props {
  handleSearch: (params: PartSearchParams, showAlerts?: boolean) => Promise<void>
  partSearchTabs: PartSearchTab[]
  setPartSearchTabs: (tabs: PartSearchTab[]) => void
  setSearchParams: (params: PartSearchParams | null) => void
}


export default function PartSearchTabs({ handleSearch, partSearchTabs, setPartSearchTabs, setSearchParams }: Props) {
  const [, setAltPartSearch] = useAtom<PartSearchParams | null>(altPartSearchAtom);
  const [, setPartSearch] = useAtom<PartSearchParams | null>(partSearchAtom);

  useEffect(() => {
    if (partSearchTabs.length === 0) {
      const tabs = [{ id: 1, name: 'New Tab', selected: true }];
      localStorage.setItem('partSearchTabs', JSON.stringify(tabs));
      setPartSearchTabs(tabs);
    }
  }, []);

  const onClickNewTab = () => {
    const newTab = {
      id: partSearchTabs.length + 1,
      name: 'New Tab',
      selected: true
    };

    const updatedTabs = [...partSearchTabs.map((t) => ({ ...t, selected: false })), newTab];
    localStorage.setItem('partSearchTabs', JSON.stringify(updatedTabs));
    setPartSearchTabs(updatedTabs);
    localStorage.removeItem('partSearches');
    localStorage.removeItem('altPartSearches');
    location.reload();
  };

  const onClickCloseTab = async (id: number) => {
    const deletedTab = partSearchTabs.find((t) => t.id === id);
    const updatedTabs = partSearchTabs.filter((t) => t.id !== id);

    if (deletedTab?.selected && updatedTabs.length > 0) {
      const deletedIndex = partSearchTabs.findIndex((t) => t.id === id);
      const newIndex = deletedIndex > 0 ? deletedIndex - 1 : 0;
      const tabToSelect = { ...updatedTabs[newIndex], selected: true };
      updatedTabs[newIndex] = tabToSelect;

      if (!tabToSelect.searchData) {
        setPartSearch(null);
        setAltPartSearch(null);
        setSearchParams(null);
        await handleSearch({} as any);
      } else {
        const data = tabToSelect.searchData;
        if (data.isAltSearch) {
          localStorage.setItem('altPartSearches', JSON.stringify(data));
          localStorage.removeItem('partSearches');
          setPartSearch(null);
          setAltPartSearch(data);
        } else {
          localStorage.setItem('partSearches', JSON.stringify(data));
          localStorage.removeItem('altPartSearches');
          setAltPartSearch(null);
          setPartSearch(data);
        }
        setSearchParams(data);
        await handleSearch(data);
      }
    }

    localStorage.setItem('partSearchTabs', JSON.stringify(updatedTabs));
    setPartSearchTabs(updatedTabs);
  };

  const onClickSelectTab = async (id: number) => {
    const selectedTab = partSearchTabs.find((t) => t.id === id);
    if (!selectedTab || partSearchTabs.find((t) => t.selected)?.id === id) return;

    const updatedTabs = partSearchTabs.map((t) => ({ ...t, selected: t.id === id }));
    localStorage.setItem('partSearchTabs', JSON.stringify(updatedTabs));
    setPartSearchTabs(updatedTabs);

    if (!selectedTab.searchData) {
      localStorage.removeItem('partSearches');
      localStorage.removeItem('altPartSearches');
      setPartSearch(null);
      setAltPartSearch(null);
      setSearchParams(null);
      return;
    }

    const data = selectedTab.searchData;
    if (data.isAltSearch) {
      localStorage.setItem('altPartSearches', JSON.stringify(data));
      localStorage.removeItem('partSearches');
      setPartSearch(null);
      setAltPartSearch(data);
    } else {
      localStorage.setItem('partSearches', JSON.stringify(data));
      localStorage.removeItem('altPartSearches');
      setAltPartSearch(null);
      setPartSearch(data);
    }

    await handleSearch(data);
  };


  return (
    <div className="part-search-tabs">
      {partSearchTabs.map((tab) => {
        return (
          <PartSearchTab
            key={tab.id}
            tab={tab}
            onClickCloseTab={onClickCloseTab}
            onClickSelectTab={onClickSelectTab}
            showCloseBtn={partSearchTabs.length > 1}
          />
        );
      })}

      <div className="part-search-tab">
        <Button
          variant={["no-style"]}
          className="part-search-tab__content part-search-tab__new-tab"
          onClick={onClickNewTab}
        >
          +
        </Button>
      </div>
    </div>
  );
}
