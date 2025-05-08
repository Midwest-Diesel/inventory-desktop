interface ButtonHTML extends React.HTMLProps<HTMLButtonElement> {}
interface InputHTML extends React.InputHTMLAttributes<HTMLInputElement> {}
interface TableHTML extends React.HTMLProps<HTMLTableElement> {}
interface SelectHTML extends React.InputHTMLAttributes<HTMLSelectElement> {}

type User = {
  id: number
  username: string
  password: string
  initials: string
  accessLevel: number
  type: 'office' | 'shop'
  subtype?: 'sales' | 'frontDesk' | 'dev'
};

type Tab = {
  id: number
  name: string | null
  urlIndex: number
  history: { name: string, url: string }[]
  selected: boolean
};

type Picture = {
  id: string
  name: string
  url: string
};

type Contact = {
  id: number
  name: string | null
  position: string | null
  email: string | null
  ext: number | null
  notes: string | null
};

type Customer = {
  id: number
  company: string | null
  contact: string | null
  contacts: Contact[]
  partsManager: string | null
  partsManagerEmail: string | null
  serviceManager: string | null
  serviceManagerEmail: string | null
  other: string | null
  phone: string | null
  billToPhone: string | null
  fax: string | null
  email: string | null
  terms: string | null
  billToAddress: string | null
  billToAddress2: string | null
  billToCity: string | null
  billToState: string | null
  billToZip: string | null
  shipToAddress: string | null
  shipToAddress2: string | null
  shipToCity: string | null
  shipToState: string | null
  shipToZip: string | null
  companyType: string | null
  dateContacted: Date
  comments: string | null
  emailList: boolean
  mailList: boolean
  propsectList: boolean
  creditApp: boolean
  taxExempt: boolean
  apConact: string | null
  apPhone: string | null
  paymentHistory: string | null
  customerType: string | null
  source: string | null
  paymentType: string | null
  country: string | null
  isTaxable: boolean
};

type Quote = {
  id: number
  date: Date | null
  source: string | null
  customer: Customer | null
  contact: string | null
  phone: string | null
  state: string | null
  partNum: string | null
  desc: string | null
  stockNum: string | null
  price: number | null
  notes: string | null
  salesman: string | null
  sale: boolean
  followedUp: boolean
  followUpDate: Date | null
  toFollowUp: boolean
  followUpNotes: string | null
  email: string | null
  invoiceItem: number | null
  createdAfter: boolean
  children: Quote[]
  piggybackQuotes: PiggybackQuote[]
  part: Part | null
};

interface EngineQuote extends Quote {
  serialNum: string
  hp: string
  model: string
}

type PiggybackQuote = {
  id: number
  date: Date
  source: Source
  customer: Customer
  contact: string
  phone: string
  state: string
  partNum: string
  desc: string
  stockNum: string
  price: number
  notes: string
  salesman: string
  sale: boolean
  followedUp: boolean
  followUpDate: Date
  rating: number
  toFollowUp: boolean
  followUpNotes: string
  email: string
  invoiceItem: number
  createdAfter: boolean
  children: Quote[]
  piggybackQuotes: PiggybackQuote[]
  addToEmail: boolean
  part?: Part
};

type SalesEndOfDayItem = {
  id: number
  billToCompany: string
  date: Date
  part?: Part
  partNum: string
  desc: string
  unitPrice: number
  customer: Customer
};

type Core = {
  id: number
  date: Date
  qty: number
  partNum: string
  desc: string
  unitPrice: number
  customerId: number
  partInvoiceId: number
  pendingInvoiceId: number
  handwrittenItemId: number
  billToCompany: string
  shipToCompany: string
  charge: number
  priority: string
  salesmanId: number
  initials: string
  part?: Part
};

type Handwritten = {
  id: number
  invoiceId: number
  customer: Customer
  handwrittenItems: HandwrittenItem[]
  createdBy: string
  createdById: number
  soldBy: string
  soldById: number
  date: Date
  poNum: string | null
  billToAddress: string | null
  billToAddress2: string | null
  billToCity: string | null
  billToState: string | null
  billToZip: string | null
  billToCountry: Country | null
  billToCompany: string | null
  billToPhone: string | null
  fax: string | null
  email: string | null
  contactName: string | null
  shipToAddress: string | null
  shipToAddress2: string | null
  shipToCity: string | null
  shipToState: string | null
  shipToZip: string | null
  shipToCompany: string | null
  shipToContact: string | null
  source: string | null
  payment: string | null
  phone: string | null
  cell: string | null
  engineSerialNum: string | null
  isBlindShipment: boolean
  isNoPriceInvoice: boolean
  shipVia: FreightCarrier | null
  cardNum: number | null
  expDate: string | null
  cvv: number | null
  cardAddress: string | null
  cardZip: string | null
  cardName: string | null
  orderNotes: string | null
  invoiceStatus: InvoiceStatus
  accountingStatus: AccountingStatus | null
  shippingStatus: ShippingStatus | null
  cores: Core[]
  coreReturns: Core[]
  shippingNotes: string | null
  mp: number
  br: number
  cap: number
  fl: number
  isCollect: boolean
  isThirdParty: boolean
  isTaxable: boolean
  isSetup: boolean
  isEndOfDay: boolean
  trackingNumbers: TrackingNumber[]
  thirdPartyAccount: string | null
};

