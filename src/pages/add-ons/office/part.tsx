import { Layout } from "@/components/Layout";
import OfficePartAddonRow from "@/components/addOns/OfficePartAddonRow";
import AddOnAltPartsDialog from "@/components/addOns/dialogs/AddOnAltPartsDialog";
import Button from "@/components/library/Button";
import { usePreventNavigation } from "@/hooks/usePreventNavigation";
import { shopAddOnsAtom, userAtom } from "@/scripts/atoms/state";
import { emitServerEvent, offServerEvent, onServerEvent } from "@/scripts/config/websockets";
import { addOnClearUserEditing, editAddOns, getOfficeAddOns } from "@/scripts/services/addOnsService";
import { getAllPartNums } from "@/scripts/services/partsService";
import { parseResDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import { Fragment, useEffect, useRef, useState } from "react";


export default function OfficePartAddOns() {
  const [user] = useAtom<User>(userAtom);
  const [partNumList, setPartNumList] = useState<string[]>([]);
  const [prevAddons, setPrevAddons] = useState<AddOn[]>([]);
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [selectedAddOnData, setSelectedAddOnData] = useState<AddOn | null>(null);
  const [savedBtnText, setSavedBtnText] = useState('Save');
  const [shouldPreventLeave, setShouldPreventLeave] = useState(false);
  const isSavingRef = useRef(false);
  usePreventNavigation(shouldPreventLeave, 'Leave without saving changes?');

  useEffect(() => {
    onServerEvent('UPDATE_ADDON_OWNERSHIP', updateAddOnOwnership);
    onServerEvent('UPDATE_ADDONS', updateAddOns);
    onServerEvent('UPDATE_ADDON_OWNERSHIP_CLEAR', clearOwnership);
    onServerEvent('INSERT_ADDON', handleAddOnInsert);
    onServerEvent('PRINT_ADDON', handleAddOnPrint);
    onServerEvent('DELETE_ADDON', handleAddOnDelete);

    const fetchData = async () => {
      const res = await getOfficeAddOns();
      setAddons(res);
      setPrevAddons(res);

      const partNums = await getAllPartNums();
      setPartNumList(partNums.map((p: Part) => p.partNum));
    };
    fetchData();

    return () => {
      offServerEvent('UPDATE_ADDONS', updateAddOns);
      offServerEvent('UPDATE_ADDON_OWNERSHIP', updateAddOnOwnership);
      offServerEvent('INSERT_ADDON', handleAddOnInsert);
      offServerEvent('PRINT_ADDON', handleAddOnPrint);
      offServerEvent('DELETE_ADDON', handleAddOnDelete);
    };
  }, [selectedAddOnData]);

  const updateAddOnOwnership = (row :{ id: number, userEditing: { id: number, username: string } }) => {
    if (isSavingRef.current) return;
    setAddons(prev =>
      prev.map(a =>
        a.id === row.id ? { ...a, userEditing: row.userEditing } : a
      )
    );

    setPrevAddons(prev =>
      prev.map(a =>
        a.id === row.id ? { ...a, userEditing: row.userEditing } : a
      )
    );
  };

  const clearOwnership = (userId: number) => {
    setAddons(prev =>
      prev.map(row =>
        row.userEditing?.id === userId
          ? { ...row, userEditing: null }
          : row
      )
    );
  };

  const updateAddOns = (updatedRows: AddOn[], userEditing: number) => {
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

    setPrevAddons(prev =>
      prev.map((row) => {
        const updated = updatedRows.find(a => a.id === row.id);
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

  const handleAddOnInsert = (newAddOn: AddOn) => {
    if (!newAddOn.isPrinted) return;
    const parsed = {
      ...newAddOn,
      entryDate: parseResDate(newAddOn.entryDate as any),
      altParts: newAddOn.altParts || []
    };

    setAddons(prev => {
      if (prev.some(a => a.id === parsed.id)) return prev;
      return [parsed, ...prev];
    });

    setPrevAddons(prev => {
      if (prev.some(a => a.id === parsed.id)) return prev;
      return [parsed, ...prev];
    });
  };

  const handleAddOnPrint = (addOn: AddOn) => {
    const parsed = {
      ...addOn,
      entryDate: parseResDate(addOn.entryDate as any),
      altParts: addOn.altParts || [],
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
    setAddons(prev => prev.filter(row => row.id !== id));
    setPrevAddons(prev => prev.filter(row => row.id !== id));
  };

  const handleEditAddOns = async () => {
    setShouldPreventLeave(false);

    const changedAddOns = addOns.filter((a) => {
      const prev = prevAddons.find(p => p.id === a.id);

      if (!prev) return true;

      return JSON.stringify(prev) !== JSON.stringify(a)
        || a.userEditing?.id === user.id;
    });
    if (!changedAddOns.length) return;

    isSavingRef.current = true;
    await editAddOns(changedAddOns);
    await addOnClearUserEditing(user.id);
    isSavingRef.current = false;
    emitServerEvent('UPDATE_ADDON_OWNERSHIP_CLEAR', [user.id]);
    const cleaned = changedAddOns.map(a => ({
      ...a,
      userEditing: null
    }));
    emitServerEvent('UPDATE_ADDONS', [cleaned, user.id]);
  };


  return (
    <Layout title="Add Ons">
      {selectedAddOnData &&
        <AddOnAltPartsDialog
          open={selectedAddOnData !== null}
          setOpen={() => setSelectedAddOnData(null)}
          addOn={selectedAddOnData}
          partNumList={partNumList}
        />
      }

      <div className="add-ons">
        <h1>Office Part Add Ons</h1>

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
                <OfficePartAddonRow addOn={addOn} onSave={handleEditAddOns} onModifyAddOnData={setSelectedAddOnData} />
              </Fragment>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
