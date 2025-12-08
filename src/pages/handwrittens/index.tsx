import { Layout } from "@/components/Layout";
import CustomerDropdownDialog from "@/components/customers/dialogs/CustomerSelectDialog";
import HandwrittensSearchDialog from "@/components/handwrittens/dialogs/HandwrittensSearchDialog";
import HandwrittenItemsTable from "@/components/handwrittens/HandwrittenItemsTable";
import Button from "@/components/library/Button";
import Loading from "@/components/library/Loading";
import Pagination from "@/components/library/Pagination";
import Table from "@/components/library/Table";
import { userAtom } from "@/scripts/atoms/state";
import { addHandwritten, getSomeHandwrittens, getYeserdayCOGS, getYeserdaySales, HandwrittenSearch, searchHandwrittens } from "@/scripts/services/handwrittensService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import Link from "@/components/library/Link";
import { useState } from "react";
import { useArrowSelector } from "@/hooks/useArrowSelector";
import { useQuery, useQueryClient } from "@tanstack/react-query";


const LIMIT = 40;

export default function Handwrittens() {
  const [user] = useAtom<User>(userAtom);
  const [focusedHandwritten, setFocusedHandwritten] = useState<Handwritten | null>(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchData, setSearchData] = useState<any>({});
  const queryClient = useQueryClient();

  const { data: totalSales = 0, isFetching: isSalesLoading } = useQuery<number>({
    queryKey: ['yesterdaySales'],
    queryFn: getYeserdaySales
  });

  const { data: totalCOGS = 0, isFetching: isCogsLoading } = useQuery<number>({
    queryKey: ['yesterdayCOGS'],
    queryFn: getYeserdayCOGS
  });

  const { data: handwrittensRes, isFetching } = useQuery<HandwrittenRes>({
    queryKey: ['handwrittens', currentPage, searchData],
    queryFn: async () => {
      const hasValidSearchCriteria =
        searchData.id ||
        searchData.date ||
        (searchData.poNum && searchData.poNum !== '*') ||
        (searchData.billToCompany && searchData.billToCompany !== '*') ||
        (searchData.shipToCompany && searchData.shipToCompany !== '*') ||
        searchData.source ||
        searchData.payment;

      if (hasValidSearchCriteria) {
        return await searchHandwrittens({
          ...searchData,
          offset: (currentPage - 1) * LIMIT
        });
      }
      return await getSomeHandwrittens(currentPage, LIMIT);
    }
  });

  useArrowSelector(handwrittensRes?.rows ?? [], focusedHandwritten, setFocusedHandwritten);

  const handleChangePage = (_: any, page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const handleSearch = (results: Handwritten[], pageCount: number, search: HandwrittenSearch) => {
    setSearchData(search);
    queryClient.setQueryData(['handwrittens', currentPage, searchData], {
      rows: results,
      pageCount
    });
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
    queryClient.invalidateQueries({ queryKey: ['handwrittens'] });
    setCurrentPage(1);
  };

  const handleFocusHandwritten = (handwritten: Handwritten) => {
    setFocusedHandwritten(handwritten);
  };


  return (
    <Layout title="Handwrittens">
      <HandwrittensSearchDialog
        open={openSearch}
        setOpen={setOpenSearch}
        handleSearch={handleSearch}
        limit={LIMIT}
      />
      <CustomerDropdownDialog
        open={customerSelectOpen}
        setOpen={setCustomerSelectOpen}
        onSubmit={handleNewHandwritten}
      />

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
              <p>{ isCogsLoading ? 'Loading...' : formatCurrency(totalCOGS) }</p>
            </div>
            <div className="handwrittens__top-bar--count-block">
              <h4>Yesterday&apos;s Sales</h4>
              <p>{ isSalesLoading ? 'Loading...' : formatCurrency(totalSales) }</p>
            </div>
          </div>

          { isFetching && <Loading /> }
          
          {handwrittensRes &&
            <>
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
                    {handwrittensRes.rows.map((handwritten: Handwritten) => {
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
              </div>
              <Pagination
                data={handwrittensRes.rows}
                setData={handleChangePage}
                pageCount={handwrittensRes.pageCount}
                pageSize={LIMIT}
              />
            </>
          }
        </div>

        {focusedHandwritten &&
          <HandwrittenItemsTable
            className="handwritten-items-table--handwrittens-page"
            handwritten={focusedHandwritten}
            setHandwritten={setFocusedHandwritten}
          />
        }
      </div>
    </Layout>
  );
}
