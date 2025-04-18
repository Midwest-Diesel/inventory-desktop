import Dialog from "../../Library/Dialog";
import Input from "../../Library/Input";
import Button from "../../Library/Button";
import { FormEvent, useEffect, useState } from "react";
import Table from "@/components/Library/Table";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { getPartsByCoreFamily } from "@/scripts/controllers/partsController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}


export default function CoreFamilySearchDialog({ open, setOpen }: Props) {
  const [coreFamily, setCoreFamily] = useState('');
  const [results, setResults] = useState<Part[]>([]);

  useEffect(() => {
    if (!open) return;
    setCoreFamily('');
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await getPartsByCoreFamily(coreFamily);
    setResults(res);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Quote Family Search"
      width={800}
      maxHeight="30rem"
    >
      <form onSubmit={handleSubmit} style={{ margin: '0 auto 1rem', maxWidth: '20rem' }}>
        <Input
          label="Core Family"
          variant={['small', 'thin', 'label-no-stack', 'label-space-between', 'label-bold']}
          value={coreFamily}
          onChange={(e: any) => setCoreFamily(e.target.value)}
        />

        <div className="form__footer">
          <Button type="submit" variant={['small']}>Submit</Button>
        </div>
      </form>

      {results.length > 0 &&
        <Table>
          <thead>
            <tr>
              <th>Core Family</th>
              <th>Part Number</th>
              <th>Stock Number</th>
              <th>Qty</th>
              <th>Condition</th>
              <th>Purchase Price</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => {
              return (
                <tr key={row.id}>
                  <td>{ row.coreFamily }</td>
                  <td>{ row.partNum }</td>
                  <td>{ row.stockNum }</td>
                  <td>{ row.qty }</td>
                  <td>{ row.condition }</td>
                  <td>{ formatCurrency(row.purchasePrice) }</td>
                  <td>{ row.location }</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      }
    </Dialog>
  );
}
