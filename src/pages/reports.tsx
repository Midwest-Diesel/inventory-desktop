import { Layout } from "@/components/Layout";
import AllCompaniesDialog from "@/components/reports/dialogs/AllCompaniesDialog";
import AllEnginesDialog from "@/components/reports/dialogs/AllEnginesDialog";
import AllPartsDialog from "@/components/reports/dialogs/AllPartsDialog";
import AllSalesmenDialog from "@/components/reports/dialogs/AllSalesmenDialog";
import AllSourcesDialog from "@/components/reports/dialogs/AllSourcesDialog";
import ArielSalesDialog from "@/components/reports/dialogs/ArielSalesDialog";
import HandwrittenCompanyDialog from "@/components/reports/dialogs/HandwrittenCompanyDialog";
import PartDescDialog from "@/components/reports/dialogs/PartDescDialog";
import PricingChangesDialog from "@/components/reports/dialogs/PricingChangesDialog";
import RecentSearchesDialog from "@/components/reports/dialogs/RecentSearchesDialog";
import SalesByBillToCompanyDialog from "@/components/reports/dialogs/SalesByBillToCompanyDialog";
import SingleCompanyDialog from "@/components/reports/dialogs/SingleCompanyDialog";
import SingleCompanyEnginesDialog from "@/components/reports/dialogs/SingleCompanyEnginesDialog";
import SingleCompanyPartsDialog from "@/components/reports/dialogs/SingleCompanyPartsDialog";
import TheMachinesDialog from "@/components/reports/dialogs/TheMachinesDialog";
import Button from "@/components/library/Button";
import AllCompaniesTable from "@/components/reports/AllCompaniesTable";
import AllEnginesTable from "@/components/reports/AllEnginesTable";
import AllPartsTable from "@/components/reports/AllPartsTable";
import AllSalesmenTable from "@/components/reports/AllSalesmenTable";
import AllSourcesTable from "@/components/reports/AllSourcesTable";
import ArielSalesTable from "@/components/reports/ArielSalesTable";
import HandwrittenCompanyTable from "@/components/reports/HandwrittenCompayTable";
import InventoryValueTable from "@/components/reports/InventoryValueTable";
import NoLocationPartsTable from "@/components/reports/NoLocationPartsTable";
import OutstandingCoresTable from "@/components/reports/OutstandingCoresTable";
import PartDescTable from "@/components/reports/PartDescTable";
import PBBTable from "@/components/reports/PBBTable";
import PricingChanges from "@/components/reports/pricingChangesTable/PricingChanges";
import RecentSearchesTable from "@/components/reports/RecentSearchesTable";
import SalesByBillToCompanyTable from "@/components/reports/SalesByBillToCompanyTable";
import SingleCompanyEnginesTable from "@/components/reports/SingleCompanyEnginesTable";
import SingleCompanyPartsTable from "@/components/reports/SingleCompanyPartsTable";
import SingleCompanyTable from "@/components/reports/SingleCompanyTable";
import TheMachinesTable from "@/components/reports/TheMachinesTable";
import { useNavState } from "@/hooks/useNavState";
import { allCompaniesReportAtom, allEnginesReportAtom, allPartsReportAtom, allSalesmenReportAtom, allSourcesReportAtom, arielSalesReportAtom, enginesCompanyReportAtom, handwrittensCompanyReportAtom, noLocationPartsReportAtom, outstandingHighCoresReportAtom, partDescReportAtom, partsCompanyReportAtom, PBBListReportAtom, pendingHandwrittensReportAtom, pricingChangesReportAtom, recentSearchesReportAtom, salesByBillToCompanyReportAtom, singleCompanyReportAtom, theMachinesReportAtom } from "@/scripts/atoms/reports";
import { reportNoLocationParts, reportOutstandingCores, reportPBB } from "@/scripts/services/reportsService";
import { useAtom } from "jotai";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PendingHandwrittensTable from "@/components/reports/PendingHandwrittensTable";
import { getSomeHandwrittensByInvoiceStatus } from "@/scripts/services/handwrittensService";


