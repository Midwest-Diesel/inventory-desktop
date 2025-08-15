interface PartsRes {
  rows: Part[];
  pageCount: number;
  totalQty: number;
  rowsHidden?: number | null;
}

interface QuoteRes {
  rows: Quote[];
  pageCount: number;
}

interface CustomerRes {
  rows: Customer[];
  pageCount: number;
}
