import { useAtom } from "jotai";
import Select from "./Select";
import { sourcesAtom } from "@/scripts/atoms/state";
import Loading from "../Loading";
import { useEffect } from "react";
import { getAllSources } from "@/scripts/controllers/sourcesController";

interface Props extends SelectHTML {
  variant?: ('label-inline' | 'label-space-between' | 'label-full-width' | 'label-stack')[]
  label?: string
}


export default function SourceSelect({ variant, label, ...props }: Props) {
  const [sourcesData, setSourcesData] = useAtom<string[]>(sourcesAtom);

  useEffect(() => {
    const fetchData = async () => {
      if (sourcesData.length === 0) setSourcesData(await getAllSources());
    };
    fetchData();
  }, []);
  

  return (
    <>
      {sourcesData.length > 0 ?
        <Select
          label={label}
          variant={variant}
          {...props}
        >
          <option value="">-- SELECT A SOURCE --</option>
          {sourcesData.length > 0 && sourcesData.sort().map((source: string, i) => {
            return (
              <option key={i} value={source}>{ source }</option>
            );
          })}
        </Select>
        :
        <Loading />
      }
    </>
  );
}
