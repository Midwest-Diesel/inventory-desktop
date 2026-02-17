import Link from "../library/Link";
import GridItem from "../library/grid/GridItem";
import Grid from "../library/grid/Grid";
import { formatCurrency, formatPhone } from "@/scripts/tools/stringUtils";
import Table from "../library/Table";
import { getCustomerSalesHistory } from "@/scripts/services/customerService";
import CustomerContactsBlock from "../customers/contacts/CustomerContactsBlock";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { selectedCustomerAtom } from "@/scripts/atoms/state";

interface Props {
  expandedDetailsOpen: boolean
}


export default function SelectedCustomerInfo({ expandedDetailsOpen }: Props) {
  const [customer, setCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const customerInfo = [formatPhone(customer.phone, true), customer.email, customer.billToState, customer.billToCity].filter((v) => v).join(', ');

  const { data: salesHistory = [] } = useQuery<SalesHistory[]>({
    queryKey: ['salesHistory', customer?.id],
    queryFn: async () => await getCustomerSalesHistory(customer.id),
    enabled: !!customer?.id
  });


  return (
    <div className="selected-customer-info" data-testid="selected-customer-info">
      {!expandedDetailsOpen ?
        <div>
          <p><strong>Selected Customer:</strong> <Link href={`customer/${customer.id}`} style={{ fontSize: 'var(--font-md)' }} data-testid="customer-link">{ customer.company }</Link> <em>{ customerInfo.length > 0 && `(${customerInfo})` }</em></p>
          <p><strong>Contact:</strong> { customer.contact }</p>
        </div>
        :
        <div data-testid="customer-details">
          <p><strong>Selected Customer:</strong> <Link href={`customer/${customer.id}`} style={{ fontSize: 'var(--font-md)' }}>{ customer.company }</Link></p>
          <Grid>
            <GridItem variant={['low-opacity-bg']}>
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

            <GridItem variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr>
                    <th>Billing Address</th>
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

            <GridItem variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr>
                    <th>Shipping Address</th>
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

            <GridItem variant={['no-style']}>
              <CustomerContactsBlock customer={customer} setCustomer={setCustomer} />
            </GridItem>

            <GridItem variant={['low-opacity-bg']}>
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

            <GridItem variant={['no-style']} className="customer-details__sales-history">
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
                    {salesHistory.map((sale: SalesHistory, i: number) => {
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
