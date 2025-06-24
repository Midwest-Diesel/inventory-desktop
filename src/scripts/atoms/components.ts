import { atom } from "jotai";


export const selectedAlertsAtom = atom<Alert[]>([]);
export const dialogsAtom = atom<{ order: number, div: HTMLDivElement }[]>([]);
export const selectedPoAddOnAtom = atom<{ selectedPoAddOn: PO | null, addOn: AddOn | null, receivedItemsDialogOpen: boolean }>({ selectedPoAddOn: null, addOn: null, receivedItemsDialogOpen: false });
