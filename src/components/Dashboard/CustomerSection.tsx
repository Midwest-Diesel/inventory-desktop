import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { selectedCustomerAtom } from "@/scripts/atoms/state";
import { isObjectNull } from "@/scripts/tools/utils";
import { getCustomerById } from "@/scripts/services/customerService";
import SelectedCustomerInfo from "@/components/dashboard/SelectedCustomerInfo";
import CustomerSearch from "@/components/dashboard/CustomerSearch";

interface Props {
  onExpandDetails: (isExpanded: boolean) => void
}


export default function CustomerSection({ onExpandDetails }: Props) {
  const [selectedCustomer, setSelectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [expandedDetailsOpen, setExpandedDetailsOpen] = useState(
    localStorage.getItem('customerExpanded') === 'true' ? true : false
  );

  useEffect(() => {
    const fetchData = async () => {
      const prevCustomer = Number(localStorage.getItem('customerId'));
      const res = await getCustomerById(prevCustomer);
      if (!res) return;
      setSelectedCustomer(prevCustomer ? res : selectedCustomer);
    };
    fetchData();
  }, []);

  const toggleExpandDetails = (isOpen: boolean) => {
    localStorage.setItem('customerExpanded', `${isOpen}`);
    setExpandedDetailsOpen(isOpen);
  };

  
  return (
    <div className="customer-search">
      <div>
        <CustomerSearch
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          expandedDetailsOpen={expandedDetailsOpen}
          setExpandedDetailsOpen={toggleExpandDetails}
          onExpandDetails={onExpandDetails}
        />

        {!isObjectNull(selectedCustomer) &&
          <SelectedCustomerInfo expandedDetailsOpen={expandedDetailsOpen} />
        }
      </div>
    </div>
  );
}
