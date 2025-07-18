import { formatCurrency } from "@/scripts/tools/stringUtils";
import Dialog from "../../Library/Dialog";
import Table from "../../Library/Table";
import Button from "@/components/Library/Button";
import { deleteCore, removeQtyFromCore } from "@/scripts/services/coresService";
import { addHandwritten, addHandwrittenItem } from "@/scripts/services/handwrittensService";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { FormEvent, useState } from "react";
import Checkbox from "@/components/Library/Checkbox";
import Input from "@/components/Library/Input";
import { useNavState } from "@/hooks/useNavState";
import { ask } from "@/scripts/config/tauri";

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
    if (selectedCores.length === 0 || !await ask('Are you sure?')) return;
    const id = await addHandwritten({ ...handwritten, date: new Date(), salesmanId: user.id } as any);

    for (let i = 0; i < selectedCores.length; i++) {
      const core = selectedCores[i];
      const qty = (core as any).selectedQty;
      const newItem = {
        handwrittenId: id,
        partId: core.part ? core.part.id : null,
        stockNum: core.part ? core.part.stockNum : '',
        location: 'CORE DEPOSIT',
        cost: 0.01,
        qty: -qty,
        partNum: core.partNum,
        desc: core.desc,
        unitPrice: core.charge,
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
            <th>Cost</th>
            <th>Qty</th>
            <th>Part Number</th>
            <th>Description</th>
            <th>Unit Price</th>
          </tr>
        </thead>
        <tbody>
          {cores.map((core: Core, i) => {
            const selectedCore = selectedCores.find((c) => c.id === core.id);
            return (
              <tr key={i}>
                {inputCore && inputCore.id === core.id ?
                  <td>
                    <form onSubmit={(e) => handleSubmitQty(e, core)}>
                      <Input
                        variant={['no-arrows', 'label-bold']}
                        label="Qty"
                        value={inputQty}
                        onChange={(e: any) => setInputQty(Math.min(e.target.value, core.qty) || '' as any)}
                        type="number"
                        data-testid="core-qty-input"
                      />
                    </form>
                  </td>
                  :
                  <td className="cbx-td">
                    <p>{ (selectedCore as any)?.selectedQty < core.qty && (selectedCore as any)?.selectedQty }</p>
                    <Checkbox
                      checked={Boolean(selectedCore)}
                      onChange={() => handleToggleSelection(core, Boolean(selectedCore))}
                    />
                  </td>
                }
                <td>$0.01</td>
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
