import Table from "@/components/Library/Table";
import Dialog from "../../Library/Dialog";
import { formatCurrency } from "@/scripts/tools/stringUtils";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  stockNumChildren: HandwrittenItemChild[]
}


export default function HandwrittenChildrenDialog({ open, setOpen, stockNumChildren }: Props) {
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Stock Numbers"
      maxHeight="25rem"
      y={-120}
      className="handwritten-children-dialog"
    >
      <div className="handwritten-children-dialog__content">
        <Table>
          <thead>
            <tr>
              <th>Qty</th>
              <th>Part Number</th>
              <th>Stock Number</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {stockNumChildren.map((item) => {
              return (
                <tr key={item.id}>
                  <td>{ item.qty }</td>
                  <td>{ item.partNum }</td>
                  <td>{ item.stockNum }</td>
                  <td>{ formatCurrency(item.cost) }</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Dialog>
  );
}
