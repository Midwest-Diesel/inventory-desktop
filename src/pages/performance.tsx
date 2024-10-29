import { Layout } from "@/components/Layout";
import Table from "@/components/Library/Table";
import { getPerformance } from "@/scripts/controllers/reportsController";
import { useEffect, useState } from "react";


export default function Performance() {
  const [performance, setPerformance] = useState<Performance>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getPerformance();
      setPerformance(res);
    };
    fetchData();
  }, []);


  return (
    <Layout title="Performance">
      <div className="performance-page">
        <h2>Sales</h2>
        <Table variant={['fit']}>
          <thead>
            <tr>
              <th>Salesperson</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {performance && performance.sales.map((sale, i) => {
              return (
                <tr key={i}>
                  <td>{ sale.initials }</td>
                  <td>{ sale.amount }</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Layout>
  );
}
