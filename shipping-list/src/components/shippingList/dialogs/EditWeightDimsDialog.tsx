import { useEffect, useState } from "react";
import Dialog from "@/components/library/Dialog";
import { Button, Input, Table } from "@midwest-diesel/mwd-ui";
import useAutoSave from "@/hooks/useAutoSave";
import { editShippingList } from "@/scripts/services/shippingListService";

interface Props {
  row: ShippingListRow
  setRow: (value: ShippingListRow | null) => void
  refetch: () => void
}


export default function EditWeightDimsDialog({ row, setRow, refetch }: Props) {
  const [weightDims, setWeightDims] = useState<WeightDims[]>(row.weightDims);

  useEffect(() => {
    setWeightDims(row.weightDims);
  }, [row]);

  useAutoSave(weightDims, async () => {
    const newWeightDims: WeightDims[] = weightDims.map((r) => ({ ...r, lbs: Number(r.lbs) }));
    await editShippingList({ ...row, weightDims: newWeightDims }, 'weightDims');
    refetch();
  }, { delay: 0 });

  const onChange = (i: number, field: keyof typeof weightDims[number], value: string | number) => {
    setWeightDims((prev) => prev.map((r, index) => {
      return index === i ? { ...r, [field]: value } : r;
    }));
  };

  const onClickAddRow = async () => {
    setWeightDims((prev) => [
      ...prev,
      { type: 'Small Pack', qty: 1, lbs: 0, length: 0, width: 0, height: 0 }
    ]);
  };

  const onClickRemoveRow = async (i: number) => {
    setWeightDims((prev) => prev.filter((_, index) => index !== i))
  };
 
 
  return (
    <Dialog
      title={row.customer}
      open={!!row}
      setOpen={() => setRow(null)}
      y={-200}
      x={850}
    >
      <Table>
        <thead>
          <tr>
            <th>Weight</th>
            <th>Length</th>
            <th>Width</th>
            <th>Height</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {weightDims.map((r, i) => {
            return (
              <tr key={i}>
                <td>
                  <Input
                    variant={['no-arrows']}
                    value={r.lbs}
                    type="number"
                    onChange={(e) => onChange(i, 'lbs', e.target.value)}
                  />
                </td>
 
                <td>
                  <Input
                    variant={['no-arrows']}
                    value={r.length}
                    type="number"
                    onChange={(e) => onChange(i, 'length', e.target.value)}
                  />
                </td>
 
                <td>
                  <Input
                    variant={['no-arrows']}
                    value={r.width}
                    type="number"
                    onChange={(e) => onChange(i, 'width', e.target.value)}
                  />
                </td>
 
                <td>
                  <Input
                    variant={['no-arrows']}
                    value={r.height}
                    type="number"
                    onChange={(e) => onChange(i, 'height', e.target.value)}
                  />
                </td>
 
                <td>
                  <Button variant={['danger']} onClick={() => onClickRemoveRow(i)}>
                    <img src="/images/icons/delete.svg" width={14} height={14} draggable={false} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
 
      <Button onClick={onClickAddRow}>Add</Button>
    </Dialog>
  );
}
