import { formatCurrency } from "@/scripts/tools/stringUtils";
import Button from "../../Library/Button";
import Loading from "../../Library/Loading";
import Table from "../../Library/Table";
import Pagination from "../../Library/Pagination";
import { useEffect, useMemo, useState } from "react";
import Select from "@/components/Library/Select/Select";

interface Props {
  data: PricingChangesReport[]
  list: PricingChangesReport[]
  setList: (value: PricingChangesReport[]) => void
  watchedPartNums: string[]
  toggleWatchRow: (row: PricingChangesReport, isWatched: boolean) => Promise<void>
  limit: number
  maxHeight: string
}
type Filter = { price?: 'desc' | 'asc' | null, percent?: 'desc' | 'asc' | null, code?: string };


export default function PricingChangesTable({ data, list, setList, watchedPartNums, toggleWatchRow, limit, maxHeight = 'auto' }: Props) {
  const [filter, setFilter] = useState<Filter | null>(null);
  const [filteredData, setFilteredData] = useState<PricingChangesReport[]>(data);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const newFiltered = getFilteredData(filter);
    setFilteredData(newFiltered);
    const startIndex = (currentPage - 1) * limit;
    setList(newFiltered.slice(startIndex, startIndex + limit));
  }, [data, filter, currentPage, limit]);

  const uniqueClassCodes = useMemo(() => {
    const codes = new Set<string>();
    data.forEach((d) => d.classCode && codes.add(d.classCode));
    return Array.from(codes).sort();
  }, [data]);

  const handleChangePage = (_: any, page: number) => {
    setCurrentPage(page);
  };

  const getFilterImg = () => {
    if (filter?.price) return filter?.price === 'desc' ? 'arrow-down-filter' : 'arrow-up-filter';
    if (filter?.percent) return filter?.percent === 'desc' ? 'arrow-down-filter' : 'arrow-up-filter';
  };

  const getFilteredData = (filter: Filter | null): PricingChangesReport[] => {
    let filtered = [...data];
    if (filter?.code) {
      filtered = filtered.filter(d => d.classCode === filter.code);
    }

    if (filter?.price) {
      filtered.sort((a, b) =>
        filter.price === 'asc' ? a.price - b.price : b.price - a.price
      );
    } else if (filter?.percent) {
      filtered.sort((a, b) =>
        filter.percent === 'asc' ? a.percent - b.percent : b.percent - a.percent
      );
    }
    return filtered;
  };

  const handleChangeFilter = (newFilter: Filter | null) => {
    let updatedFilter: Filter | null = { ...filter };
    if (newFilter?.price !== undefined) {
      const current = filter?.price;
      if (current === 'asc') {
        updatedFilter = { ...updatedFilter, price: 'desc' };
      } else if (current === 'desc') {
        delete updatedFilter.price;
      } else {
        updatedFilter = { ...updatedFilter, price: 'asc' };
      }
      delete updatedFilter.percent;
    } else if (newFilter?.percent !== undefined) {
      const current = filter?.percent;
      if (current === 'asc') {
        updatedFilter = { ...updatedFilter, percent: 'desc' };
      } else if (current === 'desc') {
        delete updatedFilter.percent;
      } else {
        updatedFilter = { ...updatedFilter, percent: 'asc' };
      }
      delete updatedFilter.price;
    } else if (newFilter?.code !== undefined) {
      if (newFilter.code) {
        updatedFilter.code = newFilter.code;
      } else {
        delete updatedFilter.code;
      }
    }

    if (Object.keys(updatedFilter).length === 0) updatedFilter = null;

    setFilter(updatedFilter);
    const filteredData = getFilteredData(updatedFilter);
    setList(filteredData.slice(0, limit));
  };


  return (
    <>
      <h3>Rows: { filteredData.length }</h3>

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
                <Select
                  value={filter?.code || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChangeFilter({ code: val });
                  }}
                  style={{ marginLeft: '0.5rem' }}
                >
                  <option value="">All</option>
                  {uniqueClassCodes.map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </Select>
              </th>
              <th>
                Price
                <Button
                  className="pricing-changes__filter-btn"
                  variant={['no-style']}
                  onClick={() => handleChangeFilter({ price: null })}
                >
                  <img src={`/images/icons/${filter?.price ? getFilterImg() : 'sort'}.svg`} alt="Filter" width={filter?.price ? '15px' : '10px'} />
                </Button>
              </th>
              <th>
                Percent
                <Button
                  className="pricing-changes__filter-btn"
                  variant={['no-style']}
                  onClick={() => handleChangeFilter({ percent: null })}
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
      </div>
      <Pagination
        data={data}
        setData={handleChangePage}
        pageCount={filteredData.length}
        pageSize={limit}
      />
    </>
  );
}
