import { formatCurrency } from "@/scripts/tools/stringUtils";
import Table from "./Library/Table";
import Checkbox from "./Library/Checkbox";
import { editReturnItem } from "@/scripts/controllers/returnsController";
import Button from "./Library/Button";
import { useRouter } from "next/navigation";
import { confirm } from "@/scripts/config/tauri";
import { editPart } from "@/scripts/controllers/partsController";

interface Props {
  className?: string
  returnItems: ReturnItem[]
  returnData: Return
  setReturnData: (returns: Return) => void
}


export default function ReturnItemsTable({ className, returnItems, returnData, setReturnData }: Props) {
  const router = useRouter();

  const getTotalPrice = (): number => {
    return returnItems.reduce((acc, item) => item.cost !== 0.04 && item.cost !== 0.01 && acc + (item.unitPrice * item.qty), 0);
  };

  const handleToggleIsReceived = async (part: ReturnItem, value: boolean) => {
    await editReturnItem({ ...part, isReturnReceived: value });
    setReturnData({ ...returnData, returnItems: returnData.returnItems.map((item) => {
      if (item.id === part.id) return { ...item, isReturnReceived: value };
      return item;
    })});
  };

  const handleToggleAsDescribed = async (part: ReturnItem, value: boolean) => {
    await editReturnItem({ ...part, isReturnAsDescribed: value });
    setReturnData({ ...returnData, returnItems: returnData.returnItems.map((item) => {
      if (item.id === part.id) return { ...item, isReturnAsDescribed: value };
      return item;
    })});
  };

  const handleTogglePutAway = async (part: ReturnItem, value: boolean) => {
    await editReturnItem({ ...part, isReturnPutAway: value });
    setReturnData({ ...returnData, returnItems: returnData.returnItems.map((item) => {
      if (item.id === part.id) return { ...item, isReturnPutAway: value };
      return item;
    })});
  };

  const handleOpenPart = async (item: ReturnItem) => {
    if (item.part.purchasedFrom && await confirm('Set "Qty Sold" to 0?')) {
      await editPart({ ...item.part, qtySold: 0 });
    }
    router.push(`/part/${item.part.id}`);
  };


  return (
    <div className={`return-items-table ${className && className}`}>
      {returnItems.sort((a, b) => b.id - a.id) &&
        <>
          <p><strong>Return Total: </strong>{ formatCurrency(getTotalPrice()) }</p>
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
                    <td>{ ret.stockNum }</td>
                    <td>{ formatCurrency(ret.cost) }</td>
                    <td>{ ret.qty }</td>
                    <td>{ ret.partNum }</td>
                    <td>{ ret.desc }</td>
                    <td>{ formatCurrency(ret.unitPrice) }</td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={ret.isReturnReceived}
                        onChange={(e: any) => handleToggleIsReceived(ret, e.target.checked)}
                      />
                    </td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={ret.isReturnAsDescribed}
                        onChange={(e: any) => handleToggleAsDescribed(ret, e.target.checked)}
                      />
                    </td>
                    <td className="cbx-td">
                      <Checkbox
                        checked={ret.isReturnPutAway}
                        onChange={(e: any) => handleTogglePutAway(ret, e.target.checked)}
                      />
                    </td>
                    <td>
                      { ret.part.id && <Button onClick={() => handleOpenPart(ret)}>Open Part</Button> }
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
