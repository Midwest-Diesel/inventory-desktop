import Button from "../Library/Button";
import Grid from "../Library/Grid/Grid";
import GridItem from "../Library/Grid/GridItem";
import { FormEvent, useEffect, useState } from "react";
import Input from "@/components/Library/Input";
import { editCustomer, getCustomerTypes } from "@/scripts/services/customerService";
import Table from "../Library/Table";
import { getMapLocationFromCustomer } from "@/scripts/services/mapService";
import EditMapLocDialog from "../Dialogs/customers/EditMapLocDialog";
import { PreventNavigation } from "../PreventNavigation";
import SourceSelect from "../Library/Select/SourceSelect";
import CustomerContactsBlock from "./CustomerContactsBlock";
import Select from "../Library/Select/Select";
import Checkbox from "../Library/Checkbox";
import { ask } from "@/scripts/config/tauri";
import TextArea from "../Library/TextArea";

interface Props {
  customer: Customer
  setCustomer: (customer: Customer) => void
  setIsEditing: (value: boolean) => void
}


export default function CustomerDetails({ customer, setCustomer, setIsEditing }: Props) {
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
  const [comments, setComments] = useState<string>(customer.comments ?? '');
  const [editLocDialogOpen, setEditLocDialogOpen] = useState(false);
  const [loc, setLoc] = useState<MapLocation | null>(null);
  const [changesSaved, setChangesSaved] = useState<boolean>(true);
  const [customerTypes, setCustomerTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () =>  {
      const types = await getCustomerTypes();
      setCustomerTypes(types);
    };
    fetchData();
  }, []);

  const saveChanges = async (e: FormEvent) => {
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

    const location = await getMapLocationFromCustomer(customer.id);
    const isLocationChanged = (
      JSON.stringify({ company: customer.company, billToAddress: customer.billToAddress, billToAddress2: customer.billToAddress2, billToCity: customer.billToCity, billToState: customer.billToState, billToZip: customer.billToZip }) !==
      JSON.stringify({ company: newCustomer.company, billToAddress: newCustomer.billToAddress, billToAddress2: newCustomer.billToAddress2, billToCity: newCustomer.billToCity, billToState: newCustomer.billToState, billToZip: newCustomer.billToZip })
    );
    if (Boolean(location) && isLocationChanged) {
      setLoc(location);
      if (await ask('Do you want to update the map location?')) setEditLocDialogOpen(true);
    } else {
      setIsEditing(false);
    }
  };

  const stopEditing = async () => {
    if (changesSaved) {
      setIsEditing(false);
    } else if (await ask('Do you want to leave without saving?')) {
      setIsEditing(false);
    }
  };

  const sameAsBillTo = () => {
    setShipToAddress(billToAddress);
    setShipToAddress2(billToAddress2);
    setShipToCity(billToCity);
    setShipToState(billToState);
    setShipToZip(billToZip);
  };

  
  return (
    <>
      <PreventNavigation shouldPrevent={!changesSaved} text="Leave without saving changes?" />

      {editLocDialogOpen &&
        <EditMapLocDialog
          open={editLocDialogOpen}
          setOpen={setEditLocDialogOpen}
          loc={loc}
        />
      }

      <form className="edit-customer-details" onSubmit={(e) => saveChanges(e)} onChange={() => setChangesSaved(false)}>
        {customer &&
          <>
            <div className="edit-customer-details__header">
              <Input
                variant={['md-text']}
                value={company}
                onChange={(e: any) => setCompany(e.target.value)}
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
                  onClick={stopEditing}
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
                          onChange={(e: any) => setPhone(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>
                        <Input
                          value={email}
                          type="email"
                          onChange={(e: any) => setEmail(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Customer Type</th>
                      <td>
                        <Select
                          onChange={(e: any) => setCustomerType(e.target.value)}
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
                          onChange={(e: any) => setSource(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Fax</th>
                      <td>
                        <Input
                          value={fax}
                          onChange={(e: any) => setFax(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Payment Type</th>
                      <td>
                        <Input
                          value={paymentType}
                          onChange={(e: any) => setPaymentType(e.target.value)}
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
                          onChange={(e: any) => setBillToAddress(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Billing Address 2</th>
                      <td>
                        <Input
                          value={billToAddress2}
                          onChange={(e: any) => setBillToAddress2(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Billing City</th>
                      <td>
                        <Input
                          value={billToCity}
                          onChange={(e: any) => setBillToCity(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Billing State</th>
                      <td>
                        <Input
                          value={billToState}
                          onChange={(e: any) => setBillToState(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Billing Zip</th>
                      <td>
                        <Input
                          value={billToZip}
                          onChange={(e: any) => setBillToZip(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Billing Phone</th>
                      <td>
                        <Input
                          value={billToPhone}
                          onChange={(e: any) => setBillToPhone(e.target.value)}
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
                  onChange={(e: any) => setIsTaxable(e.target.checked)}
                />
              </GridItem>

              <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
                <Button variant={['xx-small']} onClick={sameAsBillTo} type="button">Same as bill to</Button>
                <Table variant={['plain', 'row-details', 'edit-row-details']}>
                  <tbody>
                    <tr>
                      <th>Shipping Address 1</th>
                      <td>
                        <Input
                          value={shipToAddress}
                          onChange={(e: any) => setShipToAddress(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Shipping Address 2</th>
                      <td>
                        <Input
                          value={shipToAddress2}
                          onChange={(e: any) => setShipToAddress2(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Shipping City</th>
                      <td>
                        <Input
                          value={shipToCity}
                          onChange={(e: any) => setShipToCity(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Shipping State</th>
                      <td>
                        <Input
                          value={shipToState}
                          onChange={(e: any) => setShipToState(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Shipping Zip</th>
                      <td>
                        <Input
                          value={shipToZip}
                          onChange={(e: any) => setShipToZip(e.target.value)}
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
                          onChange={(e: any) => setPartsManager(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Parts Manager Email</th>
                      <td>
                        <Input
                          value={partsManagerEmail}
                          type="email"
                          onChange={(e: any) => setPartsManagerEmail(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Service Manager</th>
                      <td>
                        <Input
                          value={serviceManager}
                          onChange={(e: any) => setServiceManager(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Service Manager Email</th>
                      <td>
                        <Input
                          value={serviceManagerEmail}
                          type="email"
                          onChange={(e: any) => setServiceManagerEmail(e.target.value)}
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
                          onChange={(e: any) => setComments(e.target.value)}
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
