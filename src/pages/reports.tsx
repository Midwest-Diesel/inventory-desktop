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
import PricingChangesTable from "@/components/Reports/PricingChangesTable";
import RecentSearchesTable from "@/components/Reports/RecentSearchesTable";
import SingleCompanyEnginesTable from "@/components/Reports/SingleCompanyEnginesTable";
import SingleCompanyPartsTable from "@/components/Reports/SingleCompanyPartsTable";
import SingleCompanyTable from "@/components/Reports/SingleCompanyTable";
import TheMachinesTable from "@/components/Reports/TheMachinesTable";
import { reportNoLocationParts, reportOutstandingCores, reportPBB } from "@/scripts/services/reportsService";
import { useState } from "react";


export default function Reports() {
  const [singleCompanyOpen, setSingleCompanyOpen] = useState(false);
  const [singleCompanyTableOpen, setSingleCompanyTableOpen] = useState(false);
  const [singleCompanyData, setSingleCompanyData] = useState<SingleCompany[]>([]);
  const [allCompaniesOpen, setAllCompaniesOpen] = useState(false);
  const [allCompaniesTableOpen, setAllCompaniesTableOpen] = useState(false);
  const [allCompaniesData, setAllCompaniesData] = useState<AllCompaniesReport[]>([]);
  const [allPartsOpen, setAllPartsOpen] = useState(false);
  const [allPartsTableOpen, setAllPartsTableOpen] = useState(false);
  const [allPartsData, setAllPartsData] = useState<AllPartsReport[]>([]);
  const [partDescOpen, setPartDescOpen] = useState(false);
  const [partDescTableOpen, setPartDescTableOpen] = useState(false);
  const [partDescData, setPartDescData] = useState<PartDescReport[]>([]);
  const [allEnginesOpen, setAllEnginesOpen] = useState(false);
  const [allEnginesTableOpen, setAllEnginesTableOpen] = useState(false);
  const [allEnginesData, setAllEnginesData] = useState<AllEnginesReport[]>([]);
  const [allSourcesOpen, setAllSourcesOpen] = useState(false);
  const [allSourcesTableOpen, setAllSourcesTableOpen] = useState(false);
  const [allSourcesData, setAllSourcesData] = useState<AllSourcesReport[]>([]);
  const [allSalesmenOpen, setAllSalesmenOpen] = useState(false);
  const [allSalesmenTableOpen, setAllSalesmenTableOpen] = useState(false);
  const [allSalesmenData, setAllSalesmenData] = useState<AllSalesmenReport[]>([]);
  const [theMachinesOpen, setTheMachinesOpen] = useState(false);
  const [theMachinesTableOpen, setTheMachinesTableOpen] = useState(false);
  const [theMachinesData, setTheMachinesData] = useState<TheMachinesReport[]>([]);
  const [arielSalesOpen, setArielSalesOpen] = useState(false);
  const [arielSalesTableOpen, setArielSalesTableOpen] = useState(false);
  const [arielSalesData, setArielSalesData] = useState<ArielSalesReport[]>([]);
  const [partsCompanyOpen, setPartsCompanyOpen] = useState(false);
  const [partsCompanyTableOpen, setPartsCompanyTableOpen] = useState(false);
  const [partsCompanyData, setPartsCompanyData] = useState<SingleCompanyParts[]>([]);
  const [enginesCompanyOpen, setEnginesCompanyOpen] = useState(false);
  const [enginesCompanyTableOpen, setEnginesCompanyTableOpen] = useState(false);
  const [enginesCompanyData, setEnginesCompanyData] = useState<SingleCompanyEngines[]>([]);
  const [handwrittensCompanyOpen, setHandwrittensCompanyOpen] = useState(false);
  const [handwrittensCompanyTableOpen, setHandwrittensCompanyTableOpen] = useState(false);
  const [handwrittensCompanyData, setHandwrittensCompanyData] = useState<HandwrittensCompanyReport[]>([]);
  const [PBBListTableOpen, setPBBListTableOpen] = useState(false);
  const [PBBListData, setPBBListData] = useState<PBBReport[]>([]);
  const [noLocationPartsTableOpen, setNoLocationPartsTableOpen] = useState(false);
  const [noLocationPartsData, setNoLocationPartsData] = useState<NoLocationPartsReport[]>([]);
  const [recentSearchesOpen, setRecentSearchesOpen] = useState(false);
  const [recentSearchesTableOpen, setRecentSearchesTableOpen] = useState(false);
  const [recentSearchesData, setRecentSearchesData] = useState<RecentPartSearch[]>([]);
  const [outstandingHighCoresTableOpen, setOutstandingHighCoresTableOpen] = useState(false);
  const [outstandingHighCoresData, setOutstandingHighCoresData] = useState<OutstandingCoresReport[]>([]);
  const [pricingChangesOpen, setPricingChangesOpen] = useState(false);
  const [pricingChangesTableOpen, setPricingChangesTableOpen] = useState(false);
  const [pricingChangesData, setPricingChangesData] = useState<PricingChangesReport[]>([]);
  const [inventoryValueTableOpen, setInventoryValueTableOpen] = useState(false);
  const [reportsPageOpen, setReportsPageOpen] = useState(true);

  const handleSearchPBB = async () => {
    setPBBListTableOpen(true);
    setReportsPageOpen(false);
    const res = await reportPBB();
    setPBBListData(res);
  };

  const handleSearchNoLocationParts = async () => {
    setNoLocationPartsTableOpen(true);
    setReportsPageOpen(false);
    const res = await reportNoLocationParts();
    setNoLocationPartsData(res);
  };
  
  const handleSearchOutstandingCores = async () => {
    setOutstandingHighCoresTableOpen(true);
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
                <Button onClick={() => setSingleCompanyOpen(!singleCompanyOpen)}>Single Company/Keyword</Button>
                <Button onClick={() => setAllCompaniesOpen(!allCompaniesOpen)}>All Companies</Button>
                <Button onClick={() => setAllPartsOpen(!allPartsOpen)}>All Parts</Button>
                <Button onClick={() => setPartDescOpen(!partDescOpen)}>Single Part Description</Button>
                <Button onClick={() => setAllEnginesOpen(!allEnginesOpen)}>All Engines</Button>
                <Button onClick={() => setAllSourcesOpen(!allSourcesOpen)}>All Sources</Button>
                <Button onClick={() => setAllSalesmenOpen(!allSalesmenOpen)}>All Salesmen</Button>
                <Button onClick={() => setTheMachinesOpen(!theMachinesOpen)}>The Machines</Button>
                <Button onClick={() => setArielSalesOpen(!arielSalesOpen)}>Ariel Sales</Button>
              </div>
            </div>

            <div className="reports-page-section">
              <h2>Purchase Reports</h2>
              <div className="reports-page-section__buttons">
                <Button onClick={() => setPartsCompanyOpen(!partsCompanyOpen)}>Parts - Single Company</Button>
                <Button onClick={() => setEnginesCompanyOpen(!enginesCompanyOpen)}>Engines - Single Company</Button>
              </div>
            </div>

            <div className="reports-page-section">
              <h2>Misc Reports</h2>
              <div className="reports-page-section__buttons">
                <Button onClick={() => setHandwrittensCompanyOpen(!handwrittensCompanyOpen)}>Handwrittens - Single Company/Keyword</Button>
                <Button onClick={handleSearchPBB}>PBB List</Button>
                <Button onClick={handleSearchNoLocationParts}>No Location Parts</Button>
                <Button onClick={() => setRecentSearchesOpen(!recentSearchesOpen)}>Recent Searches</Button>
                {/* <Button onClick={() => setEmailAddressesOpen(!emailAddressesOpen)}>Email Addresses</Button> */}
                <Button onClick={handleSearchOutstandingCores}>Outstanding High Cores</Button>
                <Button onClick={() => setPricingChangesOpen(!pricingChangesOpen)}>Pricing Changes</Button>
                <Button
                  onClick={() => {
                    setInventoryValueTableOpen(true);
                    setReportsPageOpen(false);
                  }}
                >
                  Inventory Accounting
                </Button>
              </div>
            </div>
          </div>

          {singleCompanyOpen &&
            <SingleCompanyDialog
              open={singleCompanyOpen}
              setOpen={setSingleCompanyOpen}
              setTableOpen={setSingleCompanyTableOpen}
              setTableData={setSingleCompanyData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {allCompaniesOpen &&
            <AllCompaniesDialog
              open={allCompaniesOpen}
              setOpen={setAllCompaniesOpen}
              setTableOpen={setAllCompaniesTableOpen}
              setTableData={setAllCompaniesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {allPartsOpen &&
            <AllPartsDialog
              open={allPartsOpen}
              setOpen={setAllPartsOpen}
              setTableOpen={setAllPartsTableOpen}
              setTableData={setAllPartsData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {partDescOpen &&
            <PartDescDialog
              open={partDescOpen}
              setOpen={setPartDescOpen}
              setTableOpen={setPartDescTableOpen}
              setTableData={setPartDescData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {allEnginesOpen &&
            <AllEnginesDialog
              open={allEnginesOpen}
              setOpen={setAllEnginesOpen}
              setTableOpen={setAllEnginesTableOpen}
              setTableData={setAllEnginesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {allSourcesOpen &&
            <AllSourcesDialog
              open={allSourcesOpen}
              setOpen={setAllSourcesOpen}
              setTableOpen={setAllSourcesTableOpen}
              setTableData={setAllSourcesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {allSalesmenOpen &&
            <AllSalesmenDialog
              open={allSalesmenOpen}
              setOpen={setAllSalesmenOpen}
              setTableOpen={setAllSalesmenTableOpen}
              setTableData={setAllSalesmenData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {theMachinesOpen &&
            <TheMachinesDialog
              open={theMachinesOpen}
              setOpen={setTheMachinesOpen}
              setTableOpen={setTheMachinesTableOpen}
              setTableData={setTheMachinesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {arielSalesOpen &&
            <ArielSalesDialog
              open={arielSalesOpen}
              setOpen={setArielSalesOpen}
              setTableOpen={setArielSalesTableOpen}
              setTableData={setArielSalesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {partsCompanyOpen &&
            <SingleCompanyPartsDialog
              open={partsCompanyOpen}
              setOpen={setPartsCompanyOpen}
              setTableOpen={setPartsCompanyTableOpen}
              setTableData={setPartsCompanyData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {enginesCompanyOpen &&
            <SingleCompanyEnginesDialog
              open={enginesCompanyOpen}
              setOpen={setEnginesCompanyOpen}
              setTableOpen={setEnginesCompanyTableOpen}
              setTableData={setEnginesCompanyData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {handwrittensCompanyOpen &&
            <HandwrittenCompanyDialog
              open={handwrittensCompanyOpen}
              setOpen={setHandwrittensCompanyOpen}
              setTableOpen={setHandwrittensCompanyTableOpen}
              setTableData={setHandwrittensCompanyData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {recentSearchesOpen &&
            <RecentSearchesDialog
              open={recentSearchesOpen}
              setOpen={setRecentSearchesOpen}
              setTableOpen={setRecentSearchesTableOpen}
              setTableData={setRecentSearchesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {pricingChangesOpen &&
            <PricingChangesDialog
              open={pricingChangesOpen}
              setOpen={setPricingChangesOpen}
              setTableOpen={setPricingChangesTableOpen}
              setTableData={setPricingChangesData}
              setReportsOpen={setReportsPageOpen}
            />
          }
          {/* {emailAddressesOpen &&
            <EmailsDialog
              open={emailAddressesOpen}
              setOpen={setEmailAddressesOpen}
              setTableOpen={setEmailAddressesTableOpen}
              setTableData={setEmailAddressesData}
              setReportsOpen={setReportsPageOpen}
            />
          } */}
        </div>
        :
        <>
          { singleCompanyTableOpen && <SingleCompanyTable setTableOpen={setSingleCompanyTableOpen} data={singleCompanyData} setReportsOpen={setReportsPageOpen} /> }
          { allCompaniesTableOpen && <AllCompaniesTable setTableOpen={setAllCompaniesTableOpen} data={allCompaniesData} setReportsOpen={setReportsPageOpen} /> }
          { allPartsTableOpen && <AllPartsTable setTableOpen={setAllPartsTableOpen} data={allPartsData} setReportsOpen={setReportsPageOpen} /> }
          { partDescTableOpen && <PartDescTable setTableOpen={setPartDescTableOpen} data={partDescData} setReportsOpen={setReportsPageOpen} /> }
          { allEnginesTableOpen && <AllEnginesTable setTableOpen={setAllEnginesTableOpen} data={allEnginesData} setReportsOpen={setReportsPageOpen} /> }
          { allSourcesTableOpen && <AllSourcesTable setTableOpen={setAllSourcesTableOpen} data={allSourcesData} setReportsOpen={setReportsPageOpen} /> }
          { allSalesmenTableOpen && <AllSalesmenTable setTableOpen={setAllSalesmenTableOpen} data={allSalesmenData} setReportsOpen={setReportsPageOpen} /> }
          { theMachinesTableOpen && <TheMachinesTable setTableOpen={setTheMachinesTableOpen} data={theMachinesData} setReportsOpen={setReportsPageOpen} /> }
          { arielSalesTableOpen && <ArielSalesTable setTableOpen={setArielSalesTableOpen} data={arielSalesData} setReportsOpen={setReportsPageOpen} /> }
          { partsCompanyTableOpen && <SingleCompanyPartsTable setTableOpen={setPartsCompanyTableOpen} data={partsCompanyData} setReportsOpen={setReportsPageOpen} /> }
          { enginesCompanyTableOpen && <SingleCompanyEnginesTable setTableOpen={setEnginesCompanyTableOpen} data={enginesCompanyData} setReportsOpen={setReportsPageOpen} /> }
          { handwrittensCompanyTableOpen && <HandwrittenCompanyTable setTableOpen={setHandwrittensCompanyTableOpen} data={handwrittensCompanyData} setReportsOpen={setReportsPageOpen} /> }
          { PBBListTableOpen && <PBBTable setTableOpen={setPBBListTableOpen} data={PBBListData} setReportsOpen={setReportsPageOpen} /> }
          { noLocationPartsTableOpen && <NoLocationPartsTable setTableOpen={setNoLocationPartsTableOpen} data={noLocationPartsData} setReportsOpen={setReportsPageOpen} /> }
          { recentSearchesTableOpen && <RecentSearchesTable setTableOpen={setRecentSearchesTableOpen} data={recentSearchesData} setReportsOpen={setReportsPageOpen} /> }
          {/* { emailAddressesTableOpen && <EmailsTable setTableOpen={setEmailAddressesTableOpen} data={emailAddressesData} setReportsOpen={setReportsPageOpen} /> } */}
          { outstandingHighCoresTableOpen && <OutstandingCoresTable setTableOpen={setOutstandingHighCoresTableOpen} data={outstandingHighCoresData} setReportsOpen={setReportsPageOpen} /> }
          { pricingChangesTableOpen && <PricingChangesTable setTableOpen={setPricingChangesTableOpen} data={pricingChangesData} setReportsOpen={setReportsPageOpen} /> }
          { inventoryValueTableOpen && <InventoryValueTable setTableOpen={setInventoryValueTableOpen} setReportsOpen={setReportsPageOpen} /> }
        </>
      }
    </Layout>
  );
}
