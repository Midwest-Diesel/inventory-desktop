import CustomerContactsBlock from "@/components/CustomerContactsBlock";
import EditCustomerDetails from "@/components/Dashboard/EditCustomerDetails";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import { selectedCustomerAtom, userAtom } from "@/scripts/atoms/state";
import { deleteCustomer, getCustomerById, getCustomerSalesHistory } from "@/scripts/controllers/customerController";
import { formatCurrency, formatPhone } from "@/scripts/tools/stringUtils";
import { setTitle } from "@/scripts/tools/utils";
import { useAtom } from "jotai";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { confirm } from '@tauri-apps/api/dialog';


export default function Customer() {
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [selectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [customer, setCustomer] = useState<Customer>(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      const customerRes = await getCustomerById(Number(params.customer));
      setCustomer(customerRes);
      setSalesHistory(await getCustomerSalesHistory(Number(params.customer)));
      setTitle(customerRes.company);
    };
    fetchData();
  }, [params]);

  const handleDelete = async () => {
    if (user.accessLevel <= 1 || prompt('Type "confirm" to delete this customer') !== 'confirm') return;
    await deleteCustomer(customer.id);
    if (selectedCustomer.id === customer.id) localStorage.removeItem('customerId');
    location.replace('/');
  };


  return (
    <Layout title="Customer">
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
                <Button
                  variant={['link']}
                  className="customer-details__close-btn"
                >
                  <Link href="/">Close</Link>
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
                      <td></td>
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

              <GridItem variant={['no-style']} colStart={5} colEnd={9} rowStart={2}>
                { customer.contacts && customer.contacts.length > 0 ? <CustomerContactsBlock customer={customer} setCustomer={setCustomer} /> : <p>Empty</p> }
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
