import Button from "@/components/Library/Button";
import Dialog from "@/components/Library/Dialog";
import Input from "@/components/Library/Input";
import { getSupabaseFile, uploadSupabaseFile } from "@/scripts/config/supabase";
import { FormEvent, useState } from "react";
import * as XLSX from "xlsx";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  setTableOpen: (open: boolean) => void
  setTableData: (data: PricingChangesReport[]) => void
  setReportsOpen: (open: boolean) => void
}


export default function PricingChangesDialog({ open, setOpen, setTableOpen, setTableData, setReportsOpen }: Props) {
  const [file, setFile] = useState<File>(null);
  const [list, setList] = useState<PricingChangesReport[]>([]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setTableOpen(true);
    setReportsOpen(false);
    setOpen(false);

    const url = await getSupabaseFile('files', 'pricing_changes.xlsx');
    const oldFile = await readFile(url);
    await uploadSupabaseFile('files', file, { upsert: true });
    setTableData(oldFile);
  };

  const readFile = async (url: string): Promise<PricingChangesReport[]> => {
    const res = await fetch(url);
    const blob = await res.blob();
    const reader = new FileReader();
  
    return new Promise((resolve, reject) => {
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet).map((row: any) => {
            return {
              partNum: row.PART_NUMBER,
              desc: row.PART_DESCRIPTION,
              qty: Number(row.AVAILABLE_QTY),
              salesModel: row.SALES_MODEL,
              classCode: row.MAJOR_CLASS_CODE,
              price: Number(row.DISC_PRICE),
              percent: Number(row.DISC_PERCENT)
            };
          }).filter((row) => row.partNum);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
  
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(blob);
    });
  };

  const formatFile = (jsonData: string[][]): PricingChangesReport[] => {
    const formattedData: PricingChangesReport[] = [];
    for (const row of jsonData.slice(1)) {
      const formattedRow = {
        partNum: row[0],
        desc: row[1],
        qty: Number(row[2]),
        salesModel: row[3],
        classCode: row[4],
        price: Number(row[5]),
        percent: Number(row[6])
      };
      formattedData.push(formattedRow);
    }
    return formattedData;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    setFile(file);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setList(formatFile(jsonData));
    };
    reader.readAsArrayBuffer(file);
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
        <Input
          label="Upload Spreadsheet"
          variant={['label-bold']}
          onChange={(e: any) => handleFile(e)}
          accept=".xlsx,.xls"
          type="file"
        />

        <br />
        <div className="form__footer">
          <Button type="submit">Get Results</Button>
        </div>
      </form>
    </Dialog>
  );
}
