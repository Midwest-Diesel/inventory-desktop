import { formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import Loading from "../library/Loading";
import { useAtom } from "jotai";
import { newCustomersReportAtom } from "@/scripts/atoms/reports";
import { useEffect, useState } from "react";
import { reportNewCustomers } from "@/scripts/services/reportsService";
import Link from "../library/Link";
import { editCustomerLastPrintedLabel, getCustomerById } from "@/scripts/services/customerService";
import { usePrintQue } from "@/hooks/usePrintQue";

interface Props {
  closeTable: () => void
}


export default function NewCustomersTable({ closeTable }: Props) {
  const [newCustomersData, setNewCustomersData] = useAtom<NewCustomersReport[]>(newCustomersReportAtom);
  const [filter, setFilter] = useState('1 Month');
  const { addToQue, printQue } = usePrintQue();

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

  const onClickPrintLabel = async (row: NewCustomersReport) => {
    await editCustomerLastPrintedLabel(row.customerId, new Date());
    const customer = await getCustomerById(row.customerId);
    if (!customer) return;

    const shipToCityStateZip = [customer.billToCity, `${customer.billToState} ${customer.billToZip}`].join(', ');
    const args = {
      shipFromCompany: 'MIDWEST DIESEL',
      shipFromAddress: '3051 82ND LANE NE',
      shipFromAddress2: '',
      shipFromCityStateZip: 'BLAINE, MN 55449',
      shipToCompany: customer.company ?? '',
      shipToAddress: customer.billToAddress ?? '',
      shipToAddress2: customer.billToAddress2 ? `${customer.billToAddress2}\n` : '',
      shipToCityStateZip: shipToCityStateZip ?? '',
      shipToContact: customer.contact ?? ''
    };
    addToQue('shippingLabel', 'print_shipping_label', args, '576px', '374.4px');
    printQue();

    setNewCustomersData(newCustomersData.map((d) => {
      if (d.customerId !== row.customerId) return d;
      return { ...row, lastPrintedLabel: new Date() };
    }));
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

      <div style={{ overflowY: 'auto', maxHeight: '82vh' }}>
        <Table>
          <thead>
            <tr>
              <th>Created Date</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th></th>
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
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Button
                        style={{ margin: '0 0 0.1rem' }}
                        variant={['xx-small', 'fit', 'center']}
                        onClick={() => onClickPrintLabel(row)}
                      >
                        Print
                      </Button>
                      <p style={{ fontSize: 'var(--font-xsm)', textAlign: 'center' }}>{ formatDate(row.lastPrintedLabel) }</p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      { newCustomersData.length == 0 && <Loading /> }
    </div>
  );
}
