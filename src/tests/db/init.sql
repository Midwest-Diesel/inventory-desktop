-- USERS
INSERT INTO "users" ("username", "password", "initials", "accessLevel", "type", "subtype", "email")
VALUES ('test', '$2a$10$hU8uxVwoTok90amc51Pmle3O9TF5QjlgbTw309iJ5xRj5E/CK4pZe', 'TS', 3, 'office', 'sales', 'bennett@midwestdiesel.com');

-- ALERTS
INSERT INTO "alerts" ("type", "partNum", "date", "note", "subtext", "salesmanId")
VALUES ('ALERT!!!', '1304701', '2021-04-13', '3406E/C15 Gear - Lots of matches! 6I4578 Is for older 5ek, uses a 6I3621 stubshaft, 1304701 uses a 1302979 or 1515966 subshaft', '', 1);

-- PARTS INFO
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('2251283', 'ELBOW', '2251283', NULL, 'ELB');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('3949674', 'ELBOW', '3949674, 20R4880', NULL, 'ELB');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('20R4880', 'ELBOW', '3949674, 20R4880', NULL, 'ELB');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('E23525567', 'VALVE', 'E23525567, R23525567', NULL, 'VA');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('R23525567', 'VALVE', 'E23525567, R23525567', NULL, 'VA');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('7L0406', 'VALVE', '7L0406, 9N3242', NULL, 'VA');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('9N3242', 'VALVE', '7L0406, 9N3242', NULL, 'VA');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('10R3264', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', 'IGP');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('10R3264R', 'INJECTOR C27', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', NULL);
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('2447715', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', NULL, 'IGP');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('2530615', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', 'IGP');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('3740750', 'INJECTOR C27', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', NULL);
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('6180750', 'INJECTOR', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', NULL, NULL);
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('6470750', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', NULL, NULL);
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('20R2284', 'INJECTOR C27', '2447715, 2530615, 10R3264, 3740750, 20R2284R, 10R3264R, 6180750, 6470750, 20R2284', 'UPS: 7LBS 12x10x6', NULL);
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('11R1251', 'TUBE', '11R1251, 5441832, 5865303', NULL, 'TU');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('5441832', 'TUBE', '11R1251, 5441832, 5865303', NULL, 'TU');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('5865303', 'TUBE', '11R1251, 5441832, 5865303', NULL, 'TU');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('6057481', 'WATER PUMP C15', '6057481', NULL, 'TU');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('4700245', 'INJECTOR C9', '4700245', NULL, 'INJ');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('7E0333', 'VALVE COVER 3406', '7C9667, 4N4536, 4N4537, 7C9261, 7E0330, 7E0331, 7E0333, 7W9179', null, 'VC');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('9N3240', 'THERM HSNG 3306', '9N3240', NULL, 'TH');
INSERT INTO "partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('0323237', 'SPACER', '0323237, 323237, 1W4589, 1336934', NULL, 'SP');

-- PARTS
INSERT INTO "parts" ("legacyId", "handwrittenId", "invoiceNum", "partNum", "manufacturer", "desc", "location", "remarks", "entryDate", "enteredBy", "qty", "stockNum", "purchasePrice", "listPrice", "corePrice", "fleetPrice", "soldTo", "qtySold", "sellingPrice", "purchasedFrom", "soldToDate", "condition", "rating", "engineNum", "remanListPrice", "remanFleetPrice", "weightDims", "priceLastUpdated", "coreFam", "pricingNotes", "specialNotes")
VALUES
  (771790682, null, null, '7E0333', 'CATERPILLAR', 'VALVE COVER 3406', 'C5G4A', 'T/O, NTBBD', '2026-02-17', 2000, 34, 'UP9432', 0.01, 179.84, 0, 161.87, null, 0, null, 'CB1', null, 'Good Used', 0.0, 7259, 0, 0, null, '2020-06-09', null, null , null),
  (771820176, null, null, '9N3240', 'CATERPILLAR', 'THERM HSNG 3306', 'C5G4A', '(8.5) CCBD AND ZD, CAST IRON THERM HSNG, LOOKS GOOD', '2026-02-17', 2000, 34, 'TH609-23C', 0.01, 179.84, 0, 161.87, null, 0, null, 'CB1', null, 'Good Used', 0.0, 7259, 0, 0, null, '2020-06-09', null, null , null),
  (771892778, null, null, '7L0406', 'CATERPILLAR', 'THERM HSNG 3306', 'C5G4A', '(8.5) CCBD AND ZD, CAST IRON THERM HSNG, LOOKS GOOD', '2026-02-17', 2000, 34, 'TH418-19A', 0.01, 179.84, 0, 161.87, null, 0, null, 'CB1', null, 'Good Used', 0.0, 7259, 0, 0, null, '2020-06-09', null, null , null);

-- CUSTOMERS
INSERT INTO "customers" ("legacyId", "company", "contact", "partsManager", "partsManagerEmail", "serviceManager", "serviceManagerEmail", "other", "phone", "billToPhone", "fax", "email", "terms", "billToAddress", "billToAddress2", "billToCity", "billToState", "billToZip", "shipToAddress", "shipToAddress2", "shipToCity", "shipToState", "shipToZip", "dateContacted", "comments", "customerType", "source", "country", "isTaxable", "paymentType")
VALUES
  (NULL, 'HEAVY DUTY REBUILDERS', 'BURK DAY', NULL, NULL, NULL, NULL, NULL, '(800) 873-8783', NULL, '(417) 581-9808', NULL, 'NET 30', '1250 WEST LIBERTY AVE', NULL, 'OZARK', 'MO', 65721, '1250 WEST LIBERTY AVE', NULL, 'OZARK', 'MO', 65721, NULL, '6050 N Cabinet Drive', 'Vendor', 'RC', NULL, false, NULL),
  (NULL, 'ConEquip Parts & Equipment (14196)', 'Al', NULL, NULL, NULL, NULL, NULL, '(888) 983-7847', NULL, NULL, NULL, 'NET 30', '5251 Shawnee Rd', NULL, 'Sanborn', 'NY', 14132, '5251 Shawnee Rd', NULL, 'Sanborn', 'NY', 14132, NULL, NULL, 'Broker', NULL, NULL, false, NULL);

-- HANDWRITTENS
INSERT INTO "handwrittens" ("invoiceId", "legacyId", "customerId", "date", "poNum", "billToCompany", "billToAddress", "billToAddress2", "billToCity", "billToState", "billToZip", "billToCountry", "shipToContact", "billToPhone", "fax", "shipToCompany", "shipToAddress", "shipToAddress2", "shipToCity", "shipToState", "shipToZip", "source", "payment", "phone", "cell", "customerEngineInfo", "isBlindShipment", "isNoPriceInvoice", "contactName", "cardPrinted", "paymentComplete", "invoiceStatus", "accountingStatus", "shippingStatus", "orderNotes", "shippingNotes", "mp", "cap", "br", "fl", "isCollect", "isThirdParty", "isEndOfDay", "isTaxable", "isSetup", "thirdPartyAccount", "email", "shipViaId", "createdBy", "soldBy")
VALUES
  (NULL, NULL, 1, '2026-02-17', '8486', 'HEAVY DUTY REBUILDERS', '1250 WEST LIBERTY AVE', NULL, 'OZARK', 'MO', '65721', NULL, NULL, '8008738783', NULL, 'HEAVY DUTY REBUILDERS', NULL, NULL, NULL, NULL, NULL, 'FAST TRACK/PEED', 'NET 30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SENT TO ACCOUNTING', 'COMPLETE', NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (NULL, NULL, 2, '2026-02-17', '8486', 'ConEquip Parts & Equipment (14196)', '1250 WEST LIBERTY AVE', NULL, 'OZARK', 'MO', '65721', NULL, NULL, '8008738783', NULL, 'ConEquip Parts & Equipment (14196)', NULL, NULL, NULL, NULL, NULL, 'FAST TRACK/PEED', 'NET 30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SENT TO ACCOUNTING', 'COMPLETE', NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- HANDWRITTEN ITEMS
INSERT INTO "handwrittenItems" ("handwrittenId", "date", "desc", "partNum", "stockNum", "unitPrice", "qty", "cost", "location", "partId", "isInvoiced", "isQuoteChecked", "dimsQty", "weight", "length", "width", "height", "isTakeoffDone")
VALUES
(1, '2026-02-17', 'PAID CK # 17495 09/13/96', null, null, -595, 1, null, null, null, null, null, 0, 0, 0, 0 , 0, false),
(1, '2026-02-17', 'EMERY AIR FREIGHT', null, null, 95, 1, null, null, null, null, null, 0, 0, 0, 0 , 0, false),
(1, '2026-02-17', '4N5534 FLYWHEEL HSNG', null, null, 500, 1, null, null, null, null, null, 0, 0, 0, 0 , 0, false),
(2, '2026-02-17', 'C7.1 Surplus Long Block', 'C7.1 Engine', '7342', 500, 1, null, null, null, null, null, 0, 0, 0, 0 , 0, false);

-- HANDWRITTEN ITEMS CHILDREN
INSERT INTO "handwrittenItemsChildren" ("partId", "parentId", "qty", "cost", "isTakeoffDone", "stockNum", "partNum")
VALUES (1, 1, 1, 1060, false, NULL, NULL);

-- CORES
-- INSERT INTO "cores" ("salesmanId", "customerId", "handwrittenId", "handwrittenItemId", "partId", "date", "billToCompany", "qty", "altParts", "partNum", "desc", "charge", "shipToCompany", "priority")
-- VALUES

-- ADD ONS
INSERT INTO "addOns" ("legacyId", "qty", "partNum", "desc", "stockNum", "location", "remarks", "entryDate", "rating", "engineNum", "condition", "purchasePrice", "purchasedFrom", "po", "manufacturer", "isSpecialCost", "type", "hp", "serialNum", "newPrice", "remanPrice", "dealerPrice", "priceStatus", "altParts", "isPrinted", "isPoOpened", "prefix")
VALUES (NULL, 1, '6057481', 'WATER PUMP C15', 'WP7301', '1A5B', '(10.0) NTO, WATER PUMP ASSEMBLY, LOOKS VERY NICE, YELLOW', '2026-01-14', 10.0, 7301, 'New', NULL, NULL, NULL, 'New Cat', false, 'Industrial', '540', 'MCW19560', 1391.46, 0, 0, 'We have pricing', '6057481', true, false, NULL);

-- ENGINES
INSERT INTO "engines" ("stockNum", "model", "serialNum", "loginDate", "toreDownDate", "soldDate", "location", "comments", "horsePower", "purchasedFrom", "purchasePrice", "soldTo", "costApplied1", "costAppliedDesc1", "costApplied2", "costAppliedDesc2", "costApplied3", "costAppliedDesc3", "costApplied4", "costAppliedDesc4", "costApplied5", "costAppliedDesc5", "costApplied6", "costAppliedDesc6", "currentStatus", "totalCostApplied", "mileage", "warranty", "sellPrice", "partsPulled", "testRun", "arrNum", "askingPrice", "costProposed1", "costProposed2", "costProposed3", "costProposed4", "costProposed5", "costProposed6", "costIn1", "costInDesc1", "costIn2", "costInDesc2", "costIn3", "costInDesc3", "costIn4", "costInDesc4", "costNotes", "EngineStockNumber", "soldEnginesJakeBrake", "torque", "pan", "turboArr", "application", "ecm", "waterPumpNew", "fwhNumber", "turboHpNew", "turboLpNew", "blockNew", "blockReman", "crankNew", "crankReman", "headNew", "headReman", "camNew", "camReman", "injNew", "injReman", "turboNew", "turboReman", "pistonNew", "pistonReman", "cylPacksNew", "cylPacksReman", "fwhNew", "fwhReman", "oilPanNew", "oilPanReman", "oilCoolerNew", "oilCoolerReman", "frontHsngNew", "flywheelNew", "ragNew", "heuiPumpNew", "heuiPumpReman", "turboHpReman", "turboLpReman", "jakeBrake", "waterPumpActual", "fwhActual", "turboHpActual", "blockActual", "blockCasting", "crankActual", "headActual", "camActual", "injActual", "pistonActual", "cylPacksActual", "oilPanActual", "oilCoolerActual", "frontHsngActual", "flywheelActual", "ragActual", "heuiPumpActual", "turboLpActual", "turboActual", "oilPumpNew", "oilPumpReman", "oilPumpActual", "waterPumpReman", "exhMnfldNew", "exhMnfldReman", "exhMnfldActual")
VALUES
  (3086, 'C-7', '7XC09627', '2006-01-31', '2006-02-05', '1899-12-30', NULL, '0R4697  REF. SER.# 3ZJ36500', '425', 'NC MACHINERY', 2300, NULL, 700, 'B3066 TOROMONT CAT', 550, 'C3066', 250, 'P3066', 300, 'FP3066', 0, NULL, 0, NULL, 'RunnerReady', 2300, NULL, false, 0, NULL, false, NULL, NULL, 0, 0, 0, 0, 0, 0, 1800, ' Purchase Price', 0, NULL, 0, NULL, 0, NULL, 'CoreEngine', 3066, false, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (7342, 'C7.1', '7XC09627', '2006-01-31', '2006-02-05', '1899-12-30', NULL, '0R4697  REF. SER.# 3ZJ36500', '425', 'NC MACHINERY', 2300, NULL, 700, 'B3066 TOROMONT CAT', 550, 'C3066', 250, 'P3066', 300, 'FP3066', 0, NULL, 0, NULL, 'RunnerReady', 2300, NULL, false, 0, NULL, false, NULL, NULL, 0, 0, 0, 0, 0, 0, 1800, ' Purchase Price', 0, NULL, 0, NULL, 0, NULL, 'CoreEngine', 3066, false, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (7259, 'C7.1', '79419143', '2006-01-31', '2006-02-05', '1899-12-30', NULL, '0R4697  REF. SER.# 3ZJ36500', '500', 'NC MACHINERY', 2300, NULL, 700, 'B3066 TOROMONT CAT', 550, 'C3066', 250, 'P3066', 300, 'FP3066', 0, NULL, 0, NULL, 'RunnerReady', 2300, NULL, false, 0, NULL, false, NULL, NULL, 0, 0, 0, 0, 0, 0, 1800, ' Purchase Price', 0, NULL, 0, NULL, 0, NULL, 'CoreEngine', 3066, false, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
