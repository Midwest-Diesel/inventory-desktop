import OfficeEngineAddOnRow from "@/components/AddOns/OfficeEngineAddonRow";
import Button from "@/components/Library/Button";
import { PreventNavigation } from "@/components/PreventNavigation";
import { engineAddOnsAtom } from "@/scripts/atoms/state";
import { supabase } from "@/scripts/config/supabase";
import { editEngineAddOn, getOfficeEngineAddOns } from "@/scripts/services/engineAddOnsService";
import { RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { useAtom } from "jotai";
import { FormEvent, Fragment, useEffect, useState } from "react";


export default function OfficeEngineAddOnsContainer() {
  const [addOns, setAddons] = useAtom<EngineAddOn[]>(engineAddOnsAtom);
  const [prevAddons, setPrevAddons] = useState<EngineAddOn[]>([]);
  const [savedBtnText, setSavedBtnText] = useState('Save');
  const [shouldPreventLeave, setShouldPreventLeave] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getOfficeEngineAddOns();
      setAddons(res);
      setPrevAddons(res);
    };
    fetchData();

    const channel = supabase
      .channel('engineAddOns')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'engineAddOns' }, refreshAddOnsInsert)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'engineAddOns' }, refreshAddOnsUpdate)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'engineAddOns' }, refreshAddOnsDelete);
    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const refreshAddOnsInsert = (e: RealtimePostgresInsertPayload<EngineAddOn>) => {
    setAddons((prev) => {
      if (prev.some(a => a.id === e.new.id)) return prev;
      return [e.new, ...prev];
    });
    setPrevAddons((prev) => {
      if (prev.some(a => a.id === e.new.id)) return prev;
      return [e.new, ...prev];
    });
  };

  const refreshAddOnsUpdate = (e: RealtimePostgresUpdatePayload<EngineAddOn>) => {
    setAddons((prev) => prev.map((row) => row.id === e.new.id ? e.new : row));
    setPrevAddons((prev) => prev.map((row) => row.id === e.new.id ? e.new : row));
  };

  const refreshAddOnsDelete = (e: RealtimePostgresDeletePayload<EngineAddOn>) => {
    setAddons((prev) => prev.filter((row) => row.id !== e.old.id));
    setPrevAddons((prev) => prev.filter((row) => row.id !== e.old.id));
  };

  const handleEditAddOns = async (e: FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  const handleSave = async () => {
    setSavedBtnText('Saved!');
    setShouldPreventLeave(false);
    for (let i = 0; i < addOns.length; i++) {
      if (JSON.stringify(prevAddons[i]) !== JSON.stringify(addOns[i])) {
        await editEngineAddOn(addOns[i]);
      }
    }
    setTimeout(() => setSavedBtnText('Save'), 1000);
  };


  return (
    <>
      <PreventNavigation shouldPrevent={shouldPreventLeave} text="Do you want to leave without saving?" />

      <div className="add-ons">
        <h1>Engine Add Ons</h1>

        <form onSubmit={handleEditAddOns} onChange={() => setShouldPreventLeave(true)}>
          <div className="header__btn-container">
            <Button
              variant={['save']}
              type="submit"
            >
              { savedBtnText }
            </Button>
          </div>

          <div className="add-ons__list">
            {addOns.map((addOn) => {
              return (
                <Fragment key={addOn.id}>
                  <OfficeEngineAddOnRow addOn={addOn} onSave={handleSave} />
                </Fragment>
              );
            })}
          </div>
        </form>
      </div>
    </>
  );
}
