import { Layout } from "@/components/Layout";
import Button from "@/components/library/Button";
import Pagination from "@/components/library/Pagination";
import Table from "@/components/library/Table";
import { useState } from "react";
import Link from "@/components/library/Link";
import Loading from "@/components/library/Loading";
import { getSomeCompletedReturns, getSomeReturns, searchReturns } from "@/scripts/services/returnsService";
import { cap, formatDate } from "@/scripts/tools/stringUtils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useNavState } from "@/hooks/useNavState";
import SearchReturnsDialog, { ReturnSearch } from "@/components/returns/dialogs/SearchReturnsDialog";
import { isObjectNull } from "@/scripts/tools/utils";

const LIMIT = 26;


export default function ReturnsContainer() {
  const { push } = useNavState();
  const [params] = useSearchParams();
  const panel = params.get('panel') ?? 'shop';
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState<ReturnSearch | null>(null);

  const { data: returns, isFetching } = useQuery<ReturnRes>({
    queryKey: ['returns', currentPage, panel, JSON.stringify(search)],
    queryFn: async () => {
      if (search) {
        return await searchReturns(search, currentPage, LIMIT);
      }

      if (panel === 'completed') {
        return await getSomeCompletedReturns(currentPage, LIMIT);
      } else {
        return await getSomeReturns(currentPage, LIMIT, panel === 'shop');
      }
    }
  });

  const handleChangePage = async (_: any, page: number) => {
    setCurrentPage(page);
  };

  const handleChangeDisplayPanel = async (panel: string) => {
    if (search) setSearch({ ...search, progress: panel as any });
    setCurrentPage(1);
    await push('Returns', `${location.pathname}?panel=${panel}`);
  };

  const onSearch = async (data: ReturnSearch) => {
    if (isObjectNull(data)) {
      setSearch(null);
      return;
    }

    setCurrentPage(1);
    if (data.progress) await handleChangeDisplayPanel(data.progress);
    setSearch(data);
    setSearchOpen(false);  
  };


  return (
    <Layout>
      <SearchReturnsDialog
        open={searchOpen}
        setOpen={setSearchOpen}
        onSearch={onSearch}
      />

      <div className="returns">
        <h1>{ `${cap(panel)} Returns` }</h1>
        <div className="returns__top-bar">
          { search && <Button onClick={() => setSearch(null)}>Clear Search</Button> }
          <Button onClick={() => setSearchOpen(true)}>Search</Button>
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
                  <th>Part Numbers</th>
                  <th>Return Notes</th>
                </tr>
              </thead>
              <tbody>
                {returns.rows.map((ret: Return) => {
                  const items = Array.from(new Set(ret.returnItems.map((r) => r.partNum)))
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <tr key={ret.id}>
                      <td><Link href={`/returns/${ret.id}`} data-testid="return-link">{ ret.id }</Link></td>
                      <td><Link href={`/handwrittens/${ret.handwrittenId}`} data-testid="handwritten-link">{ ret.handwrittenId }</Link></td>
                      <td>{ formatDate(ret.dateCalled) }</td>
                      <td>{ ret.salesman?.initials }</td>
                      <td>{ ret.billToCompany }</td>
                      <td>{ items }</td>
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
