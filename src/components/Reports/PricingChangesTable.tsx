import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../Library/Button";
import Loading from "../Library/Loading";
import Table from "../Library/Table";
import { getSupabaseFile } from "@/scripts/config/supabase";
import { useState } from "react";
import Pagination from "../Library/Pagination";

interface Props {
  setTableOpen: (open: boolean) => void
  data: PricingChangesReport[]
  setReportsOpen: (open: boolean) => void
}


export default function PricingChangesTable({ setTableOpen, data, setReportsOpen }: Props) {
  const [list, setList] = useState<PricingChangesReport[]>([]);
  const LIMIT = 200;

  const handleGoBack = () => {
    setTableOpen(false);
    setReportsOpen(true);
  };

  const handleDownload = async () => {
    const url = await getSupabaseFile('files', 'pricing_changes.xlsx');
    window.open(url);
  };

  const handleChangePage = async (_: any, page: number) => {
    const startIndex = (page - 1) * LIMIT;
    const paginatedData = data.slice(startIndex, startIndex + LIMIT);
    setList(paginatedData);
  };


  return (
    <>
      <div className="reports-table">
        <div className="reports-table__top-bar">
          <Button onClick={handleGoBack}>Back</Button>
          <Button onClick={handleDownload}>Download Spreadsheet</Button>
        </div>
        <h3>Rows: {data.length}</h3>

        <Table>
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Sales Model</th>
              <th>Major Class Code</th>
              <th>Price</th>
              <th>Percent</th>
            </tr>
          </thead>
          <tbody>
            {list && list.map((row, i) => {
              const isAddingRow = row.oldPartNum === 'ADD' as any;
              const isDeletingRow = row.oldPartNum === 'DELETE' as any;

              return (
                <tr key={i}>
                  {row.oldPartNum && row.oldPartNum !== row.partNum ?
                    <td style={{ backgroundColor: 'var(--grey-light-5)', fontWeight: 'bold' }}>
                      <span style={{ color: !isDeletingRow ? 'var(--green-light-1)' : 'var(--red-2)' }}>{ row.partNum } </span>
                      { !isAddingRow && !isDeletingRow && <span style={{ color: 'var(--red-2)', textDecoration: 'line-through' }}>{ row.oldPartNum }</span> }
                    </td>
                    :
                    <td>
                      { row.partNum }
                    </td>
                  }
                  
                  {row.oldDesc && row.oldDesc !== row.desc ?
                    <td style={{ backgroundColor: 'var(--grey-light-5)', fontWeight: 'bold' }}>
                      <span style={{ color: !isDeletingRow ? 'var(--green-light-1)' : 'var(--red-2)' }}>{ row.desc } </span>
                      { !isAddingRow && !isDeletingRow && <span style={{ color: 'var(--red-2)', textDecoration: 'line-through' }}>{ row.oldDesc }</span> }
                    </td>
                    :
                    <td>
                      { row.desc }
                    </td>
                  }
                  
                  {row.oldQty && row.oldQty !== row.qty ?
                    <td style={{ backgroundColor: 'var(--grey-light-5)', fontWeight: 'bold' }}>
                      <span style={{ color: !isDeletingRow ? 'var(--green-light-1)' : 'var(--red-2)' }}>{ row.qty } </span>
                      { !isAddingRow && !isDeletingRow && <span style={{ color: 'var(--red-2)', textDecoration: 'line-through' }}>{ row.oldQty }</span> }
                    </td>
                    :
                    <td>
                      { row.qty }
                    </td>
                  }
                  
                  {row.oldSalesModel && row.oldSalesModel !== row.salesModel ?
                    <td style={{ backgroundColor: 'var(--grey-light-5)', fontWeight: 'bold' }}>
                      <span style={{ color: !isDeletingRow ? 'var(--green-light-1)' : 'var(--red-2)' }}>{ `${row.salesModel}`.split(';').join(', ') } </span>
                      { !isAddingRow && !isDeletingRow && <span style={{ color: 'var(--red-2)', textDecoration: 'line-through' }}>{ `${row.oldSalesModel}`.split(';').join(', ') }</span> }
                    </td>
                    :
                    <td>
                      { `${row.salesModel}`.split(';').join(', ') }
                    </td>
                  }
                  
                  {row.oldClassCode && row.oldClassCode !== row.classCode ?
                    <td style={{ backgroundColor: 'var(--grey-light-5)', fontWeight: 'bold' }}>
                      <span style={{ color: !isDeletingRow ? 'var(--green-light-1)' : 'var(--red-2)' }}>{ row.classCode } </span>
                      { !isAddingRow && !isDeletingRow && <span style={{ color: 'var(--red-2)', textDecoration: 'line-through' }}>{ row.oldClassCode }</span>}
                    </td>
                    :
                    <td>
                      { row.classCode }
                    </td>
                  }
                  
                  {row.oldPrice && row.oldPrice !== row.price ?
                    <td style={{ backgroundColor: 'var(--grey-light-5)', fontWeight: 'bold' }}>
                      <span style={{ color: !isDeletingRow ? 'var(--green-light-1)' : 'var(--red-2)' }}>{ formatCurrency(row.price) } </span>
                      { !isAddingRow && !isDeletingRow && <span style={{ color: 'var(--red-2)', textDecoration: 'line-through' }}>{ formatCurrency(row.oldPrice) }</span> }
                    </td>
                    :
                    <td>
                      { formatCurrency(row.price) }
                    </td>
                  }
                  
                  {row.oldPercent && row.oldPercent !== row.percent ?
                    <td style={{ backgroundColor: 'var(--grey-light-5)', fontWeight: 'bold' }}>
                      <span style={{ color: !isDeletingRow ? 'var(--green-light-1)' : 'var(--red-2)' }}>{ row.percent }% </span>
                      { !isAddingRow && !isDeletingRow && <span style={{ color: 'var(--red-2)', textDecoration: 'line-through' }}>{ row.oldPercent }%</span> }
                    </td>
                    :
                    <td>
                      { row.percent }%
                    </td>
                  }
                </tr>
              );
            })}
          </tbody>
        </Table>
        { data.length == 0 && <Loading /> }
      </div>

      <Pagination
        data={data}
        setData={handleChangePage}
        pageCount={data.length}
        pageSize={LIMIT}
      />
    </>
  );
}
