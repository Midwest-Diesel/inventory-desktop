import { useState } from "react";
import Dialog from "../../Library/Dialog";
import Table from "../../Library/Table";
import Input from "@/components/Library/Input";
import Button from "@/components/Library/Button";
import { editHandwrittenPromotionals } from "@/scripts/controllers/handwrittensController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setIsEditing: (value: boolean) => void
  handwritten: Handwritten
}


export default function PromotionalDialog({ open, setOpen, setIsEditing, handwritten }: Props) {
  const [mp, setMp] = useState<number>(handwritten.mp ?? 0);
  const [cap, setCap] = useState<number>(handwritten.cap ?? 0);
  const [br, setBr] = useState<number>(handwritten.br ?? 0);
  const [fl, setFl] = useState<number>(handwritten.fl ?? 0);

  const handleAddPromotionals = async () => {
    await editHandwrittenPromotionals(handwritten.id, mp, cap, br, fl);
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Promotional Materials"
      width={250}
      data-testid="promotional-dialog"
    >
      <Table>
        <tbody>
          <tr>
            <th>Mousepads</th>
            <td>
              <Input
                style={{ margin: 0, color: 'white' }}
                variant={['no-arrows', 'no-style']}
                value={mp}
                onChange={(e) => setMp(Number(e.target.value))}
                data-testid="mp-input"
              />
            </td>
          </tr>
          <tr>
            <th>Hats</th>
            <td>
              <Input
                style={{ margin: 0, color: 'white' }}
                variant={['no-arrows', 'no-style']}
                value={cap}
                onChange={(e) => setCap(Number(e.target.value))}
                data-testid="cap-input"
              />
            </td>
          </tr>
          <tr>
            <th>Brochures</th>
            <td>
              <Input
                style={{ margin: 0, color: 'white' }}
                variant={['no-arrows', 'no-style']}
                value={br}
                onChange={(e) => setBr(Number(e.target.value))}
                data-testid="br-input"
              />
            </td>
          </tr>
          <tr>
            <th>Flashlights</th>
            <td>
              <Input
                style={{ margin: 0, color: 'white' }}
                variant={['no-arrows', 'no-style']}
                value={fl}
                onChange={(e) => setFl(Number(e.target.value))}
                data-testid="fl-input"
              />
            </td>
          </tr>
        </tbody>
      </Table>

      <div className="form__footer">
        <Button onClick={handleAddPromotionals} data-testid="submit-btn">Add</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </div>
    </Dialog>
  );
}
