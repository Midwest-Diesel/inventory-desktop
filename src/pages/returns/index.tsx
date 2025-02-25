import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/components/Library/Loading";
import { editReturnItem, getSomeCompletedReturns, getSomeReturns } from "@/scripts/controllers/returnsController";
import { cap, formatDate } from "@/scripts/tools/stringUtils";
import Checkbox from "@/components/Library/Checkbox";


export default function Returns() {
  const [returnsData, setReturnsData] = useState<Return[]>([]);
  const [returns, setReturns] = useState<Return[]>(returnsData);
  const [returnMin, setReturnMin] = useState<number[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [displayedPanel, setDisplayedPanel] = useState<string>('shop');
  const [loading, setLoading] = useState(true);
  const LIMIT = 26;

  useEffect(() => {
    if (returnsData.length === 0) fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getSomeReturns(1, LIMIT, true);
    setReturnsData(res.rows);
    setReturnMin(res.minItems);
    setLoading(false);
  };

  const handleChangePage = async (_: any, page: number) => {
    if (displayedPanel === 'completed') {
      const res = await getSomeCompletedReturns(page, LIMIT);
      setReturns(res.rows);
      setReturnMin(res.minItems);
    } else {
      const res = await getSomeReturns(page, LIMIT, displayedPanel === 'shop' ? true : false);
      setReturns(res.rows);
      setReturnMin(res.minItems);
    }
  };

  const handleToggleIsReceived = async (part: ReturnItem, value: boolean) => {
    await editReturnItem({ ...part, isReturnReceived: value });
    setReturns(returns.map((ret, i) => {
      if (ret.id === part.returnId) return {
        ...ret,
        returnItems: returns[i].returnItems.map((item) => {
          if (item.id === part.id) return { ...item, isReturnReceived: value };
          return item;
        })
      };
      return ret;
    }));
  };

  const handleToggleAsDescribed = async (part: ReturnItem, value: boolean) => {
    await editReturnItem({ ...part, isReturnAsDescribed: value });
    setReturns(returns.map((ret, i) => {
      if (ret.id === part.returnId) return {
        ...ret,
        returnItems: returns[i].returnItems.map((item) => {
          if (item.id === part.id) return { ...item, isReturnAsDescribed: value };
          return item;
        })
      };
      return ret;
    }));
  };

  const handleToggleIsPutAway = async (part: ReturnItem, value: boolean) => {
    await editReturnItem({ ...part, isReturnPutAway: value });
    setReturns(returns.map((ret, i) => {
      if (ret.id === part.returnId) return {
        ...ret,
        returnItems: returns[i].returnItems.map((item) => {
          if (item.id === part.id) return { ...item, isReturnPutAway: value };
          return item;
        })
      };
      return ret;
    }));
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
                      <td><Link href={`/returns/${ret.id}`} data-id="return-link">{ ret.id }</Link></td>
                      <td><Link href={`/handwrittens/${ret.handwrittenId}`} data-id="handwritten-link">{ ret.handwrittenId }</Link></td>
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
                          onChange={(e: any) => handleToggleIsReceived(part, e.target.checked)}
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnAsDescribed}
                          onChange={(e: any) => handleToggleAsDescribed(part, e.target.checked)}
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnPutAway}
                          onChange={(e: any) => handleToggleIsPutAway(part, e.target.checked)}
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
              minData={returnMin}
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
                      <td><Link href={`/handwrittens/${ret.handwrittenId}`}>{ ret.handwrittenId }</Link></td>
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
                          onChange={(e: any) => handleToggleIsReceived(part, e.target.checked)}
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnAsDescribed}
                          onChange={(e: any) => handleToggleAsDescribed(part, e.target.checked)}
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnPutAway}
                          onChange={(e: any) => handleToggleIsPutAway(part, e.target.checked)}
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
              minData={returnMin}
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
                      <td><Link href={`/handwrittens/${ret.handwrittenId}`}>{ ret.handwrittenId }</Link></td>
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
                          onChange={(e: any) => handleToggleIsReceived(part, e.target.checked)}
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnAsDescribed}
                          onChange={(e: any) => handleToggleAsDescribed(part, e.target.checked)}
                        />
                      </td>
                      <td className="cbx-td">
                        <Checkbox
                          checked={part && part.isReturnPutAway}
                          onChange={(e: any) => handleToggleIsPutAway(part, e.target.checked)}
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
              minData={returnMin}
              pageSize={LIMIT}
            />
          </>
        }
      </div>
    </Layout>
  );
}
