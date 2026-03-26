import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Table from "@/components/library/Table";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  partList: Part[]
  onSelect: (part: Part) => void
}


export default function TakeoffPartSelectDialog({ open, setOpen, partList, onSelect }: Props) {
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      minWidth={900}
    >
      <h2 style={{ marginBottom: '0.5rem' }}>Missing part ID: Select connected part</h2>

      <div style={{ maxHeight: '40rem', overflowY: 'auto' }}>
        <Table>
          <thead>
            <tr>
              <th>Desc</th>
              <th>StockNum</th>
              <th>Qty</th>
              <th>Remarks</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {partList.map((part) => {
              return (
                <tr key={part.id}>
                  <td>{ part.desc }</td>
                  <td>{ part.stockNum }</td>
                  <td>{ part.qty }</td>
                  <td>{ part.remarks }</td>
                  <td><Button onClick={() => onSelect(part)}>Select</Button></td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Dialog>
  );
}
