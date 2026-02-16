import { prompt } from "@/components/library/Prompt";
import { ask } from "../config/tauri";
import { editAddOnAltParts, getOfficeAddOns } from "../services/addOnsService";
import { editAltParts, getPartInfoByPartNum } from "../services/partsService";
import { formatDate } from "../tools/stringUtils";


const getAltPartsToAdd = async (partNum: string, altParts: string[]): Promise<string[]> => {
  const partsInfo = await getPartInfoByPartNum(partNum);
  const filteredAlts = altParts.filter(Boolean);
  const altPartsSet = new Set(partsInfo?.altParts.split(',').map((a) => a.trim()) || [partNum]);

  for (const alt of filteredAlts) {
    const partsInfo = await getPartInfoByPartNum(alt);
    if (partsInfo) {
      const existing = partsInfo.altParts?.split(',').map((s) => s.trim()).filter(Boolean) || [];
      existing.forEach((e) => altPartsSet.add(e));
    }
    altPartsSet.add(alt);
  }
  return Array.from(altPartsSet).filter(Boolean);
};

export const promptAddAltParts = async (partNum: string, updateLoading?: (i: number, total: number) => void) => {
  const input = await prompt('Enter part numbers separated by a comma');
  if (!input) return;
  const values = input.toUpperCase().trim().replace(/\s*,\s*/g, ',').split(',');
  const altPartsArray = await getAltPartsToAdd(partNum, values);
  if (!await ask(`Are you sure you want to add: ${values.join(', ')}?\n\nNew Alt Parts:\n${altPartsArray.join(', ')}`)) return;
  await addAltParts(partNum, values, updateLoading);
};

export const promptRemoveAltParts = async (partNum: string) => {
  const input = await prompt('Enter part numbers seperated by comma');
  if (!input) return;
  const removedParts = input.toUpperCase().trim().replace(/\s*,\s*/g, ',').split(',');
  const partsInfo = await getPartInfoByPartNum(partNum);
  if (!partsInfo) {
    alert(`Invalid part: ${partNum}`);
    return;
  }
  const currentAlts = partsInfo.altParts?.split(',').map((a) => a.trim()) || [];
  const updatedAltString = currentAlts.filter((a) => !removedParts.includes(a));
  if (!await ask(`Are you sure you want to remove: ${removedParts.join(', ')}?\n\nNew Alt Parts:\n${updatedAltString.join(', ')}`)) return;
  await removeAltParts(partNum, removedParts);
};

export const addAltParts = async (partNum: string, altParts: string[], updateLoading?: (i: number, total: number) => void) => {
  const altPartsArray = await getAltPartsToAdd(partNum, altParts);

  // Update every part in the set to have all others as alts
  for (let i = 0; i < altPartsArray.length; i++) {
    if (updateLoading) updateLoading(i + 1, altPartsArray.length);
    const current = altPartsArray[i];
    await editAltParts(current, altPartsArray);
  }

  // Sync add on alt parts
  const addOns = await getOfficeAddOns();
  for (const addOn of addOns) {
    if (altPartsArray.some((a) => addOn.altParts.includes(a))) {
      const newAddOnAlts = Array.from(
        new Set([...addOn.altParts, ...altPartsArray])
      );
      await editAddOnAltParts(addOn.id, newAddOnAlts.join(', '));
    }
  }
};

export const removeAltParts = async (partNum: string, altPartsToRemove: string[]) => {
  // For the main part, remove all parts in altPartsToRemove
  const mainPartsInfo = await getPartInfoByPartNum(partNum);
  if (!mainPartsInfo) {
    alert('Invalid part');
    return;
  }
  const altParts = mainPartsInfo.altParts?.split(',').map((s) => s.trim()).filter(Boolean) || [];
  const newAlts = altParts.filter((a) => !altPartsToRemove.includes(a));
  await editAltParts(partNum, newAlts);

  // For each part connected to the main part not removed
  // Take off the altPartsToRemove from their altParts as well
  const connectedAlts = mainPartsInfo.altParts?.split(',').map((s) => s.trim()).filter(Boolean) || [];
  const newConnectedAlts = connectedAlts.filter((a) => a !== partNum);
  for (const alt of newConnectedAlts) {
    if (altPartsToRemove.includes(alt)) continue;
    const partsInfo = await getPartInfoByPartNum(alt);
    if (!partsInfo) {
      alert('Invalid part');
      return;
    }
    const altParts = partsInfo.altParts?.split(',').map((s) => s.trim()).filter(Boolean) || [];
    const newAlts = altParts.filter((a) => !altPartsToRemove.includes(a));
    await editAltParts(alt, newAlts);
  }

  // For each removed part, also remove the main part from their altParts
  for (const alt of altPartsToRemove) {
    const partsInfo = await getPartInfoByPartNum(alt);
    if (!partsInfo) {
      alert('Invalid part');
      return;
    }
    const altParts = partsInfo.altParts?.split(',').map((s) => s.trim()).filter(Boolean) || [];
    const newAlts = altParts.filter((a) => a !== partNum && !newConnectedAlts.includes(a));
    await editAltParts(alt, [alt, ...newAlts]);
  }

  // Sync add on alt parts
  const addOns = await getOfficeAddOns();
  for (const addOn of addOns) {
    if (addOn.altParts.includes(partNum) || altPartsToRemove.some((a) => addOn.altParts.includes(a))) {
      const filteredAlts = addOn.altParts.filter((a) => !altPartsToRemove.includes(a));
      await editAddOnAltParts(addOn.id, filteredAlts.join(', '));
    }
  }
};

export const formatRemarksSoldText = (remarks: string | null, qtySold: number | null, salesman: string, customer: string): string => {
  if (!remarks) return '';
  return `^ ${qtySold ? `${qtySold} ` : ''}SOLD BY ${salesman} ${formatDate(new Date())} ${customer} ^^${remarks}`;
};

export const removeRemarksSoldText = (remarks: string | null): string => {
  if (!remarks) return '';
  const markerIndex = remarks.lastIndexOf('^^');
  if (markerIndex === -1) return remarks;
  return remarks.substring(markerIndex + 2).trim();
};
