import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Dialog from "../../Library/Dialog";
import Table from "../../Library/Table";
import Button from "@/components/Library/Button";
import { deleteCore, removeQtyFromCore } from "@/scripts/controllers/coresController";
import { addHandwritten, addHandwrittenItem } from "@/scripts/controllers/handwrittensController";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { confirm } from '@tauri-apps/api/dialog';
import { useRouter } from "next/router";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  cores: Core[]
  handwritten: Handwritten
}


export default function CoreCreditsDialog({ open, setOpen, cores, handwritten }: Props) {
  const router = useRouter();
  const [user] = useAtom<User>(userAtom);

  const handleCredit = async (core: Core) => {
    if (!await confirm('Are you sure you want to credit this core?')) return;
    const qty = core.qty > 1 ? Number(prompt('Enter qty to credit')) : 1;
    const id = await addHandwritten({ date: new Date(), salesmanId: user.id, ...handwritten });
    const newItem = {
      handwrittenId: id,
      partId: null,
      stockNum: '',
      location: '',
      cost: core.charge,
      qty: -qty,
      partNum: 'CORE DEPOSIT',
      desc: 'CORE DEPOSIT',
      unitPrice: core.unitPrice,
      return: false,
      date: core.date,
      invoiceItemChildren: [],
    } as HandwrittenItem;
    await addHandwrittenItem(newItem);
    await removeQtyFromCore(core, qty);
    if (core.qty - qty <= 0) await deleteCore(core.id);
    router.replace(`/handwrittens`);
  };

  const handleDelete = async (id: number) => {
    if (!await confirm('Are you sure you want to delete this core?')) return;
    await deleteCore(id);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Core Credits"
      maxHeight="25rem"
    >
      <Table>
        <thead>
          <tr>
            <th></th>
            <th>Date</th>
            <th>Qty</th>
            <th>Part Number</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {cores.map((core: Core, i) => {
            return (
              <tr key={i}>
                <td className="parts-list__left-col table-buttons">
                  <Button variant={['x-small']} onClick={() => handleCredit(core)}>Credit</Button>
                  <Button variant={['x-small', 'red-color']} onClick={() => handleDelete(core.id)}>Delete</Button>
                </td>
                <td>{ formatDate(core.date) }</td>
                <td>{ core.qty }</td>
                <td>{ core.partNum }</td>
                <td>{ core.desc }</td>
                <td>{ formatCurrency(core.charge) }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Dialog>
  );
}
