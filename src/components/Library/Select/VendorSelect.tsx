import { useAtom } from "jotai";
import Select from "./Select";
import Loading from "../Loading";
import { useEffect } from "react";
import { vendorsDataAtom } from "@/scripts/atoms/state";
import { getVendors } from "@/scripts/controllers/vendorsController";

interface Props extends SelectHTML {
  variant?: ('label-inline' | 'label-space-between' | 'label-full-width' | 'label-stack' | 'label-bold')[]
  label?: string
}


export default function VendorSelect({ variant, label, ...props }: Props) {
  const [vendorsData, setVendorsData] = useAtom<Vendor[]>(vendorsDataAtom);

  useEffect(() => {
    const fetchData = async () => {
      if (vendorsData.length === 0) setVendorsData(await getVendors());
    };
    fetchData();
  }, []);
  

  return (
    <>
      {vendorsData.length > 0 ?
        <Select
          label={label}
          variant={variant}
          {...props}
        >
          <option value="">-- SELECT A VENDOR --</option>
          {vendorsData.length > 0 && vendorsData.sort().map((vendor: Vendor, i) => {
            return (
              <option key={i} value={vendor.name ?? ''}>{ vendor.name }</option>
            );
          })}
        </Select>
        :
        <Loading />
      }
    </>
  );
}
