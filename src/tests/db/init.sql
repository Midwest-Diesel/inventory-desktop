-- These queries will run whenever the docker inventory-tests DB is reset, after the data.sql file.
-- Use this to add fake data for tests.

INSERT INTO public."alerts" ("type", "partNum", "date", "note", "subtext", "salesmanId") VALUES ('ALERT!!!', '1304701', '2021-04-13', '3406E/C15 Gear - Lots of matches!  6I4578 Is for older 5ek, uses a 6I3621 stubshaft, 1304701 uses a 1302979 or 1515966 subshaft', '', 8);

INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('2251283', 'ELBOW', '2251283', NULL, 'ELB');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('3949674', 'ELBOW', '3949674, 20R4880', NULL, 'ELB');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('20R4880', 'ELBOW', '3949674, 20R4880', NULL, 'ELB');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('E23525567', 'VALVE', 'E23525567, R23525567', NULL, 'VA');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('R23525567', 'VALVE', 'E23525567, R23525567', NULL, 'VA');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('7L0406', 'VALVE', '7L0406, 9N3242', NULL, 'VA');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('9N3242', 'VALVE', '7L0406, 9N3242', NULL, 'VA');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('10R3264', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', 'IGP');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('10R3264R', 'INJECTOR C27', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', NULL);
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('2447715', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', NULL, 'IGP');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('2530615', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', 'IGP');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('3740750', 'INJECTOR C27', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', NULL);
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('6180750', 'INJECTOR', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', NULL, NULL);
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('6470750', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', NULL, NULL);
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('20R2284', 'INJECTOR C27', '2447715, 2530615, 10R3264, 3740750, 20R2284R, 10R3264R, 6180750, 6470750, 20R2284', 'UPS: 7LBS 12x10x6', NULL);
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('11R1251', 'TUBE', '11R1251, 5441832, 5865303', NULL, 'TU');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('5441832', 'TUBE', '11R1251, 5441832, 5865303', NULL, 'TU');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('5865303', 'TUBE', '11R1251, 5441832, 5865303', NULL, 'TU');
INSERT INTO public."partsInfo" ("partNum", "desc", "altParts", "weightDims", "prefix") VALUES ('6057481', 'WATER PUMP C15', '6057481', NULL, 'TU');

INSERT INTO public."customers" ("legacyId","company","contact","partsManager","partsManagerEmail","serviceManager","serviceManagerEmail","other","phone","billToPhone","fax","email","terms","billToAddress","billToAddress2","billToCity","billToState","billToZip","shipToAddress","shipToAddress2","shipToCity","shipToState","shipToZip","dateContacted","comments","customerType","source","country","isTaxable","paymentType") VALUES (714,'LKQ HEAVY DUTY REBUILDERS','BURK DAY',NULL,NULL,NULL,NULL,NULL,'(800) 873-8783',NULL,'(417) 581-9808',NULL,'NET 30','1250 WEST LIBERTY AVE',NULL,'OZARK','MO',65721,'1250 WEST LIBERTY AVE',NULL,'OZARK','MO',65721,NULL,'Bill''s Address: &nbsp;6050 N Cabinet Drive&nbsp;Ozark, MO 65721','Vendor','RC',NULL,'false',NULL);

INSERT INTO public.handwrittens ("invoiceId", "legacyId", "customerId", "salesmanId", date, "poNum", "billToCompany", "billToAddress", "billToAddress2", "billToCity", "billToState", "billToZip", "billToCountry", "shipToContact", "billToPhone", fax, "shipToCompany", "shipToAddress", "shipToAddress2", "shipToCity", "shipToState", "shipToZip", source, payment, phone, cell, "customerEngineInfo", "isBlindShipment", "isNoPriceInvoice", "contactName", "cardPrinted", "paymentComplete", "invoiceStatus", "accountingStatus", "shippingStatus", "orderNotes", "shippingNotes", mp, cap, br, fl, "isCollect", "isThirdParty", "isEndOfDay", "isTaxable", "isSetup", "thirdPartyAccount", email, "shipViaId", "createdBy", "soldBy") VALUES (11, NULL, 2, NULL, '1996-09-28', '8486', 'HEAVY DUTY REBUILDERS', '1250 WEST LIBERTY AVE', NULL, 'OZARK', 'MO', '65721', NULL, NULL, '8008738783', NULL, 'HEAVY DUTY REBUILDERS', NULL, NULL, NULL, NULL, NULL, 'FAST TRACK/PEED', 'NET 30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SENT TO ACCOUNTING', 'COMPLETE', NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO public."handwrittenItems" ("legacyId", "legacyInvoiceId", "handwrittenId", "date", "desc", "partNum", "stockNum", "unitPrice", "qty", "cost", "location", "partId", "isInvoiced", "isQuoteChecked", "dimsQty", "weight", "length", "width", "height", "isTakeoffDone")
VALUES
(165, 11, 2, '1996-08-05', 'PAID CK # 17495 09/13/96', null, null, -595, 1, null, null, null, null, null, 0, 0, 0, 0 , 0, false),
(165, 11, 1, '1996-08-05', 'PAID CK # 17495 09/13/96', null, null, -595, 1, null, null, null, null, null, 0, 0, 0, 0 , 0, false),
(2, 11, 1, '1996-08-05', 'EMERY AIR FREIGHT', null, null, 95, 1, null, null, null, null, null, 0, 0, 0, 0 , 0, false),
(1, 11, 1, '1996-08-05', '4N5534 FLYWHEEL HSNG', null, null, 500, 1, null, null, null, null, null, 0, 0, 0, 0 , 0, false);

INSERT INTO public."handwrittenItemsChildren" ("partId", "parentId", qty, cost, "isTakeoffDone", "stockNum", "partNum") VALUES (1, 101, 1, 1060, false, NULL, NULL);

INSERT INTO public."addOns" ("legacyId", qty, "partNum", "desc", "stockNum", location, remarks, "entryDate", rating, "engineNum", condition, "purchasePrice", "purchasedFrom", po, manufacturer, "isSpecialCost", type, hp, "serialNum", "newPrice", "remanPrice", "dealerPrice", "priceStatus", "altParts", "isPrinted", "isPoOpened", prefix) VALUES (138380, 1, '6057481', 'WATER PUMP C15', 'WP7301', '1A5B', '(10.0) NTO, WATER PUMP ASSEMBLY, LOOKS VERY NICE, YELLOW', '2026-01-14', 10.0, 7301, 'New', NULL, NULL, NULL, 'New Cat', false, 'Industrial', '540', 'MCW19560', 1391.46, 0, 0, 'We have pricing', '6057481', true, false, NULL);
