import Dialog from "../Library/Dialog";
import Table from "../Library/Table";
import { formatDate } from "@/scripts/tools/stringUtils";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  part: Part
  history: PartQtyHistory[]
}


export default function PartQtyHistoryDialog({ open, setOpen, part, history }: Props) {
  const getPastQtyFromValue = (targetRow: PartQtyHistory): number => {
    let qty = part.qty;
    for (const row of history) {
      if (row.id === targetRow.id) {
        return qty;
      }
      qty -= row.qtyChanged;
    }
    return qty;
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Part Qty History"
      width={500}
      y={-150}
      maxHeight="20rem"
    >
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Qty Applied</th>
            <th>Qty After Change</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row: PartQtyHistory) => {
            return (
              <tr key={row.id}>
                <td>{ formatDate(row.dateChanged) }</td>
                <td>{ row.qtyChanged }</td>
                <td>{ getPastQtyFromValue(row) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Dialog>
  );
}
