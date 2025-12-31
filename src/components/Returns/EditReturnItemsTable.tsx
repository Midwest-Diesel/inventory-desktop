import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "../library/Table";
import Checkbox from "../library/Checkbox";
import Button from "../library/Button";
import { ask, confirm } from "@/scripts/config/tauri";
import { editPart } from "@/scripts/services/partsService";
import { useNavState } from "../../hooks/useNavState";
import ReturnItemChildrenDialog from "./dialogs/ReturnItemChildrenDialog";
import { useState } from "react";
import Input from "../library/Input";
import { deleteReturnItem } from "@/scripts/services/returnsService";

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
      if (item.id === item.id) return ret;
      return item;
    }));
  };

  const onClickDeleteItem = async (id: number) => {
    if (!await ask('Do you want to delete this item?')) return;
    await deleteReturnItem(id);
    setReturnItems(returnItems.filter((item) => item.id !== id));
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {returnItems.map((item: ReturnItem) => {
                return (
                  <tr key={item.id}>
                    <td>
                      {item.stockNum ?
                        item.stockNum
                        :
                        <Button onClick={() => handleOpenStockNumbers(item)} type="button">Stock Numbers</Button>
                      }
                    </td>
                    <td>
                      <Input
                        value={item.cost || ''}
                        onChange={(e) => handleEditItem({ ...item, cost: Number(e.target.value) })}
                        type="number"
                      />
                    </td>
                    <td>
                      {item.returnItemChildren.length > 0 ?
                        item.returnItemChildren.reduce((acc, cur) => acc + cur.qty, 0)
                        :
                        <Input
                          value={item.qty || ''}
                          onChange={(e) => handleEditItem({ ...item, qty: Number(e.target.value) })}
                          type="number"
                        />
                      }
                    </td>
                    <td>
                      <Input
                        value={item.partNum ?? ''}
                        onChange={(e) => handleEditItem({ ...item, partNum: e.target.value })}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.desc ?? ''}
                        onChange={(e) => handleEditItem({ ...item, desc: e.target.value })}
                      />
                    </td>
                    <td>
                      <Input
                        value={item.unitPrice || ''}
                        onChange={(e) => handleEditItem({ ...item, unitPrice: Number(e.target.value) })}
                        type="number"
                      />
                    </td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={item.isReturnReceived}
                        onChange={(e) => handleEditItem({ ...item, isReturnReceived: e.target.checked })}
                      />
                    </td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={item.isReturnAsDescribed}
                        onChange={(e) => handleEditItem({ ...item, isReturnAsDescribed: e.target.checked })}
                      />
                    </td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={item.isReturnPutAway}
                        onChange={(e) => handleEditItem({ ...item, isReturnPutAway: e.target.checked })}
                      />
                    </td>
                    <td>
                      { item.part?.id && <Button onClick={() => handleOpenPart(item)}>Open Part</Button> }
                    </td>
                    <td>
                      <Button variant={['danger']} onClick={() => onClickDeleteItem(item.id)}>Delete</Button>
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
