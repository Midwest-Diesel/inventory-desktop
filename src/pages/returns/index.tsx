import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { useEffect, useState } from "react";
import Link from "@/components/Library/Link";
import Loading from "@/components/Library/Loading";
import { getSomeCompletedReturns, getSomeReturns } from "@/scripts/services/returnsService";
import { cap, formatDate } from "@/scripts/tools/stringUtils";


export default function Returns() {
  const [returnsData, setReturnsData] = useState<Return[]>([]);
  const [returns, setReturns] = useState<Return[]>(returnsData);
  const [pageCount, setPageCount] = useState(0);
  const [displayedPanel, setDisplayedPanel] = useState<string>('shop');
  const [loading, setLoading] = useState(true);
  const LIMIT = 26;

  useEffect(() => {
    if (returnsData.length === 0) fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getSomeReturns(1, LIMIT, true);
    setReturnsData(res.rows);
    setPageCount(res.pageCount);
    setLoading(false);
  };

  const handleChangePage = async (_: any, page: number) => {
    if (displayedPanel === 'completed') {
      const res = await getSomeCompletedReturns(page, LIMIT);
      setReturns(res.rows);
      setPageCount(res.pageCount);
    } else {
      const res = await getSomeReturns(page, LIMIT, displayedPanel === 'shop' ? true : false);
      setReturns(res.rows);
      setPageCount(res.pageCount);
    }
  };


  return (
    <Layout>
      <div className="returns">
        <h1>{ `${cap(displayedPanel)} Returns` }</h1>
        <div className="returns__top-bar">
          <Button onClick={() => setDisplayedPanel('shop')} data-testid="shop-btn">Shop Returns</Button>
          <Button onClick={() => setDisplayedPanel('accounting')} data-testid="accounting-btn">Accounting Returns</Button>
          <Button onClick={() => setDisplayedPanel('completed')} data-testid="completed-btn">Completed Returns</Button>
        </div>

        { loading && <Loading /> }
        {returnsData && displayedPanel === 'shop' &&
          <>
            <Table>
              <thead>
                <tr>
                  <th>Return</th>
                  <th>Handwritten</th>
                  <th>Date</th>
                  <th>By</th>
                  <th>Bill to Company</th>
                  <th>Return Notes</th>
                </tr>
              </thead>
              <tbody>
                {returns && returns.map((ret: Return) => {
                  return (
                    <tr key={ret.id}>
                      <td><Link href={`/returns/${ret.id}`} data-testid="return-link">{ ret.id }</Link></td>
                      <td><Link href={`/handwrittens/${ret.handwrittenId}`} data-testid="handwritten-link">{ ret.handwrittenId }</Link></td>
                      <td>{ formatDate(ret.dateCalled) }</td>
                      <td>{ ret.salesman?.initials }</td>
                      <td>{ ret.billToCompany }</td>
                      <td>{ ret.returnNotes }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              data={returnsData}
              setData={handleChangePage}
              pageCount={pageCount}
              pageSize={LIMIT}
            />
          </>
        }

        {returnsData && displayedPanel === 'accounting' &&
          <>
            <Table>
              <thead>
                <tr>
                  <th>Return</th>
                  <th>Handwritten</th>
                  <th>Date</th>
                  <th>By</th>
                  <th>Bill to Company</th>
                  <th>Return Notes</th>
                  <th>Date Credited</th>
                </tr>
              </thead>
              <tbody>
                {returns && returns.map((ret: Return) => {
                  return (
                    <tr key={ret.id}>
                      <td><Link href={`/returns/${ret.id}`}>{ ret.id }</Link></td>
                      <td><Link href={`/handwrittens/${ret.handwrittenId}`}>{ ret.handwrittenId }</Link></td>
                      <td>{ formatDate(ret.dateCalled) }</td>
                      <td>{ ret.salesman?.initials }</td>
                      <td>{ ret.billToCompany }</td>
                      <td>{ ret.returnNotes }</td>
                      <td>{ formatDate(ret.creditIssued) }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              data={returnsData}
              setData={handleChangePage}
              pageCount={pageCount}
              pageSize={LIMIT}
            />
          </>
        }

        {returnsData && displayedPanel === 'completed' &&
          <>
            <Table>
              <thead>
                <tr>
                  <th>Return</th>
                  <th>Handwritten</th>
                  <th>Date</th>
                  <th>By</th>
                  <th>Bill to Company</th>
                  <th>Return Notes</th>
                  <th>Date Credited</th>
                </tr>
              </thead>
              <tbody>
                {returns && returns.map((ret: Return) => {
                  return (
                    <tr key={ret.id}>
                      <td><Link href={`/returns/${ret.id}`}>{ ret.id }</Link></td>
                      <td><Link href={`/handwrittens/${ret.handwrittenId}`}>{ ret.handwrittenId }</Link></td>
                      <td>{ formatDate(ret.dateCalled) }</td>
                      <td>{ ret.salesman?.initials }</td>
                      <td>{ ret.billToCompany }</td>
                      <td>{ ret.returnNotes }</td>
                      <td>{ formatDate(ret.creditIssued) }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              data={returnsData}
              setData={handleChangePage}
              pageCount={pageCount}
              pageSize={LIMIT}
            />
          </>
        }
      </div>
    </Layout>
  );
}
