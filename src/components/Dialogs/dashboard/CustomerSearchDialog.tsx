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

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  searchTerm: string
}

export default function CustomerSearchDialog({ open, setOpen, searchTerm }: Props) {
  const [customersData, setCustomersData] = useAtom<Customer[]>(customersAtom);
  const [searchedCustomers, setSearchedCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [pageCount, setPageCount] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>(customersData);
  const [customerTypes, setCustomerTypes] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [name, setName] = useState(searchTerm);
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [customerType, setCustomerType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const res = await getSomeCustomers(1, 25);
      setCustomersData(res.rows);
      setPageCount(res.pageCount);
      const types = await getCustomerTypes();
      setCustomerTypes(types);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm && open) {
        setIsSearching(true);
        const results = await searchCustomers({ name: searchTerm, phone, state, zip, country, customerType });
        setSearchedCustomers(results);
        setPage(1);
      } else {
        setIsSearching(false);
      }
    };
    fetchData();
  }, [searchTerm, customersData, open]);

  const selectCustomer = (customer: Customer) => {
    localStorage.setItem('customerId', customer.id.toString());
    setSelectedCustomer(customer);
  };

  const handleChangePage = async (_: any, page: number) => {
    setPage(page);
    if (isSearching) {
      const startIndex = (page - 1) * 25;
      const endIndex = startIndex + 25;
      setCustomers(searchedCustomers.slice(startIndex, endIndex));
    } else {
      const res = await getSomeCustomers(page, 25);
      setCustomers(res.rows);
    }
  };

  const handleCustomerSearch = async (e: FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const res = await searchCustomers({ name, phone, state, zip, country, customerType });
    setSearchedCustomers(res);
    setPage(1);
  };

  const displayedCustomers = isSearching ? searchedCustomers.slice((page - 1) * 25, page * 25) : customers;

  
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
          {customerTypes.map((type, i) => {
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
          {displayedCustomers && displayedCustomers.map((customer: Customer) => {
            return (
              <tr key={customer.id} onClick={() => selectCustomer(customer)} className={`${customer.id === selectedCustomer.id ? 'customer-search__selected-customer' : ''}`}>
                <td><Link href={`customer/${customer.id}`}>Details</Link></td>
                <td>{ customer.company }</td>
                <td>{ customer.billToCity }</td>
                <td>{ customer.billToState }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination
        data={isSearching ? searchedCustomers : customersData}
        setData={handleChangePage}
        pageCount={pageCount}
        pageSize={25}
      />
      { displayedCustomers.length === 0 && <p>No results</p> }
    </Dialog>
  );
}
