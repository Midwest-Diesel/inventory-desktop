import Dialog from "../../Library/Dialog";
import Button from "@/components/Library/Button";
import { AltShip, deleteAltShipAddress, editHandwritten, getHandwrittenById } from "@/scripts/controllers/handwrittensController";
import { ask } from "@tauri-apps/api/dialog";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwritten: Handwritten
  setHandwritten: (handwritten: Handwritten | null) => void
  altShipData: AltShip[]
  setAltShipData: (data: AltShip[]) => void
}


export default function AltShipDialog({ open, setOpen, handwritten, setHandwritten, altShipData, setAltShipData }: Props) {
  const selectAddress = async (data: AltShip) => {
    if (!await ask('Are you sure you want to use this address?')) return;
    const newHandwritten = {
      ...handwritten,
      shipToAddress: data.shipToAddress,
      shipToAddress2: data.shipToAddress2,
      shipToCity: data.shipToCity,
      shipToState: data.shipToState,
      shipToZip: data.shipToZip,
      shipToCompany: data.shipToCompany,
      soldBy: handwritten.soldById
    } as any;
    await editHandwritten(newHandwritten);
    setHandwritten(await getHandwrittenById(handwritten.id));
  };

  const handleDelete = async (id: number) => {
    if (!await ask('Are you sure you want to delete this?')) return;
    await deleteAltShipAddress(id);
    setAltShipData(altShipData.filter((data) => data.id !== id));
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Alt Shipping"
      maxHeight="28.3rem"
      width={370}
      className="alt-ship-dialog"
      y={-150}
    >
      {altShipData.map((data: AltShip, i) => {
        return (
          <div key={i} className="alt-ship-dialog__box">
            <p>{ data.shipToCompany }</p>
            <p>{ data.shipToAddress }</p>
            <p>{ data.shipToAddress2 }</p>
            <p>{ data.shipToCity}, { data.shipToState } { data.shipToZip }</p>
            <div className="alt-ship-dialog__box--buttons">
              <Button onClick={() => data.id && handleDelete(data.id)}>Delete</Button>
              <Button onClick={() => selectAddress(data)}>Use This Address</Button>
            </div>
          </div>
        );
      })}
    </Dialog>
  );
}
