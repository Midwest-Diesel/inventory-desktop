import AllCompaniesDialog from "@/components/Dialogs/reports/AllCompaniesDialog";
import AllEnginesDialog from "@/components/Dialogs/reports/AllEnginesDialog";
import AllPartsDialog from "@/components/Dialogs/reports/AllPartsDialog";
import AllSalesmenDialog from "@/components/Dialogs/reports/AllSalesmenDialog";
import AllSourcesDialog from "@/components/Dialogs/reports/AllSourcesDialog";
import ArielSalesDialog from "@/components/Dialogs/reports/ArielSalesDialog";
import HandwrittenCompanyDialog from "@/components/Dialogs/reports/HandwrittenCompanyDialog";
import PartDescDialog from "@/components/Dialogs/reports/PartDescDialog";
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
import PartDescTable from "@/components/Reports/PartDescTable";
import SingleCompanyEnginesTable from "@/components/Reports/SingleCompanyEnginesTable";
import SingleCompanyPartsTable from "@/components/Reports/SingleCompanyPartsTable";
import SingleCompanyTable from "@/components/Reports/SingleCompanyTable";
import TheMachinesTable from "@/components/Reports/TheMachinesTable";
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
  const [PBBListOpen, setPBBListOpen] = useState(false);
  const [noLocationPartsOpen, setNoLocationPartsOpen] = useState(false);
  const [recentSearchesOpen, setRecentSearchesOpen] = useState(false);
  const [emailAddressesOpen, setEmailAddressesOpen] = useState(false);
  const [outstandingHighCoresOpen, setOutstandingHighCoresOpen] = useState(false);
  const [reportsPageOpen, setReportsPageOpen] = useState(true);


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
                <Button onClick={() => setPBBListOpen(!PBBListOpen)}>PBB List</Button>
                <Button onClick={() => setNoLocationPartsOpen(!noLocationPartsOpen)}>No Location Parts</Button>
                <Button onClick={() => setRecentSearchesOpen(!recentSearchesOpen)}>Recent Searches</Button>
                <Button onClick={() => setEmailAddressesOpen(!emailAddressesOpen)}>Email Addresses</Button>
                <Button onClick={() => setOutstandingHighCoresOpen(!outstandingHighCoresOpen)}>Outstanding High Cores</Button>
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
        </>
      }
    </Layout>
  );
}
