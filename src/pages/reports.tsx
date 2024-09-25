import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";


export default function Reports() {
  return (
    <Layout title="Reports">
      <div className="reports-page">
        <h1>Reports</h1>

        <div className="reports-page__content">
          <div className="reports-page-section">
            <h2>Sales Reports</h2>
            <div className="reports-page-section__buttons">
              <Button>Single Company/Keyword</Button>
              <Button>Single State/Country</Button>
              <Button>All Companies</Button>
              <Button>All Parts</Button>
              <Button>Single Part Description</Button>
              <Button>All Engines</Button>
              <Button>All Sources</Button>
              <Button>All Salesmen</Button>
              <Button>The Machines</Button>
              <Button>Ariel Sales</Button>
            </div>
          </div>

          <div className="reports-page-section">
            <h2>Purchase Reports</h2>
            <div className="reports-page-section__buttons">
              <Button>Parts - Single Company</Button>
              <Button>Engines - Single Company</Button>
            </div>
          </div>

          <div className="reports-page-section">
            <h2>Misc Reports</h2>
            <div className="reports-page-section__buttons">
              <Button>Invoices - Single Company/Keyword</Button>
              <Button>PBB List</Button>
              <Button>No Location Parts</Button>
              <Button>Recent Searches</Button>
              <Button>Email Addresses</Button>
              <Button>Outstanding High Cores</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
