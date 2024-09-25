import { FormEvent, useEffect, useState } from "react";
import Button from "../Library/Button";
import Input from "../Library/Input";
import CustomerSearchDialog from "../Dialogs/dashboard/CustomerSearchDialog";
import { useAtom } from "jotai";
import { selectedCustomerAtom } from "@/scripts/atoms/state";
import { isObjectNull } from "@/scripts/tools/utils";
import SelectedCustomerInfo from "./SelectedCustomerInfo";
import { addCustomer, getCustomerById, getCustomerByName } from "@/scripts/controllers/customerController";


export default function CustomerSearch() {
  const [selectedCustomer, setSelectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const prevCustomer = Number(localStorage.getItem('customerId'));
      const res = await getCustomerById(prevCustomer);
      setSelectedCustomer(prevCustomer ? res : selectedCustomer);
    };
    fetchData();
  }, []);

  const handleCustomerSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchDialogOpen(true);
  };

  const handleAddCustomer = async () => {
    const name = prompt('Enter customer name');
    if (!name) return;
    await addCustomer(name);
    const res = await getCustomerByName(name);
    location.replace(`/customer/${res.id}`);
  };

  
  return (
    <div className="customer-search">
      <h2 className="no-select">Customer Search</h2>
      { isObjectNull(selectedCustomer) && <Button variant={['x-small']} onClick={handleAddCustomer}>Add Customer</Button> }
      { !isObjectNull(selectedCustomer) && <SelectedCustomerInfo customerData={selectedCustomer} setCustomerData={setSelectedCustomer} /> }
      <form onSubmit={(e) => handleCustomerSearch(e)}>
        <Input
          variant={['search']}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          value={searchTerm}
          data-cy="customer-input"
        >
          <Button variant={['search', 'small']} data-cy="customer-search">Search</Button>
        </Input>
      </form>

      <CustomerSearchDialog open={searchDialogOpen} setOpen={setSearchDialogOpen} searchTerm={searchTerm} />
    </div>
  );
}
