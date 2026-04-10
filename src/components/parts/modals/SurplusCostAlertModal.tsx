import Modal from "@/components/library/Modal";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  costAlertPurchasedFrom: string
  costAlertAmount: string
}


export default function SurplusCostAlertModal({ open, setOpen, costAlertPurchasedFrom, costAlertAmount }: Props) {
  return (
    <Modal
      style={{ backgroundColor: 'var(--orange-1)' }}
      open={open}
      setOpen={setOpen}
      onClose={() => {}}
      closeOnOutsideClick={true}
      exitWithEsc={true}
    >
      <h2>If you are selling this part</h2>
      <h1>STOP!!!</h1>
      <br />
      {costAlertPurchasedFrom &&
        <>
          <h2>This part is from:</h2>
          <h1>{ costAlertPurchasedFrom }</h1>
        </>
      }
      <h2>Cost Remaining:</h2>
      <h1>{ costAlertAmount }</h1>
    </Modal>
  );
}
