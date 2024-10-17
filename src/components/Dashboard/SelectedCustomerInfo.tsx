import Link from "next/link";
import Button from "../Library/Button";
import { useEffect, useState } from "react";
import GridItem from "../Library/Grid/GridItem";
import Grid from "../Library/Grid/Grid";
import { formatCurrency, formatPhone } from "@/scripts/tools/stringUtils";
import Table from "../Library/Table";
import { addCustomer, getCustomerSalesHistory } from "@/scripts/controllers/customerController";
import CustomerContactsBlock from "../CustomerContactsBlock";
import { useAtom } from "jotai";
import { selectedCustomerAtom, userAtom } from "@/scripts/atoms/state";
import { addHandwritten } from "@/scripts/controllers/handwrittensController";
import Toast from "../Library/Toast";

interface Props {
  customerData: Customer
  setCustomerData: (customer: Customer) => void
}


export default function SelectedCustomerInfo({ customerData, setCustomerData }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [selectedCustomer, setSelectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [customer, setCustomer] = useState<Customer>(customerData);
  const [expandedDetailsOpen, setExpandedDetailsOpen] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const customerInfo = [formatPhone(customer.phone, true), customer.email, customer.billToState, customer.billToCity].filter((v) => v).join(', ');

  useEffect(() => {
    const fetchData = async () => {
      setSalesHistory(await getCustomerSalesHistory(Number(customer.id)));
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCustomer(customerData);
  }, [customerData]);

  const deselectCustomer = () => {
    localStorage.removeItem('customerId');
    setSelectedCustomer({} as Customer);
  };

  const handleAddCustomer = async () => {
    const name = prompt('Enter customer name');
    if (!name) return;
    await addCustomer(name);
  };

  const handleNewHandwritten = async () => {
    const newHandwritten = {
      customer,
      date: new Date(),
      poNum: '',
      billToCompany: customer.company,
      billToAddress: customer.billToAddress,
      billToAddress2: customer.billToAddress2,
      billToCity: customer.billToCity,
      billToState: customer.billToState,
      billToZip: customer.billToZip,
      billToCountry: null,
      billToPhone: customer.billToPhone,
      fax: customer.fax,
      shipToCompany: customer.company,
      shipToAddress: customer.shipToAddress,
      shipToAddress2: customer.shipToAddress2,
      shipToCity: customer.shipToCity,
      shipToState: customer.shipToState,
      shipToZip: customer.shipToZip,
      source: null,
      contactName: '',
      payment: customer.paymentType,
      salesmanId: user.id,
      phone: null,
      cell: null,
      engineSerialNum: '',
      isBlindShipment: false,
      isNoPriceInvoice: false,
      shipVia: '',
      cardNum: '',
      expDate: '',
      cvv: null,
      cardZip: null,
      cardName: '',
      invoiceStatus: 'INVOICE PENDING',
      accountingStatus: '',
      shippingStatus: '',
    } as Handwritten;
    await addHandwritten(newHandwritten);
    setToastOpen(true);
  };


  return (
    <div className="selected-customer-info" data-cy="selected-customer-info">
      <Toast msg="Created handwritten" type="success" open={toastOpen} setOpen={setToastOpen} />

      <div className="selected-customer-info__buttons">
        <Button variant={['x-small']} onClick={handleAddCustomer}>Add Customer</Button>
        <Button variant={['x-small']} onClick={deselectCustomer} data-cy="unselect">Unselect</Button>
        <Button variant={['x-small']} onClick={() => setExpandedDetailsOpen(!expandedDetailsOpen)} data-cy="expand">{ expandedDetailsOpen ? 'Collapse' : 'Expand' }</Button>
        <Button variant={['x-small']} onClick={handleNewHandwritten}>New Handwritten</Button>
      </div>

      {!expandedDetailsOpen ?
        <div>
          <p><strong>Selected Customer:</strong> <a href={`customer/${customer.id}`} style={{ fontSize: 'var(--font-md)' }} data-cy="customer-link">{ customer.company }</a> (<em>{ customerInfo }</em>)</p>
          <p><strong>Contact:</strong> { customer.contact }</p>
        </div>
        :
        <div data-cy="customer-details">
          <p><strong>Selected Customer:</strong> <a href={`customer/${customer.id}`} style={{ fontSize: 'var(--font-md)' }}>{ customer.company }</a></p>
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

            <GridItem colStart={1} colEnd={4} rowStart={2} variant={['low-opacity-bg']}>
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

            <GridItem colStart={4} colEnd={8} variant={['low-opacity-bg']}>
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

            <GridItem variant={['no-style']} colStart={8} colEnd={12} rowStart={1} className="customer-details__sales-history">
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

            <GridItem variant={['no-style']} colStart={8} colEnd={12} rowStart={2}>
              { customer.contacts.length > 0 && <CustomerContactsBlock customer={customer} setCustomer={setCustomerData} /> }
            </GridItem>
          </Grid>
        </div>
      }
    </div>
  );
}
