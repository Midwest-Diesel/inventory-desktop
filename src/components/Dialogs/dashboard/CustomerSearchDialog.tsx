import Dialog from "../../Library/Dialog";
import Pagination from "../../Library/Pagination";
import Table from "../../Library/Table";
import { useAtom } from "jotai";
import { customersAtom, selectedCustomerAtom } from "@/scripts/atoms/state";
import { FormEvent, useEffect, useState } from "react";
import Link from "../../Library/Link";
import { getCustomerTypes, getSomeCustomers, searchCustomers } from "@/scripts/services/customerService";
import Button from "@/components/Library/Button";
import Input from "@/components/Library/Input";
import Select from "@/components/Library/Select/Select";
import { useQuery } from "@tanstack/react-query";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  searchTerm: string
}

const LIMIT = 25;


export default function CustomerSearchDialog({ open, setOpen, searchTerm }: Props) {
  const [customersData, setCustomersData] = useAtom<Customer[]>(customersAtom);
  const [selectedCustomer, setSelectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [page, setPage] = useState<number>(1);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [name, setName] = useState(searchTerm);
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [customerType, setCustomerType] = useState('');

  const { data: customerTypes = [] } = useQuery<string[]>({
    queryKey: ['customerTypes'],
    queryFn: getCustomerTypes,
    enabled: open
  });

  const { data: customerRes, refetch: refetchCustomers } = useQuery<CustomerRes>({
    queryKey: ['customers', page, name, phone, state, zip, country, customerType],
    queryFn: async () => {
      if (name || phone || state || zip || country || customerType) {
        return { pageCount: customerRes?.pageCount ?? 0, rows: await searchCustomers({ name, phone, state, zip, country, customerType }) };
      } else {
        return await getSomeCustomers(page, LIMIT);
      }
    },
    enabled: open,
    keepPreviousData: true
  });

  const selectCustomer = (customer: Customer) => {
    localStorage.setItem('customerId', customer.id.toString());
    setSelectedCustomer(customer);
  };

  const handleCustomerSearch = async (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetchCustomers();
  };

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };

  
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Customers"
      maxHeight="20rem"
      width={600}
      className="customer-search-dialog"
      data-testid="customer-search-dialog"
    >
      <form onSubmit={handleCustomerSearch} autoComplete="off">
        <Input label="Name" variant={['label-bold', 'label-stack', 'thin', 'small', 'label-fit-content']} onChange={e => setName(e.target.value)} value={name} />
        <Input label="Phone" variant={['label-bold', 'label-stack', 'thin', 'small', 'label-fit-content']} onChange={e => setPhone(e.target.value)} value={phone} />
        <Input label="State" variant={['label-bold', 'label-stack', 'thin', 'x-small', 'label-fit-content']} onChange={e => setState(e.target.value)} value={state} />
        <Input label="Zip" variant={['label-bold', 'label-stack', 'thin', 'x-small', 'label-fit-content']} onChange={e => setZip(e.target.value)} value={zip} />
        <Input label="Country" variant={['label-bold', 'label-stack', 'thin', 'small', 'label-fit-content']} onChange={e => setCountry(e.target.value)} value={country} />
        <Select label="Customer Type" variant={['label-bold', 'label-stack']} onChange={e => setCustomerType(e.target.value)} value={customerType}>
          <option value=""></option>
          {customerTypes.map((type, i) => <option key={i} value={type}>{type}</option>)}
        </Select>
        <Button variant={['fit']} type="submit">Search</Button>
      </form>

      <h3>Selected Customer: {selectedCustomer?.company || 'none'}</h3>
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
          {customerRes?.rows.map((customer: Customer) => (
            <tr key={customer.id} onClick={() => selectCustomer(customer)} className={customer.id === selectedCustomer?.id ? 'customer-search__selected-customer' : ''} data-testid="customer-row">
              <td><Link href={`customer/${customer.id}`}>Details</Link></td>
              <td>{customer.company}</td>
              <td>{customer.billToCity}</td>
              <td>{customer.billToState}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination
        data={customerRes?.rows ?? []}
        setData={handleChangePage}
        pageCount={customerRes?.pageCount}
        pageSize={LIMIT}
      />

      {customerRes?.rows.length === 0 && <p>No results</p>}
    </Dialog>
  );
}
