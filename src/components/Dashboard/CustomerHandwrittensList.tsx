import { useQuery } from "@tanstack/react-query";
import Table from "../library/Table";
import { getCustomerHandwrittens } from "@/scripts/services/handwrittensService";
import { formatDate } from "@/scripts/tools/stringUtils";
import Link from "../library/Link";
import Loading from "../library/Loading";

interface Props {
  company: string
}


export default function CustomerHandwrittensList({ company }: Props) {
  const { data: rows = [], isFetching } = useQuery<CustomerHandwritten[]>({
    queryKey: ['rows', open],
    queryFn: async () => {
      const res = await getCustomerHandwrittens(company);
      return res;
    }
  });


  if (isFetching) return <Loading />;

  return (
    <Table>
      <thead>
        <tr style={{ cursor: 'default' }}>
          <th></th>
          <th>Date</th>
          <th>Bill To Company</th>
          <th>Ship To Company</th>
          <th>Source</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Accounting</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((handwritten: CustomerHandwritten) => {
          return (
            <tr key={handwritten.id} style={{ cursor: 'default' }}>
              <td>
                <Link href={`/handwrittens/${handwritten.id}`} data-testid="link">{ handwritten.id }</Link>
                { handwritten.hasCore && <strong style={{ color: 'var(--red-2)' }}> (CORE)</strong> }  
              </td>
              <td>{ formatDate(handwritten.date) }</td>
              <td>{ handwritten.billToCompany }</td>
              <td>{ handwritten.shipToCompany }</td>
              <td>{ handwritten.source }</td>
              <td>{ handwritten.payment }</td>
              <td>{ handwritten.invoiceStatus }</td>
              <td>{ handwritten.accountingStatus }</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
