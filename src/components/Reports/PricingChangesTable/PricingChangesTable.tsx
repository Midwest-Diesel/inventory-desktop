import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../../Library/Button";
import Loading from "../../Library/Loading";
import Table from "../../Library/Table";
import Pagination from "../../Library/Pagination";

interface Props {
  data: PricingChangesReport[]
  list: PricingChangesReport[]
  setList: (value: PricingChangesReport[]) => void
  watchedPartNums: string[]
  toggleWatchRow: (row: PricingChangesReport, isWatched: boolean) => Promise<void>
  limit: number
  maxHeight?: string
}


export default function PricingChangesTable({ data, list, setList, watchedPartNums, toggleWatchRow, limit, maxHeight = 'auto' }: Props) {
  const handleChangePage = async (_: any, page: number) => {
    const startIndex = (page - 1) * limit;
    const paginatedData = data.slice(startIndex, startIndex + limit);
    setList(paginatedData);
  };


  return (
    <>
      <h3>Rows: { data.length }</h3>

      <div style={{ maxHeight, overflowY: 'auto' }}>
        <Table>
          <thead>
            <tr>
              <th></th>
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
              const isWatched = watchedPartNums.includes(row.partNum);

              return (
                <tr key={i} style={isWatched ? { color: 'var(--yellow-2)', fontWeight: 'bold' } : {}}>
                  <td>
                    <Button variant={['no-style']} className="pricing-changes__watch-btn" onClick={() => toggleWatchRow(row, isWatched)}>
                      <img src={`/images/icons/eye-${isWatched ? 'slash' : 'open'}.svg`} alt="Eye opened" />
                    </Button>
                  </td>
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

        <Pagination
          data={data}
          setData={handleChangePage}
          pageCount={data.length}
          pageSize={limit}
        />
      </div>
    </>
  );
}
