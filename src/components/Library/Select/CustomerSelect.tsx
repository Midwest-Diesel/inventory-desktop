import { useEffect, useState } from "react";
import React from "react";
import { useAtom } from "jotai";
import { customerNamesAtom } from "@/scripts/atoms/state";
import { getCustomerNames } from "@/scripts/services/customerService";
import Select from "./Select";
import Loading from "../Loading";

interface Props extends SelectHTML {
  variant?: ('label-inline' | 'label-space-between' | 'label-full-width' | 'label-stack' | 'label-bold')[]
  label?: string
}


export default function CustomerSelect({ variant, label, ...props }: Props) {
  const [customerNames, setCustomerNames] = useAtom<string[]>(customerNamesAtom);
  const [customers, setCustomers] = useState<string[]>([]);

  useEffect(() => {
    setCustomers(customerNames);
  }, [customerNames]);

  useEffect(() => {
    const fetchData = async () => {
      if (customerNames.length === 0) setCustomerNames(await getCustomerNames());
    };
    fetchData();
  }, []);


  return (
    <>
      {customers.length > 0 ?
        <Select
          label={label}
          variant={variant}
          {...props}
        >
          <option value="">-- SELECT A CUSTOMER --</option>
          {customers.length > 0 && customers.sort().map((name: string, i) => {
            return (
              <option key={i} value={name}>{ name }</option>
            );
          })}
        </Select>
        :
        <Loading />
      }
    </>
  );
}
