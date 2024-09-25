import { useEffect, useState } from "react";
import Dropdown from "../Dropdown/Dropdown";
import DropdownOption from "../Dropdown/DropdownOption";
import React from "react";
import { useAtom } from "jotai";
import { vendorsDataAtom } from "@/scripts/atoms/state";
import { getVendors } from "@/scripts/controllers/vendorsController";

interface Props {
  variant?: ('label-inline' | 'label-space-between' | 'label-full-width' | 'label-stack' | 'large' | 'no-margin' | 'label-full-height' | 'fill' | 'gap' | 'label-bold')[]
  label?: string
  value: string
  onChange: (vendor: Vendor) => void
  maxHeight?: string
}


export default function VendorSelect({ variant, label, value, onChange, maxHeight }: Props) {
  const [vendorsData, setVendorsData] = useAtom<Vendor[]>(vendorsDataAtom);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    setVendors(vendorsData);
  }, [vendorsData]);

  useEffect(() => {
    const fetchData = async () => {
      if (vendorsData.length === 0) setVendorsData(await getVendors());
    };
    fetchData();
  }, []);

  const handleChange = (vendor: Vendor) => {
    onChange(vendor);
  };


  return (
    <>
      <Dropdown
        label={label}
        variant={variant}
        value={value}
        onChange={(_: string, data: any) => handleChange(data)}
        maxHeight={maxHeight}
      >
        <DropdownOption value="">-- SELECT A VENDOR --</DropdownOption>
        {vendors.length > 0 && vendors.sort((a, b) => a.name && a.name.localeCompare(b.name)).map((vendor: Vendor) => {
          return (
            <DropdownOption key={vendor.id} value={vendor.name} data={vendor}>{ vendor.name }</DropdownOption>
          );
        })}
      </Dropdown>
    </>
  );
}
