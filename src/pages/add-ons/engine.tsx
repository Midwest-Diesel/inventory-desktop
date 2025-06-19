import EngineAddOnRow from "@/components/AddOns/EngineAddonRow";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { PreventNavigation } from "@/components/PreventNavigation";
import { engineAddOnsAtom } from "@/scripts/atoms/state";
import { addEngineAddOn, editEngineAddOn, getAllEngineAddOns } from "@/scripts/services/engineAddOnsService";
import { useAtom } from "jotai";
import { FormEvent, Fragment, useEffect, useState } from "react";


export default function AddOnsEngine() {
  const [addOns, setAddons] = useAtom<EngineAddOn[]>(engineAddOnsAtom);
  const [prevAddons, setPrevAddons] = useState<EngineAddOn[]>([]);
  const [savedBtnText, setSavedBtnText] = useState('Save');
  const [shouldPreventLeave, setShouldPreventLeave] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllEngineAddOns();
      setAddons(res);
      setPrevAddons(res);
    };
    fetchData();
  }, []);

  const handleEditAddOns = async (e: FormEvent) => {
    e.preventDefault();
    setSavedBtnText('Saved!');
    setShouldPreventLeave(false);
    for (let i = 0; i < addOns.length; i++) {
      if (JSON.stringify(prevAddons[i]) !== JSON.stringify(addOns[i])) {
        await editEngineAddOn(addOns[i]);
      }
    }
    setTimeout(() => setSavedBtnText('Save'), 1000);
  };

  const handleDuplicateAddOn = async (duplicateAddOn: EngineAddOn) => {
    await addEngineAddOn(duplicateAddOn);
    const res = await getAllEngineAddOns();
    setAddons(res);
    setPrevAddons(res);
  };

  const handleNewAddOn = async () => {
    await addEngineAddOn();
    const res = await getAllEngineAddOns();
    setAddons(res);
    setPrevAddons(res);
  };


  return (
    <Layout title="Add Ons">
      <PreventNavigation shouldPrevent={shouldPreventLeave} text="Do you want to leave without saving?" />

      <div className="add-ons">
        <h1>Engine Add Ons</h1>
        <Button
          variant={['fit']}
          onClick={handleNewAddOn}
        >
          New Engine
        </Button>

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
                  <EngineAddOnRow addOn={addOn} handleDuplicateAddOn={handleDuplicateAddOn} />
                </Fragment>
              );
            })}
          </div>
        </form>
      </div>
    </Layout>
  );
}
