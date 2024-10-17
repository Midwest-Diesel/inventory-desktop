import CoreSearchDialog from "@/components/Dialogs/CoreSearchDialog";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Table from "@/components/Library/Table";
import { getAllCores } from "@/scripts/controllers/coresController";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Link from "next/link";
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
      <div className="cores-page">
        <CoreSearchDialog open={isCoreSearchOpen} setOpen={setIsOpenCoreSearchOpen} cores={coresData} setCores={setCores} />

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
                return (
                  <tr key={core.id}>
                    <td><a href={`/handwrittens/${core.invoiceId}`}>{ core.invoiceId }</a></td>
                    <td>{ formatDate(core.date) }</td>
                    <td>{ core.billToCompany }</td>
                    <td>{ core.shipToCompany }</td>
                    <td>{ core.partNum }</td>
                    <td>{ core.desc }</td>
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
