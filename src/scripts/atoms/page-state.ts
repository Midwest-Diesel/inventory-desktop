import { atom } from "jotai";
import { POSearch } from "../services/purchaseOrderService";
import { EngineSearch } from "../services/enginesService";
import { HandwrittenSearch } from "../services/handwrittensService";

export interface POPageState {
  currentPage: number
  showIncoming: boolean
  search: POSearch | null
}

export type EngineListType = 'all' | 'running' | 'toreDown' | 'core' | 'sold' | 'shortBlock' | 'longBlock';

export interface EngineListPageState {
  listOpen: EngineListType
  currentPage: number
  search: EngineSearch | null
}

export interface HandwrittensPageState {
  currentPage: number
  search: HandwrittenSearch | null
}


export const engineListPageStateAtom = atom<EngineListPageState>({ listOpen: 'all', currentPage: 1, search: null });
export const poPageStateAtom = atom<POPageState>({ currentPage: 1, showIncoming: false, search: null });
export const handwrittensPageStateAtom = atom<HandwrittensPageState>({ currentPage: 1, search: null });
