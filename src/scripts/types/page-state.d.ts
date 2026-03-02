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
  id?: number
  customerId?: number
  date?: string
  poNum?: string
  billToCompany?: string
  shipToCompany?: string
  source?: string
  payment?: string
  limit: number
  offset: number
}

interface HandwrittensPageState {
  currentPage: number
  search: HandwrittenSearch | null
}
