import { addReturnItemChild, deleteReturnItemChild, editReturnItemChild } from "@/scripts/services/returnsService";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Table from "../Library/Table";
import { FormEvent } from "react";
import Button from "../Library/Button";
import { ask } from "@/scripts/config/tauri";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  returnItemChildren: ReturnItemChild[]
  setReturnItemChildren: (returnItemChildren: ReturnItemChild[]) => void
  returnItemId: number
}


export default function ReturnItemChildrenDialog({ open, setOpen, returnItemChildren, setReturnItemChildren, returnItemId }: Props) {
  const handleEditRow = (row: ReturnItemChild) => {
    setReturnItemChildren(returnItemChildren.map((child) => {
      if (row.id === child.id) return row;
      return child;
    }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    for (const child of returnItemChildren) {
      await editReturnItemChild(child);
    }
  };
  
  const handleNewRow = async () => {
    if (!returnItemId) return;
    const id = await addReturnItemChild(returnItemId);
    if (!id) return;
    setReturnItemChildren([...returnItemChildren, { id, returnItemId, stockNum: '', qty: 0 }]);
  };

  const handleDelete = async (id: number) => {
    if (!await ask('Are you sure you want to delete this?')) return;
    await deleteReturnItemChild(id);
    setReturnItemChildren(returnItemChildren.filter((row) => row.id !== id));
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Stock Numbers"
      width={500}
      className="return-item-children-dialog"
    >
      <form onSubmit={handleSave}>
        <Button variant={['fit', 'no-hover-color']} type="submit">Save</Button>
        <Table>
          <thead>
            <tr>
              <th>Stock Number</th>
              <th>Qty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {returnItemChildren.map((row: ReturnItemChild) => {
              return (
                <tr key={row.id}>
                  <td>
                    <Input
                      style={{ color: 'white' }}
                      variant={['no-style']}
                      value={row.stockNum ?? ''}
                      onChange={(e) => handleEditRow({ ...row, stockNum: e.target.value })}
                    />
                  </td>
                  <td>
                    <Input
                      style={{ color: 'white' }}
                      variant={['no-style']}
                      value={row.qty}
                      onChange={(e) => handleEditRow({ ...row, qty: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <Button variant={['danger']} type="button" onClick={() => handleDelete(row.id)}>Delete</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Button variant={['fit']} type="button" onClick={handleNewRow}>New</Button>
      </form>
    </Dialog>
  );
}
