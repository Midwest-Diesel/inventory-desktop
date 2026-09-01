interface EngineListPageState {
  listOpen: EngineListType
  currentPage: number
  search: EngineSearch | null
}

interface POSearch {
  poNum: number
  date: string
  purchasedFrom: string
  purchasedFor: string
  isItemReceived: string
  orderedBy: string
  limit: number
  offset: number
  showIncoming: boolean
}

interface POPageState {
  currentPage: number
  showIncoming: boolean
  search: POSearch | null
}

interface HandwrittenSearch {
  id?: number | null
  customerId?: number | null
  date?: string | null
  poNum?: string | null
  billToCompany?: string | null
  shipToCompany?: string | null
  source?: string | null
  payment?: string | null
  limit: number
  offset: number
}

interface HandwrittensPageState {
  currentPage: number
  search: HandwrittenSearch | null
}
