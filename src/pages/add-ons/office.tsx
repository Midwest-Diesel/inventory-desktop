import OfficeAddonRow from "@/components/AddOns/OfficeAddonRow";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { shopAddOnsAtom } from "@/scripts/atoms/state";
import { editAddOn, getAllAddOns } from "@/scripts/controllers/addOnsController";
import { useAtom } from "jotai";
import { FormEvent, Fragment, useEffect, useState } from "react";
import { confirm } from '@tauri-apps/api/dialog';


export default function AddOnsOffice() {
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

    function confirmLeave(event) {
      event.preventDefault();
      event.returnValue = '';
    }
    
    window.addEventListener('beforeunload', confirmLeave);
    return () => {
      window.removeEventListener('beforeunload', confirmLeave);
    };
  }, []);

  const handleEditAddOns = async (e: FormEvent) => {
    e.preventDefault();
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

          <div className="add-ons__list">
            {addOns.map((addOn) => {
              return (
                <Fragment key={addOn.id}>
                  <OfficeAddonRow addOn={addOn} />
                </Fragment>
              );
            })}
          </div>
        </form>
      </div>
    </Layout>
  );
}
