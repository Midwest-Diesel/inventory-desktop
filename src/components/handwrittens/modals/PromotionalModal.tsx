import { useState } from "react";
import Table from "../../library/Table";
import Input from "@/components/library/Input";
import Button from "@/components/library/Button";
import { editHandwrittenPromotionals } from "@/scripts/services/handwrittensService";
import Modal from "@/components/library/Modal";

interface Props {
  open?: boolean
  onNext?: () => void
  onPrev?: () => void
  onClose?: () => void
  handwritten: Handwritten
  onAddPromotionals: (mp: number, cap: number, br: number, fl: number) => void
}


export default function PromotionalModal({ open, onNext, onPrev, handwritten, onAddPromotionals }: Props) {
  const [mp, setMp] = useState<number>(handwritten.mp ?? 0);
  const [cap, setCap] = useState<number>(handwritten.cap ?? 0);
  const [br, setBr] = useState<number>(handwritten.br ?? 0);
  const [fl, setFl] = useState<number>(handwritten.fl ?? 0);

  const handleAddPromotionals = async () => {
    await editHandwrittenPromotionals(handwritten.id, mp, cap, br, fl);
    onAddPromotionals(mp, cap, br, fl);
    if (onNext) onNext();
  };


  return (
    <Modal
      open={open}
      title="Add Promotional Materials?"
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
        { onPrev && <Button onClick={onPrev}>Back</Button> }
        <Button onClick={handleAddPromotionals} data-testid="submit-btn">Next</Button>
      </div>
    </Modal>
  );
}
