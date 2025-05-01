import EditReturnDetails from "@/components/EditReturnDetails";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import ReturnItemsTable from "@/components/ReturnItemsTable";
import { userAtom } from "@/scripts/atoms/state";
import { confirm, invoke } from "@/scripts/config/tauri";
import { deleteReturn, getReturnById, issueReturnCredit } from "@/scripts/controllers/returnsController";
import { formatCurrency, formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import { useAtom } from "jotai";
import Link from "@/components/Library/Link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useNavState } from "@/components/Navbar/useNavState";


export default function Return() {
  const { closeBtn, backward, push } = useNavState();
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [returnData, setReturnData] = useState<Return | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      const res = await getReturnById(Number(params.return));
      setTitle(`${res.id} Return`);
      setReturnData(res);
    };
    fetchData();
  }, [params]);

  const handleDelete = async () => {
    if (!returnData?.id || prompt('Type "confirm" to delete this return') !== 'confirm') return;
    await deleteReturn(returnData.id);
    await backward();
  };

  const handleCreditIssued = async () => {
    if (!returnData || returnData.creditIssued || !await confirm('Are you sure you want to credit this?')) return;
    await issueReturnCredit(returnData.id);
    setReturnData({ ...returnData, creditIssued: new Date() });
  };

  const handlePrint = async () => {
    if (!await confirm('Print return?')) return;
    const args = {
      createdBy: returnData?.salesman?.initials ?? '',
      date: formatDate(new Date()),
      poNum: returnData?.poNum || '',
      id: returnData?.id,
      invoiceDate: formatDate(returnData?.invoiceDate),
      billToCompany: returnData?.billToCompany || '',
      shipToCompany: returnData?.shipToCompany || '',
      billToAddress: returnData?.billToAddress || '',
      billToCity: returnData?.billToCity || '',
      billToState: returnData?.billToState || '',
      billToZip: returnData?.billToZip || '',
      billToPhone: returnData?.billToPhone || '',
      dateCalled: formatDate(returnData?.dateCalled),
      salesman: user.initials || '',
      returnReason: returnData?.returnReason || '',
      returnNotes: returnData?.returnNotes || '',
      returnPaymentTerms: returnData?.returnPaymentTerms || '',
      payment: returnData?.payment || '',
      restockFee: returnData?.restockFee || '',
      items: JSON.stringify(returnData?.returnItems.map((item) => {
        return {
          cost: formatCurrency(item.cost).replaceAll(',', '|') || '$0.00',
          stockNum: item.stockNum || '',
          qty: item.qty,
          partNum: item.partNum || '',
          desc: item.desc || '',
          unitPrice: formatCurrency(item.unitPrice).replaceAll(',', '|') || '$0.00',
          total: formatCurrency((item.qty ?? 0) * (item.unitPrice ?? 0)).replaceAll(',', '|') || '$0.00'
        };
      })) || '[]'
    };
    await invoke('print_return', { args });
  };

  
  return (
    <Layout title="Return Details">
      <div className="return-details">
        {returnData ? isEditing ?
          <EditReturnDetails returnData={returnData} setReturn={setReturnData} setIsEditing={setIsEditing} />
          :
          <>
            <div className="return-details__header">
              <h2>Return { returnData.id }</h2>

              <div className="header__btn-container">
                <Button
                  variant={['blue']}
                  className="return-details__edit-btn"
                  onClick={() => setIsEditing(true)}
                  data-testid="edit-btn"
                >
                  Edit
                </Button>
                <Button
                  className="return-details__close-btn"
                  onClick={async () => await closeBtn()}
                >
                  Close
                </Button>
                <Button
                  variant={['danger']}
                  onClick={handleDelete}
                  data-testid="delete-btn"
                >
                  Delete
                </Button>
              </div>
            </div>

            <div className="return-details__top-bar">
              <Button onClick={handleCreditIssued} disabled={Boolean(returnData.creditIssued)} data-testid="credit-issued-btn">Credit Issued</Button>
              <Button onClick={() => push('Warranty', `/warranties/${returnData.warrantyId}`)} disabled={!returnData.warrantyId}>Warranty</Button>
              <Button onClick={handlePrint}>Print</Button>
            </div>

            <Grid rows={1} cols={12} gap={1}>
              <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Handwritten</th>
                      <td><Link href={`/handwrittens/${returnData.handwrittenId}`}>{ returnData.handwrittenId }</Link></td>
                    </tr>
                    <tr>
                      <th>Customer</th>
                      <td><Link href={`/customer/${returnData.customer?.id}`}>{ returnData.customer?.company }</Link></td>
                    </tr>
                    <tr>
                      <th>PO Number</th>
                      <td data-testid="po-num">{ returnData.poNum }</td>
                    </tr>
                    <tr>
                      <th>Payment</th>
                      <td>{ returnData.payment }</td>
                    </tr>
                    <tr>
                      <th>Source</th>
                      <td>{ returnData.source }</td>
                    </tr>
                    <tr>
                      <th>Created By</th>
                      <td>{ returnData.salesman && returnData.salesman.initials }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={6} colEnd={11} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Date Called</th>
                      <td>{ formatDate(returnData.dateCalled) }</td>
                    </tr>
                    <tr>
                      <th>Date Received</th>
                      <td>{ formatDate(returnData.dateReceived) }</td>
                    </tr>
                    <tr>
                      <th>Credit Issued</th>
                      <td data-testid="credit-issued">{ formatDate(returnData.creditIssued) }</td>
                    </tr>

                    <tr>
                      <th>Return Notes</th>
                      <td>{ returnData.returnNotes }</td>
                    </tr>
                    <tr>
                      <th>Return Reason</th>
                      <td>{ returnData.returnReason }</td>
                    </tr>

                    <tr>
                      <th>Return Payment Terms</th>
                      <td>{ returnData.returnPaymentTerms }</td>
                    </tr>
                    <tr>
                      <th>Restock Fee</th>
                      <td>{ returnData.restockFee }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Billing Address</th>
                      <td>{ returnData.billToAddress }</td>
                    </tr>
                    <tr>
                      <th>Billing Address 2</th>
                      <td>{ returnData.billToAddress2 }</td>
                    </tr>
                    <tr>
                      <th>Billing City</th>
                      <td>{ returnData.billToCity }</td>
                    </tr>
                    <tr>
                      <th>Billing State</th>
                      <td>{ returnData.billToState }</td>
                    </tr>
                    <tr>
                      <th>Billing Zip</th>
                      <td>{ returnData.billToZip }</td>
                    </tr>
                    <tr>
                      <th>Billing Phone</th>
                      <td>{ formatPhone(returnData.billToPhone) }</td>
                    </tr>
                    <tr>
                      <th>Contact</th>
                      <td>{ returnData.billToContact }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={6} colEnd={11} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Shipping Address</th>
                      <td>{ returnData.shipToAddress }</td>
                    </tr>
                    <tr>
                      <th>Shipping Address 2</th>
                      <td>{ returnData.shipToAddress2 }</td>
                    </tr>
                    <tr>
                      <th>Shipping City</th>
                      <td>{ returnData.shipToCity }</td>
                    </tr>
                    <tr>
                      <th>Shipping State</th>
                      <td>{ returnData.shipToState }</td>
                    </tr>
                    <tr>
                      <th>Shipping Zip</th>
                      <td>{ returnData.shipToZip }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem variant={['no-style']} colStart={1} colEnd={12}>
                <ReturnItemsTable returnItems={returnData.returnItems} returnData={returnData} setReturnData={setReturnData}  />
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
