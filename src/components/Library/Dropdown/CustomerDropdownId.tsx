import { useEffect } from "react";
import Dropdown from "./Dropdown";
import DropdownOption from "./DropdownOption";
import React from "react";
import { useAtom } from "jotai";
import { customersMinAtom } from "@/scripts/atoms/state";
import { getCustomersMin } from "@/scripts/services/customerService";

interface Props {
  variant?: ('small' | 'input' | 'label-space-between' | 'label-stack' | 'label-inline' | 'label-full-width' | 'large' | 'no-margin' | 'label-full-height' | 'fill' | 'gap' | 'label-bold')[]
  label?: string
  value: string | number
  onChange: (id: number) => void
  maxHeight?: string
}


export default function CustomerDropdownId({ variant, label, value, onChange, maxHeight }: Props) {
  const [customers, setCustomers] = useAtom<CustomerMin[]>(customersMinAtom);

  useEffect(() => {
    const fetchData = async () => {
      if (customers.length === 0) setCustomers(await getCustomersMin());
    };
    fetchData();
  }, []);


  return (
    <>
      <Dropdown
        label={label}
        variant={variant}
        value={value.toString()}
        onChange={(id: number) => onChange(id)}
        maxHeight={maxHeight}
      >
        <DropdownOption value="0">-- SELECT A CUSTOMER --</DropdownOption>
        {customers.length > 0 && customers.sort().map((customer: CustomerMin, i) => {
          return (
            <DropdownOption key={i} value={customer.id}>{ customer.company }</DropdownOption>
          );
        })}
      </Dropdown>
    </>
  );
}
