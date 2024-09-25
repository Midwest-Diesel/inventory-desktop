import { useEffect, useState } from "react";
import Dialog from "../Library/Dialog";
import Table from "../Library/Table";
import { getSurplusSoldParts } from "@/scripts/controllers/surplusController";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Link from "next/link";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  code: string
}

interface SoldPart {
  id: number
  customerId: number
  soldToDate: Date
  soldTo: string
  qtySold: number
  partNum: string
  desc: string
  stockNum: string
  purchasePrice: number
  sellingPrice: number
  totalPrice: number
}


export default function SoldSurplusPartsDialog({ open, setOpen, code }: Props) {
  const [soldParts, setSoldParts] = useState<SoldPart[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getSurplusSoldParts(code);
      setSoldParts(res);
    };
    fetchData();
  }, [code]);


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Sold Parts"
      width={1000}
      maxHeight={'400px'}
      className="sold-surplus-dialog"
    >
      <Table>
        <thead>
          <tr>
            <th>Sold Date</th>
            <th>Sold to</th>
            <th>Qty Sold</th>
            <th>Part Number</th>
            <th>Description</th>
            <th>Stock Number</th>
            <th>Cost</th>
            <th>Selling Price</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {soldParts.map((part: SoldPart, i) => {
            return (
              <tr key={i}>
                <td>{ formatDate(part.soldToDate) }</td>
                <td><Link href={`/customer/${part.customerId}`}>{ part.soldTo }</Link></td>
                <td>{ part.qtySold }</td>
                <td><Link href={`/part/${part.id}`}>{ part.partNum }</Link></td>
                <td>{ part.desc }</td>
                <td>{ part.stockNum }</td>
                <td>{ formatCurrency(part.purchasePrice) }</td>
                <td>{ formatCurrency(part.sellingPrice) }</td>
                <td>{ formatCurrency(part.totalPrice) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Dialog>
  );
}
