interface PartsRes {
  rows: Part[]
  pageCount: number
  totalQty: number
  rowsHidden?: number | null
}

interface QuoteRes {
  rows: Quote[]
  pageCount: number
}

interface CustomerRes {
  rows: Customer[]
  pageCount: number
}

interface VendorRes {
  rows: Vendor[]
  pageCount: number
}

interface HandwrittenRes {
  rows: Handwritten[]
  pageCount: number
}

interface ReturnRes {
  rows: Return[]
  pageCount: number
}

interface WarrantyRes {
  rows: Warranty[]
  pageCount: number
}

interface PORes {
  rows: PO[]
  pageCount: number
}

interface EngineRes {
  rows: Engine[]
  pageCount: number
}
