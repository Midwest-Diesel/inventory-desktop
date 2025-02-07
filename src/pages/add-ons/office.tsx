import OfficeAddonRow from "@/components/AddOns/OfficeAddonRow";
import AddOnAltPartsDialog from "@/components/Dialogs/AddOnAltPartsDialog";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { PreventNavigation } from "@/components/PreventNavigation";
import { selectedAddOnAtom } from "@/scripts/atoms/components";
import { shopAddOnsAtom } from "@/scripts/atoms/state";
import { editAddOn, getAllAddOns } from "@/scripts/controllers/addOnsController";
import { getAllEngineNums } from "@/scripts/controllers/enginesController";
import { getAllPartNums } from "@/scripts/controllers/partsController";
import { useAtom } from "jotai";
import { FormEvent, Fragment, useEffect, useState } from "react";


export default function AddOnsOffice() {
  const [partNumList, setPartNumList] = useState<string[]>([]);
  const [engineNumList, setEngineNumList] = useState<string[]>([]);
  const [prevAddons, setPrevAddons] = useState<AddOn[]>([]);
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [selectedAddOnData, setSelectedAddOnData] = useAtom<{ addOn: AddOn, dialogOpen: boolean }>(selectedAddOnAtom);
  const [savedBtnText, setSavedBtnText] = useState('Save');
  const [shouldPreventLeave, setShouldPreventLeave] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllAddOns();
      setAddons(res);
      setPrevAddons(res);

      const partNums = await getAllPartNums();
      setPartNumList(partNums.map((p) => p.partNum));
      const engines = await getAllEngineNums();
      setEngineNumList(engines.map((e) => `${e.stockNum}`));
    };
    fetchData();
  }, []);

  const handleEditAddOns = async (e: FormEvent) => {
    e.preventDefault();
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
      { selectedAddOnData.dialogOpen &&
        <AddOnAltPartsDialog
          open={selectedAddOnData.dialogOpen}
          setOpen={(value) => setSelectedAddOnData({ ...selectedAddOnData, dialogOpen: value })}
          addOn={selectedAddOnData.addOn}
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
                  <OfficeAddonRow addOn={addOn} partNumList={partNumList} engineNumList={engineNumList} />
                </Fragment>
              );
            })}
          </form>
        </form>
      </div>
    </Layout>
  );
}
