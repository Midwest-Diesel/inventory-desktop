import EngineProfitDialog from "@/components/Dialogs/EngineProfitDialog";
import EditEngineDetails from "@/components/Engines/EditEngineDetails";
import Loading from "@/components/Library/Loading";
import { getEngineByStockNum } from "@/scripts/services/enginesService";
import { setTitle } from "@/scripts/tools/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import EngineDetails from "@/components/Engines/EngineDetails";


export default function EngineDetailsContainer() {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [engineProfitOpen, setEngineProfitOpen] = useState(false);

  const { data: engine, isFetching, isFetched, refetch } = useQuery<Engine | null>({
    queryKey: ['engine', params, isEditing],
    queryFn: async () => {
      const res = await getEngineByStockNum(Number(params.engine));
      setTitle(`${res?.stockNum} Engine`);
      return res;
    },
    enabled: !!params,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });


  if (!engine && isFetched) return <p>No engine data found...</p>;
  if (!engine) return null;

  return (
    <div className="engine-details">
      {isEditing ?
        <EditEngineDetails
          engine={engine}
          setIsEditing={setIsEditing}
          refetch={refetch}
        />
        :
        <>
          <EngineProfitDialog open={engineProfitOpen} setOpen={setEngineProfitOpen} stockNum={engine.stockNum} />

          { isFetching && <Loading /> }
          <EngineDetails
            engine={engine}
            setIsEditing={setIsEditing}
            setEngineProfitOpen={setEngineProfitOpen}
          />
        </>
      }
    </div>
  );
}
