import { atom } from "jotai";


export const selectedAlertsAtom = atom<Alert[]>([]);
export const dialogsAtom = atom<{ order: number, div: HTMLDivElement }[]>([]);
export const selectedPoAddOnAtom = atom<{ selectedPoAddOn: PO, addOn: AddOn, receivedItemsDialogOpen: boolean }>({ selectedPoAddOn: null, addOn: null, receivedItemsDialogOpen: false });
export const selectedAddOnAtom = atom<{ addOn: AddOn, dialogOpen: boolean }>({ addOn: null, dialogOpen: false });
