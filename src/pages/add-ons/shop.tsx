import ShopAddonRow from "@/components/AddOns/ShopAddonRow";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { PreventNavigation } from "@/components/PreventNavigation";
import { shopAddOnsAtom } from "@/scripts/atoms/state";
import { addAddOn, editAddOn, getAllAddOns } from "@/scripts/controllers/addOnsController";
import { confirm } from "@tauri-apps/api/dialog";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";


export default function AddOnsShop() {
  const router = useRouter();
  const [prevAddons, setPrevAddons] = useState<AddOn[]>([]);
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [savedBtnText, setSavedBtnText] = useState('Save');

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
    setPrevAddons([res[0], ...prevAddons]);
  };

  const handleDuplicateAddOn = async (duplicateAddOn: AddOn) => {
    await addAddOn(duplicateAddOn);
    const res = await getAllAddOns();
    setAddons(res);
    setPrevAddons([res[0], ...prevAddons]);
  };

  const handleEditAddOns = async () => {
    setSavedBtnText('Saved!');
    for (let i = 0; i < addOns.length; i++) {
      if (JSON.stringify(prevAddons[i]) !== JSON.stringify(addOns[i])) {
        await editAddOn(addOns[i]);
      }
    }
    setTimeout(() => setSavedBtnText('Save'), 1000);
  };


  return (
    <Layout title="Add Ons">
      <PreventNavigation />

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

        <div className="add-ons__list">
          {addOns.map((addOn) => {
            return (
              <Fragment key={addOn.id}>
                <ShopAddonRow addOn={addOn} handleDuplicateAddOn={handleDuplicateAddOn} />
              </Fragment>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
