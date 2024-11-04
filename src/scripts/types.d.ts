interface ButtonHTML extends React.HTMLProps<HTMLButtonElement> {}
interface InputHTML extends React.HTMLProps<HTMLInputElement> {}
interface TableHTML extends React.HTMLProps<HTMLTableElement> {}
interface SelectHTML extends React.HTMLProps<HTMLSelectElement> {}


type User = {
  id: number
  username: string
  password: string
  initials: string
  accessLevel: number
  type: 'office' | 'shop'
};

type Picture = {
  id: string
  name: string
  url: string
};

type Contact = {
  id: number
  name: string
  position: string
  email: string
  ext: number
  notes: string
};

type Customer = {
  id: number
  company: string
  contact: string
  contacts: Contact[]
  partsManager: string
  partsManagerEmail: string
  serviceManager: string
  serviceManagerEmail: string
  other: string
  phone: string
  billToPhone: string
  fax: string
  email: string
  terms: string
  billToAddress: string
  billToAddress2: string
  billToCity: string
  billToState: string
  billToZip: string
  shipToAddress: string
  shipToAddress2: string
  shipToCity: string
  shipToState: string
  shipToZip: string
  companyType: string
  dateContacted: Date
  comments: string
  emailList: boolean
  mailList: boolean
  propsectList: boolean
  creditApp: boolean
  taxExempt: boolean
  rating: number
  apConact: string
  apPhone: string
  paymentHistory: string
  customerType: string
  source: string
  paymentType: string
};

type Quote = {
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
  part?: Part
};

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

type Core = {
  id: number
  date: Date
  qty: number
  partNum: string
  desc: string
  unitPrice: number
  customerId: number
  partInvoiceId: number
  invoiceId: number
  billToCompany: string
  shipToCompany: string
  charge: number
  priority: string
  salesmanId: number
  initials: string
};

type Handwritten = {
  id: number
  invoiceId: number
  customer: Customer
  handwrittenItems: HandwrittenItem[]
  initials: string
  date: Date
  poNum: string
  billToAddress: string
  billToAddress2: string
  billToCity: string
  billToState: string
  billToZip: string
  billToCountry: Country
  billToCompany: string
  billToPhone: string
  fax: string
  contactName: string
  shipToAddress: string
  shipToAddress2: string
  shipToCity: string
  shipToState: string
  shipToZip: string
  shipToCompany: string
  shipToContact: string
  source: string
  payment: string
  salesmanId: number
  phone: string
  cell: string
  engineSerialNum: string
  isBlindShipment: boolean
  isNoPriceInvoice: boolean
  shipVia: string
  cardNum: string
  expDate: string
  cvv: number
  cardZip: string
  cardName: string
  orderNotes: string
  invoiceStatus: InvoiceStatus
  accountingStatus: AccountingStatus
  shippingStatus: ShippingStatus
  cores: Core[]
  coreReturns: Core[]
};

type InvoiceStatus = 'INVOICE PENDING' | 'SENT TO ACCOUNTING' | 'CANCELLED' | 'STOP - HOLD' | 'HOLD AS FAVOR';
type AccountingStatus = '' | 'COMPLETE' | 'IN PROCESS' | 'PAYMENT EXCEPTION';
type ShippingStatus = '' | 'ORDER PICKED' | 'ORDER PACKAGED' | 'ORDER COMPLETE';

type HandwrittenItem = {
  id: number
  handwrittenId: number
  partId: number
  stockNum: string
  location: string
  cost: number
  qty: number
  partNum: string
  desc: string
  unitPrice: number
  return: boolean
  date: Date
  invoiceItemChildren: HandwrittenItemChild[]
};

type HandwrittenItemChild = {
  id: number
  partId: number
  qty: number
  cost: number
  partNum: string
  stockNum: string
};

type AddOn = {
  id: number
  qty: number
  partNum: string
  desc: string
  stockNum: string
  location: string
  remarks: string
  entryDate: string
  rating: number
  engineNum: number
  condition: string
  purchasePrice: number
  purchasedFrom: string
  po: number
  manufacturer: string
  isSpecialCost: boolean
  newPrice: number
  remanPrice: number
  dealerPrice: number
  pricingType: 'Truck' | 'Industrial'
  priceStatus: 'We have pricing' | 'No pricing'
  hp: string
  serialNum: string
};

type EngineAddOn = {
  id: number
  engineNum: number
  model: string
  serialNum: string
  arrNum: number
  entryDate: Date
  location: string
  hp: string
  currentStatus: EngineStatus
  purchasedFrom: string
  notes: string
  ecm: boolean
  jakeBrake: boolean
  oilPan: 'FS' | 'RS' | 'CS'
  cost: number
};

type Warranty = {
  id: number
  customer: Customer
  date: Date
  salesman: string
  vendor: string
  invoiceDate: Date
  completed: boolean
  completedDate: Date
  vendorWarrantyNum: number
  warrantyItems: WarrantyItem[]
  handwrittenId: number
};

