import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import WarrantyItemsTable from "@/components/Warranties/WarrantyItemsTable";
import { userAtom, warrantySearchAtom } from "@/scripts/atoms/state";
import { addWarranty, editWarranty, getSomeWarranties, searchWarranties } from "@/scripts/services/warrantiesService";
import { formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import Link from "@/components/Library/Link";
import { useEffect, useState } from "react";
import { confirm } from "@/scripts/config/tauri";
import WarrantySearchDialog from "@/components/Dialogs/WarrantySearchDialog";
import { useArrowSelector } from "@/hooks/useArrowSelector";


export default function Warranties() {
  const [user] = useAtom<User>(userAtom);
  const [searchData] = useAtom(warrantySearchAtom);
  const [warrantiesData, setWarrantiesData] = useState<Warranty[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [focusedWarranty, setFocusedWarranty] = useState<Warranty | null>(null);
  const [warrantySearchOpen, setWarrantySearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useArrowSelector(warranties, focusedWarranty, setFocusedWarranty);
  const LIMIT = 26;
  
  useEffect(() => {
    const fetchData = async () => {
      const res = await getSomeWarranties(1, LIMIT);
      setWarrantiesData(res.rows);
      setPageCount(res.pageCount);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChangePage = async (_: any, page: number) => {
    setLoading(true);
    const hasValidSearchCriteria = (
      searchData.id ||
      (searchData.partNum && searchData.partNum !== '*') ||
      searchData.vendor ||
      searchData.status
    );

    if (hasValidSearchCriteria) {
      const res = await searchWarranties({ ...searchData, offset: (page - 1) * LIMIT });
      setPageCount(res.pageCount);
      setWarranties(res.rows);
    } else{
      const res = await getSomeWarranties(page, LIMIT);
      setWarranties(res.rows);
      setPageCount(res.pageCount);
    }
    setLoading(false);
  };

  const handleChangeStatus = async (war: Warranty, checked: boolean) => {
    if (!await confirm(`Mark warranty as ${checked ? 'closed' : 'open'}?`)) return;
    const updatedWarranty = {
      ...war,
      completed: checked,
      customerId: war.customer?.id
    } as Warranty;
    await editWarranty(updatedWarranty);
    const res = await getSomeWarranties(1, LIMIT);
    setWarrantiesData(res.rows);
    setPageCount(res.pageCount);
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
      handwrittenId: null,
    } as any;
    await addWarranty(newWarranty);
    setWarrantiesData([...warrantiesData, newWarranty]);
  };


  return (
    <Layout title="Warranties">
      <WarrantySearchDialog open={warrantySearchOpen} setOpen={setWarrantySearchOpen} setWarranties={setWarranties} limit={LIMIT} setMinItems={setPageCount} />

      <div className="warranties__container">
        <div className="warranties">
          <h1>Warranties</h1>
          <div className="warranties__top-buttons">
            <Button onClick={() => setWarrantySearchOpen(true)}>Search</Button>
            <Button onClick={handleNewWarranty}>New</Button>
          </div>
          { loading && <Loading /> }

          {warrantiesData &&
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
                  {warranties.map((war) => {
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

              <Pagination
                data={warrantiesData}
                setData={handleChangePage}
                pageCount={pageCount}
                pageSize={LIMIT}
              />
            </div>
          }
        </div>
          
        {focusedWarranty && <WarrantyItemsTable className="warranty-items-table--warranties-page" warrantyItems={focusedWarranty.warrantyItems} /> }
      </div>
    </Layout>
  );
}
