import Input from "@/components/Library/Input";
import Dialog from "../../Library/Dialog";
import Button from "@/components/Library/Button";
import { deleteAltShipAddress, editAltShipAddress } from "@/scripts/services/altShipService";
import { editHandwritten, getHandwrittenById } from "@/scripts/services/handwrittensService";
import { ask } from "@tauri-apps/api/dialog";
import { FormEvent, useEffect, useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handwritten: Handwritten
  setHandwritten: (handwritten: Handwritten | null) => void
  altShipData: AltShip[]
  setAltShipData: (data: AltShip[]) => void
  onChangeAltShip: () => void
}


export default function AltShipDialog({ open, setOpen, handwritten, setHandwritten, altShipData, setAltShipData, onChangeAltShip }: Props) {
  const [shipToCompany, setShipToCompany] = useState('');
  const [shipToAddress, setShipToAddress] = useState('');
  const [shipToAddress2, setShipToAddress2] = useState('');
  const [shipToCity, setShipToCity] = useState('');
  const [shipToState, setShipToState] = useState('');
  const [shipToZip, setShipToZip] = useState('');
  const [altShipEdited, setAltShipEdited] = useState<AltShip | null>(null);

  useEffect(() => {}, [altShipData]);

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
    onChangeAltShip();
  };

  const handleDelete = async (id: number) => {
    if (!await ask('Are you sure you want to delete this?')) return;
    await deleteAltShipAddress(id);
    setAltShipData(altShipData.filter((data) => data.id !== id));
  };

  const editAltShip = (data: AltShip) => {
    setAltShipEdited(data);
    setShipToCompany(data.shipToCompany);
    setShipToAddress(data.shipToAddress);
    setShipToAddress2(data.shipToAddress2);
    setShipToCity(data.shipToCity);
    setShipToState(data.shipToState);
    setShipToZip(data.shipToZip);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!await ask('Save changes?') || !altShipEdited) return;
    const newAltShip = {
      id: altShipEdited.id,
      shipToCompany,
      shipToAddress,
      shipToAddress2,
      shipToCity,
      shipToState,
      shipToZip
    } as AltShip;
    await editAltShipAddress(newAltShip);
    setAltShipData(altShipData.map((alt) => {
      if (alt.id === newAltShip.id) return newAltShip;
      return alt;
    }));
    resetData();
  };

  const resetData = () => {
    setShipToCompany('');
    setShipToAddress('');
    setShipToAddress2('');
    setShipToCity('');
    setShipToState('');
    setShipToZip('');
    setAltShipEdited(null);
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
      {!altShipEdited && altShipData.map((data: AltShip, i) => {
        return (
          <div key={i} className="alt-ship-dialog__box">
            <p>{ data.shipToCompany }</p>
            <p>{ data.shipToAddress }</p>
            <p>{ data.shipToAddress2 }</p>
            <p>{ data.shipToCity}, { data.shipToState } { data.shipToZip }</p>
            <div className="alt-ship-dialog__box--buttons">
              <Button onClick={() => editAltShip(data)}>Edit</Button>
              <Button onClick={() => selectAddress(data)}>Use This Address</Button>
              <Button onClick={() => data.id && handleDelete(data.id)}>Delete</Button>
            </div>
          </div>
        );
      })}

      {altShipEdited &&
        <form className="alt-ship-dialog__box" onSubmit={handleSave}>
          <Input
            variant={['label-bold']}
            label="Ship to Company"
            value={shipToCompany}
            onChange={(e) => setShipToCompany(e.target.value)}
          />
          <Input
            variant={['label-bold']}
            label="Ship to Address"
            value={shipToAddress}
            onChange={(e) => setShipToAddress(e.target.value)}
          />
          <Input
            variant={['label-bold']}
            label="Ship to Address 2"
            value={shipToAddress2}
            onChange={(e) => setShipToAddress2(e.target.value)}
          />
          <Input
            variant={['label-bold']}
            label="Ship to City"
            value={shipToCity}
            onChange={(e) => setShipToCity(e.target.value)}
          />
          <Input
            variant={['label-bold']}
            label="Ship to State"
            value={shipToState}
            onChange={(e) => setShipToState(e.target.value)}
          />
          <Input
            variant={['label-bold']}
            label="Ship to Zip"
            value={shipToZip}
            onChange={(e) => setShipToZip(e.target.value)}
          />

          <div className="alt-ship-dialog__box--buttons">
            <Button type="submit">Save</Button>
            <Button type="button" onClick={resetData}>Cancel</Button>
            <Button type="button" onClick={() => selectAddress(altShipEdited)}>Use This Address</Button>
          </div>
        </form>
      }
    </Dialog>
  );
}