type InvoiceStatus = 'INVOICE PENDING' | 'SENT TO ACCOUNTING' | 'CANCELLED' | 'STOP - HOLD' | 'HOLD AS FAVOR';
type AccountingStatus = '' | 'COMPLETE' | 'IN PROCESS' | 'PAYMENT EXCEPTION';
type ShippingStatus = '' | 'ORDER PICKED' | 'ORDER PACKAGED' | 'ORDER COMPLETE';

type HandwrittenItem = {
  id: number
  handwrittenId: number
  partId: number | null
  handwrittenItemId: number
  stockNum: string | null
  location: string | null
  cost: number | null
  qty: number | null
  partNum: string | null
  desc: string | null
  unitPrice: number | null
  return: boolean
  date: Date | null
  isTakeoffDone: boolean
  invoiceItemChildren: HandwrittenItemChild[]
  weight: number
  length: number
  width: number
  height: number
};

type HandwrittenItemChild = {
  id: number
  parentId: number | null
  partId: number | null
  part: Part | null
  qty: number | null
  cost: number | null
  partNum: string | null
  stockNum: string | null
};

type AddOn = {
  id: number
  qty: number | null
  partNum: string | null
  desc: string | null
  stockNum: string | null
  location: string | null
  remarks: string | null
  entryDate: Date | null
  rating: string | null
  engineNum: number | null
  condition: string | null
  purchasePrice: number | null
  purchasedFrom: string | null
  po: string | null
  manufacturer: string | null
  isSpecialCost: boolean
  newPrice: number | null
  remanPrice: number | null
  dealerPrice: number | null
  pricingType: 'Truck' | 'Industrial'
  priceStatus: 'We have pricing' | 'No pricing'
  hp: string | null
  serialNum: string | null
  altParts: string[]
};

type EngineAddOn = {
  id: number
  engineNum: number | null
  model: string | null
  serialNum: string | null
  arrNum: number | null
  entryDate: Date | null
  location: string | null
  hp: string | null
  currentStatus: EngineStatus
  purchasedFrom: string | null
  notes: string | null
  ecm: boolean
  jakeBrake: boolean
  oilPan: 'FS' | 'RS' | 'CS'
  cost: number | null
};

type Warranty = {
  id: number
  customer: Customer | null
  date: Date
  salesman: string | null
  vendor: string | null
  invoiceDate: Date
  completed: boolean
  completedDate: Date | null
  vendorWarrantyNum: number | null
  warrantyItems: WarrantyItem[]
  handwrittenId: number | null
  return: Return | null
};

type WarrantyItem = {
  id: number
  stockNum: string | null
  qty: number | null
  partNum: string | null
  desc: string | null
  cost: number | null
  price: number | null
  returnedVendorDate: Date | null
  claimReason: string | null
  vendorReport: string | null
  hasVendorReplacedPart: boolean
  vendorCredit: string | null
  isCustomerCredited: boolean
};

type Part = {
  id: number
  partNum: string
  manufacturer: string | null
  desc: string | null
  location: string | null
  remarks: string | null
  entryDate: Date | null
  enteredBy: string | null
  qty: number
  stockNum: string | null
  purchasePrice: number | null
  listPrice: number | null
  remanListPrice: number | null
  fleetPrice: number | null
  remanFleetPrice: number | null
  corePrice: number | null
  soldTo: string | null
  qtySold: number | null
  sellingPrice: number | null
  purchasedFrom: string | null
  soldToDate: Date | null
  condition: string | null
  rating: number | null
  invoiceNum: number | null
  engineNum: number | null
  altParts: string[]
  partsCostIn: PartsCostIn[]
  engineCostOut: EngineCostOut[]
  pictures?: Picture[]
  imageExists: boolean
  snImageExists: boolean
  weightDims: string | null
  specialNotes: string | null
  coreFam: string | null
};

