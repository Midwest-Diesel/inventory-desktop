import { formatDate } from "@/scripts/tools/stringUtils";
import Modal from "../Library/Modal";
import { useQuery } from "@tanstack/react-query";
import { searchHandwrittens } from "@/scripts/services/handwrittensService";
import Table from "../Library/Table";
import Link from "../Library/Link";
import Loading from "../Library/Loading";
import { useState } from "react";
import CustomerHandwrittenItemsList from "../Dashboard/CustomerHandwrittenItemsList";
import Button from "../Library/Button";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  customerId: number
  company: string
}


export default function HandwrittensListModal({ open, setOpen, customerId, company }: Props) {
  const [showItems, setShowItems] = useState(false);

  const { data: handwrittens = [], isFetching } = useQuery<Handwritten[]>({
    queryKey: ['handwrittens', open],
    queryFn: async () => {
      const res = await searchHandwrittens({ customerId, limit: 9999, offset: 0 });
      return res.rows;
    }
  });


  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      closeOnOutsideClick={true}
      maxHeight="70vh"
    >
      { isFetching && <Loading /> }

      <div style={{ marginBottom: '0.3rem' }}>
        <Button onClick={() => setShowItems(!showItems)}>{ showItems ? 'Hide' : 'Show' } Items</Button>
      </div>

      {showItems ?
        <CustomerHandwrittenItemsList company={company} />
        :
        <Table>
          <thead>
            <tr>
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
            {handwrittens.map((handwritten: Handwritten) => {
              return (
                <tr key={handwritten.id}>
                  <td><Link href={`/handwrittens/${handwritten.id}`} data-testid="link">{ handwritten.id }</Link></td>
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
      }
    </Modal>
  );
}
