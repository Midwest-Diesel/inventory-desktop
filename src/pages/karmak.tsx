import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { invoke } from "@/scripts/config/tauri";
import { getEndOfDayHandwrittens, getSomeHandwrittens, getSomeHandwrittensByStatus } from "@/scripts/services/handwrittensService";
import { formatDate } from "@/scripts/tools/stringUtils";
import Link from "@/components/Library/Link";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { accountingPageFilterAtom } from "@/scripts/atoms/state";

type AccountingStatus = '' | 'all' | 'IN PROCESS' | 'COMPLETE';


export default function Karmak() {
  const [currentStatus, setCurrentStatus] = useAtom(accountingPageFilterAtom);
  const [handwrittensData, setHandwrittensData] = useState<Handwritten[]>([]);
  const [handwrittens, setHandwrittens] = useState<Handwritten[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 60;

  useEffect(() => {
    const init = async () => {
      if (currentStatus !== 'all') {
        await handleFilterStatus(currentStatus, 1, true);
        return;
      }
      fetchData();
    };
    init();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setCurrentPage(1);
    const res = await getSomeHandwrittens(1, LIMIT);
    setHandwrittensData(res.rows);
    setHandwrittens(res.rows);
    setPageCount(res.pageCount);
    setLoading(false);
  };

  const handleChangePage = async (_: any, page: number) => {
    if (currentStatus === 'all') {
      setCurrentPage(page);
      const res = await getSomeHandwrittens(page, LIMIT);
      setHandwrittens(res.rows);
      setPageCount(res.pageCount);
    } else {
      await handleFilterStatus(currentStatus, page);
    }
  };
  
  const handleFilterStatus = async (status: AccountingStatus, page: number, force = false) => {
    if (currentStatus === status && currentPage === page && !force) return;
    setCurrentPage(page);
    setLoading(true);
    setCurrentStatus(status);
    const res = await getSomeHandwrittensByStatus(page, LIMIT, status);
    setHandwrittensData(res.rows);
    setHandwrittens(res.rows);
    setPageCount(res.pageCount);
    setLoading(false);
  };

  const handleFilterAll = async () => {
    setCurrentStatus('all');
    await fetchData();
  };

  const handleEndOfDay = async () => {
    const res = await getEndOfDayHandwrittens();
    for (let i = 0; i < res.length; i++) {
      const handwritten: Handwritten = res[i];
      const args = {
        id: Number(handwritten.id),
        email: handwritten.email ?? '',
        company: handwritten.customer.company,
        date: formatDate(handwritten.date),
        year: handwritten.date.getFullYear().toString(),
        month: (handwritten.date.getMonth() + 1).toString(),
        day: handwritten.date.getDay().toString(),
        shipVia: handwritten.shipVia?.name ?? '',
        trackingNumbers: handwritten.trackingNumbers.map((num) => `<li style='margin: 0;'>${num.trackingNumber}</li>`)
      };
      await invoke('email_end_of_day', { args });
    }
  };


  return (
    <Layout title="Karmak">
      <div className="karmak-page">
        <h1>Accounting</h1>
        <div className="karmak-page__top-buttons">
          <Button onClick={handleEndOfDay}>End of Day</Button>
        </div>
        <hr />
        <div className="karmak-page__top-buttons">
          <Button onClick={handleFilterAll}>All</Button>
          <Button onClick={() => handleFilterStatus('', 1)}>New</Button>
          <Button onClick={() => handleFilterStatus('IN PROCESS', 1)}>In Process</Button>
          <Button onClick={() => handleFilterStatus('COMPLETE', currentPage)}>Completed</Button>
        </div>

        { loading && <Loading /> }
        <div className="karmak-page__table-container">
          <Table>
            <thead>
              <tr>
                <th>Handwritten</th>
                <th>Date</th>
                <th>Bill to Company</th>
                <th>Ship to Company</th>
                <th>Shipping</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {handwrittens.map((handwritten) => {
                return (
                  <tr key={handwritten.id}>
                    <td><Link href={`/handwrittens/${handwritten.id}`}>{ handwritten.id }</Link></td>
                    <td>{ formatDate(handwritten.date) }</td>
                    <td>{ handwritten.billToCompany }</td>
                    <td>{ handwritten.shipToCompany }</td>
                    <td>{ handwritten.shipVia?.name }</td>
                    <td>{ handwritten.accountingStatus }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination
            data={handwrittensData}
            setData={handleChangePage}
            pageCount={pageCount}
            pageSize={LIMIT}
            page={currentPage}
          />
        </div>
      </div>
    </Layout>
  );
}
