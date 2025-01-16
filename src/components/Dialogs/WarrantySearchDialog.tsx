import { FormEvent, useState } from "react";
import Dialog from "../Library/Dialog";
import Input from "../Library/Input";
import Button from "../Library/Button";
import Select from "../Library/Select/Select";
import VendorSelect from "../Library/Select/VendorSelect";
import { searchWarranties } from "@/scripts/controllers/warrantiesController";
import { useAtom } from "jotai";
import { warrantySearchAtom } from "@/scripts/atoms/state";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setWarranties: (warranties: Warranty[]) => void
  setMinItems: (minItems: number[]) => void
  limit: number
  page: number
}


export default function WarrantySearchDialog({ open, setOpen, setWarranties, setMinItems, limit, page }: Props) {
  const [searchData, setSearchData] = useAtom(warrantySearchAtom);
  const [id, setId] = useState<number>('' as any);
  const [partNum, setPartNum] = useState('');
  const [vendor, setVendor] = useState('');
  const [status, setStatus] = useState<'' | 'TRUE' | 'FALSE'>('');

  const clearInputs = () => {
    setId('' as any);
    setPartNum('');
    setVendor('');
    setStatus('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const searchData = {
      id: Number(id),
      partNum,
      vendor,
      status,
      limit,
      page: (page - 1) * limit
    };
    const res = await searchWarranties(searchData);
    setWarranties(res.rows);
    setMinItems(res.minItems);
    setSearchData(searchData);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Warranty Search"
      width={500}
      height={300}
      className="engines-search-dialog"
      y={-200}
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        <Input
          label="Warranty ID"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={id}
          onChange={(e: any) => setId(e.target.value)}
          type="number"
        />

        <Input
          label="Part Number"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between']}
          value={partNum}
          onChange={(e: any) => setPartNum(e.target.value)}
        />

        <VendorSelect
          variant={['label-space-between', 'label-inline']}
          label="Vendor"
          value={vendor}
          onChange={(e: any) => setVendor(e.target.value)}
        />

        <Select
          variant={['label-space-between', 'label-inline']}
          label="Status"
          value={status}
          onChange={(e: any) => setStatus(e.target.value)}
        >
          <option value="">Both</option>
          <option value="TRUE">True</option>
          <option value="FALSE">False</option>
        </Select>

        <div className="form__footer">
          <Button type="button" variant={['small']} onClick={clearInputs}>Clear</Button>
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>
    </Dialog>
  );
}
