import { Layout } from "@/components/Layout";
import OfficeEngineAddOnRow from "@/components/addOns/OfficeEngineAddonRow";
import Button from "@/components/library/Button";
import { usePreventNavigation } from "@/hooks/usePreventNavigation";
import { engineAddOnsAtom, userAtom } from "@/scripts/atoms/state";
import { emitServerEvent, offServerEvent, onServerEvent } from "@/scripts/config/websockets";
import { editEngineAddOns, engineAddOnClearUserEditing, getOfficeEngineAddOns } from "@/scripts/services/engineAddOnsService";
import { parseResDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import { Fragment, useEffect, useRef, useState } from "react";


export default function OfficeEngineAddOns() {
  const [user] = useAtom<User>(userAtom);
  const [addOns, setAddons] = useAtom<EngineAddOn[]>(engineAddOnsAtom);
  const [prevAddons, setPrevAddons] = useState<EngineAddOn[]>([]);
  const [savedBtnText, setSavedBtnText] = useState('Save');
  const [shouldPreventLeave, setShouldPreventLeave] = useState(false);
  const isSavingRef = useRef(false);
  usePreventNavigation(shouldPreventLeave, 'Leave without saving changes?');

  useEffect(() => {
    onServerEvent('UPDATE_ENGINE_ADDON_OWNERSHIP', updateAddOnOwnership);
    onServerEvent('UPDATE_ENGINE_ADDONS', updateAddOns);
    onServerEvent('UPDATE_ENGINE_ADDON_OWNERSHIP_CLEAR', clearOwnership);
    onServerEvent('PRINT_ENGINE_ADDON', handleAddOnPrint);
    onServerEvent('DELETE_ENGINE_ADDON', handleAddOnDelete);

    const fetchData = async () => {
      const res = await getOfficeEngineAddOns();
      setAddons(res);
      setPrevAddons(res);
    };
    fetchData();

    return () => {
      offServerEvent('UPDATE_ENGINE_ADDONS', updateAddOns);
      offServerEvent('UPDATE_ENGINE_ADDON_OWNERSHIP', updateAddOnOwnership);
      offServerEvent('UPDATE_ENGINE_ADDON_OWNERSHIP_CLEAR', clearOwnership);
      offServerEvent('PRINT_ENGINE_ADDON', handleAddOnPrint);
      offServerEvent('DELETE_ENGINE_ADDON', handleAddOnDelete);
    };
  }, []);

  const updateAddOnOwnership = (row :{ id: number, userEditing: { id: number, username: string } }) => {
    if (isSavingRef.current) return;
    setAddons((prev) =>
      prev.map((a) =>
        a.id === row.id ? { ...a, userEditing: row.userEditing } : a
      )
    );

    setPrevAddons((prev) =>
      prev.map((a) =>
        a.id === row.id ? { ...a, userEditing: row.userEditing } : a
      )
    );
  };

  const clearOwnership = (userId: number) => {
    setAddons((prev) =>
      prev.map((row) =>
        row.userEditing?.id === userId ? { ...row, userEditing: null } : row
      )
    );
  };

  const updateAddOns = (updatedRows: EngineAddOn[], userEditing: number) => {
    setSavedBtnText('Saved!');
    setAddons((prev) =>
      prev.map((row) => {
        const updated = updatedRows.find((a) => a.id === row.id);
        if (updated) {
          return { ...updated, userEditing: null };
        }
        if (row.userEditing?.id === userEditing) {
          return { ...row, userEditing: null };
        }
        return row;
      })
    );

    setPrevAddons((prev) =>
      prev.map((row) => {
        const updated = updatedRows.find((a) => a.id === row.id);
        if (updated) {
          return { ...updated, userEditing: null };
        }
        if (row.userEditing?.id === userEditing) {
          return { ...row, userEditing: null };
        }
        return row;
      })
    );

    setTimeout(() => setSavedBtnText('Save'), 1000);
  };

  const handleAddOnPrint = (addOn: EngineAddOn) => {
    const parsed = {
      ...addOn,
      entryDate: parseResDate(addOn.entryDate as any),
      userEditing: null
    };

    setAddons((prev) => {
      if (prev.some((a) => a.id === parsed.id)) return prev;
      return [parsed, ...prev];
    });

    setPrevAddons((prev) => {
      if (prev.some((a) => a.id === parsed.id)) return prev;
      return [parsed, ...prev];
    });
  };

  const handleAddOnDelete = (id: number) => {
    setAddons((prev) => prev.filter(row => row.id !== id));
    setPrevAddons((prev) => prev.filter(row => row.id !== id));
  };

  const handleEditAddOns = async () => {
    setShouldPreventLeave(false);

    const changedAddOns = addOns.filter((a) => {
      const prev = prevAddons.find(p => p.id === a.id);
      if (!prev) return true;
      return JSON.stringify(prev) !== JSON.stringify(a) || a.userEditing?.id === user.id;
    });
    if (!changedAddOns.length) return;

    isSavingRef.current = true;
    await editEngineAddOns(changedAddOns);
    await engineAddOnClearUserEditing(user.id);
    isSavingRef.current = false;
    emitServerEvent('UPDATE_ENGINE_ADDON_OWNERSHIP_CLEAR', [user.id]);
    const cleaned = changedAddOns.map(a => ({
      ...a,
      userEditing: null
    }));
    emitServerEvent('UPDATE_ENGINE_ADDONS', [cleaned, user.id]);
  };


  return (
    <Layout title="Add Ons">
      <div className="add-ons">
        <h1>Office Engine Add Ons</h1>

        <div className="header__btn-container">
          <Button
            variant={['save']}
            onClick={handleEditAddOns}
          >
            { savedBtnText }
          </Button>
        </div>

        <div className="add-ons__list" onChange={() => setShouldPreventLeave(true)}>
          {addOns.map((addOn) => {
            return (
              <Fragment key={addOn.id}>
                <OfficeEngineAddOnRow addOn={addOn} onSave={handleEditAddOns} />
              </Fragment>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
