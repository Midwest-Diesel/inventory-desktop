import { useAtom } from "jotai";
import Table from "../Library/Table";
import { recentPartSearchesAtom, userAtom } from "@/scripts/atoms/state";
import { formatDate, formatTime, parseResDate } from "@/scripts/tools/stringUtils";
import Image from "next/image";
import { useEffect, useState } from "react";
import Tabs from "../Library/Tabs";
import { supabase } from "@/scripts/config/supabase";
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { getRecentPartSearches } from "@/scripts/controllers/recentSearchesController";


export default function RecentPartSearches() {
  const [user] = useAtom(userAtom);
  const [recentPartSearches, setRecentPartSearches] = useAtom<RecentPartSearch[]>(recentPartSearchesAtom);
  const [recentSearchesOpen, setRecentSearchesOpen] = useState(localStorage.getItem('recentPartSearchOpen') === 'true' || localStorage.getItem('recentPartSearchOpen') === null ? true : false);
  
  const toggleRecentSearchOpen = () => {
    localStorage.setItem('recentPartSearchOpen', `${!recentSearchesOpen}`);
    setRecentSearchesOpen(!recentSearchesOpen);
  };

  useEffect(() => {
    supabase
      .channel('recentSearches')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'recentSearches' }, refreshRecentSearches)
      .subscribe();
  }, [recentPartSearches]);

  const refreshRecentSearches = async (e: RealtimePostgresInsertPayload<RecentPartSearch>) => {
    const newSearchData = e.new = { ...e.new, date: parseResDate(e.new.date as any), salesman: user.initials };
    setRecentPartSearches([newSearchData, ...recentPartSearches]);

    const prevSearch: any = localStorage.getItem('altPartSearches') || localStorage.getItem('partSearches');
    const partNum = JSON.parse(prevSearch).partNum.replace('*', '');
    setRecentPartSearches(await getRecentPartSearches((partNum && partNum !== '') ? partNum : '*'));
  };
  

  return (
    <div className="recent-part-searches">
      <div className="recent-part-searches__header no-select" onClick={toggleRecentSearchOpen}>
        <h2>Recent Part Searches</h2>
        <Image src={`/images/icons/arrow-${recentSearchesOpen ? 'up' : 'down'}.svg`} alt="arrow" width={25} height={25} />
      </div>

      {recentSearchesOpen &&
        <Tabs>
          <div>
            <>All Searches</>
            <>My Searches</>
          </div>

          <div className="recent-part-searches__table-container">
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Salesman</th>
                  <th>Part Number</th>
                </tr>
              </thead>
              <tbody>
                {recentPartSearches.map((search: RecentPartSearch) => {
                  return (
                    <tr key={search.id}>
                      <td>{ formatDate(search.date) }</td>
                      <td>{ formatTime(search.date) }</td>
                      <td>{ search.salesman }</td>
                      <td>{ search.partNum }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <div className="recent-part-searches__table-container">
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Salesman</th>
                  <th>Part Number</th>
                </tr>
              </thead>
              <tbody>
                {recentPartSearches.filter((s) => s.salesmanId === user.id).map((search: RecentPartSearch) => {
                  return (
                    <tr key={search.id}>
                      <td>{ formatDate(search.date) }</td>
                      <td>{ formatTime(search.date) }</td>
                      <td>{ search.salesman }</td>
                      <td>{ search.partNum }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Tabs>
      }
    </div>
  );
}
