import { useEffect, useState } from "react";
import Dropdown from "../Dropdown/Dropdown";
import DropdownOption from "../Dropdown/DropdownOption";
import React from "react";
import { useAtom } from "jotai";
import { customerNamesAtom } from "@/scripts/atoms/state";
import { getCustomerNames } from "@/scripts/services/customerService";

interface Props {
  variant?: ('small' | 'input' | 'label-space-between' | 'label-stack' | 'label-inline' | 'label-full-width' | 'large' | 'no-margin' | 'label-full-height' | 'fill' | 'gap' | 'label-bold')[]
  label?: string
  value: string
  onChange: (customer: string) => void
  maxHeight?: string
}


export default function CustomerDropdown({ variant, label, value, onChange, maxHeight }: Props) {
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
      <Dropdown
        label={label}
        variant={variant}
        value={value}
        onChange={(c: string) => onChange(c)}
        maxHeight={maxHeight}
      >
        <DropdownOption value="">-- SELECT A CUSTOMER --</DropdownOption>
        {customers.length > 0 && customers.sort((a, b) => a.localeCompare(b)).map((customer: string, i) => {
          return (
            <DropdownOption key={i} value={customer}>{ customer }</DropdownOption>
          );
        })}
      </Dropdown>
    </>
  );
}
