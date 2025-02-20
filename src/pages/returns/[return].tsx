import EditReturnDetails from "@/components/EditReturnDetails";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import ReturnItemsTable from "@/components/ReturnItemsTable";
import { deleteReturn, getReturnById } from "@/scripts/controllers/returnsController";
import { formatDate, formatPhone } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Return() {
  const router = useRouter();
  const params = useParams();
  const [returnData, setReturnData] = useState<Return>(null);
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
    if (prompt('Type "confirm" to delete this return') !== 'confirm') return;
    await deleteReturn(returnData.id);
    router.back();
  };


  return (
    <Layout title="Return Details">
      <div className="return-details">
        {returnData ? isEditing ?
          <EditReturnDetails returnData={returnData} setReturn={setReturnData} setIsEditing={setIsEditing} />
          :
          <>
            <div className="return-details__header">
              <h2>{ returnData.id } Return</h2>

              <div className="header__btn-container">
                <Button
                  variant={['blue']}
                  className="return-details__edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  className="return-details__close-btn"
                  onClick={() => router.back()}
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
                      <th>Handwritten</th>
                      <td><Link href={`/handwrittens/${returnData.invoiceId}`}>{ returnData.invoiceId }</Link></td>
                    </tr>
                    <tr>
                      <th>Customer</th>
                      <td><Link href={`/customer/${returnData.customer.id}`}>{ returnData.customer.company }</Link></td>
                    </tr>
                    <tr>
                      <th>PO Number</th>
                      <td>{ returnData.poNum }</td>
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
                      <td>{ returnData.createdBy }</td>
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
                      <td>{ formatDate(returnData.creditIssued) }</td>
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
                <ReturnItemsTable returnItems={returnData.returnItems} />
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