type RecentPartSearch = {
  id: number
  salesmanId: number
  partNum: string
  salesman: string
  date: Date
};

type RecentQuoteSearch = {
  id: number
  date: Date
  partNum: string
  salesman: string
  company: string
  price: number
  sale: boolean
};

type PartCostIn = {
  id: number
  stockNum: string | null
  invoiceNum: number | null
  cost: number | null
  vendor: string | null
  costType: string | null
  note: string | null
};

type EngineCostOut = {
  id: number
  stockNum: string | null
  cost: number | null
  engineStockNum: number | null
  costType: CostType | null
  note: string | null
};

type EngineCostIn = {
  id: number
  engineStockNum: number | null
  cost: number | null
  invoiceNum: number | null
  costType: CostType | null
  vendor: string | null
  note: string | null
};

type EngineProfit = {
  partNum: string
  desc: string
  qtySold: number
  purchasePrice: number
  sellingPrice: number
};

type CostType = 'PurchasePrice' | 'ReconPrice' | 'Other';

type Surplus = {
  id: number
  code: string
  name: string
  date: Date
  price: number
  costApplied: number | null
  notes: string | null
};

type EngineStatus = 'ToreDown' | 'RunnerReady' | 'RunnerNotReady' | 'HoldSoldRunner' | 'CoreEngine' | 'Sold' | 'ShortBlock' | 'LongBlock';

type Engine = {
  id: number
  stockNum: number
  toreDownDate: Date | null
  model: string | null
  serialNum: string | null
  location: string | null
  horsePower: string | null
  jakeBrake: boolean
  purchasedFrom: string | null
  soldTo: string | null
  comments: string | null
  partsPulled: string | null
  totalCostApplied: number | null
  sellPrice: number | null
  askingPrice: number | null
  purchasePrice: number | null
  soldDate: Date | null
  costRemaining: number | null
  currentStatus: EngineStatus | null
  loginDate: Date | null
  warranty: boolean
  testRun: boolean
  ecm: boolean
  mileage: string | null
  torque: string | null
  pan: string | null
  application: string | null
  costIn: EngineCostIn[]
  costOut: EngineCostOut[]
  turboArr: string | null
  turboHpNew: string | null
  turboHpReman: string | null
  turboHpActual: string | null
  turboLpNew: string | null
  turboLpReman: string | null
  turboLpActual: string | null
  fwhNumber: string | null
  costProposed1: number | null
  arrNum: string | null
  costIn1: number | null
  costIn2: number | null
  costIn3: number | null
  costIn4: number | null
  blockNew: string | null
  blockReman: string | null
  blockActual: string | null
  blockCasting: string | null
  crankNew: string | null
  crankReman: string | null
  crankActual: string | null
  headNew: string | null
  headReman: string | null
  headActual: string | null
  camNew: string | null
  camReman: string | null
  camActual: string | null
  injNew: string | null
  injReman: string | null
  injActual: string | null
  turboNew: string | null
  turboReman: string | null
  turboActual: string | null
  pistonNew: string | null
  pistonReman: string | null
  pistonActual: string | null
  cylPacksNew: string | null
  cylPacksReman: string | null
  cylPacksActual: string | null
  fwhNew: string | null
  fwhReman: string | null
  fwhActual: string | null
  oilPanNew: string | null
  oilPanReman: string | null
  oilPanActual: string | null
  oilCoolerNew: string | null
  oilCoolerReman: string | null
  oilCoolerActual: string | null
  frontHsngNew: string | null
  frontHsngActual: string | null
  flywheelNew: string | null
  flywheelActual: string | null
  ragNew: string | null
  ragActual: string | null
  heuiPumpNew: string | null
  heuiPumpReman: string | null
  heuiPumpActual: string | null
  exhMnfldNew: string | null
  exhMnfldReman: string | null
  exhMnfldActual: string | null
  oilPumpNew: string | null
  oilPumpReman: string | null
  oilPumpActual: string | null
  waterPumpNew: string | null
  waterPumpReman: string | null
  waterPumpActual: string | null
};

