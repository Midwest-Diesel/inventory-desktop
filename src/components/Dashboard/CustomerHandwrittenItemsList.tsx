import { useQuery } from "@tanstack/react-query";
import Table from "../library/Table";
import { getCustomerHandwrittenItems } from "@/scripts/services/handwrittensService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Link from "../library/Link";
import Loading from "../library/Loading";

interface Props {
  company: string
}


export default function CustomerHandwrittenItemsList({ company }: Props) {
  const { data: rows = [], isFetching } = useQuery<CustomerHandwrittenItem[]>({
    queryKey: ['rows', open],
    queryFn: async () => {
      const res = await getCustomerHandwrittenItems(company);
      return res;
    }
  });


  if (isFetching) return <Loading />;

  return (
    <Table>
      <thead>
        <tr>
          <th>Handwritten</th>
          <th>Date</th>
          <th>Qty</th>
          <th>PartNum</th>
          <th>Desc</th>
          <th>Unit Price</th>
          <th>Payment</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          return (
            <tr key={i}>
              <td><Link href={`/handwrittens/${row.handwrittenId}`}>{ row.handwrittenId }</Link></td>
              <td>{ formatDate(row.date) }</td>
              <td>{ row.qty }</td>
              <td>{ row.partId ? <Link href={`/part/${row.partId}`}>{ row.partNum }</Link> : row.partNum }</td>
              <td>{ row.desc }</td>
              <td>{ formatCurrency(row.unitPrice) }</td>
              <td>{ row.payment }</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