export default function Reports() {
  const { push } = useNavState();
  const [searchParams] = useSearchParams();
  const [openedReport, setOpenedReport] = useState('');
  const [singleCompanyData, setSingleCompanyData] = useAtom<SingleCompany[]>(singleCompanyReportAtom);
  const [salesByBillToCompanyData, setSalesByBillToCompanyData] = useAtom<SingleCompany[]>(salesByBillToCompanyReportAtom);
  const [allCompaniesData, setAllCompaniesData] = useAtom<AllCompaniesReport[]>(allCompaniesReportAtom);
  const [allPartsData, setAllPartsData] = useAtom<AllPartsReport[]>(allPartsReportAtom);
  const [partDescData, setPartDescData] = useAtom<PartDescReport[]>(partDescReportAtom);
  const [allEnginesData, setAllEnginesData] = useAtom<AllEnginesReport[]>(allEnginesReportAtom);
  const [allSourcesData, setAllSourcesData] = useAtom<AllSourcesReport[]>(allSourcesReportAtom);
  const [allSalesmenData, setAllSalesmenData] = useAtom<AllSalesmenReport[]>(allSalesmenReportAtom);
  const [theMachinesData, setTheMachinesData] = useAtom<TheMachinesReport[]>(theMachinesReportAtom);
  const [arielSalesData, setArielSalesData] = useAtom<ArielSalesReport[]>(arielSalesReportAtom);
  const [partsCompanyData, setPartsCompanyData] = useAtom<SingleCompanyParts[]>(partsCompanyReportAtom);
  const [enginesCompanyData, setEnginesCompanyData] = useAtom<SingleCompanyEngines[]>(enginesCompanyReportAtom);
  const [pendingHandwrittensData, setPendingHandwrittensData] = useAtom<Handwritten[]>(pendingHandwrittensReportAtom);
  const [handwrittensCompanyData, setHandwrittensCompanyData] = useAtom<HandwrittensCompanyReport[]>(handwrittensCompanyReportAtom);
  const [PBBListData, setPBBListData] = useAtom<PBBReport[]>(PBBListReportAtom);
  const [noLocationPartsData, setNoLocationPartsData] = useAtom<NoLocationPartsReport[]>(noLocationPartsReportAtom);
  const [recentSearchesData, setRecentSearchesData] = useAtom<RecentPartSearch[]>(recentSearchesReportAtom);
  const [outstandingHighCoresData, setOutstandingHighCoresData] = useAtom<OutstandingCoresReport[]>(outstandingHighCoresReportAtom);
  const [pricingChangesData, setPricingChangesData] = useAtom<PricingChangesReport[]>(pricingChangesReportAtom);
  const openedTable = searchParams.get('r') ?? '';

  const toggleOpenedReport = (name: string) => {
    setOpenedReport(openedReport === name ? '' : name);
  };

  const isReportOpened = (name: string) => {
    return openedReport === name;
  };
  const isTableOpened = (name: string) => {
    return openedTable === name;
  };

  const openTable = async (table: string) => {
    await push('Report', table ? `/reports?r=${table}` : '/reports');
  };

  const handleSearchPBB = async () => {
    const res = await reportPBB();
    setPBBListData(res);
    await openTable('pbb');
  };

  const handleSearchNoLocationParts = async () => {
    const res = await reportNoLocationParts();
    setNoLocationPartsData(res);
    await openTable('no-location-parts');
  };
  
  const handleSearchOutstandingCores = async () => {
    const res = await reportOutstandingCores();
    setOutstandingHighCoresData(res);
    await openTable('outstanding-high-cores');
  };

  const handlePendingHandwrittens = async () => {
    const res = await getSomeHandwrittensByInvoiceStatus(1, 9999, 'INVOICE PENDING');
    setPendingHandwrittensData(res.rows);
    await openTable('pending-handwrittens');
  };


  return (
    <Layout title="Reports">
      {!openedTable ?
        <div className="reports-page">
          <h1>Reports</h1>

          <div className="reports-page__content">
            <div className="reports-page-section">
              <h2>Sales Reports</h2>
              <div className="reports-page-section__buttons">
                <Button onClick={() => toggleOpenedReport('single-company')}>Sales by Customer</Button>
                <Button onClick={() => toggleOpenedReport('sales-by-bill-to-company')}>Sales by BillToCompany</Button>
                <Button onClick={() => toggleOpenedReport('all-companies')}>All Companies</Button>
                <Button onClick={() => toggleOpenedReport('all-parts')}>All Parts</Button>
                <Button onClick={() => toggleOpenedReport('part-desc')}>Sales by Part Desc</Button>
                <Button onClick={() => toggleOpenedReport('all-engines')}>All Engines</Button>
                <Button onClick={() => toggleOpenedReport('all-sources')}>All Sources</Button>
                <Button onClick={() => toggleOpenedReport('all-salesmen')}>All Salesmen</Button>
                <Button onClick={() => toggleOpenedReport('ariel-sales')}>Ariel Sales</Button>
              </div>
            </div>

            <div className="reports-page-section">
              <h2>Purchase Reports</h2>
              <div className="reports-page-section__buttons">
                <Button onClick={() => toggleOpenedReport('parts-company')}>Parts - Single Company</Button>
                <Button onClick={() => toggleOpenedReport('engines-company')}>Engines - Single Company</Button>
              </div>
            </div>

            <div className="reports-page-section">
              <h2>Misc Reports</h2>
              <div className="reports-page-section__buttons">
                <Button onClick={handlePendingHandwrittens}>Pending Handwrittens</Button>
                <Button onClick={() => toggleOpenedReport('handwrittens-company')}>Handwrittens by Year</Button>
                <Button onClick={handleSearchPBB}>PBB List</Button>
                <Button onClick={handleSearchNoLocationParts}>No Location Parts</Button>
                <Button onClick={() => toggleOpenedReport('recent-searches')}>Recent Searches</Button>
                <Button onClick={handleSearchOutstandingCores}>Outstanding High Cores</Button>
                <Button onClick={() => toggleOpenedReport('pricing-changes')}>Pricing Changes</Button>
                <Button onClick={() => toggleOpenedReport('the-machines')}>Part Availability</Button>
                <Button onClick={() => openTable('inventory-value')}>Inventory Accounting</Button>
              </div>
            </div>
          </div>

          {isReportOpened('single-company') &&
            <SingleCompanyDialog
              open={isReportOpened('single-company')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('single-company')}
              setTableData={setSingleCompanyData}
            />
          }
          {isReportOpened('sales-by-bill-to-company') &&
            <SalesByBillToCompanyDialog
              open={isReportOpened('sales-by-bill-to-company')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('sales-by-bill-to-company')}
              setTableData={setSalesByBillToCompanyData}
            />
          }
          {isReportOpened('all-companies') &&
            <AllCompaniesDialog
              open={isReportOpened('all-companies')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('all-companies')}
              setTableData={setAllCompaniesData}
            />
          }
          {isReportOpened('all-parts') &&
            <AllPartsDialog
              open={isReportOpened('all-parts')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('all-parts')}
              setTableData={setAllPartsData}
            />
          }
          {isReportOpened('part-desc') &&
            <PartDescDialog
              open={isReportOpened('part-desc')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('part-desc')}
              setTableData={setPartDescData}
            />
          }
          {isReportOpened('all-engines') &&
            <AllEnginesDialog
              open={isReportOpened('all-engines')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('all-engines')}
              setTableData={setAllEnginesData}
            />
          }
          {isReportOpened('all-sources') &&
            <AllSourcesDialog
              open={isReportOpened('all-sources')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('all-sources')}
              setTableData={setAllSourcesData}
            />
          }
          {isReportOpened('all-salesmen') &&
            <AllSalesmenDialog
              open={isReportOpened('all-salesmen')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('all-salesmen')}
              setTableData={setAllSalesmenData}
            />
          }
          {isReportOpened('the-machines') &&
            <TheMachinesDialog
              open={isReportOpened('the-machines')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('the-machines')}
              setTableData={setTheMachinesData}
            />
          }
          {isReportOpened('ariel-sales') &&
            <ArielSalesDialog
              open={isReportOpened('ariel-sales')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('ariel-sales')}
              setTableData={setArielSalesData}
            />
          }
          {isReportOpened('parts-company') &&
            <SingleCompanyPartsDialog
              open={isReportOpened('parts-company')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('parts-company')}
              setTableData={setPartsCompanyData}
            />
          }
          {isReportOpened('engines-company') &&
            <SingleCompanyEnginesDialog
              open={isReportOpened('engines-company')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('engines-company')}
              setTableData={setEnginesCompanyData}
            />
          }
          {isReportOpened('handwrittens-company') &&
            <HandwrittenCompanyDialog
              open={isReportOpened('handwrittens-company')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('handwrittens-company')}
              setTableData={setHandwrittensCompanyData}
            />
          }
          {isReportOpened('recent-searches') &&
            <RecentSearchesDialog
              open={isReportOpened('recent-searches')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('recent-searches')}
              setTableData={setRecentSearchesData}
            />
          }
          {isReportOpened('pricing-changes') &&
            <PricingChangesDialog
              open={isReportOpened('pricing-changes')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => openTable('pricing-changes')}
              setTableData={setPricingChangesData}
            />
          }
        </div>
        :
        <>
          { isTableOpened('single-company') && <SingleCompanyTable closeTable={() => openTable('')} data={singleCompanyData} /> }
          { isTableOpened('sales-by-bill-to-company') && <SalesByBillToCompanyTable closeTable={() => openTable('')} data={salesByBillToCompanyData} /> }
          { isTableOpened('all-companies') && <AllCompaniesTable closeTable={() => openTable('')} data={allCompaniesData} /> }
          { isTableOpened('all-parts') && <AllPartsTable closeTable={() => openTable('')} data={allPartsData} /> }
          { isTableOpened('part-desc') && <PartDescTable closeTable={() => openTable('')} data={partDescData} /> }
          { isTableOpened('all-engines') && <AllEnginesTable closeTable={() => openTable('')} data={allEnginesData} /> }
          { isTableOpened('all-sources') && <AllSourcesTable closeTable={() => openTable('')} data={allSourcesData} /> }
          { isTableOpened('all-salesmen') && <AllSalesmenTable closeTable={() => openTable('')} data={allSalesmenData} /> }
          { isTableOpened('the-machines') && <TheMachinesTable closeTable={() => openTable('')} data={theMachinesData} /> }
          { isTableOpened('ariel-sales') && <ArielSalesTable closeTable={() => openTable('')} data={arielSalesData} /> }
          { isTableOpened('parts-company') && <SingleCompanyPartsTable closeTable={() => openTable('')} data={partsCompanyData} /> }
          { isTableOpened('engines-company') && <SingleCompanyEnginesTable closeTable={() => openTable('')} data={enginesCompanyData} /> }
          { isTableOpened('pending-handwrittens') && <PendingHandwrittensTable closeTable={() => openTable('')} data={pendingHandwrittensData} /> }
          { isTableOpened('handwrittens-company') && <HandwrittenCompanyTable closeTable={() => openTable('')} data={handwrittensCompanyData} /> }
          { isTableOpened('pbb') && <PBBTable closeTable={() => openTable('')} data={PBBListData} /> }
          { isTableOpened('no-location-parts') && <NoLocationPartsTable closeTable={() => openTable('')} data={noLocationPartsData} /> }
          { isTableOpened('recent-searches') && <RecentSearchesTable closeTable={() => openTable('')} data={recentSearchesData} /> }
          { isTableOpened('outstanding-high-cores') && <OutstandingCoresTable closeTable={() => openTable('')} data={outstandingHighCoresData} /> }
          { isTableOpened('pricing-changes') && <PricingChanges closeTable={() => openTable('')} data={pricingChangesData} /> }
          { isTableOpened('inventory-value') && <InventoryValueTable closeTable={() => openTable('')} /> }
        </>
      }
    </Layout>
  );
}
