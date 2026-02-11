import { Layout } from "@/components/Layout";
import ShopPartAddonRow from "@/components/addOns/ShopPartAddonRow";
import MarkPoItemsReceivedDialog from "@/components/purchaseOrders/dialogs/MarkPoItemsReceivedDialog";
import Button from "@/components/library/Button";
import { usePreventNavigation } from "@/hooks/usePreventNavigation";
import { selectedPoAddOnAtom } from "@/scripts/atoms/components";
import { shopAddOnsAtom, userAtom } from "@/scripts/atoms/state";
import { addAddOn, addOnClearUserEditing, editAddOns, getAllAddOns } from "@/scripts/services/addOnsService";
import { getAllPartNums } from "@/scripts/services/partsService";
import { parseResDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import { Fragment, useEffect, useRef, useState } from "react";
import { getNextStockNumberSuffix } from "@/scripts/logic/addOns";
import { emitServerEvent, offServerEvent, onServerEvent } from "@/scripts/config/websockets";


export default function ShopPartAddOns() {
  const [user] = useAtom<User>(userAtom);
  const [selectedPoData, setSelectedPoData] = useAtom<{ selectedPoAddOn: PO | null, addOn: AddOn | null, receivedItemsDialogOpen: boolean }>(selectedPoAddOnAtom);
  const [partNumList, setPartNumList] = useState<string[]>([]);
  const [prevAddons, setPrevAddons] = useState<AddOn[]>([]);
  const [addOns, setAddons] = useAtom<AddOn[]>(shopAddOnsAtom);
  const [savedBtnText, setSavedBtnText] = useState('Save');
  const [shouldPreventLeave, setShouldPreventLeave] = useState(false);
  const isSavingRef = useRef(false);
  const { selectedPoAddOn, addOn, receivedItemsDialogOpen } = selectedPoData;
  usePreventNavigation(shouldPreventLeave, 'Leave without saving changes?');

  useEffect(() => {
    onServerEvent('UPDATE_ADDON_OWNERSHIP', updateAddOnOwnership);
    onServerEvent('UPDATE_ADDONS', updateAddOns);
    onServerEvent('UPDATE_ADDON_OWNERSHIP_CLEAR', clearOwnership);
    onServerEvent('INSERT_ADDON', handleAddOnInsert);
    onServerEvent('DELETE_ADDON', handleAddOnDelete);

    const fetchData = async () => {
      const res = await getAllAddOns();
      setAddons(res);
      setPrevAddons(res);

      const parts = await getAllPartNums();
      setPartNumList(parts.map((p: Part) => p.partNum));
    };
    fetchData();

    return () => {
      offServerEvent('UPDATE_ADDONS', updateAddOns);
      offServerEvent('UPDATE_ADDON_OWNERSHIP', updateAddOnOwnership);
      offServerEvent('INSERT_ADDON', handleAddOnInsert);
      offServerEvent('DELETE_ADDON', handleAddOnDelete);
    };
  }, []);

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

  const handleAddOnDelete = (id: number) => {
    setAddons(prev => prev.filter(row => row.id !== id));
    setPrevAddons(prev => prev.filter(row => row.id !== id));
  };

  const handleNewAddOn = async () => {
    await handleEditAddOns();
    const newRow = await addAddOn();
    if (!newRow) {
      alert('Failed to create new row');
      return;
    }
    emitServerEvent('INSERT_ADDON', [newRow]);
  };

  const handleDuplicateAddOn = async (duplicateAddOn: AddOn, addOns: AddOn[]) => {
    if (duplicateAddOn.userEditing && duplicateAddOn.userEditing.id !== user.id) {
      alert('Cannot duplicate add on that is being edited');
      return;
    }

    await handleEditAddOns();
    if (!duplicateAddOn.stockNum) {
      alert('Invalid stockNum');
      return;
    }
    const rawStockNum = duplicateAddOn.stockNum.slice(0, -1);
    const suffix = await getNextStockNumberSuffix(rawStockNum, addOns);
    const stockNum = `${rawStockNum}${suffix}`;
    const newRow = await addAddOn({ ...duplicateAddOn, stockNum });
    if (!newRow) {
      alert('Failed to create new row');
      return;
    }
    emitServerEvent('INSERT_ADDON', [newRow]);
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
      { selectedPoAddOn ?
        <MarkPoItemsReceivedDialog
          open={receivedItemsDialogOpen}
          setOpen={(value: boolean) => setSelectedPoData({ ...selectedPoData, receivedItemsDialogOpen: value })}
          purchaseOrder={selectedPoAddOn}
          addOn={addOn}
        /> : '' }

      <div className="add-ons">
        <h1>Shop Part Add Ons</h1>
        <Button
          variant={['fit']}
          onClick={handleNewAddOn}
          data-testid="new-part-btn"
        >
          New Part
        </Button>

        <div className="header__btn-container">
          <Button
            variant={['save']}
            onClick={handleEditAddOns}
            data-testid="save-btn"
          >
            { savedBtnText }
          </Button>
        </div>

        <div className="add-ons__list" onChange={() => setShouldPreventLeave(true)}>
          {addOns.map((addOn) => {
            return (
              <Fragment key={addOn.id}>
                <ShopPartAddonRow addOn={addOn} handleDuplicateAddOn={handleDuplicateAddOn} partNumList={partNumList} onSave={handleEditAddOns} />
              </Fragment>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