type CompareConsist = {
  id: number
  customerId: number | null
  dateCreated: Date | null
  model: string | null
  serialNum: string | null
  arrNum: string | null
  hp: string | null
  headNew: string | null
  headReman: string | null
  blockNew: string | null
  blockReman: string | null
  crankNew: string | null
  crankReman: string | null
  pistonNew: string | null
  pistonReman: string | null
  camNew: string | null
  camReman: string | null
  injNew: string | null
  injReman: string | null
  turboNew: string | null
  turboReman: string | null
  fwhNew: string | null
  fwhReman: string | null
  frontHsngNew: string | null
  frontHsngReman: string | null
  oilPanNew: string | null
  oilPanReman: string | null
  turboHpNew: string | null
  turboHpReman: string | null
  turboLpNew: string | null
  turboLpReman: string | null
  heuiPumpNew: string | null
  heuiPumpReman: string | null
  exhMnfldNew: string | null
  exhMnfldReman: string | null
  oilPumpNew: string | null
  oilPumpReman: string | null
  waterPumpNew: string | null
  waterPumpReman: string | null
  notes: string | null
  headCheck: boolean
  blockCheck: boolean
  crankCheck: boolean
  pistonCheck: boolean
  camCheck: boolean
  injCheck: boolean
  turboCheck: boolean
  fwhCheck: boolean
  frontHsngCheck: boolean
  oilPanCheck: boolean
  turboHpCheck: boolean
  turboLpCheck: boolean
  heuiPumpCheck: boolean
  exhMnfldCheck: boolean
  oilPumpCheck: boolean
  waterPumpCheck: boolean
};

type Return = {
  id: number
  customer: Customer | null
  handwrittenId: number | null
  warrantyId: number | null
  invoiceDate: Date | null
  salesman: User | null
  dateCalled: Date | null
  dateReceived: Date | null
  creditIssued: Date | null
  returnNotes: string | null
  returnReason: string | null
  returnPaymentTerms: string | null
  restockFee: string | null
  billToCompany: string | null
  billToAddress: string | null
  billToAddress2: string | null
  billToCity: string | null
  billToState: string | null
  billToZip: string | null
  billToContact: string | null
  billToPhone: string | null
  shipToCompany: string | null
  shipToAddress: string | null
  shipToAddress2: string | null
  shipToCity: string | null
  shipToState: string | null
  shipToZip: string | null
  poNum: string | null
  payment: string | null
  source: string | null
  returnItems: ReturnItem[]
  returnPart: ReturnPart | null
};

type ReturnItem = {
  id: number
  returnId: number
  qty: number | null
  partNum: string | null
  desc: string | null
  cost: number | null
  unitPrice: number | null
  stockNum: string | null
  isReturnReceived: boolean
  isReturnAsDescribed: boolean
  isReturnPutAway: boolean
  notes: string | null
  part: Part | null
};

type ReturnPart = {
  partNum: string
  desc: string
  stockNum: string
  qty: number
};

type PO = {
  id: number
  poNum: number
  date: Date | null
  purchasedFrom: string | null
  vendorAddress: string | null
  vendorCity: string | null
  vendorState: string | null
  vendorZip: string | null
  vendorPhone: string | null
  vendorFax: string | null
  shipToCompany: string | null
  shipToAddress: string | null
  shipToCity: string | null
  shipToState: string | null
  shipToZip: string | null
  shipToPhone: string | null
  shipToFax: string | null
  paymentTerms: string | null
  specialInstructions: string | null
  comments: string | null
  purchasedFor: string | null
  isItemReceived: boolean
  orderedBy: string | null
  salesmanId: number | null
  vendorContact: string | null
  shippingMethod: string | null
  poItems: POItem[]
  poReceivedItems: POReceivedItem[]
};

type POItem = {
  id: number
  desc: string | null
  qty: number | null
  unitPrice: number | null
  totalPrice: number | null
  isReceived: boolean
};

type POReceivedItem = {
  id: number
  partNum: string | null
  desc: string | null
  stockNum: string | null
  cost: number | null
  qty: number | null
  POItemId: number | null
};

type EmailStuff = {
  id: number
  name: string
  images: { data: string, path: string }[]
};

type ShippingList = {
  id: number
  handwrittenId: number
  initials: string
  shipVia: string
  customer: string
  attnTo: string
  partNum: string
  desc: string
  stockNum: string
  location: string
  mp: number
  br: number
  cap: number
  fl: number
  pulled: boolean
  packaged: boolean
  gone: boolean
  ready: boolean
  weight: number
  dims: string
};

type Vendor = {
  id: number
  name: string | null
  vendorAddress: string | null
  vendorState: string | null
  vendorZip: string | null
  vendorPhone: string | null
  vendorFax: string | null
  vendorTerms: string | null
  vendorContact: string | null
};

type Alert = {
  id: number
  type: string
  partNum: string
  date: Date
  addedBy: string | null
  note: string | null
};

