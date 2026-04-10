import Modal from "@/components/library/Modal";
import { formatCurrency } from "@/scripts/tools/stringUtils";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  costRemaining: number
}


export default function EngineCostAlertModal({ open, setOpen, costRemaining }: Props) {
  return (
    <Modal
      style={{ backgroundColor: 'var(--red-3)' }}
      open={open}
      setOpen={setOpen}
      onClose={() => {}}
      closeOnOutsideClick={true}
      exitWithEsc={true}
    >
      <h2>If you are selling this part</h2>
      <h1>STOP!!!</h1>
      <br />
      <h2>Engine Cost Remaining:</h2>
      <h1>{ formatCurrency(costRemaining) }</h1>
    </Modal>
  );
}
