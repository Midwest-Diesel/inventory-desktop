import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "../library/Table";
import Checkbox from "../library/Checkbox";
import Button from "../library/Button";
import { confirm } from "@/scripts/config/tauri";
import { editPart } from "@/scripts/services/partsService";
import { useNavState } from "../../hooks/useNavState";
import ReturnItemChildrenDialog from "./dialogs/ReturnItemChildrenDialog";
import { useState } from "react";
import Input from "../library/Input";

interface Props {
  className?: string
  returnData: Return
  returnItems: ReturnItem[]
  setReturnItems: (items: ReturnItem[]) => void
}


export default function EditReturnItemsTable({ className, returnData, returnItems, setReturnItems }: Props) {
  const { push } = useNavState();
  const [stockNumDialogOpen, setStockNumDialogOpen] = useState(false);
  const [returnItemChildren, setReturnItemChildren] = useState<ReturnItemChild[]>([]);
  const [returnItemId, setReturnItemId] = useState(0);

  const handleOpenPart = async (item: ReturnItem) => {
    if (item.part?.purchasedFrom && await confirm('Set "Qty Sold" to 0?')) {
      await editPart({ ...item.part, qtySold: 0 });
    }
    await push('Part', `/part/${item.part?.id}`);
  };

  const handleOpenStockNumbers = (item: ReturnItem) => {
    setStockNumDialogOpen(true);
    setReturnItemId(item.id);
    setReturnItemChildren(item.returnItemChildren);
  };

  const handleEditItem = (ret: ReturnItem) => {
    setReturnItems(returnItems.map((item) => {
      if (item.id === ret.id) return ret;
      return item;
    }));
  };


  return (
    <div className={`return-items-table ${className && className}`}>
      <ReturnItemChildrenDialog
        open={stockNumDialogOpen}
        setOpen={setStockNumDialogOpen}
        returnItemChildren={returnItemChildren}
        setReturnItemChildren={setReturnItemChildren}
        returnItemId={returnItemId}
      />

      {returnItems &&
        <>
          <p><strong>Return Total: </strong>{ formatCurrency(returnData.returnTotal) }</p>
          <Table>
            <thead>
              <tr>
                <th>Stock Number</th>
                <th>Cost</th>
                <th>Qty</th>
                <th>Part Number</th>
                <th>Desc</th>
                <th>Unit Price</th>
                <th>Received</th>
                <th>As Described</th>
                <th>Put Away</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {returnItems.map((ret: ReturnItem) => {
                return (
                  <tr key={ret.id}>
                    <td>
                      {ret.stockNum ?
                        ret.stockNum
                      :
                        <Button onClick={() => handleOpenStockNumbers(ret)} type="button">Stock Numbers</Button>
                      }
                    </td>
                    <td>
                      <Input
                        value={ret.cost || ''}
                        onChange={(e) => handleEditItem({ ...ret, cost: Number(e.target.value) })}
                        type="number"
                      />
                    </td>
                    <td>
                      {ret.returnItemChildren.length > 0 ?
                        ret.returnItemChildren.reduce((acc, cur) => acc + cur.qty, 0)
                        :
                        <Input
                          value={ret.qty || ''}
                          onChange={(e) => handleEditItem({ ...ret, qty: Number(e.target.value) })}
                          type="number"
                        />
                      }
                    </td>
                    <td>
                      <Input
                        value={ret.partNum ?? ''}
                        onChange={(e) => handleEditItem({ ...ret, partNum: e.target.value })}
                      />
                    </td>
                    <td>
                      <Input
                        value={ret.desc ?? ''}
                        onChange={(e) => handleEditItem({ ...ret, desc: e.target.value })}
                      />
                    </td>
                    <td>
                      <Input
                        value={ret.unitPrice || ''}
                        onChange={(e) => handleEditItem({ ...ret, unitPrice: Number(e.target.value) })}
                        type="number"
                      />
                    </td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={ret.isReturnReceived}
                        onChange={(e) => handleEditItem({ ...ret, isReturnReceived: e.target.checked })}
                      />
                    </td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={ret.isReturnAsDescribed}
                        onChange={(e) => handleEditItem({ ...ret, isReturnAsDescribed: e.target.checked })}
                      />
                    </td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={ret.isReturnPutAway}
                        onChange={(e) => handleEditItem({ ...ret, isReturnPutAway: e.target.checked })}
                      />
                    </td>
                    <td>
                      { ret.part?.id && <Button onClick={() => handleOpenPart(ret)}>Open Part</Button> }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      }
    </div>
  );
}
