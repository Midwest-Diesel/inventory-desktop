import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { getHandwrittenCount, getHandwrittenCountByStatus, getSomeHandwrittens, getSomeHandwrittensByStatus } from "@/scripts/controllers/handwrittensController";
import { formatDate } from "@/scripts/tools/stringUtils";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function Karmak() {
  const [handwrittensData, setHandwrittensData] = useState<Handwritten[]>([]);
  const [handwrittens, setHandwrittens] = useState<Handwritten[]>([]);
  const [handwrittensMin, setHandwrittensMin] = useState<number[]>([]);
  const [currentStatus, setCurrentStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 60;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setCurrentPage(1);
    setHandwrittensMin(await getHandwrittenCount());
    const res = await getSomeHandwrittens(1, LIMIT);
    setHandwrittensData(res);
    setHandwrittens(res);
    setLoading(false);
  };

  const handleChangePage = async (_: any, page: number) => {
    if (currentStatus === 'all') {
      setCurrentPage(page);
      const res = await getSomeHandwrittens(page, LIMIT);
      setHandwrittens(res);
    } else {
      await handleFilterStatus(currentStatus as AccountingStatus, page);
    }
  };
  
  const handleFilterStatus = async (status: AccountingStatus, page: number) => {
    if (currentStatus === status && currentPage === page) return;
    setCurrentPage(page);
    setLoading(true);
    setCurrentStatus(status);
    setHandwrittensMin(await getHandwrittenCountByStatus(status));
    const res = await getSomeHandwrittensByStatus(page, LIMIT, status);
    setHandwrittensData(res);
    setHandwrittens(res);
    setLoading(false);
  };

  const handleFilterAll = async () => {
    setCurrentStatus('all');
    await fetchData();
  };


  return (
    <Layout title="Karmak">
      <div className="karmak-page">
        <h1>Accounting</h1>
        <div className="karmak-page__top-buttons">
          <Button>End of Day</Button>
          <Button>Email Netcom Inventory</Button>
          <Button>FedEx Sync</Button>
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
                    <td>{ handwritten.shipVia }</td>
                    <td>{ handwritten.accountingStatus }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination
            data={handwrittensData}
            setData={handleChangePage}
            minData={handwrittensMin}
            pageSize={LIMIT}
            page={currentPage}
          />
        </div>
      </div>
    </Layout>
  );
}
