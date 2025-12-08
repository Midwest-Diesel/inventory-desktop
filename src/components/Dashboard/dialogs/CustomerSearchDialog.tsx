import Dialog from "../../library/Dialog";
import Pagination from "../../library/Pagination";
import Table from "../../library/Table";
import { useAtom } from "jotai";
import { customersAtom, selectedCustomerAtom } from "@/scripts/atoms/state";
import { FormEvent, useState } from "react";
import Link from "../../library/Link";
import { getCustomerTypes, getSomeCustomers, searchCustomers } from "@/scripts/services/customerService";
import Button from "@/components/library/Button";
import Input from "@/components/library/Input";
import Select from "@/components/library/select/Select";
import { useQuery } from "@tanstack/react-query";
import { isObjectNull } from "@/scripts/tools/utils";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  searchTerm: string
}


const LIMIT = 40;

export default function CustomerSearchDialog({ open, setOpen, searchTerm }: Props) {
  const [customersData, setCustomersData] = useAtom<Customer[]>(customersAtom);
  const [selectedCustomer, setSelectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [name, setName] = useState(searchTerm);
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [customerType, setCustomerType] = useState('');

  const { data: customerTypes = [] } = useQuery<string[]>({
    queryKey: ['customerTypes'],
    queryFn: getCustomerTypes
  });  

  const { data: customers = customersData, refetch } = useQuery<Customer[]>({
    queryKey: ['customers', page, open, searchTerm],
    queryFn: async () => {
      if (isObjectNull({ name: name || searchTerm, phone, state, zip, country, customerType })) {
        const res = await getSomeCustomers(page, LIMIT);
        setCustomersData(res.rows);
        setPageCount(res.pageCount);
        return res.rows;
      } else {
        const res = await searchCustomers({ name: name || searchTerm, phone, state, zip, country, customerType, page, limit: LIMIT });
        setCustomersData(res.rows);
        setPageCount(res.pageCount);
        return res.rows;
      }
    },
    enabled: open
  });

  const selectCustomer = (customer: Customer) => {
    localStorage.setItem('customerId', customer.id.toString());
    setSelectedCustomer(customer);
  };

  const handleCustomerSearch = async (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    await refetch();
  };

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };

  
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Customers"
      maxHeight="30rem"
      width={680}
      className="customer-search-dialog"
      data-testid="customer-search-dialog"
    >
      <form onSubmit={(e) => handleCustomerSearch(e)} autoComplete="off">
        <Input
          label="Name"
          variant={['label-bold', 'label-stack', 'thin', 'small', 'label-fit-content']}
          onChange={(e: any) => setName(e.target.value)}
          value={name}
        />
        <Input
          label="Phone"
          variant={['label-bold', 'label-stack', 'thin', 'small', 'label-fit-content']}
          onChange={(e: any) => setPhone(e.target.value)}
          value={phone}
        />
        <Input
          label="State"
          variant={['label-bold', 'label-stack', 'thin', 'x-small', 'label-fit-content']}
          onChange={(e: any) => setState(e.target.value)}
          value={state}
        />
        <Input
          label="Zip"
          variant={['label-bold', 'label-stack', 'thin', 'x-small', 'label-fit-content']}
          onChange={(e: any) => setZip(e.target.value)}
          value={zip}
        />
        <Input
          label="Country"
          variant={['label-bold', 'label-stack', 'thin', 'small', 'label-fit-content']}
          onChange={(e: any) => setCountry(e.target.value)}
          value={country}
        />
        <Select
          label="Customer Type"
          variant={['label-bold', 'label-stack']}
          onChange={(e: any) => setCustomerType(e.target.value)}
          value={customerType}
        >
          <option value=""></option>
          {customerTypes.map((type: string, i: number) => {
            return <option key={i} value={type}>{ type }</option>;
          })}
        </Select>
        <Button variant={['fit']} type="submit">Search</Button>
      </form>

      <h3>Selected Customer: { selectedCustomer.company || 'none' }</h3>
      <Table width="500px">
        <thead>
          <tr>
            <th></th>
            <th>Company Name</th>
            <th>City</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer: Customer) => {
            return (
              <tr key={customer.id} onClick={() => selectCustomer(customer)} className={`${customer.id === selectedCustomer.id ? 'customer-search__selected-customer' : ''}`} data-testid="customer-row">
                <td><Link href={`customer/${customer.id}`}>Details</Link></td>
                <td>{ customer.company }</td>
                <td>{ customer.billToCity }</td>
                <td>{ customer.billToState }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      { customers.length === 0 && <p>No results</p> }

      <Pagination
        data={customersData}
        setData={handleChangePage}
        pageCount={pageCount}
        pageSize={LIMIT}
      />
    </Dialog>
  );
}
