import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { addGonculatorData, deleteGonculatorData, reportTheMachines } from "@/scripts/controllers/reportsController";
import { FormEvent, useState } from "react";
import * as XLSX from "xlsx";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setTableOpen: (open: boolean) => void
  setTableData: (data: TheMachinesReport[]) => void
  setReportsOpen: (open: boolean) => void
}


export default function TheMachinesDialog({ open, setOpen, setTableOpen, setTableData, setReportsOpen }: Props) {
  const [partList, setPartList] = useState<string[]>([]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setTableOpen(true);
    setReportsOpen(false);
    setOpen(false);
    const res = await reportTheMachines();
    setTableData(res);
  };

  const formatFile = (jsonData: string[][]): string[] => {
    const formattedData: string[] = [];
    for (const row of jsonData) {
      const formattedRow = row.join(", ");
      formattedData.push(formattedRow);
    }
    return formattedData;
  };  

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setPartList(formatFile(jsonData));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSetPartData = async () => {
    if (partList.length === 0) return;
    const chunkSize = 100;
    await deleteGonculatorData();
  
    for (let i = 0; i < partList.length; i += chunkSize) {
      const chunk = partList.slice(i, i + chunkSize);
      await addGonculatorData(chunk);
    }
  };
  


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Gonculator"
      width={400}
      y={-100}
      className="reports-dialog"
    >
      <form onSubmit={handleSearch}>
        <div style={{ display: 'flex' }}>
          <Input
            label="Upload Parts"
            variant={['label-bold']}
            accept=".xlsx,.xls"
            type="file"
            onChange={(e: any) => handleFile(e)}
          />
          <Button style={{ height: 'fit-content', alignSelf: 'center' }} type="button" onClick={handleSetPartData}>Set Part Data</Button>
        </div>

        <br />
        <div className="form__footer">
          <Button type="submit">Get Results</Button>
        </div>
      </form>
    </Dialog>
  );
}
