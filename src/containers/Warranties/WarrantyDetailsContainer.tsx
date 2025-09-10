import EditWarrantyDetails from "@/components/Warranties/EditWarrantyDetails";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import WarrantyItemsTableDetails from "@/components/Warranties/WarrantyItemsTableDetails";
import { userAtom } from "@/scripts/atoms/state";
import { deleteWarranty, editWarrantyCompleted, getWarrantyById } from "@/scripts/services/warrantiesService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import { useAtom } from "jotai";
import Link from "@/components/Library/Link";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { confirm } from "@/scripts/config/tauri";
import { useNavState } from "@/hooks/useNavState";
import { usePrintQue } from "@/hooks/usePrintQue";


export default function WarrantyDetailsContainer() {
  const { backward, push } = useNavState();
  const { addToQue, printQue } = usePrintQue();
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [warrantyData, setWarrantyData] = useState<Warranty | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      const res = await getWarrantyById(Number(params.warranty));
      setTitle(`${res.warrantyItems.length > 0 ? res.warrantyItems[0].desc + ' ' : ''}Warranty`);
      setWarrantyData(res);
    };
    fetchData();
  }, [params]);

  const handleDelete = async () => {
    if (user.accessLevel <= 1 || prompt('Type "confirm" to delete this warranty') !== 'confirm' || !warrantyData?.id) return;
    await deleteWarranty(warrantyData.id);
    await push('Warranties', '/warranties');
  };

  const handleCompleteWarranty = async () => {
    if (!warrantyData || !await confirm(`${warrantyData.completed ? 'Open' : 'Close'} warranty?`)) return;
    await editWarrantyCompleted(warrantyData.id, !warrantyData.completed, warrantyData.completed ? null : new Date());
    setWarrantyData(await getWarrantyById(warrantyData.id));
  };

  const handlePrint = async () => {
    if (!await confirm('Print warranty?')) return;
    const claimReason: string[] = [];
    const vendorReport: string[] = [];
    const args = {
      vendor: warrantyData?.vendor ?? '',
      createdDate: formatDate(warrantyData?.date ?? null),
      id: warrantyData?.id,
      vendorWarrantyId: Number(warrantyData?.vendorWarrantyNum),
      completed: warrantyData?.completed ? `Claim Completed: ${formatDate(warrantyData?.completedDate)}` : '',
      billToAddress: warrantyData?.customer?.billToAddress ?? '',
      shipToAddress: warrantyData?.customer?.shipToAddress ?? '',
      paymentTerms: warrantyData?.return?.returnPaymentTerms ?? ' ',
      restockFee: warrantyData?.return?.restockFee ?? ' ',
      items: warrantyData?.warrantyItems.map((item: WarrantyItem, i: number) => {
        if (item.claimReason) claimReason.push(`[Row ${i + 1}] ${item.claimReason}`);
        if (item.vendorReport) vendorReport.push(`[Row ${i + 1}] ${item.vendorReport}`);

        return {
          qty: item.qty ?? '',
          partNum: item.partNum ?? '',
          desc: item.desc ?? '',
          stockNum: item.stockNum ?? '',
          cost: formatCurrency(item.cost) || '$0.00',
          price: formatCurrency(item.price) || '$0.00',
          hasVendorReplacedPart: item.hasVendorReplacedPart,
          isCustomerCredited: item.isCustomerCredited,
          vendorCredit: formatCurrency(item.vendorCredit) || '$0.00'
        };
      }) || []
    };
    addToQue('warranty', 'print_warranty', { ...args, claimReason, vendorReport }, '816px', '1090px');
    printQue();
  };


  return (
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
                onClick={async () => await backward()}
              >
                Back
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
                      {warrantyData.customer &&
                        <Link href={`/customer/${warrantyData.customer.id}`}>{ warrantyData.customer.company }</Link>
                      }
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
                      {warrantyData.return &&
                        <Link href={`/returns/${warrantyData.return.id}`}>{ warrantyData.return.id }</Link>
                      }
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
  );
}
