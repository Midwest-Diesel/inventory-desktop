import CustomerSelectDialog from "@/components/Dialogs/CustomerSelectDialog";
import HandwrittensSearchDialog from "@/components/Dialogs/handwrittens/HandwrittensSearchDialog";
import HandwrittenItemsTable from "@/components/HandwrittenItemsTable";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { handwrittenSearchAtom, userAtom } from "@/scripts/atoms/state";
import { addHandwritten, getHandwrittenCount, getHandwrittensByDate, getMostRecentHandwrittenDate, getSomeHandwrittens, searchHandwrittens } from "@/scripts/controllers/handwrittensController";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import Link from "@/components/Library/Link";
import { useEffect, useState } from "react";


export const paymentTypes = ['Net 30', 'Wire Transfer', 'EBPP - Secure', 'Visa', 'Mastercard', 'AMEX', 'Discover', 'Comchek', 'T-Check', 'Check', 'Cash', 'Card on File', 'Net 10', 'No Charge'].sort();

export default function Handwrittens() {
  const [user] = useAtom<User>(userAtom);
  const [handwrittenSearchData] = useAtom(handwrittenSearchAtom);
  const [handwrittensData] = useState<Handwritten[]>([]);
  const [handwrittens, setHandwrittens] = useState<Handwritten[]>([]);
  const [focusedHandwritten, setFocusedHandwritten] = useState<Handwritten | null>(null);
  const [yesterdayInvoices, setYesterdayInvoices] = useState<Handwritten[]>(handwrittensData);
  const [handwrittenCount, setHandwrittenCount] = useState<number[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchData, setSearchData] = useState<any>({});
  const [taxTotal, setTaxTotal] = useState(0);
  const TAX_RATE = 0.08375;
  const LIMIT = 40;

  useEffect(() => {
    const fetchData = async () => {
      const pageCount = await getHandwrittenCount();
      setHandwrittenCount(pageCount);
      
      const date = await getMostRecentHandwrittenDate();
      if (!date) return;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date.getTime() === today.getTime()) {
        date.setDate(date.getDate() - 1);
      }
      setYesterdayInvoices(await getHandwrittensByDate(date));
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => setSearchData(handwrittenSearchData), [handwrittenSearchData]);

  const handleChangePage = async (_: any, page: number) => {
    if (page === currentPage) return;
    setLoading(true);
    const hasValidSearchCriteria = (
      searchData.id ||
      searchData.date ||
      (searchData.poNum && searchData.poNum !== '*') ||
      (searchData.billToCompany && searchData.billToCompany !== '*') ||
      (searchData.shipToCompany && searchData.shipToCompany !== '*') ||
      searchData.source ||
      searchData.payment
    );

    if (hasValidSearchCriteria) {
      const res = await searchHandwrittens({ ...searchData, offset: (page - 1) * LIMIT });
      setHandwrittens(res?.rows);
    } else{
      const res = await getSomeHandwrittens(page, LIMIT);
      setHandwrittens(res);
    }
    setCurrentPage(page);
    setLoading(false);
  };

  const handleSearch = (results: Handwritten[]) => {
    setHandwrittens(results);
  };

  const sumInvoiceCosts = (handwrittenItems: HandwrittenItem[]): number => {
    return handwrittenItems.filter((item) => (item?.cost ?? 0) > 0.04).reduce((acc, item) => acc + ((item?.cost ?? 0) * (item?.qty ?? 0)), 0);
  };

  const sumHandwrittenItems = (handwrittenItems: HandwrittenItem[]): number => {
    return handwrittenItems.filter((item) => (item?.unitPrice ?? 0) > 0.04).reduce((acc, item) => acc + ((item?.unitPrice ?? 0) * (item?.qty ?? 0)), 0);
  };

  const getTotalCogs = (): number => {
    return yesterdayInvoices.reduce((acc, handwritten) => acc + sumInvoiceCosts(handwritten.handwrittenItems), 0);
  };

  const getTotalSales = (): number => {
    return yesterdayInvoices.reduce((acc, handwritten) => acc + sumHandwrittenItems(handwritten.handwrittenItems), 0);
  };

  const handleNewHandwritten = async (customer: Customer) => {
    const newHandwritten = {
      customer,
      poNum: null,
      billToAddress: customer.billToAddress,
      billToAddress2: customer.billToAddress2,
      billToCity: customer.billToCity,
      billToState: customer.billToState,
      billToZip: customer.billToZip,
      billToCountry: null,
      billToPhone: customer.billToPhone,
      fax: '',
      shipToAddress: null,
      shipToAddress2: null,
      shipToCity: null,
      shipToState: null,
      shipToZip: null,
      source: null,
      contactName: '',
      payment: null,
      salesmanId: user.id,
      phone: '',
      cell: null,
      engineSerialNum: null,
      isBlindShipment: false,
      isNoPriceInvoice: false,
      shipVia: null,
      cardNum: null,
      expDate: null,
      cvv: null,
      cardZip: null,
      cardName: null,
      invoiceStatus: 'INVOICE PENDING',
      accountingStatus: null,
      shippingStatus: null,
      billToCompany: customer.company,
      shipToCompany: null
    } as any;
    await addHandwritten(newHandwritten);
    const res = await getSomeHandwrittens(1, LIMIT);
    setCurrentPage(1);
    setHandwrittens(res);
  };

  const handleFocusHandwritten = (handwritten: Handwritten) => {
    setFocusedHandwritten(handwritten);
    const taxItemsAmount = handwritten && handwritten.handwrittenItems.map((item) => (item?.qty ?? 0) * (item?.unitPrice ?? 0)).reduce((acc, cur) => acc + cur, 0);
    setTaxTotal(Number((taxItemsAmount * TAX_RATE).toFixed(2)));
  };


  return (
    <Layout title="Handwrittens">
      <HandwrittensSearchDialog open={openSearch} setOpen={setOpenSearch} setHandwrittens={handleSearch} setMinItems={setHandwrittenCount} limit={LIMIT} />
      <CustomerSelectDialog open={customerSelectOpen} setOpen={setCustomerSelectOpen} onSubmit={handleNewHandwritten} />

      <div className="handwrittens__container">
        <div className="handwrittens">
          <h1>Handwrittens</h1>
          <div className="handwrittens__top-buttons">
            <Button onClick={() => setOpenSearch(true)}>Search</Button>
            { user.type === 'office' && <Button onClick={() => setCustomerSelectOpen(true)} data-id="new-btn">New</Button> }
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
          { loading && <Loading /> }
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
                      <tr key={handwritten.id} onClick={() => handleFocusHandwritten(handwritten)} style={ focusedHandwritten && handwritten.id === focusedHandwritten.id ? { border: 'solid 3px var(--yellow-2)' } : {} }>
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
                pageSize={LIMIT}
              />
            </div>
          }
        </div>

        {focusedHandwritten &&
          <HandwrittenItemsTable
            className="handwritten-items-table--handwrittens-page"
            handwritten={focusedHandwritten}
            handwrittenItems={focusedHandwritten.handwrittenItems}
            setHandwritten={setFocusedHandwritten}
            taxTotal={taxTotal}
          />
        }
      </div>
    </Layout>
  );
}
