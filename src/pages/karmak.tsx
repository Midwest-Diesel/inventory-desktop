import { Layout } from "@/components/Layout";
import Button from "@/components/library/Button";
import Loading from "@/components/library/Loading";
import Pagination from "@/components/library/Pagination";
import Table from "@/components/library/Table";
import { invoke } from "@/scripts/config/tauri";
import { getEndOfDayHandwrittens, getSomeHandwrittensByStatus } from "@/scripts/services/handwrittensService";
import { formatDate } from "@/scripts/tools/stringUtils";
import Link from "@/components/library/Link";
import { useState } from "react";
import { useAtom } from "jotai";
import { accountingPageFilterAtom } from "@/scripts/atoms/state";
import { useQuery } from "@tanstack/react-query";

type AccountingStatus = '' | 'all' | 'IN PROCESS' | 'COMPLETE';
const LIMIT = 60;


export default function Karmak() {
  const [currentStatus, setCurrentStatus] = useAtom(accountingPageFilterAtom);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: handwrittens, isFetching } = useQuery<HandwrittenRes>({
    queryKey: ['handwrittens', currentPage, currentStatus],
    queryFn: () => getSomeHandwrittensByStatus(currentPage, LIMIT, currentStatus)
  });

  const handleChangePage = async (_: any, page: number) => {
    setCurrentPage(page);
  };
  
  const handleFilterStatus = async (status: AccountingStatus, force = false) => {
    if (currentStatus === status && currentPage === 1 && !force) return;
    setCurrentPage(1);
    setCurrentStatus(status);
  };

  const handleEndOfDay = async () => {
    const res = await getEndOfDayHandwrittens();
    for (let i = 0; i < res.length; i++) {
      const handwritten: Handwritten = res[i];
      const args = {
        id: Number(handwritten.legacyId ?? handwritten.id),
        email: handwritten.email ?? '',
        company: handwritten.customer.company,
        date: formatDate(handwritten.date),
        year: handwritten.date.getUTCFullYear().toString(),
        month: (handwritten.date.getUTCMonth() + 1).toString(),
        day: handwritten.date.getUTCDate().toString(),
        ship_via: handwritten.shipVia?.name ?? '',
        tracking_numbers: handwritten.trackingNumbers.map((num) => `<li style='margin: 0;'>${num.trackingNumber}</li>`)
      };
      await invoke('email_end_of_day', { args });
    }
  };


  return (
    <Layout title="Accounting">
      <div className="karmak-page">
        <h1>Accounting</h1>
        <div className="karmak-page__top-buttons">
          <Button onClick={handleEndOfDay}>End of Day</Button>
        </div>
        <hr />
        <div className="karmak-page__top-buttons">
          <Button onClick={() => handleFilterStatus('all')}>All</Button>
          <Button onClick={() => handleFilterStatus('')}>New</Button>
          <Button onClick={() => handleFilterStatus('COMPLETE')}>Completed</Button>
        </div>

        { isFetching && <Loading /> }

        {handwrittens &&
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
                {handwrittens.rows.map((handwritten) => {
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
              data={handwrittens.rows}
              setData={handleChangePage}
              pageCount={handwrittens.pageCount}
              pageSize={LIMIT}
              page={currentPage}
            />
          </div>
        }
      </div>
    </Layout>
  );
}
