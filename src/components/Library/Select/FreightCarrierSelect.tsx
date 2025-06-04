import { useAtom } from "jotai";
import Select from "./Select";
import Loading from "../Loading";
import { useEffect } from "react";
import { getAllFreightCarriers } from "@/scripts/services/freightCarriersService";
import { FreightCarriersAtom } from "@/scripts/atoms/state";

interface Props extends SelectHTML {
  variant?: ('label-inline' | 'label-space-between' | 'label-full-width' | 'label-stack' | 'label-bold')[]
  label?: string
}


export default function FreightCarrierSelect({ variant, label, ...props }: Props) {
  const [freightCarriers, setFreightCarriers] = useAtom<FreightCarrier[]>(FreightCarriersAtom);

  useEffect(() => {
    const fetchData = async () => {
      if (freightCarriers.length === 0) setFreightCarriers(await getAllFreightCarriers());
    };
    fetchData();
  }, []);
  

  return (
    <>
      {freightCarriers.length > 0 ?
        <Select
          label={label}
          variant={variant}
          {...props}
        >
          <option value="">-- CARRIERS --</option>
          {freightCarriers.length > 0 && freightCarriers.sort().map((row: FreightCarrier) => {
            return (
              <option key={row.id} value={row.id}>{ row.name }</option>
            );
          })}
        </Select>
        :
        <Loading />
      }
    </>
  );
}
