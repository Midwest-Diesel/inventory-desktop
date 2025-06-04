import CoreSearchDialog from "@/components/Dialogs/CoreSearchDialog";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Link from "@/components/Library/Link";
import Table from "@/components/Library/Table";
import { getAllCores } from "@/scripts/services/coresService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useEffect, useState } from "react";


export default function Cores() {
  const [coresData, setCoresData] = useState<Core[]>([]);
  const [cores, setCores] = useState<Core[]>([]);
  const [isCoreSearchOpen, setIsOpenCoreSearchOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllCores();
      setCores(res);
      setCoresData(res);
    };
    fetchData();
  }, []);


  return (
    <Layout title="Cores">
      <CoreSearchDialog open={isCoreSearchOpen} setOpen={setIsOpenCoreSearchOpen} cores={coresData} setCores={setCores} />

      <div className="cores-page">
        <h1>Cores</h1>
        <div className="cores-page__top-bar">
          <Button onClick={() => setIsOpenCoreSearchOpen(true)}>Search</Button>
        </div>

        <div className="cores-page__table-container">
          <Table>
            <thead>
              <tr>
                <th>Handwritten</th>
                <th>Date</th>
                <th>Bill to Company</th>
                <th>Ship to Company</th>
                <th>Part Number</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Charge</th>
                <th>Priority</th>
                <th>Salesperson</th>
              </tr>
            </thead>
            <tbody>
              {cores.map((core: Core) => {
                const part = core.part;
                return (
                  <tr key={core.id}>
                    <td><Link href={`/handwrittens/${core.pendingInvoiceId}`}>{ core.pendingInvoiceId }</Link></td>
                    <td>{ formatDate(core.date) }</td>
                    <td>{ core.billToCompany }</td>
                    <td>{ core.shipToCompany }</td>
                    <td data-testid="part-num">{ part ? <Link href={`/part/${part.id}`}>{ part.partNum }</Link> : core.partNum }</td>
                    <td>{ part ? part.desc : core.desc }</td>
                    <td>{ core.qty }</td>
                    <td>{ formatCurrency(core.charge) }</td>
                    <td>{ core.priority }</td>
                    <td>{ core.initials }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
