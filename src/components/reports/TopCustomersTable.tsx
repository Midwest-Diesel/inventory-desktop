import { useQuery } from "@tanstack/react-query";
import Button from "../library/Button";
import Table from "../library/Table";
import { reportTopCustomers } from "@/scripts/services/reportsService";
import { useState } from "react";
import Link from "../library/Link";

interface Props {
  closeTable: () => void
}


export default function TopCustomersTable({ closeTable }: Props) {
  const [view, setView] = useState<'value' | 'qty'>('value');

  const { data: customers } = useQuery<TopCustomersReport | null>({
    queryKey: ['customers'],
    queryFn: () => reportTopCustomers()
  });

  const handleGoBack = () => {
    closeTable();
  };


  return (
    <div className="reports-table">
      <div className="reports-table__top-bar">
        <Button onClick={handleGoBack}>Back</Button>
      </div>

      <div className="reports-table__top-bar">
        <Button
          style={view === 'value' ? { color: 'var(--yellow-2)' } : {}}
          onClick={() => setView('value')}
        >
          Value
        </Button>
        <Button
          style={view === 'qty' ? { color: 'var(--yellow-2)' } : {}}
          onClick={() => setView('qty')}
        >
          Qty
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Bill to Company</th>
            <th>Rank</th>
            <th>Bill to Address</th>
            <th>Bill to City</th>
            <th>Bill to State</th>
            <th>Bill to Zip</th>
          </tr>
        </thead>
        <tbody>
          {view === 'value' &&
            customers?.value.map((row) => {
              return (
                <tr key={row.customerId}>
                  <td><Link href={`/customer/${row.customerId}`}>{ row.billToCompany }</Link></td>
                  <td>{ row.rank }</td>
                  <td>{ row.billToAddress }</td>
                  <td>{ row.billToCity }</td>
                  <td>{ row.billToState }</td>
                  <td>{ row.billToZip }</td>
                </tr>
              );
            })
          }

          {view === 'qty' &&
            customers?.qty.map((row) => {
              return (
                <tr key={row.customerId}>
                  <td><Link href={`/customer/${row.customerId}`}>{ row.billToCompany }</Link></td>
                  <td>{ row.rank }</td>
                  <td>{ row.billToAddress }</td>
                  <td>{ row.billToCity }</td>
                  <td>{ row.billToState }</td>
                  <td>{ row.billToZip }</td>
                </tr>
              );
            })
          }
        </tbody>
      </Table>
    </div>
  );
}
