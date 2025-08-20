import AllCompaniesDialog from "@/components/Dialogs/reports/AllCompaniesDialog";
import AllEnginesDialog from "@/components/Dialogs/reports/AllEnginesDialog";
import AllPartsDialog from "@/components/Dialogs/reports/AllPartsDialog";
import AllSalesmenDialog from "@/components/Dialogs/reports/AllSalesmenDialog";
import AllSourcesDialog from "@/components/Dialogs/reports/AllSourcesDialog";
import ArielSalesDialog from "@/components/Dialogs/reports/ArielSalesDialog";
import HandwrittenCompanyDialog from "@/components/Dialogs/reports/HandwrittenCompanyDialog";
import PartDescDialog from "@/components/Dialogs/reports/PartDescDialog";
import PricingChangesDialog from "@/components/Dialogs/reports/PricingChangesDialog";
import RecentSearchesDialog from "@/components/Dialogs/reports/RecentSearchesDialog";
import SingleCompanyDialog from "@/components/Dialogs/reports/SingleCompanyDialog";
import SingleCompanyEnginesDialog from "@/components/Dialogs/reports/SingleCompanyEnginesDialog";
import SingleCompanyPartsDialog from "@/components/Dialogs/reports/SingleCompanyPartsDialog";
import TheMachinesDialog from "@/components/Dialogs/reports/TheMachinesDialog";
import Button from "@/components/Library/Button";
import AllCompaniesTable from "@/components/Reports/AllCompaniesTable";
import AllEnginesTable from "@/components/Reports/AllEnginesTable";
import AllPartsTable from "@/components/Reports/AllPartsTable";
import AllSalesmenTable from "@/components/Reports/AllSalesmenTable";
import AllSourcesTable from "@/components/Reports/AllSourcesTable";
import ArielSalesTable from "@/components/Reports/ArielSalesTable";
import HandwrittenCompanyTable from "@/components/Reports/HandwrittenCompayTable";
import InventoryValueTable from "@/components/Reports/InventoryValueTable";
import NoLocationPartsTable from "@/components/Reports/NoLocationPartsTable";
import OutstandingCoresTable from "@/components/Reports/OutstandingCoresTable";
import PartDescTable from "@/components/Reports/PartDescTable";
import PBBTable from "@/components/Reports/PBBTable";
import PricingChanges from "@/components/Reports/PricingChangesTable/PricingChanges";
import RecentSearchesTable from "@/components/Reports/RecentSearchesTable";
import SingleCompanyEnginesTable from "@/components/Reports/SingleCompanyEnginesTable";
import SingleCompanyPartsTable from "@/components/Reports/SingleCompanyPartsTable";
import SingleCompanyTable from "@/components/Reports/SingleCompanyTable";
import TheMachinesTable from "@/components/Reports/TheMachinesTable";
import { useNavState } from "@/hooks/useNavState";
import { allCompaniesReportAtom, allEnginesReportAtom, allPartsReportAtom, allSalesmenReportAtom, allSourcesReportAtom, arielSalesReportAtom, enginesCompanyReportAtom, handwrittensCompanyReportAtom, noLocationPartsReportAtom, outstandingHighCoresReportAtom, partDescReportAtom, partsCompanyReportAtom, PBBListReportAtom, pricingChangesReportAtom, recentSearchesReportAtom, singleCompanyReportAtom, theMachinesReportAtom } from "@/scripts/atoms/reports";
import { reportNoLocationParts, reportOutstandingCores, reportPBB } from "@/scripts/services/reportsService";
import { useAtom } from "jotai";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";


export default function ReportsContainer() {
  const { push } = useNavState();
  const [searchParams] = useSearchParams();
  const [openedReport, setOpenedReport] = useState('');
  const [singleCompanyData, setSingleCompanyData] = useAtom<SingleCompany[]>(singleCompanyReportAtom);
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


  return (
    <>
      {!openedTable ?
        <div className="reports-page">
          <h1>Reports</h1>

          <div className="reports-page__content">
            <div className="reports-page-section">
              <h2>Sales Reports</h2>
              <div className="reports-page-section__buttons">
                <Button onClick={() => toggleOpenedReport('single-company')}>Single Company/Keyword</Button>
                <Button onClick={() => toggleOpenedReport('all-companies')}>All Companies</Button>
                <Button onClick={() => toggleOpenedReport('all-parts')}>All Parts</Button>
                <Button onClick={() => toggleOpenedReport('part-desc')}>Single Part Description</Button>
                <Button onClick={() => toggleOpenedReport('all-engines')}>All Engines</Button>
                <Button onClick={() => toggleOpenedReport('all-sources')}>All Sources</Button>
                <Button onClick={() => toggleOpenedReport('all-salesmen')}>All Salesmen</Button>
                <Button onClick={() => toggleOpenedReport('the-machines')}>The Machines</Button>
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
                <Button onClick={() => toggleOpenedReport('handwrittens-company')}>Handwrittens - Single Company/Keyword</Button>
                <Button onClick={handleSearchPBB}>PBB List</Button>
                <Button onClick={handleSearchNoLocationParts}>No Location Parts</Button>
                <Button onClick={() => toggleOpenedReport('recent-searches')}>Recent Searches</Button>
                <Button onClick={handleSearchOutstandingCores}>Outstanding High Cores</Button>
                <Button onClick={() => toggleOpenedReport('pricing-changes')}>Pricing Changes</Button>
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
          { isTableOpened('handwrittens-company') && <HandwrittenCompanyTable closeTable={() => openTable('')} data={handwrittensCompanyData} /> }
          { isTableOpened('pbb') && <PBBTable closeTable={() => openTable('')} data={PBBListData} /> }
          { isTableOpened('no-location-parts') && <NoLocationPartsTable closeTable={() => openTable('')} data={noLocationPartsData} /> }
          { isTableOpened('recent-searches') && <RecentSearchesTable closeTable={() => openTable('')} data={recentSearchesData} /> }
          { isTableOpened('outstanding-high-cores') && <OutstandingCoresTable closeTable={() => openTable('')} data={outstandingHighCoresData} /> }
          { isTableOpened('pricing-changes') && <PricingChanges closeTable={() => openTable('')} data={pricingChangesData} /> }
          { isTableOpened('inventory-value') && <InventoryValueTable closeTable={() => openTable('')} /> }
        </>
      }
    </>
  );
}
