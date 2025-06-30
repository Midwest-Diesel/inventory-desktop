import OfficePartAddonRow from "@/components/AddOns/OfficePartAddonRow";
import AddOnAltPartsDialog from "@/components/Dialogs/AddOnAltPartsDialog";
import Button from "@/components/Library/Button";
import { PreventNavigation } from "@/components/PreventNavigation";
import { shopAddOnsAtom } from "@/scripts/atoms/state";
import { supabase } from "@/scripts/config/supabase";
import { editAddOn, getOfficeAddOns } from "@/scripts/services/addOnsService";
import { getAllPartNums } from "@/scripts/services/partsService";
import { RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { useAtom } from "jotai";
import { FormEvent, Fragment, useEffect, useState } from "react";


export default function OfficePartAddOnsContainer() {
  const [partNumList, setPartNumList] = useState<string[]>([]);
  const [prevAddons, setPrevAddons] = useState<AddOn[]>([]);
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [selectedAddOnData, setSelectedAddOnData] = useState<AddOn | null>(null);
  const [savedBtnText, setSavedBtnText] = useState('Save');
  const [shouldPreventLeave, setShouldPreventLeave] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getOfficeAddOns();
      setAddons(res);
      setPrevAddons(res);

      const partNums = await getAllPartNums();
      setPartNumList(partNums.map((p: Part) => p.partNum));
    };
    fetchData();

    const channel = supabase
      .channel('addOns')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'addOns' }, refreshAddOnsInsert)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'addOns' }, refreshAddOnsUpdate)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'addOns' }, refreshAddOnsDelete);
    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const refreshAddOnsInsert = (e: RealtimePostgresInsertPayload<AddOn>) => {
    setAddons((prev) => {
      if (prev.some(a => a.id === e.new.id)) return prev;
      return [e.new, ...prev];
    });
    setPrevAddons((prev) => {
      if (prev.some(a => a.id === e.new.id)) return prev;
      return [e.new, ...prev];
    });
  };

  const refreshAddOnsUpdate = (e: RealtimePostgresUpdatePayload<AddOn>) => {
    setAddons((prev) => prev.map((row) => row.id === e.new.id ? { ...e.new, altParts: ((e.new.altParts as any) ?? '').split(', ').filter((a: any) => a) } : row));
    setPrevAddons((prev) => prev.map((row) => row.id === e.new.id ? { ...e.new, altParts: ((e.new.altParts as any) ?? '').split(', ').filter((a: any) => a) } : row));
  };

  const refreshAddOnsDelete = (e: RealtimePostgresDeletePayload<AddOn>) => {
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
        await editAddOn(addOns[i]);
      }
    }
    setTimeout(() => setSavedBtnText('Save'), 1000);
  };


  return (
    <>
      <PreventNavigation shouldPrevent={shouldPreventLeave} text="Do you want to leave without saving?" />
      
      {selectedAddOnData &&
        <AddOnAltPartsDialog
          open={selectedAddOnData !== null}
          setOpen={() => setSelectedAddOnData(null)}
          addOn={selectedAddOnData}
          partNumList={partNumList}
        />
      }

      <div className="add-ons">
        <h1>Office Add Ons</h1>

        <form onSubmit={handleEditAddOns}>
          <div className="header__btn-container">
            <Button
              variant={['save']}
              type="submit"
            >
              { savedBtnText }
            </Button>
          </div>

          <form className="add-ons__list" onChange={() => setShouldPreventLeave(true)}>
            {addOns.map((addOn) => {
              return (
                <Fragment key={addOn.id}>
                  <OfficePartAddonRow addOn={addOn} partNumList={partNumList} setSelectedAddOnData={setSelectedAddOnData} onSave={handleSave} />
                </Fragment>
              );
            })}
          </form>
        </form>
      </div>
    </>
  );
}
