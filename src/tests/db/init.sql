-- USERS
INSERT INTO users (username, password, initials, access_level, type, subtype, email)
VALUES ('test', '$2a$10$hU8uxVwoTok90amc51Pmle3O9TF5QjlgbTw309iJ5xRj5E/CK4pZe', 'TS', 3, 'office', 'sales', 'bennett@midwestdiesel.com');

-- ALERTS
INSERT INTO alerts (type, part_num, date, note, subtext, salesman_id)
VALUES ('ALERT!!!', '1304701', '2021-04-13', '3406E/C15 Gear - Lots of matches! 6I4578 Is for older 5ek, uses a 6I3621 stubshaft, 1304701 uses a 1302979 or 1515966 subshaft', '', 1);

-- PARTS INFO
INSERT INTO parts_info
(part_num, "desc", alt_parts, weight_dims, prefix, list_price, core_price, fleet_price, reman_list_price, reman_fleet_price, price_last_updated) VALUES 
('2251283', 'ELBOW', '2251283', NULL, 'ELB', NULL, NULL, NULL, NULL, NULL, NULL),
('3949674', 'ELBOW', '3949674, 20R4880', NULL, 'ELB', NULL, NULL, NULL, NULL, NULL, NULL),
('20R4880', 'ELBOW', '3949674, 20R4880', NULL, 'ELB', NULL, NULL, NULL, NULL, NULL, NULL),
('E23525567', 'VALVE', 'E23525567, R23525567', NULL, 'VA', NULL, NULL, NULL, NULL, NULL, NULL),
('R23525567', 'VALVE', 'E23525567, R23525567', NULL, 'VA', NULL, NULL, NULL, NULL, NULL, NULL),
('7L0406', 'VALVE', '7L0406, 9N3242, 9N3240', NULL, 'VA', 179.84, 0, 161.87, 0, 0, '2020-06-09'),
('9N3242', 'VALVE', '7L0406, 9N3242, 9N3240', NULL, 'VA', NULL, NULL, NULL, NULL, NULL, NULL),
('10R3264', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', 'IGP', NULL, NULL, NULL, NULL, NULL, NULL),
('10R3264R', 'INJECTOR C27', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('2447715', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', NULL, 'IGP', NULL, NULL, NULL, NULL, NULL, NULL),
('2530615', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', 'IGP', NULL, NULL, NULL, NULL, NULL, NULL),
('3740750', 'INJECTOR C27', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', 'UPS: 7LBS 12x10x6', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('6180750', 'INJECTOR', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('6470750', 'INJECTOR C15', '2447715, 2530615, 10R3264, 3740750, 20R2284, 20R2284R, 10R3264R, 6180750, 6470750', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('20R2284', 'INJECTOR C27', '2447715, 2530615, 10R3264, 3740750, 20R2284R, 10R3264R, 6180750, 6470750, 20R2284', 'UPS: 7LBS 12x10x6', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('11R1251', 'TUBE', '11R1251, 5441832, 5865303', NULL, 'TU', NULL, NULL, NULL, NULL, NULL, NULL),
('5441832', 'TUBE', '11R1251, 5441832, 5865303', NULL, 'TU', NULL, NULL, NULL, NULL, NULL, NULL),
('5865303', 'TUBE', '11R1251, 5441832, 5865303', NULL, 'TU', NULL, NULL, NULL, NULL, NULL, NULL),
('6057481', 'WATER PUMP C15', '6057481', NULL, 'TU', NULL, NULL, NULL, NULL, NULL, NULL),
('4700245', 'INJECTOR C9', '4700245', NULL, 'INJ', NULL, NULL, NULL, NULL, NULL, NULL),
('7E0333', 'VALVE COVER 3406', '7C9667, 4N4536, 4N4537, 7C9261, 7E0330, 7E0331, 7E0333, 7W9179', NULL, 'VC', 179.84, 0, 161.87, 0, 0, '2020-06-09'),
('7E0331', 'VALVE COVER 3406', '7C9667, 4N4536, 4N4537, 7C9261, 7E0330, 7E0331, 7E0333, 7W9179', NULL, 'VC', 179.84, 0, 161.87, 0, 0, '2020-06-09'),
('9N3240', 'THERM HSNG 3306', '9N3240, 7L0406, 9N3242', NULL, 'TH', 179.84, 0, 161.87, 0, 0, '2020-06-09'),
('0323237', 'SPACER', '0323237, 323237, 1W4589, 1336934', NULL, 'SP', NULL, NULL, NULL, NULL, NULL, NULL);

-- PARTS INFO WEIGHT DIMS
INSERT INTO parts_info_weight_dims (part_num) VALUES ('1W4589');

-- PARTS
INSERT INTO parts (handwritten_id, invoice_num, part_num, manufacturer, "desc", location, remarks, entry_date, entered_by, qty, stock_num, purchase_price, sold_to, qty_sold, selling_price, purchased_from, sold_to_date, condition, rating, engine_num, core_fam, pricing_notes, special_notes)
VALUES
  (NULL, NULL, '7E0333', 'CATERPILLAR', 'VALVE COVER 3406', 'C5G4A', 'T/O, NTBBD', '2026-02-17', 2000, 34, 'UP9432', 0.01, NULL, 0, NULL, 'CB1', NULL, 'Good Used', 0.0, 7259, NULL, NULL, NULL),
  (1, NULL, '7E0331', 'CATERPILLAR', 'VALVE COVER 3406', 'C5G4A', 'T/O, NOT CHECKED, ONE HOLE', '2026-02-17', 2000, 31, 'UP12615', 0.01, NULL, 1, 100, 'CB1', '05/18/2026', 'Good Used', 0.0, 7259, NULL, NULL, NULL),
  (NULL, NULL, '9N3240', 'CATERPILLAR', 'THERM HSNG 3306', 'C5G4A', '(8.5) CCBD AND ZD, CAST IRON THERM HSNG, LOOKS GOOD', '2026-02-17', 2000, 34, 'TH609-23C', 0.01, NULL, 1, 100, 'CB1', '05/18/2026', 'Good Used', 0.0, 7259, NULL, NULL, NULL),
  (NULL, NULL, '7L0406', 'CATERPILLAR', 'THERM HSNG 3306', 'C5G4A', '(8.5) CCBD AND ZD, CAST IRON THERM HSNG, LOOKS GOOD', '2026-02-17', 2000, 1, 'TH418-19A', 0.01, NULL, 0, NULL, 'CB1', NULL, 'Good Used', 0.0, 7259, NULL, NULL, NULL);

-- CUSTOMERS
INSERT INTO customers (company, contact, parts_manager, parts_manager_email, service_manager, service_manager_email, other, phone, bill_to_phone, fax, email, terms, bill_to_address, bill_to_address_2, bill_to_city, bill_to_state, bill_to_zip, ship_to_address, ship_to_address_2, ship_to_city, ship_to_state, ship_to_zip, date_contacted, comments, customer_type, source, country, is_taxable, payment_type)
VALUES
  ('HEAVY DUTY REBUILDERS', 'BURK DAY', NULL, NULL, NULL, NULL, NULL, '(800) 873-8783', NULL, '(417) 581-9808', NULL, 'NET 30', '1250 WEST LIBERTY AVE', NULL, 'OZARK', 'MO', 65721, '1250 WEST LIBERTY AVE', NULL, 'OZARK', 'MO', 65721, NULL, '6050 N Cabinet Drive', 'Vendor', 'RC', NULL, false, NULL),
  ('ConEquip Parts & Equipment (14196)', 'Al', NULL, NULL, NULL, NULL, NULL, '(888) 983-7847', NULL, NULL, NULL, 'NET 30', '5251 Shawnee Rd', NULL, 'Sanborn', 'NY', 14132, '5251 Shawnee Rd', NULL, 'Sanborn', 'NY', 14132, NULL, NULL, 'Broker', NULL, NULL, false, NULL);

-- FREIGHT CARRIERS
INSERT INTO freight_carriers (name, type)
VALUES
  ('FedEx Express', 'Fedex'),
  ('FedEx Ground', 'Fedex'),
  ('T-FORCE', 'Truck Line'),
  ('UPS Red', 'UPS'),
  ('UPS Ground', 'UPS');

-- SOURCES
INSERT INTO sources (source)
VALUES
  ('American Trucker'),
  ('Cold Call'),
  ('Website - Chat'),
  ('Netcom');

-- HANDWRITTENS
INSERT INTO handwrittens (customer_id, date, po_num, bill_to_company, bill_to_address, bill_to_address_2, bill_to_city, bill_to_state, bill_to_zip, bill_to_country, ship_to_contact, bill_to_phone, fax, ship_to_company, ship_to_address, ship_to_address_2, ship_to_city, ship_to_state, ship_to_zip, source, payment, phone, cell, customer_engine_info, is_blind_shipment, is_no_price_invoice, contact_name, card_printed, payment_complete, invoice_status, accounting_status, shipping_status, order_notes, shipping_notes, mp, cap, br, fl, is_collect, is_third_party, is_end_of_day, is_taxable, is_setup, third_party_account, email, ship_via_id, created_by, sold_by)
VALUES
  (1, '2026-02-17', '8486', 'HEAVY DUTY REBUILDERS', '1250 WEST LIBERTY AVE', NULL, 'OZARK', 'MO', '65721', NULL, NULL, '8008738783', NULL, 'HEAVY DUTY REBUILDERS', NULL, NULL, NULL, NULL, NULL, 'FAST TRACK/PEED', 'NET 30', NULL, NULL, NULL, false, false, NULL, false, false, 'SENT TO ACCOUNTING', 'COMPLETE', NULL, NULL, NULL, 0, 0, 0, 0, false, false, false, false, false, NULL, NULL, NULL, NULL, NULL),
  (2, '2026-02-17', '8486', 'ConEquip Parts & Equipment (14196)', '1250 WEST LIBERTY AVE', NULL, 'OZARK', 'MO', '65721', NULL, NULL, '8008738783', NULL, 'ConEquip Parts & Equipment (14196)', NULL, NULL, NULL, NULL, NULL, 'FAST TRACK/PEED', 'NET 30', NULL, NULL, NULL, false, false, NULL, false, false, 'SENT TO ACCOUNTING', 'COMPLETE', NULL, NULL, NULL, 0, 0, 0, 0, false, false, false, false, false, NULL, NULL, NULL, NULL, NULL);

-- HANDWRITTEN ITEMS
INSERT INTO handwritten_items (handwritten_id, date, "desc", part_num, stock_num, unit_price, qty, cost, location, part_id, is_invoiced, is_quote_checked, dims_qty, weight, length, width, height, is_takeoff_done)
VALUES
(1, '2026-02-17', 'PAID CK # 17495 09/13/96', null, null, -595, 1, null, null, null, false, false, 0, 0, 0, 0, 0, false),
(1, '2026-02-17', 'EMERY AIR FREIGHT', null, null, 95, 1, null, null, null, false, false, 0, 0, 0, 0, 0, false),
(1, '2026-02-17', '4N5534 FLYWHEEL HSNG', null, null, 500, 1, null, null, null, false, false, 0, 0, 0, 0, 0, false),
(2, '2026-02-17', 'C7.1 Surplus Long Block', 'C7.1 Engine', '7342', 500, 1, null, null, null, false, false, 0, 0, 0, 0, 0, false);

-- HANDWRITTEN ITEMS CHILDREN
INSERT INTO handwritten_items_children (part_id, parent_id, qty, cost, is_takeoff_done, stock_num, part_num)
VALUES (1, 1, 1, 1060, false, NULL, NULL);

-- CORES
-- INSERT INTO cores (salesman_id, customer_id, handwritten_id, handwrittenItem_id, part_id, date, bill_to_company, qty, alt_parts, part_num, "desc", charge, ship_to_company, priority)
-- VALUES

-- ADD ONS
INSERT INTO add_ons (qty, part_num, "desc", stock_num, location, remarks, entry_date, rating, engine_num, condition, purchase_price, purchased_from, po, manufacturer, is_special_cost, type, hp, serial_num, new_price, reman_price, dealer_price, price_status, alt_parts, is_printed, is_po_opened, prefix)
VALUES
(1, '6057481', 'WATER PUMP C15', 'WP7301', '1A5B', '(10.0) NTO, WATER PUMP ASSEMBLY, LOOKS VERY NICE, YELLOW', '2026-01-14', 10.0, 7301, 'New', NULL, NULL, NULL, 'New Cat', false, 'Industrial', '540', 'MCW19560', 1391.46, 0, 0, 'We have pricing', '6057481', true, false, NULL),
(1, '6057481', 'WATER PUMP C15', 'UP9433', '1A5B', '(10.0) NTO, WATER PUMP ASSEMBLY, LOOKS VERY NICE, YELLOW', '2026-01-14', 10.0, 7301, 'New', NULL, NULL, NULL, 'New Cat', false, 'Industrial', '540', 'MCW19560', 1391.46, 0, 0, 'We have pricing', '6057481', true, false, NULL);

-- ENGINES
INSERT INTO engines (stock_num, model, serial_num, login_date, tore_down_date, sold_date, location, comments, horse_power, purchased_from, purchase_price, sold_to, current_status, mileage, warranty, sell_price, parts_pulled, test_run, arr_num, asking_price, sold_engines_jake_brake, torque, pan, turbo_arr, application, ecm, water_pump_new, fwh_number, turbo_hp_new, turbo_lp_new, block_new, block_reman, crank_new, crank_reman, head_new, head_reman, cam_new, cam_reman, inj_new, inj_reman, turbo_new, turbo_reman, piston_new, piston_reman, cyl_packs_new, cyl_packs_reman, fwh_new, fwh_reman, oil_pan_new, oil_pan_reman, oil_cooler_new, oil_cooler_reman, front_housing_new, flywheel_new, rag_new, heui_pump_new, heui_pump_reman, turbo_hp_reman, turbo_lp_reman, jake_brake, water_pump_actual, fwh_actual, turbo_hp_actual, block_actual, block_casting, crank_actual, head_actual, cam_actual, inj_actual, piston_actual, cyl_packs_actual, oil_pan_actual, oil_cooler_actual, front_housing_actual, flywheel_actual, rag_actual, heui_pump_actual, turbo_lp_actual, turbo_actual, oil_pump_new, oil_pump_reman, oil_pump_actual, water_pump_reman, exh_manifold_new, exh_manifold_reman, exh_manifold_actual)
VALUES
  (3086, 'C-7', '7XC09627', '2006-01-31', '2006-02-05', '1899-12-30', NULL, '0R4697  REF. SER.# 3ZJ36500', '425', 'NC MACHINERY', 2300, NULL, 'RunnerReady', NULL, false, 0, NULL, false, NULL, NULL, false, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (7342, 'C7.1', '7XC09627', '2006-01-31', '2006-02-05', '1899-12-30', NULL, '0R4697  REF. SER.# 3ZJ36500', '425', 'NC MACHINERY', 2300, NULL, 'RunnerReady', NULL, false, 0, NULL, false, NULL, NULL, false, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (7259, 'C7.1', '79419143', '2006-01-31', '2006-02-05', '1899-12-30', NULL, '0R4697  REF. SER.# 3ZJ36500', '500', 'NC MACHINERY', 2300, NULL, 'RunnerReady', NULL, false, 0, NULL, false, NULL, NULL, false, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- PURCHASE ORDERS
INSERT INTO purchase_orders (date, salesman_id, po_num)
VALUES
  (CURRENT_DATE, 1, 123456);

-- WARRANTIES
INSERT INTO warranties (completed, completed_date, customer_id, date, handwritten_id, invoice_date, invoice_id, legacy_id, salesman_id, vendor, vendor_warranty_num)
VALUES
  (true, '2012-07-12', 12795, NULL, 30290, '2012-05-08', 31199, 28, 8, 'Diesel Controls Inc', NULL);
