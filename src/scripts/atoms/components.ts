import { atom } from "jotai";


export const selectedAlertsAtom = atom<Alert[]>([]);
export const dialogsAtom = atom<{ order: number, div: HTMLDivElement }[]>([]);
export const selectedPoAddOnAtom = atom<{ selectedPoAddOn: PO, receivedItemsDialogOpen: boolean }>({ selectedPoAddOn: null, receivedItemsDialogOpen: false });
