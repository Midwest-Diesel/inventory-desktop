import Link from "../Library/Link";
import { useEffect, useState } from "react";
import GridItem from "../Library/Grid/GridItem";
import Grid from "../Library/Grid/Grid";
import { formatCurrency, formatPhone } from "@/scripts/tools/stringUtils";
import Table from "../Library/Table";
import { getCustomerSalesHistory } from "@/scripts/controllers/customerController";
import CustomerContactsBlock from "../CustomerContactsBlock";

interface Props {
  customerData: Customer
  setCustomerData: (customer: Customer) => void
  expandedDetailsOpen: boolean
}


export default function SelectedCustomerInfo({ customerData, setCustomerData, expandedDetailsOpen }: Props) {
  const [customer, setCustomer] = useState<Customer>(customerData);
  const [salesHistory, setSalesHistory] = useState([]);
  const customerInfo = [formatPhone(customer.phone, true), customer.email, customer.billToState, customer.billToCity].filter((v) => v).join(', ');

  useEffect(() => {
    setCustomer(customerData);
    const fetchData = async () => {
      const sales = await getCustomerSalesHistory(customerData.id);
      setSalesHistory(sales);
    };
    fetchData();
  }, [customerData]);


  return (
    <div className="selected-customer-info" data-id="selected-customer-info">
      {!expandedDetailsOpen ?
        <div>
          <p><strong>Selected Customer:</strong> <Link href={`customer/${customer.id}`} style={{ fontSize: 'var(--font-md)' }} data-id="customer-link">{ customer.company }</Link> <em>{ customerInfo.length > 0 && `(${customerInfo})` }</em></p>
          <p><strong>Contact:</strong> { customer.contact }</p>
        </div>
        :
        <div data-id="customer-details">
          <p><strong>Selected Customer:</strong> <Link href={`customer/${customer.id}`} style={{ fontSize: 'var(--font-md)' }}>{ customer.company }</Link></p>
          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={4} variant={['low-opacity-bg']}>
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
                    <td>{ formatPhone(customer.fax) }</td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={4} colEnd={8} variant={['low-opacity-bg']}>
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

            <GridItem colStart={8} colEnd={12} rowStart={1} variant={['low-opacity-bg']}>
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

            <GridItem variant={['no-style']} colStart={12} rowStart={1}>
              { customer.contacts.length > 0 && <CustomerContactsBlock customer={customer} setCustomer={setCustomerData} /> }
            </GridItem>

            <GridItem colStart={1} colEnd={4} variant={['low-opacity-bg']}>
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

            <GridItem variant={['no-style']} colStart={4} colEnd={8} rowStart={2} className="customer-details__sales-history">
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
          </Grid>
        </div>
      }
    </div>
  );
}
