import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { selectedCustomerAtom } from "@/scripts/atoms/state";
import { isObjectNull } from "@/scripts/tools/utils";
import { getCustomerById } from "@/scripts/services/customerService";
import SelectedCustomerInfo from "@/components/Dashboard/SelectedCustomerInfo";
import CustomerSearch from "@/components/Dashboard/CustomerSearch";


export default function CustomerSection() {
  const [selectedCustomer, setSelectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [expandedDetailsOpen, setExpandedDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const prevCustomer = Number(localStorage.getItem('customerId'));
      const res = await getCustomerById(prevCustomer);
      setSelectedCustomer(prevCustomer ? res : selectedCustomer);
    };
    fetchData();
  }, []);

  
  return (
    <div className="customer-search">
      <div>
        <CustomerSearch
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          expandedDetailsOpen={expandedDetailsOpen}
          setExpandedDetailsOpen={setExpandedDetailsOpen}
        />

        {!isObjectNull(selectedCustomer) &&
          <SelectedCustomerInfo
            customerData={selectedCustomer}
            setCustomerData={setSelectedCustomer}
            expandedDetailsOpen={expandedDetailsOpen}
          />
        }
      </div>
    </div>
  );
}
