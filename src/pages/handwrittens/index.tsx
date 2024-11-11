import HandwrittensSearchDialog from "@/components/Dialogs/HandwrittensSearchDialog";
import HandwrittenItemsTable from "@/components/HandwrittenItemsTable";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { userAtom } from "@/scripts/atoms/state";
import { addBlankHandwritten, getHandwrittenCount, getHandwrittensByDate, getSomeHandwrittens } from "@/scripts/controllers/handwrittensController";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function Handwrittens() {
  const id = location.href.split('/').pop();

  const [user] = useAtom<User>(userAtom);
  const [handwrittensData] = useState<Handwritten[]>([]);
  const [handwrittens, setHandwrittens] = useState<Handwritten[]>([]);
  const [focusedHandwritten, setFocusedHandwritten] = useState<Handwritten>(null);
  const [yesterdayInvoices, setYesterdayInvoices] = useState<Handwritten[]>(handwrittensData);
  const [handwrittenCount, setHandwrittenCount] = useState<number[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const pageCount = await getHandwrittenCount();
      setHandwrittenCount(pageCount);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setYesterdayInvoices(await getHandwrittensByDate(yesterday));
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log(id);
    if (!id) return;
    location.replace(`/handwrittens/${id}`);
  }, [id]);

  const handleChangePage = async (data: any, page: number) => {
    if (page === currentPage) return;
    setLoading(true);
    const res = await getSomeHandwrittens(page, 26);
    setHandwrittens(res);
    setCurrentPage(page);
    setLoading(false);
  };

  const handleSearch = (results: Handwritten[]) => {
    setHandwrittens(results);
  };

  const sumInvoiceCosts = (handwrittenItems: HandwrittenItem[]): number => {
    return handwrittenItems.reduce((acc, item) => acc + (item.cost * item.qty), 0);
  };

  const sumHandwrittenItems = (handwrittenItems: HandwrittenItem[]): number => {
    return handwrittenItems.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  };

  const getTotalCogs = (): number => {
    return yesterdayInvoices.reduce((acc, handwritten) => acc + sumInvoiceCosts(handwritten.handwrittenItems), 0);
  };

  const getTotalSales = (): number => {
    return yesterdayInvoices.reduce((acc, handwritten) => acc + sumHandwrittenItems(handwritten.handwrittenItems), 0);
  };

  const handleNewHandwritten = async () => {
    await addBlankHandwritten({ date: new Date(), userId: user.id });
    location.reload();
  };


  return (
    <Layout title="Handwrittens">
      <HandwrittensSearchDialog open={openSearch} setOpen={setOpenSearch} setHandwrittens={handleSearch} />

      <div className="handwrittens__container">
        <div className="handwrittens">
          <h1>Handwrittens</h1>
          <div className="handwrittens__top-buttons">
            <Button onClick={() => setOpenSearch(true)}>Search</Button>
            { user.type === 'office' && <Button onClick={handleNewHandwritten}>New</Button> }
          </div>
          <div className="handwrittens__top-bar">
            <div className="handwrittens__top-bar--count-block">
              <h4>Yesterday&apos;s COGS</h4>
              <p>{ yesterdayInvoices && formatCurrency(getTotalCogs()) }</p>
            </div>
            <div className="handwrittens__top-bar--count-block">
              <h4>Yesterday&apos;s Sales</h4>
              <p>{ yesterdayInvoices && formatCurrency(getTotalSales()) }</p>
            </div>
          </div>
          {loading && <Loading />}
          {handwrittens &&
            <div className="handwrittens__table-container">
              <Table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Date</th>
                    <th>Bill To Company</th>
                    <th>Ship To Company</th>
                    <th>Source</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Accounting</th>
                  </tr>
                </thead>
                <tbody>
                  {handwrittens.map((handwritten: Handwritten) => {
                    return (
                      <tr key={handwritten.id} onClick={() => setFocusedHandwritten(handwritten)} style={ focusedHandwritten && handwritten.id === focusedHandwritten.id ? { border: 'solid 3px var(--yellow-2)' } : {} }>
                        <td><Link href={`/handwrittens/${handwritten.id}`}>{ handwritten.id }</Link></td>
                        <td>{ formatDate(handwritten.date) }</td>
                        <td>{ handwritten.billToCompany }</td>
                        <td>{ handwritten.shipToCompany }</td>
                        <td>{ handwritten.source }</td>
                        <td>{ handwritten.payment }</td>
                        <td>{ handwritten.invoiceStatus }</td>
                        <td>{ handwritten.accountingStatus }</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <Pagination
                data={handwrittensData}
                setData={handleChangePage}
                minData={handwrittenCount}
                pageSize={26}
              />
            </div>
          }
        </div>

        {focusedHandwritten && <HandwrittenItemsTable className="handwritten-items-table--handwrittens-page" handwritten={focusedHandwritten} handwrittenItems={focusedHandwritten.handwrittenItems} setHandwritten={setFocusedHandwritten} /> }
      </div>
    </Layout>
  );
}
