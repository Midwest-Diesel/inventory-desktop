import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/components/Library/Loading";
import { editReturn, getReturnCount, getSomeCompletedReturns, getSomeReturns } from "@/scripts/controllers/returnsController";
import { cap, formatDate } from "@/scripts/tools/stringUtils";
import Checkbox from "@/components/Library/Checkbox";
import Image from "next/image";
import { confirm } from '@tauri-apps/api/dialog';


export default function Returns() {
  const [returnsData, setReturnsData] = useState<Return[]>();
  const [returns, setReturns] = useState<Return[]>(returnsData);
  const [returnMin, setReturnMin] = useState<number[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [displayedPanel, setDisplayedPanel] = useState<string>('shop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const pageCount = await getReturnCount();
    setReturnMin(pageCount);

    const res = await getSomeReturns(1, 26);
    setReturnsData(res);
    setLoading(false);
  };

  const handleChangePage = async (data: any, page: number) => {
    if (displayedPanel === 'completed') {
      const res = await getSomeCompletedReturns(page, 26);
      setReturns(res);
    } else {
      const res = await getSomeReturns(page, 26, displayedPanel === 'shop' ? true : false);
      setReturns(res);
    }
  };

  const markReceived = async (ret: Return) => {
    if (!await confirm('Mark this return as received?')) return;
    const newReturn = { ...ret, dateReceived: new Date(), customerId: ret.customer.id };
    setLoading(true);
    await editReturn(newReturn);
    await fetchData();
  };


  return (
    <Layout>
      <div className="returns">
        <h1>{ `${cap(displayedPanel)} Returns` }</h1>
        <div className="returns__top-bar">
          {/* <Button onClick={() => setOpenSearch(true)}>Search</Button> */}
          <Button onClick={() => setDisplayedPanel('shop')}>Shop Returns</Button>
          <Button onClick={() => setDisplayedPanel('accounting')}>Accounting Returns</Button>
          <Button onClick={() => setDisplayedPanel('completed')}>Completed Returns</Button>
        </div>

        { loading && <Loading /> }
        {returnsData && displayedPanel === 'shop' &&
          <>
            <Table>
              <thead>
                <tr>
                  <th></th>
                  <th>Return</th>
                  <th>Handwritten</th>
                  <th>Date</th>
                  <th>By</th>
                  <th>Company</th>
                  <th>Part Number</th>
                  <th>Description</th>
                  <th>Return Notes</th>
                  <th>Stock Number</th>
                  <th>Qty</th>
                  <th>Received</th>
                  <th>As Described</th>
                  <th>Put Away</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {returns && returns.map((ret: Return) => {
                  const part = ret.returnItems[0];
                  return (
                    <tr key={ret.id}>
                      <td>
                        <Button variant={['x-small', 'green']} onClick={() => markReceived(ret)}>
                          <Image src="/images/check.svg" alt="Checkmark" width={12} height={12} />
                        </Button>
                      </td>
                      <td><Link href={`/returns/${ret.id}`}>{ ret.id }</Link></td>
                      <td><Link href={`/handwrittens/${ret.invoiceId}`}>{ ret.invoiceId }</Link></td>
                      <td>{ formatDate(ret.dateCalled) }</td>
                      <td>{ ret.createdBy }</td>
                      <td>{ ret.billToCompany }</td>
                      <td>{ part && part.partNum }</td>
                      <td>{ part && part.desc }</td>
                      <td>{ ret.returnNotes }</td>
                      <td>{ part && part.stockNum }</td>
                      <td>{ part && part.qty }</td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnReceived}
                          disabled
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnAsDescribed}
                          disabled
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnPutAway}
                          disabled
                        />
                      </td>
                      <td>{ part && part.notes }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              data={returnsData}
              setData={handleChangePage}
              minData={returnMin.filter((min: any) => !min.dateReceived)}
              pageSize={26}
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
                  <th>Company</th>
                  <th>Part Number</th>
                  <th>Description</th>
                  <th>Return Notes</th>
                  <th>Stock Number</th>
                  <th>Qty</th>
                  <th>Received</th>
                  <th>As Described</th>
                  <th>Put Away</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {returns && returns.map((ret: Return) => {
                  const part = ret.returnItems[0];
                  return (
                    <tr key={ret.id}>
                      <td><Link href={`/returns/${ret.id}`}>{ ret.id }</Link></td>
                      <td><Link href={`/handwrittens/${ret.invoiceId}`}>{ ret.invoiceId }</Link></td>
                      <td>{ formatDate(ret.dateCalled) }</td>
                      <td>{ ret.createdBy }</td>
                      <td>{ ret.billToCompany }</td>
                      <td>{ part && part.partNum }</td>
                      <td>{ part && part.desc }</td>
                      <td>{ ret.returnNotes }</td>
                      <td>{ part && part.stockNum }</td>
                      <td>{ part && part.qty }</td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnReceived}
                          disabled
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnAsDescribed}
                          disabled
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnPutAway}
                          disabled
                        />
                      </td>
                      <td>{ part && part.notes }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              data={returnsData}
              setData={handleChangePage}
              minData={returnMin.filter((min: any) => min.dateReceived)}
              pageSize={26}
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
                  <th>Company</th>
                  <th>Part Number</th>
                  <th>Description</th>
                  <th>Return Notes</th>
                  <th>Stock Number</th>
                  <th>Qty</th>
                  <th>Received</th>
                  <th>As Described</th>
                  <th>Put Away</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {returns && returns.map((ret: Return) => {
                  const part = ret.returnItems[0];
                  return (
                    <tr key={ret.id}>
                      <td><Link href={`/returns/${ret.id}`}>{ ret.id }</Link></td>
                      <td><Link href={`/handwrittens/${ret.invoiceId}`}>{ ret.invoiceId }</Link></td>
                      <td>{ formatDate(ret.dateCalled) }</td>
                      <td>{ ret.createdBy }</td>
                      <td>{ ret.billToCompany }</td>
                      <td>{ part && part.partNum }</td>
                      <td>{ part && part.desc }</td>
                      <td>{ ret.returnNotes }</td>
                      <td>{ part && part.stockNum }</td>
                      <td>{ part && part.qty }</td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnReceived}
                          disabled
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnAsDescribed}
                          disabled
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnPutAway}
                          disabled
                        />
                      </td>
                      <td>{ part && part.notes }</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              data={returnsData}
              setData={handleChangePage}
              minData={returnMin.filter((min: any) => min.dateReceived)}
              pageSize={26}
            />
          </>
        }
      </div>
    </Layout>
  );
}