type WarrantyItem = {
  id: number
  stockNum: string
  qty: number
  partNum: string
  desc: string
  cost: number
  price: number
  returnedVendorDate: Date
  claimReason: string
  vendorReport: string
  hasVendorReplacedPart: boolean
  vendorCredit: string
  isCustomerCredited: boolean
};

type Part = {
  id: number
  partNum: string
  manufacturer: string
  desc: string
  location: string
  remarks: string
  entryDate: Date
  enteredBy: string
  qty: number
  stockNum: string
  purchasePrice: number
  dealerPrice: number
  listPrice: number
  remainingPrice: number
  fleetPrice: number
  endUserPrice: number
  soldTo: string
  qtySold: number
  sellingPrice: number
  purchasedFrom: string
  soldToDate: Date
  condition: string
  rating: number
  invoiceNum: number
  engineNum: number
  altParts: string[]
  partsCostIn: PartsCostIn[]
  engineCostOut: EngineCostOut[]
  pictures?: Picture[]
  imageExists: boolean
  snImageExists: boolean
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
  stockNum: string
  invoiceNum: number
  cost: number
  vendor: string
  costType: string
  note: string
};

type EngineCostOut = {
  id: number
  stockNum: string
  cost: number
  engineStockNum: number
  costType: CostType
  note: string
};

type EngineCostIn = {
  id: number
  engineStockNum: number
  cost: number
  invoiceNum: number
  costType: CostType
  vendor: string
  note: string
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
  costApplied: number
  notes: string
};

type Invoice = {
  id: number
  customer: Customer
  invoiceItems: InvoiceItem[]
  date: Date
  poNum: string
  billToCompany: string
  billToAddress: string
  billToCity: string
  billToState: string
  billToZip: string
  billToCountry: Country
  billToContact: string
  billToPhone: string
  billToFax: string
  shipToCompany: string
  shipToAddress: string
  shipToCity: string
  shipToState: string
  shipToZip: string
  source: string
  payment: string
  return: boolean
  returnDate: Date
  salesperson: string
};

type InvoiceItem = {
  stockNum: string
  location: string
  cost: number
  qty: number
  partNum: string
  desc: string
  unitPrice: number
  return: boolean
  entryDate: Date
};

type EngineStatus = 'ToreDown' | 'RunnerReady' | 'RunnerNotReady' | 'HoldSoldRunner' | 'CoreEngine' | 'Sold' | 'ShortBlock' | 'LongBlock';

type Engine = {
  id: number
  stockNum: number
  toreDownDate: Date
  model: string
  serialNumber: string
  location: string
  horsePower: string
  jakeBrake: boolean
  purchasedFrom: string
  soldTo: string
  comments: string
  partsPulled: string
  totalCostApplied: number
  sellPrice: number
  askingPrice: number
  purchasePrice: number
  soldDate: Date
  costRemaining?: number
  currentStatus: EngineStatus
  loginDate: Date
  warranty: boolean
  testRun: boolean
  ecm: boolean
  mileage: string
  torque: string
  pan: string
  application: string
  turboArr: string
  turboHP: string
  turboHPReman: string
  turboHPActual: string
  turboLP: string
  turboLPReman: string
  turboLPActual: string
  fwhNumber: string
  costProposed1: number
  arrangementNumber: string
  costIn1: number
  costIn2: number
  costIn3: number
  costIn4: number
  blockPartNum: string
  blockRemanPartNum: string
  blockActual: string
  blockCasting: string
  crankPartNum: string
  crankRemanPartNum: string
  crankActual: string
  headPartNum: string
  headRemanPartNum: string
  headActual: string
  camPartNum: string
  camRemanPartNum: string
  camActual: string
  injPartNum: string
  injRemanPartNum: string
  injActual: string
  turboPartNum: string
  turboRemanPartNum: string
  turboActual: string
  pistonsPartNum: string
  pistonsRemanPartNum: string
  pistonsActual: string
  cylPacksPartNum: string
  cylPacksRemanPartNum: string
  cylPacksActual: string
  fwhPartNum: string
  fwhRemanPartNum: string
  fwhActual: string
  oilPanPartNum: string
  oilPanRemanPartNum: string
  oilPanActual: string
  oilCoolerPartNum: string
  oilCoolerRemanPartNum: string
  oilCoolerActual: string
  frontHousingPartNum: string
  frontHousingActual: string
  flywheelPartNum: string
  flywheelActual: string
  ragPartNum: string
  ragActual: string
  heuiPumpPartNum: string
  heuiPumpRemanPartNum: string
  heuiActual: string
  exhMnfldNew: string
  exhMnfldReman: string
  exhMnfldActual: string
  oilPumpNew: string
  oilPumpReman: string
  oilPumpActual: string
  waterPump: string
  waterPumpReman: string
  waterPumpActual: string
};

