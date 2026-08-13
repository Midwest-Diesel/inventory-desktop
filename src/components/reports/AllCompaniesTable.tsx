import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import Loading from "../library/Loading";
import { useEffect, useState } from "react";
import { usePrintQue } from "@/hooks/usePrintQue";
import { editCustomerLastPrintedLabel, getCustomerById } from "@/scripts/services/customerService";
import Link from "../library/Link";

interface Props {
  closeTable: () => void
  data: AllCompaniesReport[]
  setData: (data: AllCompaniesReport[]) => void
}


export default function AllCompaniesTable({ closeTable, data, setData }: Props) {
  const [total, setTotal] = useState(0);
  const { addToQue, printQue } = usePrintQue();

  useEffect(() => {
    setTotal(data.reduce((acc, cur) => acc + cur.sales, 0));
  }, [data]);

  const handleGoBack = () => {
    closeTable();
  };

  const onClickPrintLabel = async (row: AllCompaniesReport) => {
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

    setData(data.map((d) => {
      if (d.customerId !== row.customerId) return d;
      return { ...row, lastPrintedLabel: new Date() };
    }));
  };


  return (
    <div className="reports-table">
      <div className="reports-table__top-row">
        <Button onClick={handleGoBack}>Back</Button>
        <h3>Total: { formatCurrency(total) }</h3>
      </div>
      
      <Table>
        <thead>
          <tr>
            <th>BillToCompany</th>
            <th>BillToAddress</th>
            <th>BillToCity</th>
            <th>BillToState</th>
            <th>BillToZip</th>
            <th>Country</th>
            <th>Sales</th>
            <th>Invoices</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td><Link href={`/customer/${row.customerId}`}>{ row.billToCompany }</Link></td>
                <td>{ row.billToAddress }</td>
                <td>{ row.billToCity }</td>
                <td>{ row.billToState }</td>
                <td>{ row.billToZip }</td>
                <td>{ row.country }</td>
                <td>{ formatCurrency(row.sales) }</td>
                <td>{ row.invoices }</td>
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

      { data.length == 0 && <Loading /> }
    </div>
  );
}
