import { atom } from "jotai";

export const userAtom = atom<User>({
  id: null,
  username: null,
  password: null,
  initials: null,
  accessLevel: null,
  type: null
} as any);

export const picturesAtom = atom<any[]>([]);
export const snPicturesAtom = atom<any[]>([]);
export const customersAtom = atom<Customer[]>([]);
export const customerNamesAtom = atom<string[]>([]);
export const vendorsDataAtom = atom<Vendor[]>([]);
export const quotesAtom = atom<Quote[]>([]);
export const partsAtom = atom<Part[]>([]);
export const enginesAtom = atom<Engine[]>([]);
export const recentPartSearchesAtom = atom<RecentPartSearch[]>([]);
export const recentQuotesAtom = atom<RecentQuoteSearch[]>([]);
export const partsQtyAtom = atom<number[]>([]);
export const lastPartSearchAtom = atom<string>('');
export const selectedCustomerAtom = atom<Customer>({} as Customer);
export const sourcesAtom = atom<string[]>([]);
export const alertsAtom = atom<Alert[]>([]);
export const enginePartsTableAtom = atom<EnginePartsTable>({} as EnginePartsTable);
export const shopAddOnsAtom = atom<AddOn[]>([]);
export const engineAddOnsAtom = atom<EngineAddOn[]>([]);
export const showSoldPartsAtom = atom<boolean>(true);
export const usersAtom = atom<{ id: number, username: string, initials: string, type: string, subtype: string }[]>([]);
export const handwrittenSearchAtom = atom<any>({});
export const warrantySearchAtom = atom<any>({});
export const POSearchAtom = atom<any>({});
export const ReturnSearchAtom = atom<any>({});
export const FreightCarriersAtom = atom<FreightCarrier[]>([]);
export const tabsAtom = atom<Tab[]>([]);
