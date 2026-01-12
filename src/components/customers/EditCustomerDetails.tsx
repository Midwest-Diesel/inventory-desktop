import Button from "../library/Button";
import Grid from "../library/grid/Grid";
import GridItem from "../library/grid/GridItem";
import { FormEvent, useState } from "react";
import Input from "@/components/library/Input";
import { editCustomer, getCustomerTypes } from "@/scripts/services/customerService";
import Table from "../library/Table";
import { getMapLocationFromCustomer } from "@/scripts/services/mapService";
import EditMapLocDialog from "./dialogs/EditMapLocDialog";
import { usePreventNavigation } from "../../hooks/usePreventNavigation";
import SourceSelect from "../library/select/SourceSelect";
import CustomerContactsBlock from "./contacts/CustomerContactsBlock";
import Select from "../library/select/Select";
import Checkbox from "../library/Checkbox";
import { ask } from "@/scripts/config/tauri";
import TextArea from "../library/TextArea";
import { useQuery } from "@tanstack/react-query";

interface Props {
  customer: Customer
  setCustomer: (customer: Customer) => void
  setIsEditing: (value: boolean) => void
}


export default function CustomerDetails({ customer, setCustomer, setIsEditing }: Props) {
  // The comments from Access used to have html tags inside them
  // So this is parsing it as html and turning it back to a string
  const parser = new DOMParser();
  const commentsDoc = parser.parseFromString(customer?.comments ?? '', "text/html");
  const [company, setCompany] = useState<string>(customer.company ?? '');
  const [phone, setPhone] = useState<string>(customer.phone ?? '');
  const [billToPhone, setBillToPhone] = useState<string>(customer.billToPhone ?? '');
  const [email, setEmail] = useState<string>(customer.email ?? '');
  const [customerType, setCustomerType] = useState<string>(customer.customerType ?? '');
  const [fax, setFax] = useState<string>(customer.fax ?? '');
  const [billToAddress, setBillToAddress] = useState<string>(customer.billToAddress ?? '');
  const [billToAddress2, setBillToAddress2] = useState<string>(customer.billToAddress2 ?? '');
  const [billToCity, setBillToCity] = useState<string>(customer.billToCity ?? '');
  const [billToState, setBillToState] = useState<string>(customer.billToState ?? '');
  const [billToZip, setBillToZip] = useState<string>(customer.billToZip ?? '');
  const [shipToAddress, setShipToAddress] = useState<string>(customer.shipToAddress ?? '');
  const [shipToAddress2, setShipToAddress2] = useState<string>(customer.shipToAddress2 ?? '');
  const [shipToCity, setShipToCity] = useState<string>(customer.shipToCity ?? '');
  const [shipToState, setShipToState] = useState<string>(customer.shipToState ?? '');
  const [shipToZip, setShipToZip] = useState<string>(customer.shipToZip ?? '');
  const [partsManager, setPartsManager] = useState<string>(customer.partsManager ?? '');
  const [partsManagerEmail, setPartsManagerEmail] = useState<string>(customer.partsManagerEmail ?? '');
  const [serviceManager, setServiceManager] = useState<string>(customer.serviceManager ?? '');
  const [serviceManagerEmail, setServiceManagerEmail] = useState<string>(customer.serviceManagerEmail ?? '');
  const [paymentType, setPaymentType] = useState<string>(customer.paymentType ?? '');
  const [source, setSource] = useState<string>(customer.source ?? '');
  const [isTaxable, setIsTaxable] = useState<boolean>(customer.isTaxable);
  const [comments, setComments] = useState<string>(commentsDoc.querySelector('body')?.innerText ?? '');
  const [editLocDialogOpen, setEditLocDialogOpen] = useState(false);
  const [location, setLocation] = useState<MapLocation | null>(null);
  const [changesSaved, setChangesSaved] = useState(true);
  usePreventNavigation(!changesSaved, 'Leave without saving changes?');

  const { data: customerTypes = [] } = useQuery<string[]>({
    queryKey: ['customerTypes'],
    queryFn: getCustomerTypes
  });

  const onSubmitSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!changesSaved && !await ask('Are you sure you want to save these changes?')) return;
    setChangesSaved(false);
    const newCustomer = {
      ...customer,
      id: customer.id,
      company,
      contact: customer.contact,
      phone,
      email,
      customerType,
      source,
      fax,
      billToAddress,
      billToAddress2,
      billToCity,
      billToState,
      billToZip,
      billToPhone,
      shipToAddress,
      shipToAddress2,
      shipToCity,
      shipToState,
      shipToZip,
      partsManager,
      partsManagerEmail,
      serviceManager,
      serviceManagerEmail,
      paymentType,
      isTaxable,
      comments
    } as Customer;
    await editCustomer(newCustomer);
    setCustomer(newCustomer);

    // Prompt to update map location
    const location = await getMapLocationFromCustomer(customer.id);
    const isLocationChanged = (
      JSON.stringify({ company: customer.company, billToAddress: customer.billToAddress, billToAddress2: customer.billToAddress2, billToCity: customer.billToCity, billToState: customer.billToState, billToZip: customer.billToZip }) !==
      JSON.stringify({ company: newCustomer.company, billToAddress: newCustomer.billToAddress, billToAddress2: newCustomer.billToAddress2, billToCity: newCustomer.billToCity, billToState: newCustomer.billToState, billToZip: newCustomer.billToZip })
    );
    if (location && isLocationChanged) {
      setLocation(location);
      if (await ask('Do you want to update the map location?')) {
        setEditLocDialogOpen(true);
      } else {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const onClickStopEditing = async () => {
    if (changesSaved) {
      setIsEditing(false);
    } else if (await ask('Do you want to leave without saving?')) {
      setIsEditing(false);
    }
  };

  const onClickSameAsBillTo = () => {
    setShipToAddress(billToAddress);
    setShipToAddress2(billToAddress2);
    setShipToCity(billToCity);
    setShipToState(billToState);
    setShipToZip(billToZip);
  };

  
  return (
    <>
      {editLocDialogOpen &&
        <EditMapLocDialog
          open={editLocDialogOpen}
          setOpen={setEditLocDialogOpen}
          location={location}
        />
      }

      <form className="edit-customer-details" onSubmit={(e) => onSubmitSaveChanges(e)} onChange={() => setChangesSaved(false)}>
        {customer &&
          <>
            <div className="edit-customer-details__header">
              <Input
                variant={['md-text']}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            
              <div className="header__btn-container">
                <Button
                  variant={['save']}
                  className="edit-customer-details__save-btn"
                  type="submit"
                >
                  Save
                </Button>
                <Button
                  className="edit-customer-details__close-btn"
                  type="button"
                  onClick={onClickStopEditing}
                >
                  Cancel Editing
                </Button>
              </div>
            </div>
          
            <Grid rows={1} cols={12} gap={1}>
              <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Phone</th>
                      <td>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>
                        <Input
                          value={email}
                          type="email"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Customer Type</th>
                      <td>
                        <Select
                          onChange={(e) => setCustomerType(e.target.value)}
                          value={customerType}
                        >
                          {customerTypes.map((type, i) => {
                            return <option key={i} value={type}>{ type }</option>;
                          })}
                        </Select>
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
                      <th>Fax</th>
                      <td>
                        <Input
                          value={fax}
                          onChange={(e) => setFax(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Payment Type</th>
                      <td>
                        <Input
                          value={paymentType}
                          onChange={(e) => setPaymentType(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Billing Address 1</th>
                      <td>
                        <Input
                          value={billToAddress}
                          onChange={(e) => setBillToAddress(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Billing Address 2</th>
                      <td>
                        <Input
                          value={billToAddress2}
                          onChange={(e) => setBillToAddress2(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Billing City</th>
                      <td>
                        <Input
                          value={billToCity}
                          onChange={(e) => setBillToCity(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Billing State</th>
                      <td>
                        <Input
                          value={billToState}
                          onChange={(e) => setBillToState(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Billing Zip</th>
                      <td>
                        <Input
                          value={billToZip}
                          onChange={(e) => setBillToZip(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Billing Phone</th>
                      <td>
                        <Input
                          value={billToPhone}
                          onChange={(e) => setBillToPhone(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem variant={['no-style']} colStart={5} colEnd={9} rowStart={2}>
                <CustomerContactsBlock customer={customer} setCustomer={setCustomer} />

                <Checkbox
                  variant={['label-bold', 'label-align-center']}
                  label="TAXABLE"
                  checked={isTaxable}
                  onChange={(e) => setIsTaxable(e.target.checked)}
                />
              </GridItem>

              <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
                <Button variant={['xx-small']} onClick={onClickSameAsBillTo} type="button">Same as bill to</Button>
                <Table variant={['plain', 'row-details', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Shipping Address 1</th>
                      <td>
                        <Input
                          value={shipToAddress}
                          onChange={(e) => setShipToAddress(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Shipping Address 2</th>
                      <td>
                        <Input
                          value={shipToAddress2}
                          onChange={(e) => setShipToAddress2(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Shipping City</th>
                      <td>
                        <Input
                          value={shipToCity}
                          onChange={(e) => setShipToCity(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Shipping State</th>
                      <td>
                        <Input
                          value={shipToState}
                          onChange={(e) => setShipToState(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Shipping Zip</th>
                      <td>
                        <Input
                          value={shipToZip}
                          onChange={(e) => setShipToZip(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={5} colEnd={10} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Parts Manager</th>
                      <td>
                        <Input
                          value={partsManager}
                          onChange={(e) => setPartsManager(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Parts Manager Email</th>
                      <td>
                        <Input
                          value={partsManagerEmail}
                          type="email"
                          onChange={(e) => setPartsManagerEmail(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Service Manager</th>
                      <td>
                        <Input
                          value={serviceManager}
                          onChange={(e) => setServiceManager(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Service Manager Email</th>
                      <td>
                        <Input
                          value={serviceManagerEmail}
                          type="email"
                          onChange={(e) => setServiceManagerEmail(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Comments</th>
                      <td>
                        <TextArea
                          style={{ height: '100%' }}
                          variant={['auto-size']}
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>
            </Grid>
          </>
        }
      </form>
    </>
  );
}
