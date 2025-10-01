import { atom } from "jotai";


export const singleCompanyReportAtom = atom<SingleCompany[]>([]);
export const salesByBillToCompanyReportAtom = atom<SingleCompany[]>([]);
export const allCompaniesReportAtom = atom<AllCompaniesReport[]>([]);
export const allPartsReportAtom = atom<AllPartsReport[]>([]);
export const partDescReportAtom = atom<PartDescReport[]>([]);
export const allEnginesReportAtom = atom<AllEnginesReport[]>([]);
export const allSourcesReportAtom = atom<AllSourcesReport[]>([]);
export const allSalesmenReportAtom = atom<AllSalesmenReport[]>([]);
export const theMachinesReportAtom = atom<TheMachinesReport[]>([]);
export const arielSalesReportAtom = atom<ArielSalesReport[]>([]);
export const partsCompanyReportAtom = atom<SingleCompanyParts[]>([]);
export const enginesCompanyReportAtom = atom<SingleCompanyEngines[]>([]);
export const handwrittensCompanyReportAtom = atom<HandwrittensCompanyReport[]>([]);
export const PBBListReportAtom = atom<PBBReport[]>([]);
export const noLocationPartsReportAtom = atom<NoLocationPartsReport[]>([]);
export const recentSearchesReportAtom = atom<RecentPartSearch[]>([]);
export const outstandingHighCoresReportAtom = atom<OutstandingCoresReport[]>([]);
export const pricingChangesReportAtom = atom<PricingChangesReport[]>([]);