import ShopPartAddonRow from "@/components/AddOns/ShopPartAddonRow";
import MarkPoItemsReceivedDialog from "@/components/Dialogs/MarkPoItemsReceivedDialog";
import Button from "@/components/Library/Button";
import { PreventNavigation } from "@/components/PreventNavigation";
import { selectedPoAddOnAtom } from "@/scripts/atoms/components";
import { shopAddOnsAtom } from "@/scripts/atoms/state";
import { supabase } from "@/scripts/config/supabase";
import { addAddOn, editAddOn, getAllAddOns } from "@/scripts/services/addOnsService";
import { getAllPartNums } from "@/scripts/services/partsService";
import { RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { useAtom } from "jotai";
import { Fragment, useEffect, useState } from "react";


export default function ShopPartAddOnsContainer() {
  const [selectedPoData, setSelectedPoData] = useAtom<{ selectedPoAddOn: PO | null, addOn: AddOn | null, receivedItemsDialogOpen: boolean }>(selectedPoAddOnAtom);
  const [partNumList, setPartNumList] = useState<string[]>([]);
  const [prevAddons, setPrevAddons] = useState<AddOn[]>([]);
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [savedBtnText, setSavedBtnText] = useState('Save');
  const [shouldPreventLeave, setShouldPreventLeave] = useState(false);
  const { selectedPoAddOn, addOn, receivedItemsDialogOpen } = selectedPoData;

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllAddOns();
      setAddons(res);
      setPrevAddons(res);

      const parts = await getAllPartNums();
      setPartNumList(parts.map((p: Part) => p.partNum));
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
      return [...prev, e.new];
    });
    setPrevAddons((prev) => {
      if (prev.some(a => a.id === e.new.id)) return prev;
      return [...prev, e.new];
    });
  };

  const refreshAddOnsUpdate = (e: RealtimePostgresUpdatePayload<AddOn>) => {
    setAddons((prev) => prev.map((row) => row.id === e.new.id ? { ...e.new, altParts: (e.new.altParts as any).split(', ').filter((a: any) => a) } : row));
    setPrevAddons((prev) => prev.map((row) => row.id === e.new.id ? { ...e.new, altParts: (e.new.altParts as any).split(', ').filter((a: any) => a) } : row));
  };

  const refreshAddOnsDelete = (e: RealtimePostgresDeletePayload<AddOn>) => {
    setAddons((prev) => prev.filter((row) => row.id !== e.old.id));
    setPrevAddons((prev) => prev.filter((row) => row.id !== e.old.id));
  };

  const handleNewAddOn = async () => {
    await handleEditAddOns();
    await addAddOn();
    const res = await getAllAddOns();
    setAddons(res);
    setPrevAddons(res);
  };

  const handleDuplicateAddOn = async (duplicateAddOn: AddOn) => {
    await handleEditAddOns();
    await addAddOn(duplicateAddOn);
    const res = await getAllAddOns();
    setAddons(res);
    setPrevAddons(res);
  };

  const handleEditAddOns = async () => {
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

      { selectedPoAddOn ?
        <MarkPoItemsReceivedDialog
          open={receivedItemsDialogOpen}
          setOpen={(value: boolean) => setSelectedPoData({ ...selectedPoData, receivedItemsDialogOpen: value })}
          purchaseOrder={selectedPoAddOn}
          addOn={addOn}
        /> : '' }

      <div className="add-ons">
        <h1>Shop Add Ons</h1>
        <Button
          variant={['fit']}
          onClick={handleNewAddOn}
        >
          New Part
        </Button>

        <div className="header__btn-container">
          <Button
            variant={['save']}
            onClick={handleEditAddOns}
          >
            { savedBtnText }
          </Button>
        </div>

        <form className="add-ons__list" onChange={() => setShouldPreventLeave(true)}>
          {addOns.map((addOn) => {
            return (
              <Fragment key={addOn.id}>
                <ShopPartAddonRow addOn={addOn} handleDuplicateAddOn={handleDuplicateAddOn} partNumList={partNumList} onSave={handleEditAddOns} />
              </Fragment>
            );
          })}
        </form>
      </div>
    </>
  );
}
