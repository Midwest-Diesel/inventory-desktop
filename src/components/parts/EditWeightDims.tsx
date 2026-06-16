import { useState } from "react";
import Button from "../library/Button";
import Input from "../library/Input";
import Select from "../library/select/Select";

interface Props {
  weightDims: WeightDims[]
  setWeightDims: (value: WeightDims[]) => void
}


export default function EditWeightDims({ weightDims, setWeightDims }: Props) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const onClickAddRow = () => {
    setWeightDims([...weightDims, { qty: 1, type: 'Small Pack', lbs: 0, length: 0, width: 0, height: 0 }]);
  };

  const onClickDeleteRow = (index: number) => {
    setWeightDims(weightDims.filter((_, i) => i !== index));
  };


  return (
    <>
      {weightDims.map((item, i) => (
        <tr key={i} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
          {weightDims.length > 1 &&
            <>
              <th style={{ position: 'relative' }}>
                Qty

                {hoveredRow === i &&
                  <Button
                    style={{ position: 'absolute', zIndex: 1, left: 0, top: 0, bottom: 0, background: 'var(--red-1)', padding: '0.2rem' }}
                    variant={['danger']}
                    onClick={() => onClickDeleteRow(i)}
                  >
                    <img src="/images/icons/delete.svg" alt="Delete" width={17} height={17} draggable={false} />
                  </Button>
                }
              </th>

              <td style={{ width: '4rem' }}>
                <Input
                  value={item.qty ?? ''}
                  onChange={(e) => {
                    const newWeightDims = [...weightDims];
                    newWeightDims[i] = { ...item, qty: Number(e.target.value)};
                    setWeightDims(newWeightDims);
                  }}
                  type="number"
                  step="any"
                />
              </td>
            </>
          }

          <th>Type</th>
          <td style={{ width: '4rem' }}>
            <Select
              value={item.type}
              onChange={(e) => {
                const newWeightDims = [...weightDims];
                newWeightDims[i] = { ...item, type: e.target.value as WeightDimsType };
                setWeightDims(newWeightDims);
              }}
            >
              <option>Small Pack</option>
              <option>LTL</option>
            </Select>
          </td>

          <th>Lbs</th>
          <td style={{ width: '4rem' }}>
            <Input
              value={item.lbs ?? ''}
              onChange={(e) => {
                const newWeightDims = [...weightDims];
                newWeightDims[i] = { ...item, lbs: Number(e.target.value) };
                setWeightDims(newWeightDims);
              }}
              type="number"
              step="any"
            />
          </td>

          <th>L</th>
          <td style={{ width: '4rem' }}>
            <Input
              value={item.length ?? ''}
              onChange={(e) => {
                const newWeightDims = [...weightDims];
                newWeightDims[i] = { ...item, length: Number(e.target.value) };
                setWeightDims(newWeightDims);
              }}
              type="number"
              step="any"
            />
          </td>

          <th>W</th>
          <td style={{ width: '4rem' }}>
            <Input
              value={item.width ?? ''}
              onChange={(e) => {
                const newWeightDims = [...weightDims];
                newWeightDims[i] = { ...item, width: Number(e.target.value) };
                setWeightDims(newWeightDims);
              }}
              type="number"
              step="any"
            />
          </td>

          <th>H</th>
          <td style={{ width: '4rem' }}>
            <Input
              value={item.height ?? ''}
              onChange={(e) => {
                const newWeightDims = [...weightDims];
                newWeightDims[i] = { ...item, height: Number(e.target.value) };
                setWeightDims(newWeightDims);
              }}
              type="number"
              step="any"
            />
          </td>
        </tr>
      ))}

      <Button
        variant={['xx-small', 'fit']}
        onClick={onClickAddRow}
      >
        Add
      </Button>
    </>
  );
}
