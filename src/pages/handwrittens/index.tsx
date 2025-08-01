import CustomerDropdownDialog from "@/components/Dialogs/CustomerSelectDialog";
import HandwrittensSearchDialog from "@/components/Dialogs/handwrittens/HandwrittensSearchDialog";
import HandwrittenItemsTable from "@/components/Handwrittens/HandwrittenItemsTable";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import { handwrittenSearchAtom, userAtom } from "@/scripts/atoms/state";
import { addHandwritten, getSomeHandwrittens, getYeserdayCOGS, getYeserdaySales, searchHandwrittens } from "@/scripts/services/handwrittensService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import Link from "@/components/Library/Link";
import { useEffect, useState } from "react";
import { useArrowSelector } from "@/hooks/useArrowSelector";


export default function Handwrittens() {
  const [user] = useAtom<User>(userAtom);
  const [handwrittenSearchData] = useAtom(handwrittenSearchAtom);
  const [handwrittensData] = useState<Handwritten[]>([]);
  const [handwrittens, setHandwrittens] = useState<Handwritten[]>([]);
  const [focusedHandwritten, setFocusedHandwritten] = useState<Handwritten | null>(null);
  const [handwrittenCount, setHandwrittenCount] = useState(0);
  const [openSearch, setOpenSearch] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchData, setSearchData] = useState<any>({});
  const [taxTotal, setTaxTotal] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCOGS, setTotalCOGS] = useState(0);
  useArrowSelector(handwrittens, focusedHandwritten, setFocusedHandwritten);
  const TAX_RATE = 0.08375;
  const LIMIT = 40;

  useEffect(() => {
    const fetchData = async () => {
      setTotalSales(await getYeserdaySales());
      setTotalCOGS(await getYeserdayCOGS());
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
      setHandwrittens(res.rows);
      setHandwrittenCount(res.pageCount);
    } else {
      const res = await getSomeHandwrittens(page, LIMIT);
      setHandwrittens(res.rows);
      setHandwrittenCount(res.pageCount);
    }
    setCurrentPage(page);
    setLoading(false);
  };

  const handleSearch = (results: Handwritten[]) => {
    setHandwrittens(results);
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
      isTaxable: customer.isTaxable,
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
    setHandwrittens(res.rows);
    setHandwrittenCount(res.pageCount);
  };

  const handleFocusHandwritten = (handwritten: Handwritten) => {
    setFocusedHandwritten(handwritten);
    const taxItemsAmount = handwritten && handwritten.handwrittenItems.map((item) => (item?.qty ?? 0) * (item?.unitPrice ?? 0)).reduce((acc, cur) => acc + cur, 0);
    setTaxTotal(Number((taxItemsAmount * TAX_RATE).toFixed(2)));
  };


  return (
    <Layout title="Handwrittens">
      <HandwrittensSearchDialog open={openSearch} setOpen={setOpenSearch} setHandwrittens={handleSearch} setMinItems={setHandwrittenCount} limit={LIMIT} />
      <CustomerDropdownDialog open={customerSelectOpen} setOpen={setCustomerSelectOpen} onSubmit={handleNewHandwritten} />

      <div className="handwrittens__container">
        <div className="handwrittens">
          <h1>Handwrittens</h1>
          <div className="handwrittens__top-buttons">
            <Button onClick={() => setOpenSearch(true)}>Search</Button>
            { user.type === 'office' && <Button onClick={() => setCustomerSelectOpen(true)} data-testid="new-btn">New</Button> }
          </div>
          <div className="handwrittens__top-bar">
            <div className="handwrittens__top-bar--count-block">
              <h4>Yesterday&apos;s COGS</h4>
              <p>{ formatCurrency(totalCOGS) }</p>
            </div>
            <div className="handwrittens__top-bar--count-block">
              <h4>Yesterday&apos;s Sales</h4>
              <p>{ formatCurrency(totalSales) }</p>
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
                        <td><Link href={`/handwrittens/${handwritten.id}`} data-testid="link">{ handwritten.id }</Link></td>
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
                pageCount={handwrittenCount}
                pageSize={LIMIT}
              />
            </div>
          }
        </div>

        {focusedHandwritten &&
          <HandwrittenItemsTable
            className="handwritten-items-table--handwrittens-page"
            handwritten={focusedHandwritten}
            setHandwritten={setFocusedHandwritten}
            taxTotal={taxTotal}
          />
        }
      </div>
    </Layout>
  );
}
