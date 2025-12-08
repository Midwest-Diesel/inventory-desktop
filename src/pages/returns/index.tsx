import { Layout } from "@/components/Layout";
import Button from "@/components/library/Button";
import Pagination from "@/components/library/Pagination";
import Table from "@/components/library/Table";
import { useState } from "react";
import Link from "@/components/library/Link";
import Loading from "@/components/library/Loading";
import { getSomeCompletedReturns, getSomeReturns } from "@/scripts/services/returnsService";
import { cap, formatDate } from "@/scripts/tools/stringUtils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useNavState } from "@/hooks/useNavState";

const LIMIT = 26;


export default function ReturnsContainer() {
  const { push } = useNavState();
  const [params] = useSearchParams();
  const panel = params.get('panel') ?? 'shop';
  const [currentPage, setCurrentPage] = useState(1);

  const { data: returns, isFetching } = useQuery<ReturnRes>({
    queryKey: ['returns', currentPage, panel],
    queryFn: async () => {
      if (panel === 'completed') {
        return await getSomeCompletedReturns(currentPage, LIMIT);
      } else {
        return await getSomeReturns(currentPage, LIMIT, panel === 'shop' ? true : false);
      }
    }
  });

  const handleChangePage = async (_: any, page: number) => {
    setCurrentPage(page);
  };

  const handleChangeDisplayPanel = async (panel: string) => {
    await push('Returns', `${location.pathname}?panel=${panel}`);
  };


  return (
    <Layout>
      <div className="returns">
        <h1>{ `${cap(panel)} Returns` }</h1>
        <div className="returns__top-bar">
          <Button onClick={() => handleChangeDisplayPanel('shop')} data-testid="shop-btn">Shop Returns</Button>
          <Button onClick={() => handleChangeDisplayPanel('accounting')} data-testid="accounting-btn">Accounting Returns</Button>
          <Button onClick={() => handleChangeDisplayPanel('completed')} data-testid="completed-btn">Completed Returns</Button>
        </div>

        { isFetching && <Loading /> }
        { !returns && <p>No results...</p> }

        {returns && panel === 'shop' &&
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
                {returns.rows.map((ret: Return) => {
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
              data={returns.rows}
              setData={handleChangePage}
              pageCount={returns.pageCount}
              pageSize={LIMIT}
            />
          </>
        }

        {returns && panel === 'accounting' &&
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
                {returns.rows.map((ret: Return) => {
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
              data={returns.rows}
              setData={handleChangePage}
              pageCount={returns.pageCount}
              pageSize={LIMIT}
            />
          </>
        }

        {returns && panel === 'completed' &&
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
                {returns.rows.map((ret: Return) => {
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
              data={returns.rows}
              setData={handleChangePage}
              pageCount={returns.pageCount}
              pageSize={LIMIT}
            />
          </>
        }
      </div>
    </Layout>
  );
}
