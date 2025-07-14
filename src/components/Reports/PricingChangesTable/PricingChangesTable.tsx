import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../../Library/Button";
import Loading from "../../Library/Loading";
import Table from "../../Library/Table";
import Pagination from "../../Library/Pagination";
import { useEffect, useState } from "react";

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
  type Filter = null | { price?: 'desc' | 'asc', percent?: 'desc' | 'asc', code?: string };
  const [filter, setFilter] = useState<Filter>(null);

  useEffect(() => {
    const filteredData = getFilteredData(filter);
    setList(filteredData.slice(0, limit));
  }, [data]);

  const handleChangePage = (_: any, page: number) => {
    const startIndex = (page - 1) * limit;
    const filteredData = getFilteredData(filter);
    setList(filteredData.slice(startIndex, startIndex + limit));
  };

  const getFilterImg = () => {
    if (filter?.price) return filter?.price === 'desc' ? 'arrow-down-filter' : 'arrow-up-filter';
    if (filter?.percent) return filter?.percent === 'desc' ? 'arrow-down-filter' : 'arrow-up-filter';
  };

  const getFilteredData = (filter: Filter | null): PricingChangesReport[] => {
    let filtered = [...data];

    if (filter?.price) {
      filtered.sort((a, b) =>
        filter.price === 'asc' ? a.price - b.price : b.price - a.price
      );
    } else if (filter?.percent) {
      filtered.sort((a, b) =>
        filter.percent === 'asc' ? a.percent - b.percent : b.percent - a.percent
      );
    } else if (filter?.code) {
      filtered = filtered.filter(d => d.classCode === filter.code);
    }

    return filtered;
  };

  const handleChangeFilter = (newFilter: Filter | null) => {
    let updatedFilter: Filter = null;

    if (newFilter?.price) {
      const current = filter?.price;
      updatedFilter = { price: current === 'asc' ? 'desc' : 'asc' };
    } else if (newFilter?.percent) {
      const current = filter?.percent;
      updatedFilter = { percent: current === 'asc' ? 'desc' : 'asc' };
    } else if (newFilter?.code) {
      updatedFilter = { code: newFilter.code };
    }

    setFilter(updatedFilter);
    const filteredData = getFilteredData(updatedFilter);
    setList(filteredData.slice(0, limit));
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
              <th>
                Major Class Code
                <Button className="pricing-changes__filter-btn" variant={['no-style']}>
                  <img src="/images/icons/filter.svg" alt="Filter" width="14px" />
                </Button>
              </th>
              <th>
                Price
                <Button
                  className="pricing-changes__filter-btn"
                  variant={['no-style']}
                  onClick={() => handleChangeFilter({ price: filter?.price === 'asc' ? 'desc' : 'asc' })}
                >
                  <img src={`/images/icons/${filter?.price ? getFilterImg() : 'sort'}.svg`} alt="Filter" width={filter?.price ? '15px' : '10px'} />
                </Button>
              </th>
              <th>
                Percent
                <Button
                  className="pricing-changes__filter-btn"
                  variant={['no-style']}
                  onClick={() => handleChangeFilter({ percent: filter?.percent === 'asc' ? 'desc' : 'asc' })}
                >
                  <img src={`/images/icons/${filter?.percent ? getFilterImg() : 'sort'}.svg`} alt="Filter" width={filter?.percent ? '15px' : '10px'} />
                </Button>
              </th>
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
