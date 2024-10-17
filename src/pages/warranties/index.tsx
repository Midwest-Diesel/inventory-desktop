import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Loading from "@/components/Library/Loading";
import Pagination from "@/components/Library/Pagination";
import Table from "@/components/Library/Table";
import WarrantyItemsTable from "@/components/WarrantyItemsTable";
import { userAtom } from "@/scripts/atoms/state";
import { addWarranty, editWarranty, getSomeWarranties, getWarrantyCount } from "@/scripts/controllers/warrantiesController";
import { formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function Warranties() {
  const [user] = useAtom<User>(userAtom);
  const [warrantiesData, setWarrantiesData] = useState<Warranty[]>();
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [warrantiesMin, setWarrantiesMin] = useState<number[]>([]);
  const [focusedWarranty, setFocusedHandwritten] = useState<Warranty>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      const pageCount = await getWarrantyCount();
      setWarrantiesMin(pageCount);

      const res = await getSomeWarranties(1, 26);
      setWarrantiesData(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChangePage = async (data: any, page: number) => {
    const res = await getSomeWarranties(page, 26);
    setWarranties(res);
  };

  const handleChangeStatus = async (war: Warranty, checked: boolean) => {
    if (!confirm(`Mark warranty as ${checked ? 'closed' : 'open'}?`)) return;
    const updatedWarranty = {
      ...war,
      completed: checked,
      customerId: war.customer.id
    } as Warranty;
    await editWarranty(updatedWarranty);
    const res = await getSomeWarranties(1, 26);
    setWarrantiesData(res);
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
      <div className="warranties__container">
        <div className="warranties">
          <h1>Warranties</h1>
          <div className="warranties__top-buttons">
            <Button>Search</Button>
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
                      <tr key={war.id} onClick={() => setFocusedHandwritten(war)} style={ focusedWarranty && war.id === focusedWarranty.id ? { border: 'solid 3px var(--yellow-2)' } : {} }>
                        <td><a href={`/warranties/${war.id}`}>{ war.id }</a></td>
                        <td>{ formatDate(war.date) }</td>
                        <td><a href={`/customer/${war.customer.id}`}>{ war.customer.company }</a></td>
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
                minData={warrantiesMin}
                pageSize={26}
              />
            </div>
          }
        </div>
          
        {focusedWarranty && <WarrantyItemsTable className="warranty-items-table--warranties-page" warrantyItems={focusedWarranty.warrantyItems} /> }
      </div>
    </Layout>
  );
}