type MapLocation = {
  id: number
  name: string
  address: string
  state: string
  location: { lat: number, lng: number }
  type: MapLocationType
  salesman: string
  customer: Customer | null
  customerType: string
  date: Date
  notes: string | null
};
type MapLocationType = 'customer' | 'vendor' | '';

type Country = {
  id: number
  name: string
  continent: string
};

type TrackingNumber = {
  id: number
  handwrittenId: number
  trackingNumber: string
};

type FreightCarrier = {
  id: number
  name: string
  type: string
  isSkidRateApplied: boolean
};

interface Performance {
  sales: { initials: string, amount: number }[]
}

interface Email {
  subject: string
  body: string
  recipients: string[]
  cc_recipients?: string[]
  bcc_recipients?: string[]
  attachments: string[]
}

interface CustomerEngineData {
  serialNum: string | null
  arrNum: string | null
  headNew: string | null
  blockNew: string | null
  crankNew: string | null
  pistonNew: string | null
  camNew: string | null
  injNew: string | null
  turboNew: string | null
  fwhNew: string | null
  frontHsngNew: string | null
  oilPanNew: string | null
  turboHpNew: string | null
  turboLpNew: string | null
  heuiPumpNew: string | null
  exhMnfldNew: string | null
  oilPumpNew: string | null
  waterPumpNew: string | null
  headReman: string | null
  blockReman: string | null
  crankReman: string | null
  pistonReman: string | null
  camReman: string | null
  injReman: string | null
  turboReman: string | null
  fwhReman: string | null
  frontHsngReman: string | null
  oilPanReman: string | null
  turboHpReman: string | null
  turboLpReman: string | null
  heuiPumpReman: string | null
  exhMnfldReman: string | null
  oilPumpReman: string | null
  waterPumpReman: string | null
}

interface EnginePartsTable {
  blockReman: string | null
  blockNew: string | null
  blockCasting: string | null
  blockActual: string | null
  crankReman: string | null
  crankNew: string | null
  crankActual: string | null
  camReman: string | null
  camNew: string | null
  camActual: string | null
  injReman: string | null
  injNew: string | null
  injActual: string | null
  turboReman: string | null
  turboNew: string | null
  turboActual: string | null
  turboHpReman: string | null
  turboHpNew: string | null
  turboHpActual: string | null
  turboLpReman: string | null
  turboLpNew: string | null
  turboLpActual: string | null
  headReman: string | null
  headNew: string | null
  headActual: string | null
  pistonReman: string | null
  pistonNew: string | null
  pistonActual: string | null
  fwhNew: string | null
  fwhActual: string | null
  fwhReman: string | null
  flywheelNew: string | null
  flywheelActual: string | null
  ragNew: string | null
  ragActual: string | null
  oilPanReman: string | null
  oilPanNew: string | null
  oilPanActual: string | null
  oilCoolerReman: string | null
  oilCoolerNew: string | null
  oilCoolerActual: string | null
  frontHsngNew: string | null
  frontHsngActual: string | null
  heuiPumpReman: string | null
  heuiPumpNew: string | null
  heuiPumpActual: string | null
  oilPumpReman: string | null
  oilPumpNew: string | null
  oilPumpActual: string | null
  waterPumpReman: string | null
  waterPump: string | null
  waterPumpActual: string | null
  exhMnfldNew: string | null
  exhMnfldActual: string | null
  exhMnfldReman: string | null
}

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

interface CountryReport {

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

type InventoryValueReportParts = { partNum: string, stockNum: string, desc: string, qty: number, purchasePrice: number, totalCost: number };
type InventoryValueReportCoreEngines = { stockNum: number, loginDate: Date, model: string, serialNum: string, costRemaining: number };
type InventoryValueReportToreDownEngines = { stockNum: number, loginDate: Date, model: string, serialNum: string, costRemaining: number, toreDownDate: Date };
type InventoryValueReportRunningEngines = { stockNum: number, serialNum: string, loginDate: Date, costRemaining: number, currentStatus: string };
type InventoryValueReportShortBlocks = { stockNum: number, model: string, serialNum: string, loginDate: Date, currentStatus: string, costRemaining: number };
type InventoryValueReportSurplus = { code: string, name: string, date: Date, price: number, costRemaining: number };

interface InventoryValueReport {
  parts: InventoryValueReportParts[]
  coreEngines: InventoryValueReportCoreEngines[]
  toreDownEngines: InventoryValueReportToreDownEngines[]
  runningEngines: InventoryValueReportRunningEngines[]
  shortBlocks: InventoryValueReportShortBlocks[]
  surplus: InventoryValueReportSurplus[]
}
