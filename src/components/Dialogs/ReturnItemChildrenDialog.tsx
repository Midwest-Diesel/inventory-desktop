import Dialog from "../Library/Dialog";
import Table from "../Library/Table";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  returnItemChildren: ReturnItemChild[]
}


export default function ReturnItemChildrenDialog({ open, setOpen, returnItemChildren }: Props) {
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Stock Numbers"
      width={500}
    >
      <Table>
        <thead>
          <tr>
            <th>Stock Number</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {returnItemChildren.map((row: ReturnItemChild) => {
            return (
              <tr>
                <td>{ row.stockNum }</td>
                <td>{ row.qty }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Dialog>
  );
}
