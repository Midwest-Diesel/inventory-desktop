import EditWarrantyDetails from "@/components/EditWarrantyDetails";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import WarrantyItemsTableDetails from "@/components/WarrantyItemsTableDetails";
import { userAtom } from "@/scripts/atoms/state";
import { deleteWarranty, editWarrantyCompleted, getWarrantyById } from "@/scripts/controllers/warrantiesController";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import { useAtom } from "jotai";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { confirm, invoke } from "@/scripts/config/tauri";


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
    await editWarrantyCompleted(warrantyData.id, warrantyData.completedDate ? null : new Date());
    setWarrantyData(await getWarrantyById(warrantyData.id));
  };

  const handlePrint = async () => {
    let claimReason = [];
    let vendorReport = [];
    const args = {
      vendor: warrantyData.vendor || '',
      createdDate: formatDate(warrantyData.date),
      id: Number(warrantyData.id),
      vendorWarrantyId: Number(warrantyData.vendorWarrantyNum),
      completed: warrantyData.completed ? `Claim Completed: ${formatDate(warrantyData.completedDate)}` : '',
      billToAddress: warrantyData.customer.billToAddress || '',
      shipToAddress: warrantyData.customer.shipToAddress || '',
      paymentTerms: warrantyData.return.returnPaymentTerms || ' ',
      restockFee: warrantyData.return.restockFee || ' ',
      items: JSON.stringify(warrantyData.warrantyItems.map((item, i) => {
        claimReason.push(`[Row ${i + 1}] ${item.claimReason.replaceAll('"', `'`)}`);
        vendorReport.push(`[Row ${i + 1}] ${item.vendorReport.replaceAll('"', `'`)}`);

        return {
          qty: item.qty || '',
          partNum: item.partNum || '',
          desc: item.desc || '',
          stockNum: item.stockNum || '',
          cost: formatCurrency(item.cost).replaceAll(',', '|') || '$0.00',
          price: formatCurrency(item.price).replaceAll(',', '|') || '$0.00',
          hasVendorReplacedPart: item.hasVendorReplacedPart,
          isCustomerCredited: item.isCustomerCredited,
          vendorCredit: formatCurrency(item.vendorCredit).replaceAll(',', '|') || '$0.00'
        };
      })) || '[]'
    };
    await invoke('print_warranty', { args: { ...args, claimReason: claimReason.join('|||'), vendorReport: vendorReport.join('|||') }});
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
                  <Button onClick={handlePrint}>Print</Button>
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
                    <tr>
                      <th>Connected Return</th>
                      <td>
                        <Link href={`/returns/${warrantyData.return.id}`}>{ warrantyData.return.id }</Link>
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
