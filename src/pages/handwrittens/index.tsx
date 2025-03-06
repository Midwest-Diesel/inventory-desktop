import CustomerSelectDialog from "@/components/Dialogs/CustomerSelectDialog";
import HandwrittensSearchDialog from "@/components/Dialogs/handwrittens/HandwrittensSearchDialog";
import HandwrittenItemsTable from "@/components/HandwrittenItemsTable";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { handwrittenSearchAtom, userAtom } from "@/scripts/atoms/state";
import { addBlankHandwritten, addHandwritten, getHandwrittenCount, getHandwrittensByDate, getSomeHandwrittens, searchHandwrittens } from "@/scripts/controllers/handwrittensController";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import Link from "next/link";
import { useEffect, useState } from "react";


export const paymentTypes = ['Net 30', 'Wire Transfer', 'EBPP - Secure', 'Visa', 'Mastercard', 'AMEX', 'Discover', 'Comchek', 'T-Check', 'Check', 'Cash', 'Card on File', 'Net 10', 'No Charge'].sort();

export default function Handwrittens() {
  const [user] = useAtom<User>(userAtom);
  const [handwrittenSearchData] = useAtom(handwrittenSearchAtom);
  const [handwrittensData] = useState<Handwritten[]>([]);
  const [handwrittens, setHandwrittens] = useState<Handwritten[]>([]);
  const [focusedHandwritten, setFocusedHandwritten] = useState<Handwritten>(null);
  const [yesterdayInvoices, setYesterdayInvoices] = useState<Handwritten[]>(handwrittensData);
  const [handwrittenCount, setHandwrittenCount] = useState<number[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchData, setSearchData] = useState<any>({});
  const LIMIT = 40;

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

  useEffect(() => setSearchData(handwrittenSearchData), [handwrittenSearchData]);

  const handleChangePage = async (data: any, page: number) => {
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
      setHandwrittens(res.rows);
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
      fax: customer.fax,
      shipToAddress: null,
      shipToAddress2: null,
      shipToCity: null,
      shipToState: null,
      shipToZip: null,
      source: null,
      contactName: customer.contact,
      payment: null,
      salesmanId: user.id,
      phone: customer.phone,
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


  return (
    <Layout title="Handwrittens">
      <HandwrittensSearchDialog open={openSearch} setOpen={setOpenSearch} setHandwrittens={handleSearch} setMinItems={setHandwrittenCount} limit={LIMIT} page={currentPage} />
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
                pageSize={LIMIT}
              />
            </div>
          }
        </div>

        {focusedHandwritten && <HandwrittenItemsTable className="handwritten-items-table--handwrittens-page" handwritten={focusedHandwritten} handwrittenItems={focusedHandwritten.handwrittenItems} setHandwritten={setFocusedHandwritten} /> }
      </div>
    </Layout>
  );
}
