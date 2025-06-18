interface SingleCompany {
  id: number
  date: Date
  desc: string
  partNum: string
  billToAddress: string
  billToCity: string
  billToCompany: string
  billToState: string
  billToZip: string
  qty: number
  unitPrice: number
  total: number
}

interface AllCompaniesReport {
  billToCompany: string
  billToAddress: string
  billToCity: string
  billToState: string
  billToZip: string
  country: string
  total: number
}

interface AllPartsReport {
  altParts: string
  firstOfDesc: string
  sumOfQtySold: number
  sales: number
}

interface PartDescReport {
  altParts: string
  firstOfDesc: string
  sumOfQtySold: number
  sales: number
}

interface AllEnginesReport {
  soldTo: string
  model: string
  sellPrice: number
  serialNum: string
  engineStockNum: number
}

interface AllSourcesReport {
  source: string
  sales: number
}

interface AllSalesmenReport {
  totalSales: number
  salesCost: number
  netSales: number
  salesman: string
}

interface TheMachinesReport {
  partNum: string
  desc: string
  total: number
}

interface ArielSalesReport {
  date: Date
  billToCompany: string
  initials: string
  source: string
  total: number
}

interface SingleCompanyParts {
  entryDate: Date
  purchasedFrom: string
  partNum: string
  desc: string
  purchasePrice: number
}

interface SingleCompanyEngines {
  loginDate: Date
  purchasedFrom: string
  stockNum: number
  model: string
  purchasePrice: number
}

interface HandwrittensCompanyReport {
  year: number
  billToCompany: string
  handwrittenCount: number
  customerType: string
}

interface PBBReport {
  qty: number
  partNum: string
  desc: string
  stockNum: string
  remarks: string
}

interface NoLocationPartsReport {
  qty: number
  partNum: string
  desc: string
  location: string
  stockNum: string
  remarks: string
}

interface EmailReport {
  date: Date
  billToCompany: string
  email: string
  phone: string
  billToState: string
  accountingStatus: string
}

interface OutstandingCoresReport {
  initials: string
  date: Date
  qty: number
  partNum: string
  desc: string
  billToCompany: string
  charge: number
}

interface PricingChangesReport {
  partNum: string
  desc: string
  qty: number
  salesModel: string
  classCode: string
  price: number
  percent: number
  oldPartNum?: string
  oldDesc?: string
  oldQty?: number
  oldSalesModel?: string
  oldClassCode?: string
  oldPrice?: number
  oldPercent?: number
}

type InventoryValueReportParts = { combinedTotal: number, data: InventoryValueReportPartsData[] };
type InventoryValueReportCoreEngines = { combinedTotal: number, data: InventoryValueReportCoreEnginesData[] };
type InventoryValueReportToreDownEngines = { combinedTotal: number, data: InventoryValueReportToreDownEnginesData[] };
type InventoryValueReportRunningEngines = { combinedTotal: number, data: InventoryValueReportRunningEnginesData[] };
type InventoryValueReportShortBlocks = { combinedTotal: number, data: InventoryValueReportShortBlocksData[] };
type InventoryValueReportSurplus = { combinedTotal: number, data: InventoryValueReportSurplusData[] };

type InventoryValueReportPartsData = { partNum: string, stockNum: string, desc: string, qty: number, purchasePrice: number, totalCost: number };
type InventoryValueReportCoreEnginesData = { stockNum: number, loginDate: Date, model: string, serialNum: string, costRemaining: number };
type InventoryValueReportToreDownEnginesData = { stockNum: number, loginDate: Date, model: string, serialNum: string, costRemaining: number, toreDownDate: Date };
type InventoryValueReportRunningEnginesData = { stockNum: number, serialNum: string, loginDate: Date, costRemaining: number, currentStatus: string };
type InventoryValueReportShortBlocksData = { stockNum: number, model: string, serialNum: string, loginDate: Date, currentStatus: string, costRemaining: number };
type InventoryValueReportSurplusData = { code: string, name: string, date: Date, price: number, costRemaining: number };

interface InventoryValueReport {
  parts: InventoryValueReportParts
  coreEngines: InventoryValueReportCoreEngines
  toreDownEngines: InventoryValueReportToreDownEngines
  runningEngines: InventoryValueReportRunningEngines
  shortBlocks: InventoryValueReportShortBlocks
  surplus: InventoryValueReportSurplus
}
