import { useAtom } from "jotai";
import Table from "../library/Table";
import { recentPartSearchesAtom, userAtom } from "@/scripts/atoms/state";
import { formatDate, formatTime } from "@/scripts/tools/stringUtils";
import { useEffect } from "react";
import Tabs from "../library/Tabs";
import { getRecentPartSearches, getRecentPartSearchesToday } from "@/scripts/services/recentSearchesService";
import { useQuery } from "@tanstack/react-query";
import { offServerEvent, onServerEvent } from "@/scripts/config/websockets";


export default function RecentPartSearches() {
  const [user] = useAtom(userAtom);
  const [recentPartSearches, setRecentPartSearches] = useAtom<RecentPartSearch[]>(recentPartSearchesAtom);

  const { data: recentSearchesToday = [] } = useQuery<RecentPartSearch[]>({
    queryKey: ['recentSearchesToday', recentPartSearches],
    queryFn: getRecentPartSearchesToday
  });

  useEffect(() => {
    onServerEvent('INSERT_RECENT_SEARCH', refreshRecentSearches);

    return () => {
      offServerEvent('INSERT_RECENT_SEARCH', refreshRecentSearches);
    };
  }, []);

  const refreshRecentSearches = async () => {
    const prevSearch: any = localStorage.getItem('altPartSearches') || localStorage.getItem('partSearches');
    const partNum = JSON.parse(prevSearch).partNum.replace('*', '');
    setRecentPartSearches(await getRecentPartSearches((partNum && partNum !== '') ? partNum : '*'));
  };
  

  return (
    <div className="recent-part-searches">
      <Tabs variant={['no-top-margin']}>
        <div>
          <>All Searches</>
          <>My Searches</>
          <>My Searches Today</>
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
                const isToday = search.date.toLocaleDateString() === new Date().toLocaleDateString();
                const styles = isToday ? { color: 'var(--orange-1)', fontWeight: 'bold' } : {};
                return (
                  <tr key={search.id} style={styles}>
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
                const isToday = search.date.toLocaleDateString() === new Date().toLocaleDateString();
                const styles = isToday ? { color: 'var(--orange-1)', fontWeight: 'bold' } : {};
                return (
                  <tr key={search.id} style={styles}>
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
              {recentSearchesToday.map((search: RecentPartSearch) => {
                const isToday = search.date.toLocaleDateString() === new Date().toLocaleDateString();
                const styles = isToday ? { color: 'var(--orange-1)', fontWeight: 'bold' } : {};
                return (
                  <tr key={search.id} style={styles}>
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
    </div>
  );
}
