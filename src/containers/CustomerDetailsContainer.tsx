import CustomerContactsBlock from "@/components/Customer/CustomerContactsBlock";
import EditCustomerDetails from "@/components/Customer/EditCustomerDetails";
import AddToMapDialog from "@/components/Dialogs/customers/AddToMapDialog";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import { useNavState } from "@/hooks/useNavState";
import { selectedCustomerAtom, userAtom } from "@/scripts/atoms/state";
import { deleteCustomer, getCustomerById, getCustomerSalesHistory } from "@/scripts/services/customerService";
import { deleteMapLocationByCustomer, getMapLocationFromCustomer } from "@/scripts/services/mapService";
import { formatCurrency, formatPhone } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import { useAtom } from "jotai";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ask } from "@/scripts/config/tauri";
import { addVendor, getVendorByName } from "@/scripts/services/vendorsService";


export default function CustomerDetailsContainer() {
  const { closeBtn, push } = useNavState();
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [, setSelectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isOnMap, setIsOnMap] = useState(true);
  const [addLocDialogOpen, setAddLocDialogOpen] = useState(false);
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      // Fetch customer data
      const id = Number(params.customer);
      const customerRes = await getCustomerById(id);
      if (!customerRes) return;
      setCustomer(customerRes);
      // Fetch sales history
      setSalesHistory(await getCustomerSalesHistory(id));
      setTitle(customerRes.company ?? '');
      // Detect if customer has map location
      if (!await getMapLocationFromCustomer(id)) setIsOnMap(false);
      // Check if vendor
      const vendor = await getVendorByName(customerRes.company);
      if (vendor) setIsVendor(true);
    };
    fetchData();
  }, [params]);

  const handleDelete = async () => {
    if (!customer?.id || user.accessLevel <= 1 || prompt('Type "confirm" to delete this customer') !== 'confirm') return;
    localStorage.removeItem('customerId');
    setSelectedCustomer({} as Customer);
    await deleteCustomer(customer.id);
    await deleteMapLocationByCustomer(customer.id);
    await push('Home', '/');
  };

  const markAsVendor = async () => {
    if (!await ask('Turn this customer into a vendor?')) return;
    const newVendor = {
      name: customer?.company ?? null,
      vendorAddress: customer?.billToAddress ?? null,
      vendorState: customer?.billToState ?? null,
      vendorZip: customer?.billToZip ?? null,
      vendorPhone: customer?.billToPhone ?? customer?.phone ?? null,
      vendorFax: customer?.fax ?? null,
      vendorTerms: customer?.terms ?? null,
      vendorContact: customer?.contact ?? null
    };
    await addVendor(newVendor);
    setIsVendor(true);
  };


  return (
    <div>
      {customer &&
        <AddToMapDialog
          open={addLocDialogOpen}
          setOpen={(setAddLocDialogOpen)}
          customer={customer}
          userId={user.id}
        />
      }

      <div className="customer-details">
        {customer ? isEditing ?
          <EditCustomerDetails customer={customer} setCustomer={setCustomer} setIsEditing={setIsEditing} />
          :
          <>
            <div className="customer-details__header">
              <h2>{ customer.company }</h2>

              <div className="header__btn-container">
                <Button
                  variant={['blue']}
                  className="customer-details__edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                {!isOnMap &&
                  <Button
                    className="customer-details__close-btn"
                    onClick={() => setAddLocDialogOpen(true)}
                  >
                    Add to Map
                  </Button>
                }
                <Button
                  className="customer-details__close-btn"
                  onClick={async () => await closeBtn()}
                >
                  Close
                </Button>
                {user.accessLevel > 1 &&
                  <Button
                    variant={['danger']}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                }
              </div>
            </div>

            <div className="customer-details__top-bar">
              { !isVendor && <Button onClick={markAsVendor}>Mark as Vendor</Button> }
            </div>
          
            <Grid rows={1} cols={12} gap={1}>
              <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Contact</th>
                      <td>{ customer.contact }</td>
                    </tr>
                    <tr>
                      <th>Phone</th>
                      <td>{ formatPhone(customer.phone) }</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{ customer.email }</td>
                    </tr>
                    <tr>
                      <th>Customer Type</th>
                      <td>{ customer.customerType }</td>
                    </tr>
                    <tr>
                      <th>Source</th>
                      <td>{ customer.source }</td>
                    </tr>
                    <tr>
                      <th>Fax</th>
                      <td>{ customer.fax }</td>
                    </tr>
                    <tr>
                      <th>Payment Type</th>
                      <td>{ customer.paymentType }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem variant={['no-style']} colStart={5} colEnd={7} rowStart={1} rowEnd={3} className="customer-details__sales-history">
                <h3>Sales History</h3>
                {salesHistory.length > 0 ?
                  <Table>
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesHistory.map((sale: any, i: number) => {
                        return (
                          <tr key={i}>
                            <td>{ sale.year }</td>
                            <td>{ formatCurrency(sale.totalSales) }</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  :
                  <p>Empty</p>
                }
              </GridItem>

              <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Billing Address 1</th>
                      <td>{ customer.billToAddress }</td>
                    </tr>
                    <tr>
                      <th>Billing Address 2</th>
                      <td>{ customer.billToAddress2 }</td>
                    </tr>
                    <tr>
                      <th>Billing City</th>
                      <td>{ customer.billToCity }</td>
                    </tr>
                    <tr>
                      <th>Billing State</th>
                      <td>{ customer.billToState }</td>
                    </tr>
                    <tr>
                      <th>Billing Zip</th>
                      <td>{ customer.billToZip }</td>
                    </tr>
                    <tr>
                      <th>Billing Phone</th>
                      <td>{ customer.billToPhone }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Shipping Address 1</th>
                      <td>{ customer.shipToAddress }</td>
                    </tr>
                    <tr>
                      <th>Shipping Address 2</th>
                      <td>{ customer.shipToAddress2 }</td>
                    </tr>
                    <tr>
                      <th>Shipping City</th>
                      <td>{ customer.shipToCity }</td>
                    </tr>
                    <tr>
                      <th>Shipping State</th>
                      <td>{ customer.shipToState }</td>
                    </tr>
                    <tr>
                      <th>Shipping Zip</th>
                      <td>{ customer.shipToZip }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={5} colEnd={9} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Parts Manager</th>
                      <td>{ customer.partsManager }</td>
                    </tr>
                    <tr>
                      <th>Parts Manager Email</th>
                      <td>{ customer.partsManagerEmail }</td>
                    </tr>
                    <tr>
                      <th>Service Manager</th>
                      <td>{ customer.serviceManager }</td>
                    </tr>
                    <tr>
                      <th>Service Manager Email</th>
                      <td>{ customer.serviceManagerEmail }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem colStart={1} colEnd={5} variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Comments</th>
                      <td>{ customer.comments }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>

              <GridItem variant={['no-style']} colStart={5} colEnd={9} rowStart={2}>
                <CustomerContactsBlock customer={customer} setCustomer={setCustomer} />

                <Checkbox
                  variant={['label-bold', 'label-align-center']}
                  label="TAXABLE"
                  checked={customer.isTaxable}
                  disabled
                />
              </GridItem>
            </Grid>
          </>
          :
          <Loading />
        }
      </div>
    </div>
  );
}
