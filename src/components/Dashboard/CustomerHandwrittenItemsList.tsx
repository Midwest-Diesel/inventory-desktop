import { useQuery } from "@tanstack/react-query";
import Table from "../Library/Table";
import { getCustomerHandwrittenItems } from "@/scripts/services/handwrittensService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Link from "../Library/Link";
import Loading from "../Library/Loading";

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


  return (
    <>
      { isFetching && <Loading /> }
      <Table>
        <thead>
          <tr>
            <th>Handwritten</th>
            <th>Part</th>
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
                <td><Link href={`/part/${row.partId}`}>{ row.partId }</Link></td>
                <td>{ formatDate(row.date) }</td>
                <td>{ row.qty }</td>
                <td>{ row.partNum }</td>
                <td>{ row.desc }</td>
                <td>{ formatCurrency(row.unitPrice) }</td>
                <td>{ row.payment }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
