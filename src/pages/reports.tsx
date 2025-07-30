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
import { Layout } from "@/components/Layout";
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
import { reportNoLocationParts, reportOutstandingCores, reportPBB } from "@/scripts/services/reportsService";
import { useState } from "react";


export default function Reports() {
  const [openedReport, setOpenedReport] = useState('');
  const [openedTable, setOpenedTable] = useState('');
  const [singleCompanyData, setSingleCompanyData] = useState<SingleCompany[]>([]);
  const [allCompaniesData, setAllCompaniesData] = useState<AllCompaniesReport[]>([]);
  const [allPartsData, setAllPartsData] = useState<AllPartsReport[]>([]);
  const [partDescData, setPartDescData] = useState<PartDescReport[]>([]);
  const [allEnginesData, setAllEnginesData] = useState<AllEnginesReport[]>([]);
  const [allSourcesData, setAllSourcesData] = useState<AllSourcesReport[]>([]);
  const [allSalesmenData, setAllSalesmenData] = useState<AllSalesmenReport[]>([]);
  const [theMachinesData, setTheMachinesData] = useState<TheMachinesReport[]>([]);
  const [arielSalesData, setArielSalesData] = useState<ArielSalesReport[]>([]);
  const [partsCompanyData, setPartsCompanyData] = useState<SingleCompanyParts[]>([]);
  const [enginesCompanyData, setEnginesCompanyData] = useState<SingleCompanyEngines[]>([]);
  const [handwrittensCompanyData, setHandwrittensCompanyData] = useState<HandwrittensCompanyReport[]>([]);
  const [PBBListData, setPBBListData] = useState<PBBReport[]>([]);
  const [noLocationPartsData, setNoLocationPartsData] = useState<NoLocationPartsReport[]>([]);
  const [recentSearchesData, setRecentSearchesData] = useState<RecentPartSearch[]>([]);
  const [outstandingHighCoresData, setOutstandingHighCoresData] = useState<OutstandingCoresReport[]>([]);
  const [pricingChangesData, setPricingChangesData] = useState<PricingChangesReport[]>([]);
  const [reportsPageOpen, setReportsPageOpen] = useState(true);

  const toggleOpenedReport = (name: string) => {
    setOpenedReport(openedReport === name ? '' : name);
  };

  const isReportOpened = (name: string) => {
    return openedReport === name;
  };

  const isTableOpened = (name: string) => {
    return openedTable === name;
  };

  const handleSearchPBB = async () => {
    setOpenedTable('PBB');
    setReportsPageOpen(false);
    const res = await reportPBB();
    setPBBListData(res);
  };

  const handleSearchNoLocationParts = async () => {
    setOpenedTable('no-location-parts');
    setReportsPageOpen(false);
    const res = await reportNoLocationParts();
    setNoLocationPartsData(res);
  };
  
  const handleSearchOutstandingCores = async () => {
    setOpenedTable('outstanding-high-cores');
    setReportsPageOpen(false);
    const res = await reportOutstandingCores();
    setOutstandingHighCoresData(res);
  };


  return (
    <Layout title="Reports">
      {reportsPageOpen ?
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
                <Button
                  onClick={() => {
                    setOpenedTable('inventory-value');
                    setReportsPageOpen(false);
                  }}
                >
                  Inventory Accounting
                </Button>
              </div>
            </div>
          </div>

          {isReportOpened('single-company') &&
            <SingleCompanyDialog
              open={isReportOpened('single-company')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('single-company')}
              setTableData={setSingleCompanyData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('all-companies') &&
            <AllCompaniesDialog
              open={isReportOpened('all-companies')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('all-companies')}
              setTableData={setAllCompaniesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('all-parts') &&
            <AllPartsDialog
              open={isReportOpened('all-parts')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('all-parts')}
              setTableData={setAllPartsData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('part-desc') &&
            <PartDescDialog
              open={isReportOpened('part-desc')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('part-desc')}
              setTableData={setPartDescData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('all-engines') &&
            <AllEnginesDialog
              open={isReportOpened('all-engines')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('all-engines')}
              setTableData={setAllEnginesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('all-sources') &&
            <AllSourcesDialog
              open={isReportOpened('all-sources')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('all-sources')}
              setTableData={setAllSourcesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('all-salesmen') &&
            <AllSalesmenDialog
              open={isReportOpened('all-salesmen')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('all-salesmen')}
              setTableData={setAllSalesmenData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('the-machines') &&
            <TheMachinesDialog
              open={isReportOpened('the-machines')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('the-machines')}
              setTableData={setTheMachinesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('ariel-sales') &&
            <ArielSalesDialog
              open={isReportOpened('ariel-sales')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('ariel-sales')}
              setTableData={setArielSalesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('parts-company') &&
            <SingleCompanyPartsDialog
              open={isReportOpened('parts-company')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('parts-company')}
              setTableData={setPartsCompanyData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('engines-company') &&
            <SingleCompanyEnginesDialog
              open={isReportOpened('engines-company')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('engines-company')}
              setTableData={setEnginesCompanyData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('handwrittens-company') &&
            <HandwrittenCompanyDialog
              open={isReportOpened('handwrittens-company')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('handwrittens-company')}
              setTableData={setHandwrittensCompanyData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('recent-searches') &&
            <RecentSearchesDialog
              open={isReportOpened('recent-searches')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('recent-searches')}
              setTableData={setRecentSearchesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {isReportOpened('pricing-changes') &&
            <PricingChangesDialog
              open={isReportOpened('pricing-changes')}
              setOpen={() => toggleOpenedReport('')}
              openTable={() => setOpenedTable('pricing-changes')}
              setTableData={setPricingChangesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
        </div>
        :
        <>
          { isTableOpened('single-company') && <SingleCompanyTable closeTable={() => setOpenedTable('')} data={singleCompanyData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('all-companies') && <AllCompaniesTable closeTable={() => setOpenedTable('')} data={allCompaniesData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('all-parts') && <AllPartsTable closeTable={() => setOpenedTable('')} data={allPartsData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('part-desc') && <PartDescTable closeTable={() => setOpenedTable('')} data={partDescData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('all-engines') && <AllEnginesTable closeTable={() => setOpenedTable('')} data={allEnginesData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('all-sources') && <AllSourcesTable closeTable={() => setOpenedTable('')} data={allSourcesData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('all-salesmen') && <AllSalesmenTable closeTable={() => setOpenedTable('')} data={allSalesmenData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('the-machines') && <TheMachinesTable closeTable={() => setOpenedTable('')} data={theMachinesData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('ariel-sales') && <ArielSalesTable closeTable={() => setOpenedTable('')} data={arielSalesData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('parts-company') && <SingleCompanyPartsTable closeTable={() => setOpenedTable('')} data={partsCompanyData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('engines-company') && <SingleCompanyEnginesTable closeTable={() => setOpenedTable('')} data={enginesCompanyData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('handwrittens-company') && <HandwrittenCompanyTable closeTable={() => setOpenedTable('')} data={handwrittensCompanyData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('PBB') && <PBBTable closeTable={() => setOpenedTable('')} data={PBBListData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('no-location-parts') && <NoLocationPartsTable closeTable={() => setOpenedTable('')} data={noLocationPartsData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('recent-searches') && <RecentSearchesTable closeTable={() => setOpenedTable('')} data={recentSearchesData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('outstanding-high-cores') && <OutstandingCoresTable closeTable={() => setOpenedTable('')} data={outstandingHighCoresData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('pricing-changes') && <PricingChanges closeTable={() => setOpenedTable('')} data={pricingChangesData} setReportsOpen={setReportsPageOpen} /> }
          { isTableOpened('inventory-value') && <InventoryValueTable closeTable={() => setOpenedTable('')} setReportsOpen={setReportsPageOpen} /> }
        </>
      }
    </Layout>
  );
}













