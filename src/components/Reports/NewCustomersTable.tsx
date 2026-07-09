import { formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import Loading from "../library/Loading";
import { useAtom } from "jotai";
import { newCustomersReportAtom } from "@/scripts/atoms/reports";
import { useEffect, useState } from "react";
import { reportNewCustomers } from "@/scripts/services/reportsService";
import Link from "../library/Link";

interface Props {
  closeTable: () => void
}


export default function NewCustomersTable({ closeTable }: Props) {
  const [newCustomersData, setNewCustomersData] = useAtom<NewCustomersReport[]>(newCustomersReportAtom);
  const [filter, setFilter] = useState('1 Month');

  useEffect(() => {
    const fetchData = async () => {
      const date = new Date();

      switch (filter) {
        case '1 Month':
          date.setMonth(date.getMonth() - 1);
          break;
        case '3 Months':
          date.setMonth(date.getMonth() - 3);
          break;
        case '6 Months':
          date.setMonth(date.getMonth() - 6);
          break;
        case '1 Year':
          date.setFullYear(date.getFullYear() - 1);
          break;
        default:
          break;
      }

      const res = await reportNewCustomers(date);
      setNewCustomersData(res);
    };
    fetchData();
  }, [filter]);

  const handleGoBack = () => {
    closeTable();
  };

  const copyToClipboard = () => {
    const rowsText = newCustomersData.map((row) =>
      [
        row.createdAt,
        row.name,
        row.contact,
        row.email,
        formatPhone(row.phone)
      ].join('\t')
    ).join('\n');
    navigator.clipboard.writeText(rowsText);
  };


  return (
    <div className="reports-table">
      <div className="reports-table__top-row">
        <div className="reports-table__top-bar">
          <Button onClick={handleGoBack}>Back</Button>
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>

        <div className="reports-table__top-bar">
          <Button
            style={filter === '1 Month' ? { color: 'var(--yellow-2)' } : {}}
            onClick={() => setFilter('1 Month')}
          >
            1 Month
          </Button>
          <Button
            style={filter === '3 Months' ? { color: 'var(--yellow-2)' } : {}}
            onClick={() => setFilter('3 Months')}
          >
            3 Months
          </Button>
          <Button
            style={filter === '6 Months' ? { color: 'var(--yellow-2)' } : {}}
            onClick={() => setFilter('6 Months')}
          >
            6 Months
          </Button>
          <Button
            style={filter === '1 Year' ? { color: 'var(--yellow-2)' } : {}}
            onClick={() => setFilter('1 Year')}
          >
            1 Year
          </Button>
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Created Date</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {newCustomersData && newCustomersData.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ formatDate(row.createdAt) }</td>
                <td>
                  {row.customerId ?
                    <Link href={`/customer/${row.customerId}`}>{ row.name }</Link>
                    :
                    row.customerId
                  }
                </td>
                <td>{ row.contact }</td>
                <td>{ row.email }</td>
                <td>{ formatPhone(row.phone) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      { newCustomersData.length == 0 && <Loading /> }
    </div>
  );
}
