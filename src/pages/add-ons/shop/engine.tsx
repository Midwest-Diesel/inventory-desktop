import { Layout } from "@/components/Layout";
import ShopEngineAddOnRow from "@/components/addOns/ShopEngineAddonRow";
import Button from "@/components/library/Button";
import { usePreventNavigation } from "@/hooks/usePreventNavigation";
import { usePrintQue } from "@/hooks/usePrintQue";
import { engineAddOnsAtom } from "@/scripts/atoms/state";
import { supabase } from "@/scripts/config/supabase";
import { addEngineAddOn, editEngineAddOn, getAllEngineAddOns } from "@/scripts/services/engineAddOnsService";
import { RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { useAtom } from "jotai";
import { FormEvent, Fragment, useEffect, useState } from "react";


export default function ShopEngineAddOns() {
  const [addOns, setAddons] = useAtom<EngineAddOn[]>(engineAddOnsAtom);
  const [prevAddons, setPrevAddons] = useState<EngineAddOn[]>([]);
  const [savedBtnText, setSavedBtnText] = useState('Save');
  const [shouldPreventLeave, setShouldPreventLeave] = useState(false);
  const { addToQue, printQue } = usePrintQue();
  usePreventNavigation(shouldPreventLeave, 'Leave without saving changes?');

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllEngineAddOns();
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
      if (prev.some((a) => a.id === e.new.id)) return prev;
      return [e.new, ...prev];
    });
    setPrevAddons((prev) => {
      if (prev.some((a) => a.id === e.new.id)) return prev;
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

  const handleDuplicateAddOn = async (duplicateAddOn: EngineAddOn) => {
    await handleSave();
    await addEngineAddOn(duplicateAddOn);
  };

  const handleNewAddOn = async () => {
    await handleSave();
    await addEngineAddOn();
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

  const handlePrintChecklist = () => {
    addToQue('engineChecklist', 'print_engine_checklist', null, '1500px', '1000px');
    printQue();
  };


  return (
    <Layout title="Add Ons">
      <div className="add-ons">
        <h1>Shop Engine Add Ons</h1>
        <div className="add-ons__top-buttons">
          <Button
            variant={['fit']}
            onClick={handleNewAddOn}
          >
            New Engine
          </Button>
          <Button
            variant={['fit']}
            onClick={handlePrintChecklist}
          >
            Print Checklist
          </Button>
        </div>

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
                  <ShopEngineAddOnRow addOn={addOn} handleDuplicateAddOn={handleDuplicateAddOn} onSave={handleSave} />
                </Fragment>
              );
            })}
          </div>
        </form>
      </div>
    </Layout>
  );
}
