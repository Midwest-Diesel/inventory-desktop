import Dialog from "../../Library/Dialog";
import Pagination from "../../Library/Pagination";
import Table from "../../Library/Table";
import { useAtom } from "jotai";
import { customersAtom, selectedCustomerAtom } from "@/scripts/atoms/state";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomersCount, getSomeCustomers, searchCustomers } from "@/scripts/controllers/customerController";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  searchTerm: string
}

export default function CustomerSearchDialog({ open, setOpen, searchTerm }: Props) {
  const [customersData, setCustomersData] = useAtom<Customer[]>(customersAtom);
  const [searchedCustomers, setSearchedCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [customersMin, setCustomersMin] = useState<number[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(customersData);
  const [page, setPage] = useState<number>(1);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const pageCount = await getCustomersCount();
      setCustomersMin(pageCount);
      const res = await getSomeCustomers(1, 25);
      setCustomersData(res);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm) {
        setIsSearching(true);
        const results = await searchCustomers(searchTerm);
        setSearchedCustomers(results);
        setPage(1);
      } else {
        setIsSearching(false);
      }
    };
    fetchData();
  }, [searchTerm, customersData]);

  const selectCustomer = (customer: Customer) => {
    localStorage.setItem('customerId', customer.id.toString());
    setSelectedCustomer(customer);
  };

  const handleChangePage = async (data: any, page: number) => {
    setPage(page);
    if (isSearching) {
      const startIndex = (page - 1) * 25;
      const endIndex = startIndex + 25;
      setCustomers(searchedCustomers.slice(startIndex, endIndex));
    } else {
      const res = await getSomeCustomers(page, 25);
      setCustomers(res);
    }
  };

  const displayedCustomers = isSearching ? searchedCustomers.slice((page - 1) * 25, page * 25) : customers;

  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Customers"
      maxHeight="20rem"
      data-cy="customer-search-dialog"
    >
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
        minData={isSearching ? searchedCustomers : customersMin}
        pageSize={25}
      />
      { displayedCustomers.length === 0 && <p>No results</p> }
    </Dialog>
  );
}
