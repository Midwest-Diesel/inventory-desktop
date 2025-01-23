import ShopAddonRow from "@/components/AddOns/ShopAddonRow";
import MarkPoItemsReceivedDialog from "@/components/Dialogs/MarkPoItemsReceivedDialog";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { PreventNavigation } from "@/components/PreventNavigation";
import { selectedPoAddOnAtom } from "@/scripts/atoms/components";
import { shopAddOnsAtom } from "@/scripts/atoms/state";
import { addAddOn, editAddOn, getAllAddOns } from "@/scripts/controllers/addOnsController";
import { useAtom } from "jotai";
import { Fragment, useEffect, useState } from "react";


export default function AddOnsShop() {
  const [selectedPoData, setSelectedPoData] = useAtom<{ selectedPoAddOn: PO, addOn: AddOn, receivedItemsDialogOpen: boolean }>(selectedPoAddOnAtom);
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
    };
    fetchData();
  }, []);

  const handleNewAddOn = async () => {
    await addAddOn();
    const res = await getAllAddOns();
    setAddons(res);
    setPrevAddons(res);
  };

  const handleDuplicateAddOn = async (duplicateAddOn: AddOn) => {
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
    <Layout title="Add Ons">
      <PreventNavigation shouldPrevent={shouldPreventLeave} />

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
                <ShopAddonRow addOn={addOn} handleDuplicateAddOn={handleDuplicateAddOn} />
              </Fragment>
            );
          })}
        </form>
      </div>
    </Layout>
  );
}
