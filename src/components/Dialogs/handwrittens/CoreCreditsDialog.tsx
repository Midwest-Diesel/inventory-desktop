import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Dialog from "../../Library/Dialog";
import Table from "../../Library/Table";
import Button from "@/components/Library/Button";
import { deleteCore, removeQtyFromCore } from "@/scripts/controllers/coresController";
import { addHandwritten, addHandwrittenItem } from "@/scripts/controllers/handwrittensController";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { confirm } from "@/scripts/config/tauri";
import { FormEvent, useState } from "react";
import Checkbox from "@/components/Library/Checkbox";
import Input from "@/components/Library/Input";
import { useNavState } from "@/components/Navbar/useNavState";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  cores: Core[]
  handwritten: Handwritten
}


export default function CoreCreditsDialog({ open, setOpen, cores, handwritten }: Props) {
  const { push } = useNavState();
  const [user] = useAtom<User>(userAtom);
  const [selectedCores, setSelectedCores] = useState<Core[]>([]);
  const [inputQty, setInputQty] = useState(1);
  const [inputCore, setInputCore] = useState<Core | null>(null);

  const handleCredit = async () => {
    if (selectedCores.length === 0 || !await confirm('Are you sure?')) return;
    const id = await addHandwritten({ ...handwritten, date: new Date(), salesmanId: user.id } as any);

    for (let i = 0; i < selectedCores.length; i++) {
      const core = selectedCores[i];
      const qty = (core as any).selectedQty;
      const newItem = {
        handwrittenId: id,
        partId: core.part ? core.part.id : null,
        stockNum: core.part ? core.part.stockNum : '',
        location: 'CORE DEPOSIT',
        cost: core.charge,
        qty: -qty,
        partNum: core.partNum,
        desc: core.desc,
        unitPrice: core.unitPrice,
        return: false,
        date: core.date,
        invoiceItemChildren: [],
      } as any;
      await addHandwrittenItem(newItem);
      await removeQtyFromCore(core, qty);
      if (core.qty - qty <= 0) await deleteCore(core.id);
    }
    await push('Handwrittens', `/handwrittens`);
  };

  const handleToggleSelection = (core: Core, selected: boolean) => {
    if (!selected) {
      if (core.qty > 1) {
        setInputQty(1);
        setInputCore(core);
        return;
      }
      setSelectedCores([...selectedCores, { ...core, selectedQty: 1 }] as Core[]);
    } else {
      setSelectedCores(selectedCores.filter((c) => c.id !== core.id));
    }
  };

  const handleSubmitQty = (e: FormEvent, core: Core) => {
    e.preventDefault();
    setSelectedCores([...selectedCores, { ...core, selectedQty: inputQty }] as Core[]);
    setInputQty(1);
    setInputCore(null);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Core Credits"
      maxHeight="25rem"
      data-testid="core-credits-dialog"
    >
      <Button
        style={{ marginBottom: '0.3rem' }}
        onClick={handleCredit}
        disabled={inputCore !== null || selectedCores.length === 0}
        data-testid="core-credit-submit-btn"
      >
        Credit
      </Button>

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
            const selected = selectedCores.some((c) => c.id === core.id);
            return (
              <tr key={i}>
                {inputCore && inputCore.id === core.id ?
                  <td>
                    <form onSubmit={(e) => handleSubmitQty(e, core)}>
                      <Input
                        variant={['no-arrows', 'label-bold']}
                        label="Qty"
                        value={inputQty}
                        onChange={(e: any) => setInputQty(e.target.value)}
                        type="number"
                        data-testid="core-qty-input"
                      />
                    </form>
                  </td>
                  :
                  <td className="cbx-td">
                    <Checkbox
                      checked={selected}
                      onChange={() => handleToggleSelection(core, selected)}
                    />
                  </td>
                }
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
