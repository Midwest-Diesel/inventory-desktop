import { editReturn, getReturnById } from "@/scripts/services/returnsService";
import { FormEvent, useState } from "react";
import Input from "./Library/Input";
import Button from "./Library/Button";
import GridItem from "./Library/Grid/GridItem";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Grid from "./Library/Grid/Grid";
import SourceSelect from "./Library/Select/SourceSelect";
import Table from "./Library/Table";
import { PreventNavigation } from "./PreventNavigation";
import UserSelect from "./Library/Select/UserSelect";
import CustomerSelect from "./Library/Select/CustomerSelect";
import { getCustomerByName } from "@/scripts/services/customerService";
import { ask } from "@tauri-apps/api/dialog";

interface Props {
  returnData: Return
  setReturn: (returnData: Return) => void
  setIsEditing: (value: boolean) => void
}


export default function EditReturnDetails({ returnData, setReturn, setIsEditing }: Props) {
  const [company, setCompany] = useState<string>(returnData.customer?.company ?? '');
  const [poNum, setPoNum] = useState<string>(returnData.poNum ?? '');
  const [payment, setPayment] = useState<string>(returnData.payment ?? '');
  const [source, setSource] = useState<string>(returnData.source ?? '');
  const [salesmanId, setSalesmanId] = useState<number>(returnData.salesman?.id ?? 0);
  const [billToAddress, setBillToAddress] = useState<string>(returnData.billToAddress ?? '');
  const [billToAddress2, setBillToAddress2] = useState<string>(returnData.billToAddress2 ?? '');
  const [billToCity, setBillToCity] = useState<string>(returnData.billToCity ?? '');
  const [billToState, setBillToState] = useState<string>(returnData.billToState ?? '');
  const [billToZip, setBillToZip] = useState<string>(returnData.billToZip ?? '');
  const [billToPhone, setBillToPhone] = useState<string>(returnData.billToPhone ?? '');
  const [billToContact, setBillToContact] = useState<string>(returnData.billToContact ?? '');
  const [shipToAddress, setShipToAddress] = useState<string>(returnData.shipToAddress ?? '');
  const [shipToAddress2, setShipToAddress2] = useState<string>(returnData.shipToAddress2 ?? '');
  const [shipToCity, setShipToCity] = useState<string>(returnData.shipToCity ?? '');
  const [shipToState, setShipToState] = useState<string>(returnData.shipToState ?? '');
  const [shipToZip, setShipToZip] = useState<string>(returnData.shipToZip ?? '');
  const [dateCalled, setDateCalled] = useState<Date | null>(returnData.dateCalled);
  const [dateReceived, setDateReceived] = useState<Date | null>(returnData.dateReceived);
  const [creditIssued, setCreditIssued] = useState<Date | null>(returnData.creditIssued);
  const [returnNotes, setReturnNotes] = useState<string>(returnData.returnNotes ?? '');
  const [returnReason, setReturnReason] = useState<string>(returnData.returnReason ?? '');
  const [returnPaymentTerms, setReturnPaymentTerms] = useState<string>(returnData.returnPaymentTerms ?? '');
  const [restockFee, setRestockFee] = useState<string>(returnData.restockFee ?? '');
  const [changesSaved, setChangesSaved] = useState<boolean>(true);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!changesSaved && !await ask('Are you sure you want to save these changes?')) return;
    setChangesSaved(false);
    const customerId = (await getCustomerByName(company))?.id;
    const newReturn = {
      ...returnData,
      poNum,
      payment,
      source,
      salesmanId,
      billToAddress,
      billToAddress2,
      billToCity,
      billToState,
      billToZip,
      billToPhone,
      billToContact,
      shipToAddress,
      shipToAddress2,
      shipToCity,
      shipToState,
      shipToZip,
      dateCalled,
      dateReceived,
      creditIssued,
      returnNotes,
      returnReason,
      returnPaymentTerms,
      restockFee,
      customerId
    };
    await editReturn(newReturn);
    const res = await getReturnById(returnData.id);
    setReturn(res);
    setIsEditing(false);
  };

  const stopEditing = async () => {
    if (changesSaved) {
      setIsEditing(false);
    } else if (await ask('Do you want to leave without saving?')) {
      setIsEditing(false);
    }
  };


  return (
    <>
      <PreventNavigation shouldPrevent={!changesSaved} text="Leave without saving changes?" />

      {returnData &&
        <form className="edit-return-details" onSubmit={(e) => saveChanges(e)} onChange={() => setChangesSaved(false)}>
          <div className="edit-return-details__header">
            <h2>{ returnData.id }</h2>
          
            <div className="header__btn-container">
              <Button
                variant={['save']}
                className="edit-return-details__save-btn"
                type="submit"
                data-testid="save-btn"
              >
                Save
              </Button>
              <Button
                className="edit-return-details__close-btn"
                type="button"
                onClick={stopEditing}
              >
                Stop Editing
              </Button>
            </div>
          </div>

          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Customer</th>
                    <td>
                      <CustomerSelect
                        value={company}
                        onChange={(e: any) => setCompany(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>PO Number</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={poNum}
                        onChange={(e: any) => setPoNum(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Payment</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={payment}
                        onChange={(e: any) => setPayment(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Source</th>
                    <td>
                      <SourceSelect
                        value={source}
                        onChange={(e: any) => setSource(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Created By</th>
                    <td>
                      <UserSelect
                        variant={['label-space-between', 'label-full-width', 'label-bold']}
                        value={salesmanId}
                        onChange={(e: any) => setSalesmanId(e.target.value)}
                        userSubtype="sales"
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={6} colEnd={12} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Date Called</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={parseDateInputValue(dateCalled)}
                        type="date"
                        onChange={(e: any) => setDateCalled(new Date(e.target.value))}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Date Received</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={parseDateInputValue(dateReceived)}
                        type="date"
                        onChange={(e: any) => setDateReceived(new Date(e.target.value))}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Credit Issued</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={parseDateInputValue(creditIssued)}
                        type="date"
                        onChange={(e: any) => setCreditIssued(new Date(e.target.value))}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Return Notes</th>
                    <td>
                      <Input
                        variant={['label-stack', 'label-bold', 'text-area']}
                        rows={5}
                        cols={100}
                        value={returnNotes}
                        onChange={(e: any) => setReturnNotes(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Return Reason</th>
                    <td>
                      <Input
                        variant={['label-stack', 'label-bold', 'text-area']}
                        rows={5}
                        cols={100}
                        value={returnReason}
                        onChange={(e: any) => setReturnReason(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Return Payment Terms</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={returnPaymentTerms}
                        onChange={(e: any) => setReturnPaymentTerms(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Restock Fee</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={restockFee}
                        onChange={(e: any) => setRestockFee(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={1} colEnd={6} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Billing Address</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToAddress}
                        onChange={(e: any) => setBillToAddress(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Billing City</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToCity}
                        onChange={(e: any) => setBillToCity(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Billing State</th>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToState}
                        onChange={(e: any) => setBillToState(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Billing Zip</th>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToZip}
                        onChange={(e: any) => setBillToZip(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Billing Phone</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToPhone}
                        onChange={(e: any) => setBillToPhone(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Contact</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={billToContact}
                        onChange={(e: any) => setBillToContact(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={6} colEnd={12} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Shipping Address</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToAddress}
                        onChange={(e: any) => setShipToAddress(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping City</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToCity}
                        onChange={(e: any) => setShipToCity(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping State</th>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToState}
                        onChange={(e: any) => setShipToState(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping Zip</th>
                    <td>
                      <Input
                        variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={shipToZip}
                        onChange={(e: any) => setShipToZip(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>
          </Grid>
        </form>
      }
    </>
  );
}