type CompareConsist = {
  id: number
  customerId: number
  dateCreated: Date
  model: string
  serialNum: string
  arrNum: stromg
  hp: string
  headNew: string
  headReman: string
  blockNew: string
  blockReman: string
  crankNew: string
  crankReman: string
  pistonNew: string
  pistonReman: string
  camNew: string
  camReman: string
  injectorNew: string
  injectorReman: string
  turboNew: string
  turboReman: string
  fwhNew: string
  fwhReman: string
  frontHsngNew: string
  frontHsngReman: string
  oilPanNew: string
  oilPanReman: string
  hpTurboNew: string
  hpTurboReman: string
  lpTurboNew: string
  lpTurboReman: string
  heuiPumpNew: string
  heuiPumpReman: string
  exhMnfldNew: string
  exhMnfldReman: string
  oilPumpNew: string
  oilPumpReman: string
  waterPumpNew: string
  waterPumpReman: string
  notes: string
  headCheck: boolean
  blockCheck: boolean
  crankCheck: boolean
  pistonCheck: boolean
  camCheck: boolean
  injectorCheck: boolean
  turboCheck: boolean
  fwhCheck: boolean
  frontHsngCheck: boolean
  oilPanCheck: boolean
  hpTurboCheck: boolean
  lpTurboCheck: boolean
  heuiPumpCheck: boolean
  exhMnfldCheck: boolean
  oilPumpCheck: boolean
  waterPumpCheck: boolean
};

type Return = {
  id: number
  customer: Customer
  invoiceId: number
  invoiceDate: Date
  createdBy: string
  dateCalled: Date
  dateReceived: Date
  creditIssued: Date
  returnNotes: string
  returnReason: string
  returnPaymentTerms: string
  restockFee: string
  billToCompany: string
  billToAddress: string
  billToAddress2: string
  billToCity: string
  billToState: string
  billToZip: string
  billToContact: string
  billToPhone: string
  shipToCompany: string
  shipToAddress: string
  shipToAddress2: string
  shipToCity: string
  shipToState: string
  shipToZip: string
  poNum: string
  payment: string
  source: string
  returnItems: ReturnItem[]
  returnPart: ReturnPart
};

type ReturnItem = {
  id: number
  returnId: number
  qty: number
  partNum: string
  desc: string
  cost: number
  unitPrice: number
  stockNum: string
  isReturnReceived: boolean
  isReturnAsDescribed: boolean
  isReturnPutAway: boolean
  notes: string
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
  date: Date
  purchasedFrom: string
  vendorAddress: string
  vendorCity: string
  vendorState: string
  vendorZip: number
  vendorPhone: string
  vendorFax: string
  shipToCompany: string
  shipToAddress: string
  shipToCity: string
  shipToState: string
  shipToZip: number
  shipToPhone: string
  shipToFax: string
  paymentTerms: string
  specialInstructions: string
  comments: string
  purchasedFor: string
  isItemReceived: boolean
  orderedBy: string
  salesmanId: number
  vendorContact: string
  shippingMethod: string
  poItems: POItem[]
};

type POItem = {
  id: number
  desc: string
  qty: number
  unitPrice: number
  totalPrice: number
  isReceived: boolean
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
  name: string
  vendorAddress: string
  vendorState: string
  vendorZip: string
  vendorPhone: string
  vendorFax: string
  vendorTerms: string
  vendorContact: string
};

type Alert = {
  id: number
  type: string
  partNum: string
  date: Date
  addedBy: string
  note: string
};

type Call = {
  id: number
  salesperson: string
  callOpen: Date
  callClose: Date
  abortCall: boolean
  customer: Customer
};

type Country = {
  id: number
  name: string
  continent: string
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
  serialNumber: string
  arrangementNumber: string
  newHead: string
  newBlock: string
  newCrank: string
  newPistons: string
  newCam: string
  newInjectors: string
  newSingleTurbo: string
  newFWH: string
  newFrontHsng: string
  newOilPan: string
  newHPTurbo: string
  newLPTurbo: string
  newHEUIPump: string
  newExhMnfld: string
  newOilPump: string
  newWtrPump: string
  remanHead: string
  remanBlock: string
  remanCrank: string
  remanPistons: string
  remanCam: string
  remanInjectors: string
  remanSingleTurbo: string
  remanFWH: string
  remanFrontHsng: string
  remanOilPan: string
  remanHPTurbo: string
  remanLPTurbo: string
  remanHEUIPump: string
  remanExhMnfld: string
  remanOilPump: string
  remanWtrPump: string
}

interface EnginePartsTable {
  blockRemanPartNum: string
  blockPartNum: string
  crankRemanPartNum: string
  crankPartNum: string
  camRemanPartNum: string
  camPartNum: string
  injRemanPartNum: string
  injPartNum: string
  turboRemanPartNum: string
  turboPartNum: string
  turboHPReman: string
  turboHP: string
  turboLPReman: string
  turboLP: string
  headRemanPartNum: string
  headPartNum: string
  pistonsRemanPartNum: string
  pistonsPartNum: string
  flywheelPartNum: string
  oilPanRemanPartNum: string
  oilPanPartNum: string
  oilCoolerRemanPartNum: string
  oilCoolerPartNum: string
  frontHousingPartNum: string
  heuiPumpRemanPartNum: string
  heuiPumpPartNum: string
  oilPumpReman: string
  oilPumpNew: string
  waterPumpReman: string
  waterPump: string
  exhMnfldNew: string
  exhMnfldReman: string
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
