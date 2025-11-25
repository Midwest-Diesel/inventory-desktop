import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Dialog from "../../Library/Dialog";
import Table from "../../Library/Table";
import Link from "../../Library/Link";
import { getPartInfoByPartNum, getSalesInfo, searchAltParts, searchParts } from "@/scripts/services/partsService";
import { getSalesByYear } from "@/scripts/logic/sales";
import { useQuery } from "@tanstack/react-query";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}


export default function SalesInfo({ open, setOpen }: Props) {
  const { data: prevSearch } = useQuery<{ pageCount: number, totalQty: number, rows: Part[], rowsHidden: number | null } | null>({
    queryKey: ['prevSearch', open],
    queryFn: async () => {
      const rawPartSearch = JSON.parse(localStorage.getItem('partSearches')!);
      const filteredPartSearch = rawPartSearch && Object.fromEntries(
        Object.entries(rawPartSearch).filter(([_, value]) => (value as any).toString().replace('*', ''))
      );
      const rawAltPartSearch = JSON.parse(localStorage.getItem('altPartSearches')!);
      const filteredAltPartSearch = rawAltPartSearch && Object.fromEntries(
        Object.entries(rawAltPartSearch).filter(([_, value]) => (value as any).toString().replace('*', ''))
      );
      const partSearch = filteredPartSearch && await searchParts({ ...filteredPartSearch, showSoldParts: true }, 1, 1);
      const altPartSearch = filteredAltPartSearch && await searchAltParts({ ...filteredAltPartSearch, showSoldParts: true }, 1, 1);
      const prevSearch = partSearch ?? altPartSearch;

      if (prevSearch.rows.length === 0) {
        alert('Failed to search for part records');
        return null;
      }
      return prevSearch;
    },
    enabled: open
  });

  const { data: partInfo } = useQuery<PartInfo | null>({
    queryKey: ['partInfo', open, prevSearch],
    queryFn: async () => {
      if (!prevSearch) return null;
      return await getPartInfoByPartNum(prevSearch.rows[0].partNum);
    },
    enabled: open
  });

  const { data: salesInfo } = useQuery<SalesInfo>({
    queryKey: ['salesInfo', open, partInfo],
    queryFn: async () => {
      if (!partInfo) return { sales: [], quotes: [], counters: { new: 0, recon: 0, used: 0, core: 0 }};
      return await getSalesInfo(partInfo.altParts);
    },
    enabled: open
  });


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Sales Info"
      width={1200}
      height={650}
      x={50}
    >
      <div className="sales-info">
        <div className="sales-info__top-section">
          <div>
            <h2>New</h2>
            <p>{ salesInfo?.counters.new }</p>
          </div>
          <div>
            <h2>Recon</h2>
            <p>{ salesInfo?.counters.recon }</p>
          </div>
          <div>
            <h2>Used</h2>
            <p>{ salesInfo?.counters.used }</p>
          </div>
          <div>
            <h2>Core</h2>
            <p>{ salesInfo?.counters.core }</p>
          </div>
        </div>

        <section>
          <h3>Sales History</h3>
          <div className="sales-info__sales-history">
            <Table>
              <thead>
                <tr>
                  <th>Part Number</th>
                  <th>Sold By</th>
                  <th>Sold Date</th>
                  <th>Customer</th>
                  <th>Qty Sold</th>
                  <th>Selling Price</th>
                  <th>Condition</th>
                  <th>Handwritten</th>
                </tr>
              </thead>
              <tbody>
                {salesInfo?.sales.map((info: SalesInfoSales) => {
                  return (
                    <tr key={info.id}>
                      <td><Link href={`/part/${info.id}`}>{ info.partNum }</Link></td>
                      <td>{ info.soldBy }</td>
                      <td>{ formatDate(info.soldToDate) }</td>
                      <td>{ info.soldTo }</td>
                      <td>{ info.qtySold }</td>
                      <td>{ formatCurrency(info.sellingPrice) }</td>
                      <td>{ info.condition }</td>
                      <td><Link href={`/handwrittens/${info.handwrittenId}`}>{ info.handwrittenId }</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {Number(salesInfo?.quotes.length) > 0 &&
            <div style={{ display: 'flex' }}>
              <div>
                <h3>Quotes</h3>
                <div className="sales-info__quotes-history">
                  <Table>
                    <thead>
                      <tr>
                        <th>Salesperson</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Price</th>
                        <th>Condition</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesInfo?.quotes.map((quote: SalesInfoQuote) => {
                        return (
                          <tr key={quote.id}>
                            <td>{ quote.soldBy }</td>
                            <td>{ formatDate(quote.date) }</td>
                            <td>{ quote.customer as any }</td>
                            <td>{ formatCurrency(quote.price) }</td>
                            <td>{ quote.condition }</td>
                            <td>{ quote.notes }</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </div>

              <div className="sales-info__sales-by-year">
                <h3>Sales by Year</h3>
                {getSalesByYear(salesInfo?.sales ?? []).map((sale: { year: number, amount: number }, i: number) => {
                  return (
                    <div key={i} className="sales-info__sales-by-year--row">
                      <p>{ sale.year }</p>
                      <p>---</p>
                      <p>{ sale.amount }</p>
                    </div>
                  );
                })}
              </div>
            </div>
          }
        </section>
      </div>
    </Dialog>
  );
}
