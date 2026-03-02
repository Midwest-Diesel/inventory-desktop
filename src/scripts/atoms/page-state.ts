import { atom } from "jotai";


export const engineListPageStateAtom = atom<EngineListPageState>({ listOpen: 'all', currentPage: 1, search: null });
export const poPageStateAtom = atom<POPageState>({ currentPage: 1, showIncoming: false, search: null });
export const handwrittensPageStateAtom = atom<HandwrittensPageState>({ currentPage: 1, search: null });
