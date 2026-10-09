import { atom } from "jotai";

export const loadTabs = (): Tab[] => {
  const stored = localStorage.getItem('tabs');
  if (!stored) return [{ id: 0, name: null, urlIndex: 0, history: [{ name: 'Home', url: '/' }], selected: true }];

  const tabs: Tab[] = JSON.parse(stored);
  const url = location.pathname;
  const selected = tabs.find((tab) => tab.selected);

  if (!selected || selected.history[selected.urlIndex].url !== url) {
    const id = tabs.length ? Math.max(...tabs.map((tab) => tab.id)) + 1 : 0;
    return [
      ...tabs.map((tab) => ({ ...tab, selected: false })),
      { id, name: null, urlIndex: 0, history: [{ name: 'Home', url }], selected: true }
    ];
  }

  return tabs;
};

const user = {
  id: null,
  username: null,
  password: null,
  initials: null,
  accessLevel: null,
  type: null
} as any;

export const userAtom = atom<User>(user);
export const picturesAtom = atom<any[]>([]);
export const snPicturesAtom = atom<any[]>([]);
export const customersAtom = atom<Customer[]>([]);
export const customerNamesAtom = atom<string[]>([]);
export const vendorNamesAtom = atom<string[]>([]);
export const quotesAtom = atom<Quote[]>([]);
export const partsAtom = atom<Part[]>([]);
export const enginesAtom = atom<Engine[]>([]);
export const recentPartSearchesAtom = atom<RecentPartSearch[]>([]);
export const recentQuotesAtom = atom<RecentQuoteSearch[]>([]);
export const lastPartSearchAtom = atom<string>('');
export const selectedCustomerAtom = atom<Customer>({} as Customer);
export const selectedHandwrittenIdAtom = atom<number>(0);
export const sourcesAtom = atom<string[]>([]);
export const alertsAtom = atom<Alert[]>([]);
export const enginePartsTableAtom = atom<EnginePartsTable>({} as EnginePartsTable);
export const engineAddOnsAtom = atom<EngineAddOn[]>([]);
export const showSoldPartsAtom = atom<boolean>(true);
export const usersAtom = atom<User[]>([]);
export const handwrittenSearchAtom = atom<any>({});
export const warrantySearchAtom = atom<any>({});
export const ReturnSearchAtom = atom<any>({});
export const FreightCarriersAtom = atom<FreightCarrier[]>([]);
export const printQueAtom = atom<{ name: string, printCmd: string, data: unknown, printArgs?: unknown, maxWidth: string, maxHeight: string, fileName?: string }[]>([]);
export const pdfQueAtom = atom<{ name: string, pdfCmd: string, data: unknown, args: unknown, maxWidth: string, maxHeight: string }[]>([]);
export const quickPickItemIdAtom = atom<number>(0);
export const toastAtom = atom<Toast[]>([]);
export const tooltipAtom = atom<string>('');
export const accountingPageFilterAtom = atom<'' | 'all' | 'IN PROCESS' | 'COMPLETE'>('all');
export const customersMinAtom = atom<CustomerMin[]>([]);
export const tabsAtom = atom<Tab[]>(loadTabs());
export const compareConsistAtom = atom<CustomerEngineData | null>(null);
export const partSearchAtom = atom<PartSearchParams | null>(null);
export const altPartSearchAtom = atom<PartSearchParams | null>(null);
export const shippingListWeekAtom = atom<'Current' | 'Next'>('Current');
export const shippingListDayAtom = atom(new Date());
