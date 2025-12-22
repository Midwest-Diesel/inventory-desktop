import { editReturn, editReturnItem, getReturnById } from "@/scripts/services/returnsService";
import { FormEvent, useState } from "react";
import Input from "../library/Input";
import Button from "../library/Button";
import GridItem from "../library/grid/GridItem";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import Grid from "../library/grid/Grid";
import SourceSelect from "../library/select/SourceSelect";
import Table from "../library/Table";
import { usePreventNavigation } from "../../hooks/usePreventNavigation";
import UserSelect from "../library/select/UserSelect";
import { getCustomerByName } from "@/scripts/services/customerService";
import { ask } from "@/scripts/config/tauri";
import TextArea from "../library/TextArea";
import CustomerSelect from "../library/select/CustomerSelect";
import EditReturnItemsTable from "./EditReturnItemsTable";

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
  const [returnItems, setReturnItems] = useState<ReturnItem[]>(returnData.returnItems);
  const [changesSaved, setChangesSaved] = useState(true);
  usePreventNavigation(!changesSaved, 'Leave without saving changes?');

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

    for (const item of returnItems) {
      await editReturnItem(item);
    }

    const res = await getReturnById(returnData.id);
    if (!res) return;
    setReturn(res);
    setIsEditing(false);
  };

  const stopEditing = async () => {
    if (changesSaved || await ask('Do you want to leave without saving?')) {
      setIsEditing(false);
    }
  };


  if (!returnData) return null;

  return (
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
            Cancel Editing
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
                    variant={['label-full-width', 'label-bold', 'label-inline']}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>PO Number</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={poNum}
                    onChange={(e) => setPoNum(e.target.value)}
                    data-testid="po-input"
                  />
                </td>
              </tr>
              <tr>
                <th>Payment</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Source</th>
                <td>
                  <SourceSelect
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Created By</th>
                <td>
                  <UserSelect
                    variant={['label-space-between', 'label-full-width', 'label-bold']}
                    value={salesmanId}
                    onChange={(e) => setSalesmanId(Number(e.target.value))}
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
                    onChange={(e) => setDateCalled(new Date(e.target.value))}
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
                    onChange={(e) => setDateReceived(new Date(e.target.value))}
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
                    onChange={(e) => setCreditIssued(new Date(e.target.value))}
                  />
                </td>
              </tr>
              <tr>
                <th>Return Notes</th>
                <td>
                  <TextArea
                    variant={['label-stack', 'label-bold']}
                    rows={1}
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Return Reason</th>
                <td>
                  <TextArea
                    variant={['label-stack', 'label-bold']}
                    rows={1}
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Return Payment Terms</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={returnPaymentTerms}
                    onChange={(e) => setReturnPaymentTerms(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Restock Fee</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={restockFee}
                    onChange={(e) => setRestockFee(e.target.value)}
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
                    onChange={(e) => setBillToAddress(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Billing Address</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={billToAddress2}
                    onChange={(e) => setBillToAddress2(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Billing City</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={billToCity}
                    onChange={(e) => setBillToCity(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Billing State</th>
                <td>
                  <Input
                    variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={billToState}
                    onChange={(e) => setBillToState(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Billing Zip</th>
                <td>
                  <Input
                    variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={billToZip}
                    onChange={(e) => setBillToZip(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Billing Phone</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={billToPhone}
                    onChange={(e) => setBillToPhone(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Contact</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={billToContact}
                    onChange={(e) => setBillToContact(e.target.value)}
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
                    onChange={(e) => setShipToAddress(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Shipping Address 2</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={shipToAddress2}
                    onChange={(e) => setShipToAddress2(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Shipping City</th>
                <td>
                  <Input
                    variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={shipToCity}
                    onChange={(e) => setShipToCity(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Shipping State</th>
                <td>
                  <Input
                    variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={shipToState}
                    onChange={(e) => setShipToState(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Shipping Zip</th>
                <td>
                  <Input
                    variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                    value={shipToZip}
                    onChange={(e) => setShipToZip(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </GridItem>

        <GridItem variant={['no-style']} colStart={1} colEnd={12}>
          <EditReturnItemsTable
            returnData={returnData}
            returnItems={returnItems}
            setReturnItems={setReturnItems}
          />
        </GridItem>
      </Grid>
    </form>
  );
}
