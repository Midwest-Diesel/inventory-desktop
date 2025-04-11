import { useEffect, useState } from "react";
import Dialog from "../Library/Dialog";
import Table from "../Library/Table";
import { getSurplusRemainingParts } from "@/scripts/controllers/surplusController";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import Link from "../Library/Link";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  code: string
}

interface RemainingPart {
  id: number
  qty: number
  partNum: string
  desc: string
  stockNum: string
  cost: number
  sellingPrice: number
  partCostIn: number
}


export default function RemainingSurplusDialog({ open, setOpen, code }: Props) {
  const [remainingParts, setRemainingParts] = useState<RemainingPart[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res: RemainingPart[] = await getSurplusRemainingParts(code);
      setRemainingParts(res);
    };
    fetchData();
  }, [code]);


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Remaining Parts"
      width={900}
    >
      <div className="remaining-surplus-dialog">
        <Table>
          <thead>
            <tr>
              <th>Qty</th>
              <th>Part Number</th>
              <th>Description</th>
              <th>Stock Number</th>
              <th>Cost Remaining</th>
            </tr>
          </thead>
          <tbody>
            {remainingParts.map((part: RemainingPart, i) => {
              return (
                <tr key={i}>
                  <td>{ part.qty }</td>
                  <td><Link href={`/part/${part.id}`}>{ part.partNum }</Link></td>
                  <td>{ part.desc }</td>
                  <td>{ part.stockNum }</td>
                  <td>{ formatCurrency(part.partCostIn) }</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Dialog>
  );
}
