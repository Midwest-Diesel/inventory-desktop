import EditWarrantyDetails from "@/components/EditWarrantyDetails";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import WarrantyItemsTableDetails from "@/components/WarrantyItemsTableDetails";
import { userAtom } from "@/scripts/atoms/state";
import { deleteWarranty, editWarranty, getWarrantyById } from "@/scripts/controllers/warrantiesController";
import { formatDate } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import { useAtom } from "jotai";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { confirm } from '@tauri-apps/api/dialog';


export default function Warranty() {
  const router = useRouter();
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [warrantyData, setWarrantyData] = useState<Warranty>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      const res = await getWarrantyById(Number(params.warranty));
      setTitle(`${res.warrantyItems[0].desc} Warranty`);
      setWarrantyData(res);
    };
    fetchData();
  }, [params]);

  const handleDelete = async () => {
    if (user.accessLevel <= 1 || prompt('Type "confirm" to delete this warranty') !== 'confirm') return;
    await deleteWarranty(warrantyData.id);
    router.replace('/warranties');
  };

  const handleCompleteWarranty = async () => {
    if (!await confirm(`${warrantyData.completed ? 'Open' : 'Close'} warranty?`)) return;
    const newWarranty = {
      id: Number(warrantyData.id),
      completed: !warrantyData.completed,
      completedDate: warrantyData.completedDate ? null : new Date(),
      customer: warrantyData.customer,
      date: warrantyData.date,
      vendor: warrantyData.vendor,
      vendorWarrantyNum: warrantyData.vendorWarrantyNum,
      warrantyItems: warrantyData.warrantyItems,
      handwrittenId: warrantyData.handwrittenId,
    } as Warranty;
    await editWarranty(newWarranty);
    setWarrantyData(await getWarrantyById(warrantyData.id));
  };

  const handlePrint = () => {
    window.print();
  };


  return (
    <Layout title="Warranty Details">
      <div className="warranty-details">
        {warrantyData ? isEditing ?
          <EditWarrantyDetails warrantyData={warrantyData} setWarranty={setWarrantyData} setIsEditing={setIsEditing} />
          :
          <>
            <div className="warranty-details__header">
              <div>
                <h2>{ warrantyData.id } Warranty</h2>
                <div className="warranty-details__top-bar">
                  <Button onClick={handlePrint}>Print Report</Button>
                  <Button onClick={handleCompleteWarranty}>{ warrantyData.completed ? 'Open' : 'Complete' } Claim</Button>
                </div>
              </div>

              <div className="header__btn-container">
                <Button
                  variant={['blue']}
                  className="warranty-details__edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  className="warranty-details__close-btn"
                  onClick={() => window.history.back()}
                >
                  Close
                </Button>
                <Button
                  variant={['danger']}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>

            <Grid rows={1} cols={12} gap={1}>
              <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Customer</th>
                      <td>
                        <Link href={`/customer/${warrantyData.customer.id}`}>{ warrantyData.customer.company }</Link>
                      </td>
                    </tr>
                    <tr>
                      <th>Warranty Date</th>
                      <td>{ formatDate(warrantyData.date) }</td>
                    </tr>
                    <tr>
                      <th>Original Invoice Date</th>
                      <td>{ formatDate(warrantyData.invoiceDate) }</td>
                    </tr>
                    <tr>
                      <th>Completed Date</th>
                      <td>{ formatDate(warrantyData.completedDate) }</td>
                    </tr>
                    <tr>
                      <th>Created By</th>
                      <td>{ warrantyData.salesman }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={6} colEnd={11} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Vendor</th>
                      <td>{ warrantyData.vendor }</td>
                    </tr>
                    <tr>
                      <th>Vendor Warranty Number</th>
                      <td>{ warrantyData.vendorWarrantyNum }</td>
                    </tr>
                    <tr>
                      <th>Connected Handwritten</th>
                      <td>
                        <Link href={`/handwrittens/${warrantyData.handwrittenId}`}>{ warrantyData.handwrittenId }</Link>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem variant={['no-style']} colStart={1} colEnd={12}>
                <WarrantyItemsTableDetails warrantyItems={warrantyData.warrantyItems} />
              </GridItem>
            </Grid>
          </>
          :
          <Loading />
        }
      </div>
    </Layout>
  );
}
