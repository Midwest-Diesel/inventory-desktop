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
    setHandwrittensMin(await getHandwrittenCount());
    const res = await getSomeHandwrittens(1, LIMIT);
    setHandwrittensData(res);
    setLoading(false);
  };

  // This is probably unoptimized because of the min count data fetching.
  // It's a very large array of data.
  // This is also likely causing the quotes table to be unoptimized

  const handleChangePage = async (_: any, page: number) => {
    setLoading(true);
    setCurrentPage(page);
    if (currentStatus === 'all') {
      const res = await getSomeHandwrittens(page, LIMIT);
      setHandwrittens(res);
    } else {
      await handleFilterStatus(currentStatus as AccountingStatus, page);
    }
    setLoading(false);
  };

  const handleFilterStatus = async (status: AccountingStatus, page: number) => {
    setLoading(true);
    setCurrentStatus(status);
    setHandwrittensMin(await getHandwrittenCountByStatus(status));
    const res = await getSomeHandwrittensByStatus(page, LIMIT, status);
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
        <h1>Karmak</h1>
        <div className="karmak-page__top-buttons">
          <Button>End of Day</Button>
          <Button>Email Netcom Inventory</Button>
          <Button>FedEx Sync</Button>
        </div>
        <hr />
        <div className="karmak-page__top-buttons">
          <Button onClick={handleFilterAll}>All</Button>
          <Button onClick={() => {
            setCurrentPage(1);
            handleFilterStatus('', 1);
          }}>New</Button>
          <Button onClick={() => {
            setCurrentPage(1);
            handleFilterStatus('IN PROCESS', 1);
          }}>In Process</Button>
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
                )
              })}
            </tbody>
          </Table>
          <Pagination
            data={handwrittensData}
            setData={handleChangePage}
            minData={handwrittensMin}
            pageSize={LIMIT}
          />
        </div>
      </div>
    </Layout>
  );
}
