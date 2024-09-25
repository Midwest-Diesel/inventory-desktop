import { formatCurrency } from "@/scripts/tools/stringUtils";
import Dialog from "../Library/Dialog";
import Table from "../Library/Table";
import { useEffect, useState } from "react";
import { getEngineProfit } from "@/scripts/controllers/enginesController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  stockNum: number
}


export default function EngineProfitDialog({ open, setOpen, stockNum }: Props) {
  const [engineProfit, setEngineProfit] = useState<EngineProfit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getEngineProfit(stockNum);
      setEngineProfit(res);
    };
    fetchData();
  }, []);

  const getTotalCost = () => {
    return engineProfit.reduce((acc, cur) => acc + (cur.purchasePrice * cur.qtySold), 0);
  };

  const getTotalSales = () => {
    return engineProfit.reduce((acc, cur) => acc + (cur.sellingPrice * cur.qtySold), 0);
  };

  const getTotalProfit = () => {
    return getTotalSales() - getTotalCost();
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Engine Profit"
      x={200}
      width={750}
      height={500}
    >
      <div className="engine-profit">
        <div className="engine-profit__top-bar">
          <h3>Total Cost: <span>{ formatCurrency(getTotalCost()) }</span></h3>
          <h3>Total Sales: <span>{ formatCurrency(getTotalSales()) }</span></h3>
          <h3>Total Profit: <span>{ formatCurrency(getTotalProfit()) }</span></h3>
        </div>

        <div className="engine-profit__table">
          <Table>
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Description</th>
                <th>Qty Sold</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
              </tr>
            </thead>
            <tbody>
              {engineProfit && engineProfit.map((data: EngineProfit, i) => {
                return (
                  <tr key={i}>
                    <td>{ data.partNum }</td>
                    <td>{ data.desc }</td>
                    <td>{ data.qtySold }</td>
                    <td>{ formatCurrency(data.purchasePrice) }</td>
                    <td>{ formatCurrency(data.sellingPrice) }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </Dialog>
  );
}
