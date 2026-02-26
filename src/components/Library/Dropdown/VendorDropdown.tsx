import { useEffect } from "react";
import Dropdown from "./Dropdown";
import DropdownOption from "./DropdownOption";
import React from "react";
import { useAtom } from "jotai";
import { vendorNamesAtom } from "@/scripts/atoms/state";
import { getVendorNames } from "@/scripts/services/vendorsService";

interface Props {
  variant?: ('small' | 'label-space-between' | 'label-stack' | 'label-inline' | 'label-full-width' | 'large' | 'no-margin' | 'label-full-height' | 'fill' | 'gap' | 'label-bold')[]
  label?: string
  value: string
  onChange: (value: string) => void
  maxHeight?: string
}


export default function VendorDropdown({ variant, label, value, onChange, maxHeight }: Props) {
  const [vendorsNames, setVendorsData] = useAtom<string[]>(vendorNamesAtom);

  useEffect(() => {
    const fetchData = async () => {
      if (vendorsNames.length === 0) setVendorsData(await getVendorNames());
    };
    fetchData();
  }, [vendorsNames]);


  return (
    <Dropdown
      label={label}
      variant={variant}
      value={value}
      onChange={(c: string) => onChange(c)}
      maxHeight={maxHeight}
      minWidth={'15rem'}
    >
      <DropdownOption value="">-- SELECT VENDOR --</DropdownOption>
      {vendorsNames.length > 0 && vendorsNames.map((vendor: string, i) => {
        return (
          <DropdownOption key={i} value={vendor}>{ vendor }</DropdownOption>
        );
      })}
    </Dropdown>
  );
}
