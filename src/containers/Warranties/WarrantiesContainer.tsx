import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import WarrantyItemsTable from "@/components/Warranties/WarrantyItemsTable";
import { userAtom, warrantySearchAtom } from "@/scripts/atoms/state";
import { addWarranty, editWarrantyCompleted, getSomeWarranties, searchWarranties } from "@/scripts/services/warrantiesService";
import { formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import Link from "@/components/Library/Link";
import { useState } from "react";
import { confirm } from "@/scripts/config/tauri";
import WarrantySearchDialog from "@/components/Dialogs/WarrantySearchDialog";
import { useArrowSelector } from "@/hooks/useArrowSelector";
import { useQuery } from "@tanstack/react-query";

const LIMIT = 26;


export default function WarrantiesContainer() {
  const [user] = useAtom<User>(userAtom);
  const [searchData] = useAtom(warrantySearchAtom);
  const [focusedWarranty, setFocusedWarranty] = useState<Warranty | null>(null);
  const [warrantySearchOpen, setWarrantySearchOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: warranties, isFetching, refetch } = useQuery<WarrantyRes>({
    queryKey: ['warranties', currentPage, searchData],
    queryFn: async () => {
      const hasValidSearchCriteria = (
        searchData.id ||
        (searchData.partNum && searchData.partNum !== '*') ||
        searchData.vendor ||
        searchData.status
      );

      if (hasValidSearchCriteria) {
        return await searchWarranties({ ...searchData, offset: (currentPage - 1) * LIMIT });
      } else{
        return await getSomeWarranties(currentPage, LIMIT);
      }
    }
  });

  useArrowSelector(warranties?.rows ?? [], focusedWarranty, setFocusedWarranty);

  const handleChangePage = async (_: any, page: number) => {
    setCurrentPage(page);
  };

  const handleChangeStatus = async (war: Warranty, checked: boolean) => {
    if (!await confirm(`Mark warranty as ${checked ? 'closed' : 'open'}?`)) return;
    const date = checked ? new Date() : null;
    await editWarrantyCompleted(war.id, checked, date);
    await refetch();
  };

  const handleNewWarranty = async () => {
    const newWarranty = {
      customerId: null,
      date: new Date(),
      salesmanId: user.id,
      vendor: '',
      invoiceDate: null,
      completed: false,
      completedDate: null,
      vendorWarrantyNum: null,
      handwrittenId: null
    } as any;
    await addWarranty(newWarranty);
    await refetch();
  };


  return (
    <>
      <WarrantySearchDialog open={warrantySearchOpen} setOpen={setWarrantySearchOpen} limit={LIMIT} />

      <div className="warranties__container">
        <div className="warranties">
          <h1>Warranties</h1>
          <div className="warranties__top-buttons">
            <Button onClick={() => setWarrantySearchOpen(true)}>Search</Button>
            <Button onClick={handleNewWarranty}>New</Button>
          </div>

          { isFetching && <Loading /> }
          { !warranties && <p>No results...</p> }

          {warranties &&
            <>
              <div className="warranties__table-container">
                <Table>
                  <thead>
                    <tr>
                      <th>Warranty</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Part Number</th>
                      <th>Description</th>
                      <th>Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warranties.rows.map((war) => {
                      return (
                        <tr key={war.id} onClick={() => setFocusedWarranty(war)} style={ focusedWarranty && war.id === focusedWarranty.id ? { border: 'solid 3px var(--yellow-2)' } : {} }>
                          <td><Link href={`/warranties/${war.id}`} data-testid="warranty-link">{ war.id }</Link></td>
                          <td>{ formatDate(war.date) }</td>
                          <td>{ war.customer && war.customer.company }</td>
                          <td>{ war.warrantyItems && war.warrantyItems[0].partNum }</td>
                          <td>{ war.warrantyItems && war.warrantyItems[0].desc }</td>
                          <td className="cbx-td">
                            <Checkbox
                              checked={war.completed}
                              onChange={(e: any) => handleChangeStatus(war, e.target.checked)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              <Pagination
                data={warranties.rows}
                setData={handleChangePage}
                pageCount={warranties.pageCount}
                pageSize={LIMIT}
              />
            </>
          }
        </div>
          
        {focusedWarranty && <WarrantyItemsTable className="warranty-items-table--warranties-page" warrantyItems={focusedWarranty.warrantyItems} /> }
      </div>
    </>
  );
}
