import { useEffect } from "react";
import React from "react";
import { useAtom } from "jotai";
import Select from "./Select";
import Loading from "../Loading";
import { customersMinAtom } from "@/scripts/atoms/state";
import { getCustomersMin } from "@/scripts/services/customerService";

interface Props extends SelectHTML {
  variant?: ('label-inline' | 'label-space-between' | 'label-full-width' | 'label-stack' | 'label-bold')[]
  label?: string
}


export default function CustomerSelectId({ variant, label, ...props }: Props) {
  const [customers, setCustomers] = useAtom<CustomerMin[]>(customersMinAtom);

  useEffect(() => {
    const fetchData = async () => {
      if (customers.length === 0) setCustomers(await getCustomersMin());
    };
    fetchData();
  }, []);


  return (
    <>
      {customers.length > 0 ?
        <Select
          label={label}
          variant={variant}
          data-testid="customer-select"
          {...props}
        >
          <option value="">-- SELECT A CUSTOMER --</option>
          {customers.length > 0 && customers.sort().map((customer: CustomerMin, i) => {
            return (
              <option key={i} value={customer.id}>{ customer.company }</option>
            );
          })}
        </Select>
        :
        <Loading />
      }
    </>
  );
}
