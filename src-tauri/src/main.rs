/*  
==========================================================
Printer names are hard coded, you will have to change some
of them when replacing a printer.
==========================================================
*/

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use image::{io::Reader as ImageReader, ImageOutputFormat, DynamicImage, imageops::{rotate90, resize, FilterType}};
use serde::{Deserialize, Serialize};
use serde_json::to_string;
use tauri::Manager;
use std::process::Command;
use std::fs::{write};
use std::{fs::File, io::copy};
use std::io::{self, Cursor, Write};
use reqwest::Client;
use std::path::{Path};
use zip::read::ZipArchive;
use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine, decode};
use url::Url;

#[derive(Deserialize, Debug)]
struct LatestVersionInfo {
  version: String
}

#[derive(Deserialize, Serialize)]
struct WindowArgs {
  title: String,
  url: String,
  is_prod: bool
}

#[derive(Deserialize, Serialize)]
struct PictureArgs {
  part_num: Option<String>,
  stock_num: Option<String>,
  name: Option<String>,
  pic_type: Option<String>
}

#[derive(Deserialize, Serialize)]
struct Picture {
  url: String,
  name: String
}

#[derive(Deserialize, Serialize)]
struct EmailArgs {
  subject: String,
  body: String,
  recipients: Vec<String>,
  cc_recipients: Option<Vec<String>>,
  bcc_recipients: Option<Vec<String>>,
  attachments: Option<Vec<String>>
}

#[derive(Deserialize, Serialize)]
struct Attachments {
  attachments: Vec<String>
}

#[derive(Deserialize, Serialize)]
struct Base64Picture {
  data: String,
  path: String
}

#[derive(Deserialize, Serialize)]
struct FileUpload {
  name: String,
  data: String
}

#[derive(Deserialize, Serialize)]
struct FilesArgs {
  name: String,
  files: Vec<FileUpload>,
  is_multifile: bool
}

#[derive(Deserialize, Serialize)]
struct ShippingListRow {
  handwritten_id: i32,
  initials: String,
  ship_via: String,
  ship_type: String,
  customer: String,
  attn_to: String,
  part_num: String,
  desc: String,
  stock_num: Option<String>,
  location: Option<String>,
  mp: i8,
  br: i8,
  cap: i8,
  fl: i8,
  pulled: bool,
  packaged: bool,
  gone: bool,
  ready: bool,
  weight: i16,
  dims: String,
  day: i8,
  list_path: String
}

#[derive(Deserialize, Serialize)]
struct FileArgs {
  file: Vec<u8>,
  dir: String,
  name: String
}

#[derive(Deserialize, Serialize)]
struct ShippingLabelArgs {
  shipFromCompany: String,
  shipFromAddress: String,
  shipFromAddress2: String,
  shipFromCityStateZip: String,
  shipToCompany: String,
  shipToAddress: String,
  shipToAddress2: String,
  shipToCityStateZip: String,
  copies: i8
}

#[derive(Deserialize, Serialize)]
struct CCLabelArgs {
  cardNum: i64,
  expDate: String,
  cvv: i8,
  cardZip: String,
  cardName: String,
  cardAddress: String
}

#[derive(Deserialize, Serialize)]
struct BOLArgs {
  shipToCompany: String,
  shipToAddress: String,
  shipToAddress2: String,
  shipToCityStateZip: String,
  shipFromCompany: String,
  shipFromAddress: String,
  shipFromAddress2: String,
  shipFromCityStateZip: String,
  shipVia: String,
  prepaid: bool,
  collect: bool,
  thirdParty: bool
}

#[derive(Deserialize, Serialize)]
struct ShippingInvoiceArgs {
  billToCompany: String,
  billToAddress: String,
  billToAddress2: String,
  billToCity: String,
  billToState: String,
  billToZip: String,
  billToCountry: String,
  shipToCompany: String,
  shipToAddress: String,
  shipToAddress2: String,
  shipToCity: String,
  shipToState: String,
  shipToZip: String,
  shipToContact: String,
  shipToCountry: String,
  accountNum: String,
  paymentType: String,
  createdBy: String,
  soldBy: String,
  handwrittenId: i32,
  date: String,
  contact: String,
  poNum: String,
  shipVia: String,
  items: String,
  invoiceNotes: String,
  shippingNotes: String,
  mp: String,
  cap: String,
  br: String,
  fl: String,
  setup: bool,
  taxable: bool,
  blind: bool,
  npi: bool,
  collect: bool,
  thirdParty: bool
}

#[derive(Deserialize, Serialize)]
struct AccountingInvoiceArgs {
  billToCompany: String,
  billToAddress: String,
  billToAddress2: String,
  billToCity: String,
  billToState: String,
  billToZip: String,
  billToCountry: String,
  shipToCompany: String,
  shipToAddress: String,
  shipToAddress2: String,
  shipToCity: String,
  shipToState: String,
  shipToZip: String,
  shipToContact: String,
  shipToCountry: String,
  accountNum: String,
  paymentType: String,
  createdBy: String,
  soldBy: String,
  handwrittenId: i32,
  date: String,
  contact: String,
  poNum: String,
  shipVia: String,
  items: String,
  invoiceNotes: String,
  shippingNotes: String,
  handwrittenTotal: String,
  setup: bool,
  taxable: bool,
  blind: bool,
  npi: bool,
  collect: bool,
  thirdParty: bool
}

#[derive(Deserialize, Serialize)]
struct CIArgs {
  company: String,
  address: String,
  address2: String,
  cityStateZip: String,
  date: String,
  po: String
}

#[derive(Deserialize, Serialize)]
struct PartTagArgs {
  stockNum: String,
  model: String,
  serialNum: String,
  hp: String,
  location: String,
  remarks: String,
  date: String,
  partNum: String,
  rating: String,
  hasPictures: bool,
  copies: i8
}

#[derive(Deserialize, Serialize)]
struct PrintReturnArgs {
  createdBy: String,
  date: String,
  poNum: String,
  id: i16,
  invoiceDate: String,
  billToCompany: String,
  shipToCompany: String,
  billToAddress: String,
  billToCity: String,
  billToState: String,
  billToZip: String,
  billToPhone: String,
  dateCalled: String,
  salesman: String,
  returnReason: String,
  returnNotes: String,
  returnPaymentTerms: String,
  payment: String,
  restockFee: String,
  items: String
}

#[derive(Deserialize, Serialize)]
struct PrintWarrantyArgs {
  vendor: String,
  createdDate: String,
  id: i16,
  vendorWarrantyId: i16,
  completed: String,
  billToAddress: String,
  shipToAddress: String,
  claimReason: String,
  paymentTerms: String,
  restockFee: String,
  vendorReport: String,
  items: String
}

#[derive(Deserialize, Serialize)]
struct PrintPackingSlipArgs {
  invoiceDate: String,
  poNum: String,
  billToCompany: String,
  billToAddress: String,
  billToAddress2: String,
  billToCityStateZip: String,
  shipToCompany: String,
  shipToContact: String,
  shipToAddress: String,
  shipToAddress2: String,
  shipToCityStateZip: String,
  items: String
}

#[derive(Deserialize, Serialize)]
struct PrintPackingSlipBlindArgs {
  invoiceDate: String,
  billToCompany: String,
  billToAddress: String,
  billToAddress2: String,
  billToCityStateZip: String,
  shipToCompany: String,
  shipToContact: String,
  shipToAddress: String,
  shipToAddress2: String,
  shipToCityStateZip: String,
  items: String
}

#[derive(Deserialize, Serialize)]
struct PrintPOArgs {
  id: i16,
  vendor: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  phone: String,
  fax: String,
  paymentTerms: String,
  purchasedFor: String,
  specialInstructions: String,
  comments: String,
  date: String,
  orderedBy: String,
  items: String
}

#[derive(Deserialize, Serialize)]
struct EmailEndOfDayArgs {
  id: i32,
  email: String,
  company: String,
  date: String,
  year: String,
  month: String,
  day: String,
  shipVia: String,
  trackingNumbers: Vec<String>
}

#[tokio::main]
async fn main() {
  tauri::Builder::default()
    .setup(|_| {
      create_directories();
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      new_email_draft,
      install_update,
      open_window,
      get_part_num_images,
      get_stock_num_images,
      get_engine_images,
      get_all_pictures,
      attach_to_existing_email,
      convert_img_to_base64,
      upload_email_stuff_files,
      add_to_shipping_list,
      upload_file,
      print_shipping_label,
      print_cc_label,
      print_bol,
      print_accounting_invoice,
      print_shipping_invoice,
      print_core_invoice,
      print_ci,
      print_coo,
      print_part_tag,
      print_return,
      print_warranty,
      print_packing_slip,
      print_po,
      print_packing_slip_blind,
      email_end_of_day
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn create_directories() {
  let directories = vec!["scripts", "updates"];
  for dir_name in directories {
    if std::fs::read_dir(format!("C:/MWD/{}", dir_name)).is_err() {
      std::fs::create_dir(format!("C:/MWD/{}", dir_name)).expect("Failed to create dir");
    }
  }
}

#[tauri::command]
async fn open_window(app: tauri::AppHandle, window_args: WindowArgs) {
  let title = window_args.title.clone();
  let base_url = if window_args.is_prod {
    "https://tauri.localhost"
  } else {
    "http://localhost:3000"
  };
  let url = format!("{}/{}", base_url, window_args.url);
  let parsed_url = Url::parse(&url).expect("Invalid URL");

  let new_window = tauri::WindowBuilder::new(
    &app,
    title.clone(),
    tauri::WindowUrl::External(parsed_url.into())
  )
  .title(title)
  .inner_size(1500.0, 800.0)
  .build()
  .expect("Failed to create window");

  if let Err(err) = app.emit_to("Handwritten", "window-created", window_args.url.clone()) {
    eprintln!("Failed to emit created event: {}", err);
  }
  
  if let Err(err) = new_window.set_focus() {
    eprintln!("Failed to focus window: {}", err);
  }
}

#[tauri::command]
fn install_update() {
  println!("Update detected");
  io::stdout().flush().unwrap();

  tokio::spawn(async move {
    if let Err(e) = download_update().await {
      println!("Error downloading the update: {}", e);
      io::stdout().flush().unwrap();
    } else {
      println!("Update successful, restarting app...");
      io::stdout().flush().unwrap();

      let batch_script = r#"
      @echo off
      echo Installing update...
      "%SystemRoot%\\System32\\timeout.exe" /T 2 /NOBREAK > NUL
      echo Examining reactor core...
      "%SystemRoot%\\System32\\timeout.exe" /T 2 /NOBREAK > NUL
      echo Training AI...
      "%SystemRoot%\\System32\\timeout.exe" /T 1 /NOBREAK > NUL
      taskkill /F /IM Inventory.exe > NUL 2>&1
      start "" "C:\\MWD\\Inventory.exe"
      del "%~f0" & exit
      "#;

      let script_path = "C:\\MWD\\updates\\restart_app.bat";
      std::fs::write(script_path, batch_script).expect("Failed to create batch script");

      Command::new("C:\\Windows\\System32\\cmd.exe")
        .arg("/C")
        .arg(script_path)
        .spawn()
        .expect("Failed to run restart script");

      std::process::exit(0);
    }
  });
  let _ = std::fs::remove_dir_all("C:/MWD/updates");
  let _ = std::fs::create_dir("C:/MWD/updates");
}

async fn download_update() -> Result<(), Box<dyn std::error::Error>> {
  let client = Client::new();
  let res = client
    .get("https://raw.githubusercontent.com/Midwest-Diesel/inventory-desktop/main/latest.json")
    .send()
    .await?
    .json::<LatestVersionInfo>()
    .await?;
  let version = res.version.trim_start_matches('v').to_string();

  let url = format!(
    "https://github.com/Midwest-Diesel/inventory-desktop/releases/download/v{}/Inventory_{}_x64-setup.nsis.zip",
    version, version
  );
  let client = Client::new();
  let response = client.get(url).send().await?;
  let zip_path = format!("C:/MWD/updates/Inventory_{}_x64-setup.nsis.zip", version);
  let mut dest = File::create(&zip_path)?;
  copy(&mut response.bytes().await?.as_ref(), &mut dest)?;
  println!("Update downloaded successfully.");

  let mut archive = ZipArchive::new(File::open(&zip_path)?)?;
  for i in 0..archive.len() {
    let mut file = archive.by_index(i)?;
    let outpath = Path::new("C:/MWD/updates").join(file.name());
    
    if file.name().ends_with('/') {
      std::fs::create_dir_all(&outpath)?;
    } else {
      if let Some(p) = outpath.parent() {
        std::fs::create_dir_all(p)?;
      }
      let mut out_file = File::create(&outpath)?;
      copy(&mut file, &mut out_file)?;
    }
  }
  println!("Update extracted successfully.");

  let installer_path = format!("C:/MWD/updates/Inventory_{}_x64-setup.exe", version);
  let _ = Command::new(installer_path)
    .arg("/S")
    .spawn()?;
  println!("Installer executed.");
  Ok(())
}

#[tauri::command]
async fn get_part_num_images(picture_args: PictureArgs) -> Result<Vec<Picture>, String> {
  let path = "\\\\MWD1-SERVER/Server/Pictures/parts_dir";
  let target_dir = format!("{}/{}", path, picture_args.part_num.as_deref().unwrap_or(""));
  let mut pictures = Vec::new();

  match std::fs::read_dir(&target_dir) {
    Ok(entries) => {
      for entry in entries {
        let pic_entry = match entry {
          Ok(entry) => entry,
          Err(e) => return Err(format!("Error reading entry: {}", e)),
        };
        let pic_name = pic_entry.file_name().into_string().map_err(|_| "Invalid file name")?;
        let pic_path = pic_entry.path();

        let data = match std::fs::read(&pic_path) {
          Ok(data) => data,
          Err(e) => return Err(format!("Error reading image data: {}", e)),
        };

        let base64_data = BASE64_STANDARD.encode(&data);
        pictures.push(Picture {
          url: base64_data,
          name: pic_name,
        });
      }
      Ok(pictures)
    }
    Err(e) => Ok(vec![]),
  }
}

#[tauri::command]
async fn get_stock_num_images(picture_args: PictureArgs) -> Result<Vec<Picture>, String> {
  let path = "\\\\MWD1-SERVER/Server/Pictures/sn_specific";
  let target_dir = format!("{}/{}", path, picture_args.stock_num.as_deref().unwrap_or(""));
  let mut pictures = Vec::new();

  match std::fs::read_dir(&target_dir) {
    Ok(entries) => {
      for entry in entries {
        let pic_entry = match entry {
          Ok(entry) => entry,
          Err(e) => return Err(format!("Error reading entry: {}", e)),
        };
        let pic_name = pic_entry.file_name().into_string().map_err(|_| "Invalid file name")?;
        let pic_path = pic_entry.path();

        let data = match std::fs::read(&pic_path) {
          Ok(data) => data,
          Err(e) => return Err(format!("Error reading image data: {}", e)),
        };

        let base64_data = BASE64_STANDARD.encode(&data);
        pictures.push(Picture {
          url: base64_data,
          name: pic_name,
        });
      }
      Ok(pictures)
    }
    Err(e) => Ok(vec![]),
  }
}

#[tauri::command]
async fn get_engine_images(picture_args: PictureArgs) -> Result<Vec<Picture>, String> {
  let path = "\\\\MWD1-SERVER/Server/Engines Pictures/StockPhotos";
  let target_dir = format!("{}/{}", path, picture_args.stock_num.as_deref().unwrap_or(""));
  let mut pictures = Vec::new();

  match std::fs::read_dir(&target_dir) {
    Ok(entries) => {
      for entry in entries {
        let pic_entry = match entry {
          Ok(entry) => entry,
          Err(e) => return Err(format!("Error reading entry: {}", e)),
        };
        let pic_name = pic_entry.file_name().into_string().map_err(|_| "Invalid file name")?;
        let pic_path = pic_entry.path();

        let data = match std::fs::read(&pic_path) {
          Ok(data) => data,
          Err(e) => return Err(format!("Error reading image data: {}", e)),
        };

        let base64_data = BASE64_STANDARD.encode(&data);
        pictures.push(Picture {
          url: base64_data,
          name: pic_name,
        });
      }
      Ok(pictures)
    }
    Err(e) => Ok(vec![]),
  }
}

#[tauri::command]
async fn get_all_pictures(picture_args: PictureArgs) -> Result<bool, String> {
  let path = format!(
    "\\\\MWD1-SERVER/Server/Pictures/{}/{}",
    match picture_args.pic_type.as_deref() {
      Some("part") => "parts_dir",
      Some(_) => "sn_specific",
      None => "",
    },
    picture_args.part_num.as_deref().unwrap_or("")
  );

  if std::path::Path::new(&path).exists() {
    Ok(true)
  } else {
    Ok(false)
  }
}

#[tauri::command]
fn new_email_draft(email_args: EmailArgs) {
  let recipients = email_args.recipients.join("; ");
  let subject = email_args.subject;
  let body = email_args.body;
  let cc_recipients = email_args.cc_recipients.unwrap_or_default().join("; ");
  let bcc_recipients = email_args.bcc_recipients.unwrap_or_default().join("; ");
  let attachments = email_args.attachments.unwrap_or_default();
  let attachments_joined = attachments.join(";");

  let vbs_script = format!(
    r#"
    Dim OutlookApp
    Set OutlookApp = CreateObject("Outlook.Application")
    Dim MailItem
    Set MailItem = OutlookApp.CreateItem(0)
    MailItem.Subject = "{}"
    MailItem.HTMLBody = "{}"
    MailItem.To = "{}"
    {}
    {}
    {}
    
    If Len(attachments) > 0 Then
      Dim attachmentArray: attachmentArray = Split(attachments, ";")
      Dim i
      For i = LBound(attachmentArray) To UBound(attachmentArray)
        Dim attachmentPath
        attachmentPath = Trim(attachmentArray(i))
        If attachmentPath <> "" Then
          MailItem.Attachments.Add attachmentPath
        End If
      Next
    End If

    MailItem.Display
    "#,
    subject,
    body.replace("\"", "\"\"").replace("\n", "\" & vbCrLf & \"").trim(),
    recipients,
    if !cc_recipients.is_empty() {
      format!("MailItem.CC = \"{}\"", cc_recipients.replace("\"", "\"\""))
    } else {
      "".to_string()
    },
    if !bcc_recipients.is_empty() {
      format!("MailItem.BCC = \"{}\"", bcc_recipients.replace("\"", "\"\""))
    } else {
      "".to_string()
    },
    if !attachments_joined.is_empty() {
      format!("Dim attachments: attachments = \"{}\"", attachments_joined.replace("\"", "\"\""))
    } else {
      "".to_string()
    }
  );

  let temp_vbs_path = "C:/mwd/scripts/CreateEmailDraft.vbs";
  write(&temp_vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(temp_vbs_path);
  cmd.output().expect("Failed to create new draft");
}

#[tauri::command]
fn attach_to_existing_email(attachments: String) {
  let vbs_script = format!(
    r#"
    Dim OutlookApp
    Set OutlookApp = CreateObject("Outlook.Application")
    Dim MailItem
    Set MailItem = OutlookApp.ActiveInspector.CurrentItem
    {}
    
    If Len(attachments) > 0 Then
      Dim attachmentArray: attachmentArray = Split(attachments, ";")
      Dim i
      For i = LBound(attachmentArray) To UBound(attachmentArray)
        Dim attachmentPath
        attachmentPath = Trim(attachmentArray(i))
        If attachmentPath <> "" Then
          MailItem.Attachments.Add attachmentPath
        End If
      Next
    End If

    MailItem.Display
    "#,
    if !attachments.is_empty() {
      format!("Dim attachments: attachments = \"{}\"", attachments.replace("\"", "\"\""))
    } else {
      "".to_string()
    }
  );

  let temp_vbs_path = "C:/mwd/scripts/AttachToExistingEmail.vbs";
  write(&temp_vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(temp_vbs_path);
  cmd.output().expect("Failed to attach files to the existing draft");
}

#[tauri::command]
fn convert_img_to_base64(pictures: Vec<String>) -> Result<Vec<Base64Picture>, String> {
  let mut base64_pictures = vec![];
  for pic in pictures {
    let data = match std::fs::read(&pic) {
      Ok(data) => data,
      Err(e) => return Err(format!("Error reading image data: {}", e)),
    };
    base64_pictures.push(Base64Picture { data: BASE64_STANDARD.encode(&data), path: pic });
  }
  Ok(base64_pictures)
}

#[tauri::command]
async fn upload_email_stuff_files(file_upload: FilesArgs) -> Result<(), String> {
  for file_data in file_upload.files {
    let decoded = BASE64_STANDARD.decode(&file_data.data).map_err(|e| e.to_string())?;
    let path = if file_upload.is_multifile {
      let new_dir = format!("\\\\MWD1-SERVER/Server/EmailAttachments/{}", file_upload.name);
      if std::fs::read_dir(new_dir.clone()).is_err() {
        let _ = std::fs::create_dir(new_dir.clone());
      }
      format!("{}/{}", new_dir, file_data.name)
    } else {
      format!("\\\\MWD1-SERVER/Server/EmailAttachments/{}", file_data.name)
    };
    std::fs::write(&path, decoded).map_err(|e| e.to_string())?;
  }
  Ok(())
}

#[tauri::command]
fn add_to_shipping_list(new_shipping_list_row: ShippingListRow) {
  let vbs_script = format!(
    r#"
    Dim ExcelApp, Workbook, ExcelSheet
    Set ExcelApp = CreateObject("Excel.Application")
    ExcelApp.Visible = False
    ExcelApp.DisplayAlerts = False

    Set Workbook = ExcelApp.Workbooks.Open("{}")
    Set ExcelSheet = Workbook.Sheets({})

    Dim LastRow
    LastRow = ExcelSheet.Cells.Find("{}").Offset(-1, 0).End(-4121).Row + 1

    ExcelSheet.Range("A" & LastRow).Insert
    ExcelSheet.Range("A" & LastRow).Value = "{}"
    ExcelSheet.Range("B" & LastRow).Value = "{}"
    ExcelSheet.Range("C" & LastRow).Value = "{}"
    ExcelSheet.Range("D" & LastRow).Value = "{}"
    ExcelSheet.Range("E" & LastRow).Value = "{}"
    ExcelSheet.Range("F" & LastRow).Value = "{}"
    ExcelSheet.Range("G" & LastRow).Value = "{}"
    ExcelSheet.Range("H" & LastRow).Value = "{}"
    ExcelSheet.Range("I" & LastRow).Value = "{}"
    ExcelSheet.Range("J" & LastRow).Value = "{}"
    ExcelSheet.Range("K" & LastRow).Value = "{}"
    ExcelSheet.Range("L" & LastRow).Value = "{}"
    ExcelSheet.Range("N" & LastRow).Value = "{}"
    ExcelSheet.Range("O" & LastRow).Value = "{}"
    ExcelSheet.Range("P" & LastRow).Value = "{}"
    ExcelSheet.Range("Q" & LastRow).Value = "{}"
    ExcelSheet.Range("R" & LastRow).Value = "{}"
    ExcelSheet.Range("S" & LastRow).Value = "{}"
    ExcelSheet.Range("T" & LastRow).Value = "{}"

    ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Font.Bold = False
    ExcelSheet.Range("A" & LastRow & ":U" & LastRow).HorizontalAlignment = -4131
    ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Interior.ColorIndex = -4142
    If ExcelSheet.Range("B" & LastRow).Text = "UPS Red" Then
      ExcelSheet.Range("B" & LastRow).Font.Color = RGB(255, 0, 0)
    End If

    Workbook.Save
    Workbook.Close
    ExcelApp.Quit
    "#,
    new_shipping_list_row.list_path,
    new_shipping_list_row.day,
    match new_shipping_list_row.ship_type.as_str() {
      "UPS" => "Inits",
      "Fedex" => "Fedex Small Pak",
      "Misc" => "Misc",
      "Will Call" => "Will Call",
      "Truck Line" => "Truck Lines",
      _ => "Inits",
    },
    new_shipping_list_row.initials,
    new_shipping_list_row.ship_via,
    new_shipping_list_row.customer,
    new_shipping_list_row.attn_to,
    new_shipping_list_row.part_num,
    new_shipping_list_row.desc,
    new_shipping_list_row.stock_num.clone().unwrap_or_else(|| "".to_string()),
    new_shipping_list_row.location.clone().unwrap_or_else(|| "".to_string()),
    if new_shipping_list_row.mp > 0 {new_shipping_list_row.mp.to_string()} else {"".to_string()},
    if new_shipping_list_row.br > 0 {new_shipping_list_row.br.to_string()} else {"".to_string()},
    if new_shipping_list_row.cap > 0 {new_shipping_list_row.cap.to_string()} else {"".to_string()},
    if new_shipping_list_row.fl > 0 {new_shipping_list_row.fl.to_string()} else {"".to_string()},
    if new_shipping_list_row.pulled {"x"} else {""},
    if new_shipping_list_row.packaged {"x"} else {""},
    if new_shipping_list_row.gone {"x"} else {""},
    if new_shipping_list_row.ready {"x"} else {""},
    if new_shipping_list_row.weight > 0 {new_shipping_list_row.weight.to_string()} else {"".to_string()},
    if new_shipping_list_row.dims == "0x0x0" {"".to_string()} else {new_shipping_list_row.dims},
    new_shipping_list_row.handwritten_id
  );

  let temp_vbs_path = "C:/mwd/scripts/UpdateShippingList.vbs";
  write(&temp_vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(temp_vbs_path);
  cmd.output().expect("Failed to update shipping list");
}

#[tauri::command]
fn upload_file(file_args: FileArgs) -> Result<(), String> {
  if !std::path::Path::new(&file_args.dir).exists() {
    if let Err(e) = std::fs::create_dir_all(&file_args.dir) {
        return Err(format!("Error creating directory: {}", e));
    }
  }
  let file_path = format!("{}/{}", file_args.dir, file_args.name);
  let _ = std::fs::write(file_path, &file_args.file).map_err(|e| e.to_string());
  Ok(())
}

#[tauri::command]
fn print_shipping_label(args: ShippingLabelArgs) -> Result<(), String> {
  let printer = "\\\\FRONT-DESK\\Zebra  ZP 450-200 dpi";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\shippingLabelTemplate.docx")

    Sub ReplaceTextAndColor(sheet, findText, replaceText)
      With sheet.Content.Find
        .Text = findText
        .Replacement.Text = replaceText
        .Wrap = 1
        .MatchWholeWord = True
        .Execute , , , , , , , , , , 2
      End With
    End Sub

    Call ReplaceTextAndColor(sheet1, "<SHIP_FROM_COMPANY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_FROM_ADDRESS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_FROM_ADDRESS_2>", {})
    Call ReplaceTextAndColor(sheet1, "<SHIP_FROM_CITY_STATE_ZIP>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_COMPANY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_ADDRESS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_ADDRESS_2>", {})
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_CITY_STATE_ZIP>", "{}")

    doc.ActivePrinter = "{}"
    sheet1.PrintOut , , , , , , , {}
    sheet1.Close False
    doc.Quit
    "#,
    args.shipFromCompany,
    args.shipFromAddress,
    args.shipFromAddress2,
    args.shipFromCityStateZip,
    args.shipToCompany,
    args.shipToAddress,
    args.shipToAddress2,
    args.shipToCityStateZip,
    printer,
    args.copies
  );

  let vbs_path = "C:\\MWD\\scripts\\generate_shipping_label.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  Ok(())
}

#[tauri::command]
fn print_cc_label(args: CCLabelArgs) -> Result<(), String> {
  let printer = "\\\\FRONT-DESK\\ZDesigner GC420d";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\ccLabelTemplate.docx")

    With sheet1.Content.Find
      .Text = "<CARD_NUM>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "<EXP_DATE>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "<CVV>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "<CARD_ZIP>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "<CARD_NAME>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "<CARD_ADDRESS>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With

    doc.ActivePrinter = "{}"
    sheet1.PrintOut , , , , , , , {}
    sheet1.Close False
    doc.Quit
    "#,
    args.cardNum,
    args.expDate,
    args.cvv,
    args.cardZip,
    args.cardName,
    args.cardAddress,
    printer,
    1
  );

  let vbs_path = "C:\\MWD\\scripts\\generate_cc_label.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update ccLabel");
  Ok(())
}

#[tauri::command]
fn print_bol(args: BOLArgs) -> Result<(), String> {
  let printer = "Brother HL-L5200DW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = True
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\BOLtemplate.docm")

    With sheet1.Content.Find
      .Text = "<SHIP_TO_COMPANY>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "<SHIP_TO_ADDRESS>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    If {} Then
      With sheet1.Content.Find
        .Text = "<SHIP_TO_ADDRESS_2>"
        .Execute
        If .Found Then
          Set findRange = .Parent
          findRange.Paragraphs(1).Range.Delete
        End If
      End With
    Else
      With sheet1.Content.Find
        .Text = "<SHIP_TO_ADDRESS_2>"
        .Replacement.Text = "{}"
        .Wrap = 1
        .Execute , , , , , , , , , , 2
      End With
    End If
    With sheet1.Content.Find
      .Text = "<SHIP_TO_CITY_STATE_ZIP>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "<SHIP_FROM_COMPANY>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "<SHIP_FROM_ADDRESS>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    If {} Then
      With sheet1.Content.Find
        .Text = "<SHIP_FROM_ADDRESS_2>"
        .Execute
        If .Found Then
          Set findRange = .Parent
          findRange.Paragraphs(1).Range.Delete
        End If
      End With
    Else
      With sheet1.Content.Find
        .Text = "<SHIP_FROM_ADDRESS_2>"
        .Replacement.Text = "{}"
        .Wrap = 1
        .Execute , , , , , , , , , , 2
      End With
    End If
    With sheet1.Content.Find
      .Text = "<SHIP_FROM_CITY_STATE_ZIP>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "<SHIP_VIA>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With

    Dim cc
    For Each cc In sheet1.ContentControls
      If cc.Tag = "prepaid" Then
        cc.Checked = {}
      ElseIf cc.Tag = "collect" Then
        cc.Checked = {}
      ElseIf cc.Tag = "3rdParty" Then
        cc.Checked = {}
      End If
    Next

    doc.ActivePrinter = "{}"
    "#,
    args.shipToCompany,
    args.shipToAddress,
    if args.shipToAddress2 == "" {"True"} else {"False"},
    args.shipToAddress2,
    args.shipToCityStateZip,
    args.shipFromCompany,
    args.shipFromAddress,
    if args.shipFromAddress2 == "" {"True"} else {"False"},
    args.shipFromAddress2,
    args.shipFromCityStateZip,
    args.shipVia,
    if args.prepaid {"True"} else {"False"},
    if args.collect {"True"} else {"False"},
    if args.thirdParty {"True"} else {"False"},
    printer
  );

  let vbs_path = "C:\\MWD\\scripts\\generate_bol.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  Ok(())
}

#[tauri::command]
fn print_accounting_invoice(args: AccountingInvoiceArgs) -> Result<(), String> {
  let printer = "Brother HL-L5200DW series";
  let json_data = to_string(&args.items).unwrap();
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\handwrittenAccountingTemplate.docx")

    Sub ReplaceAndSetColor(sheet, findText, replaceText)
      If Len(replaceText) > 0 Then
        If InStr(replaceText, "ADDRESS 2") > 0 Then
          With sheet.Content.Find
            .Text = findText
            .Replacement.Text = replaceText
            .Wrap = 1
            .MatchWholeWord = True
            .Execute , , , , , , , , , , 2
          End With
        Else
          With sheet.Content.Find
            .Text = findText
            .Replacement.Text = replaceText
            .Replacement.Font.Color = 0
            .Wrap = 1
            .MatchWholeWord = True
            .Execute , , , , , , , , , , 2
          End With
        End If

        Dim footer
        Set footer = sheet.Sections(1).Footers(1)
        With footer.Range.Find
          .Text = findText
          .Replacement.Text = replaceText
          .Replacement.Font.Color = 0
          .Wrap = 1
          .MatchWholeWord = True
          .Execute , , , , , , , , , , 2
        End With
      End If
    End Sub

    Call ReplaceAndSetColor(sheet1, "BILL TO COMPANY", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO ADDRESS", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL_TO_ADDRESS_2", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO CITY", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO STATE", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO ZIP", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO COUNTRY", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO COMPANY", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO ADDRESS", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP_TO_ADDRESS_2", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO CITY", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO STATE", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO ZIP", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO CONTACT", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO COUNTRY", "{}")
    Call ReplaceAndSetColor(sheet1, "ACCOUNT NUMBER", "{}")
    Call ReplaceAndSetColor(sheet1, "PAYMENT TYPE", "{}")
    Call ReplaceAndSetColor(sheet1, "CREATED_BY", "{}")
    Call ReplaceAndSetColor(sheet1, "SOLD_BY", "{}")
    Call ReplaceAndSetColor(sheet1, "INVOICE#", "{}")
    Call ReplaceAndSetColor(sheet1, "INVOICE DATE", "{}")
    Call ReplaceAndSetColor(sheet1, "CONTACT NAME", "{}")
    Call ReplaceAndSetColor(sheet1, "PO#", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP VIA", "{}")
    Call ReplaceAndSetColor(sheet1, "INVOICE NOTES", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIPPING NOTES", "{}")
    Call ReplaceAndSetColor(sheet1, "HANDWRITTEN_TOTAL", "{}")

    Dim cc
    For Each cc In sheet1.ContentControls
      If cc.Tag = "taxable" Then
        cc.Checked = {}
      ElseIf cc.Tag = "blind" Then
        cc.Checked = {}
      ElseIf cc.Tag = "npi" Then
        cc.Checked = {}
      ElseIf cc.Tag = "collect" Then
        cc.Checked = {}
      ElseIf cc.Tag = "3rdParty" Then
        cc.Checked = {}
      ElseIf cc.Tag = "setup" Then
        cc.Checked = {}
      End If
    Next

    Dim handwrittenItems, jsonData, item, table, row, i
    jsonData = {:?}

    If Len(jsonData) > 2 Then
      Dim items
      items = Split(jsonData, "}},")
      Set table = sheet1.Tables(1)

      For i = LBound(items) To UBound(items)
        Dim fields, keyValue, j
        If i > 0 Or table.Rows.Count = 1 Then
          table.Rows.Add
        End If

        Set row = table.Rows(table.Rows.Count)
        fields = Split(items(i), ",")

        For j = LBound(fields) To UBound(fields)
          keyValue = Split(fields(j), ":")
          keyValue(0) = Replace(keyValue(0), "[{{", "")
          keyValue(0) = Replace(keyValue(0), "{{", "")
          If UBound(keyValue) >= 1 Then
            keyValue(1) = Replace(keyValue(1), "}}]", "")
          End If

          Select Case keyValue(0)
            Case "cost"
              Dim cost
              cost = keyValue(1)
              cost = Replace(cost, "|", ",")
              row.Cells(1).Range.Text = cost
              row.Cells(1).Range.Font.Bold = False
            Case "qty"
              row.Cells(2).Range.Text = keyValue(1)
            Case "partNum"
              row.Cells(3).Range.Text = keyValue(1)
            Case "desc"
              row.Cells(4).Range.Text = keyValue(1)
            Case "stockNum"
              row.Cells(5).Range.Text = keyValue(1)
            Case "location"
              row.Cells(6).Range.Text = keyValue(1)
            Case "unitPrice"
              Dim unitPrice
              unitPrice = keyValue(1)
              unitPrice = Replace(unitPrice, "|", ",")
              row.Cells(7).Range.Text = unitPrice
            Case "total"
              Dim total
              total = keyValue(1)
              total = Replace(total, "|", ",")
              row.Cells(8).Range.Text = total
          End Select
        Next
      Next
    End If

    doc.ActivePrinter = "{}"
    sheet1.PrintOut
    sheet1.Close False
    doc.Quit
    "#,
    args.billToCompany,
    args.billToAddress,
    if args.billToAddress2 != "" {args.billToAddress2} else {"BILL TO ADDRESS 2".to_string()},
    args.billToCity,
    args.billToState,
    args.billToZip,
    args.billToCountry,
    args.shipToCompany,
    args.shipToAddress,
    if args.shipToAddress2 != "" {args.shipToAddress2} else {"SHIP TO ADDRESS 2".to_string()},
    args.shipToCity,
    args.shipToState,
    args.shipToZip,
    args.shipToContact,
    args.shipToCountry,
    args.accountNum,
    args.paymentType,
    args.createdBy,
    args.soldBy,
    args.handwrittenId,
    args.date,
    args.contact,
    args.poNum,
    args.shipVia,
    args.invoiceNotes,
    args.shippingNotes,
    args.handwrittenTotal,
    if args.taxable {"True"} else {"False"},
    if args.blind {"True"} else {"False"},
    if args.npi {"True"} else {"False"},
    if args.collect {"True"} else {"False"},
    if args.thirdParty {"True"} else {"False"},
    if args.setup {"True"} else {"False"},
    json_data.replace("\"", "").replace("\\", ""),
    printer
  );

  let vbs_path = "C:\\MWD\\scripts\\generate_accounting_invoice.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update content");
  Ok(())
}

#[tauri::command]
fn print_shipping_invoice(args: ShippingInvoiceArgs) -> Result<(), String> {
  let printer = "\\\\JIM-PC\\HP LaserJet Pro M402-M403 n-dne PCL 6";
  let json_data = to_string(&args.items).unwrap();
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\handwrittenShippingTemplate.docx")

    Sub ReplaceAndSetColor(sheet, findText, replaceText)
      If Len(replaceText) > 0 Then
        If InStr(replaceText, "ADDRESS 2") > 0 Then
          With sheet.Content.Find
            .Text = findText
            .Replacement.Text = replaceText
            .Wrap = 1
            .MatchWholeWord = True
            .Execute , , , , , , , , , , 2
          End With
        Else
          With sheet.Content.Find
            .Text = findText
            .Replacement.Text = replaceText
            .Replacement.Font.Color = 0
            .Wrap = 1
            .MatchWholeWord = True
            .Execute , , , , , , , , , , 2
          End With
        End If

        Dim footer
        Set footer = sheet.Sections(1).Footers(1)
        With footer.Range.Find
          .Text = findText
          .Replacement.Text = replaceText
          .Replacement.Font.Color = 0
          .Wrap = 1
          .MatchWholeWord = True
          .Execute , , , , , , , , , , 2
        End With
      End If
    End Sub

    Call ReplaceAndSetColor(sheet1, "BILL TO COMPANY", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO ADDRESS", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL_TO_ADDRESS_2", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO CITY", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO STATE", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO ZIP", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO COUNTRY", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO COMPANY", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO ADDRESS", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP_TO_ADDRESS_2", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO CITY", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO STATE", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO ZIP", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO CONTACT", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO COUNTRY", "{}")
    Call ReplaceAndSetColor(sheet1, "ACCOUNT NUMBER", "{}")
    Call ReplaceAndSetColor(sheet1, "PAYMENT TYPE", "{}")
    Call ReplaceAndSetColor(sheet1, "CREATED_BY", "{}")
    Call ReplaceAndSetColor(sheet1, "SOLD_BY", "{}")
    Call ReplaceAndSetColor(sheet1, "INVOICE#", "{}")
    Call ReplaceAndSetColor(sheet1, "INVOICE DATE", "{}")
    Call ReplaceAndSetColor(sheet1, "CONTACT NAME", "{}")
    Call ReplaceAndSetColor(sheet1, "PO#", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP VIA", "{}")
    Call ReplaceAndSetColor(sheet1, "INVOICE NOTES", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIPPING NOTES", "{}")
    Call ReplaceAndSetColor(sheet1, "Mousepads", "{}")
    Call ReplaceAndSetColor(sheet1, "Hats", "{}")
    Call ReplaceAndSetColor(sheet1, "Brochures", "{}")
    Call ReplaceAndSetColor(sheet1, "Flashlights", "{}")

    Dim cc
    For Each cc In sheet1.ContentControls
      If cc.Tag = "taxable" Then
        cc.Checked = {}
      ElseIf cc.Tag = "blind" Then
        cc.Checked = {}
      ElseIf cc.Tag = "npi" Then
        cc.Checked = {}
      ElseIf cc.Tag = "collect" Then
        cc.Checked = {}
      ElseIf cc.Tag = "3rdParty" Then
        cc.Checked = {}
      ElseIf cc.Tag = "setup" Then
        cc.Checked = {}
      End If
    Next

    Dim handwrittenItems, jsonData, item, table, row, i
    jsonData = {:?}

    If Len(jsonData) > 2 Then
      Dim items
      items = Split(jsonData, "}},")
      Set table = sheet1.Tables(1)

      For i = LBound(items) To UBound(items)
        Dim fields, keyValue, j
        If i > 0 Or table.Rows.Count = 1 Then
          table.Rows.Add
        End If

        Set row = table.Rows(table.Rows.Count)
        fields = Split(items(i), ",")

        For j = LBound(fields) To UBound(fields)
          keyValue = Split(fields(j), ":")
          keyValue(0) = Replace(keyValue(0), "[{{", "")
          keyValue(0) = Replace(keyValue(0), "{{", "")
          If UBound(keyValue) >= 1 Then
            keyValue(1) = Replace(keyValue(1), "}}]", "")
          End If

          Select Case keyValue(0)
            Case "cost"
              Dim cost
              cost = keyValue(1)
              cost = Replace(cost, "|", ",")
              row.Cells(1).Range.Text = cost
              row.Cells(1).Range.Font.Bold = False
            Case "qty"
              row.Cells(2).Range.Text = keyValue(1)
            Case "partNum"
              row.Cells(3).Range.Text = keyValue(1)
            Case "desc"
              row.Cells(4).Range.Text = keyValue(1)
            Case "stockNum"
              row.Cells(5).Range.Text = keyValue(1)
            Case "location"
              row.Cells(6).Range.Text = keyValue(1)
            Case "unitPrice"
              Dim unitPrice
              unitPrice = keyValue(1)
              unitPrice = Replace(unitPrice, "|", ",")
              row.Cells(7).Range.Text = unitPrice
            Case "total"
              Dim total
              total = keyValue(1)
              total = Replace(total, "|", ",")
              row.Cells(8).Range.Text = total
          End Select
        Next
      Next
    End If

    doc.ActivePrinter = "{}"
    sheet1.PrintOut
    sheet1.Close False
    doc.Quit
    "#,
    args.billToCompany,
    args.billToAddress,
    if args.billToAddress2 != "" {args.billToAddress2} else {"BILL TO ADDRESS 2".to_string()},
    args.billToCity,
    args.billToState,
    args.billToZip,
    args.billToCountry,
    args.shipToCompany,
    args.shipToAddress,
    if args.shipToAddress2 != "" {args.shipToAddress2} else {"SHIP TO ADDRESS 2".to_string()},
    args.shipToCity,
    args.shipToState,
    args.shipToZip,
    args.shipToContact,
    args.shipToCountry,
    args.accountNum,
    args.paymentType,
    args.createdBy,
    args.soldBy,
    args.handwrittenId,
    args.date,
    args.contact,
    args.poNum,
    args.shipVia,
    args.invoiceNotes,
    args.shippingNotes,
    args.mp,
    args.cap,
    args.br,
    args.fl,
    if args.taxable {"True"} else {"False"},
    if args.blind {"True"} else {"False"},
    if args.npi {"True"} else {"False"},
    if args.collect {"True"} else {"False"},
    if args.thirdParty {"True"} else {"False"},
    if args.setup {"True"} else {"False"},
    json_data.replace("\"", "").replace("\\", ""),
    printer
  );

  let vbs_path = "C:\\MWD\\scripts\\generate_shipping_invoice.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update content");
  Ok(())
}

#[tauri::command]
fn print_core_invoice(args: AccountingInvoiceArgs) -> Result<(), String> {
  let printer = "Brother HL-L5200DW series";
  let json_data = to_string(&args.items).unwrap();
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\handwrittenCoreTemplate.docx")

    Sub ReplaceAndSetColor(sheet, findText, replaceText)
      If Len(replaceText) > 0 Then
        If InStr(replaceText, "ADDRESS 2") > 0 Then
          With sheet.Content.Find
            .Text = findText
            .Replacement.Text = replaceText
            .Wrap = 1
            .MatchWholeWord = True
            .Execute , , , , , , , , , , 2
          End With
        Else
          With sheet.Content.Find
            .Text = findText
            .Replacement.Text = replaceText
            .Replacement.Font.Color = 0
            .Wrap = 1
            .MatchWholeWord = True
            .Execute , , , , , , , , , , 2
          End With
        End If

        Dim footer
        Set footer = sheet.Sections(1).Footers(1)
        With footer.Range.Find
          .Text = findText
          .Replacement.Text = replaceText
          .Replacement.Font.Color = 0
          .Wrap = 1
          .MatchWholeWord = True
          .Execute , , , , , , , , , , 2
        End With
      End If
    End Sub

    Call ReplaceAndSetColor(sheet1, "BILL TO COMPANY", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO ADDRESS", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL_TO_ADDRESS_2", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO CITY", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO STATE", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO ZIP", "{}")
    Call ReplaceAndSetColor(sheet1, "BILL TO COUNTRY", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO COMPANY", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO ADDRESS", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP_TO_ADDRESS_2", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO CITY", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO STATE", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO ZIP", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO CONTACT", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP TO COUNTRY", "{}")
    Call ReplaceAndSetColor(sheet1, "ACCOUNT NUMBER", "{}")
    Call ReplaceAndSetColor(sheet1, "PAYMENT TYPE", "{}")
    Call ReplaceAndSetColor(sheet1, "CREATED_BY", "{}")
    Call ReplaceAndSetColor(sheet1, "SOLD_BY", "{}")
    Call ReplaceAndSetColor(sheet1, "INVOICE#", "{}")
    Call ReplaceAndSetColor(sheet1, "INVOICE DATE", "{}")
    Call ReplaceAndSetColor(sheet1, "CONTACT NAME", "{}")
    Call ReplaceAndSetColor(sheet1, "PO#", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIP VIA", "{}")
    Call ReplaceAndSetColor(sheet1, "INVOICE NOTES", "{}")
    Call ReplaceAndSetColor(sheet1, "SHIPPING NOTES", "{}")
    Call ReplaceAndSetColor(sheet1, "HANDWRITTEN_TOTAL", "{}")

    Dim cc
    For Each cc In sheet1.ContentControls
      If cc.Tag = "taxable" Then
        cc.Checked = {}
      ElseIf cc.Tag = "blind" Then
        cc.Checked = {}
      ElseIf cc.Tag = "npi" Then
        cc.Checked = {}
      ElseIf cc.Tag = "collect" Then
        cc.Checked = {}
      ElseIf cc.Tag = "3rdParty" Then
        cc.Checked = {}
      ElseIf cc.Tag = "setup" Then
        cc.Checked = {}
      End If
    Next

    Dim handwrittenItems, jsonData, item, table, row, i
    jsonData = {:?}

If Len(jsonData) > 2 Then
      Dim items
      items = Split(jsonData, "}},")
      Set table = sheet1.Tables(1)

      For i = LBound(items) To UBound(items)
        Dim fields, keyValue, j
        If i > 0 Or table.Rows.Count = 1 Then
          table.Rows.Add
        End If

        Set row = table.Rows(table.Rows.Count)
        fields = Split(items(i), ",")

        For j = LBound(fields) To UBound(fields)
          keyValue = Split(fields(j), ":")
          keyValue(0) = Replace(keyValue(0), "[{{", "")
          keyValue(0) = Replace(keyValue(0), "{{", "")
          If UBound(keyValue) >= 1 Then
            keyValue(1) = Replace(keyValue(1), "}}]", "")
          End If

          Select Case keyValue(0)
            Case "cost"
              Dim cost
              cost = keyValue(1)
              cost = Replace(cost, "|", ",")
              row.Cells(1).Range.Text = cost
              row.Cells(1).Range.Font.Bold = False
            Case "qty"
              row.Cells(2).Range.Text = keyValue(1)
            Case "partNum"
              row.Cells(3).Range.Text = keyValue(1)
            Case "desc"
              row.Cells(4).Range.Text = keyValue(1)
            Case "stockNum"
              row.Cells(5).Range.Text = keyValue(1)
            Case "location"
              row.Cells(6).Range.Text = keyValue(1)
            Case "unitPrice"
              Dim unitPrice
              unitPrice = keyValue(1)
              unitPrice = Replace(unitPrice, "|", ",")
              row.Cells(7).Range.Text = unitPrice
            Case "total"
              Dim total
              total = keyValue(1)
              total = Replace(total, "|", ",")
              row.Cells(8).Range.Text = total
          End Select
        Next
      Next
    End If

    doc.ActivePrinter = "{}"
    sheet1.PrintOut
    sheet1.Close False
    doc.Quit
    "#,
    args.billToCompany,
    args.billToAddress,
    if args.billToAddress2 != "" {args.billToAddress2} else {"BILL TO ADDRESS 2".to_string()},
    args.billToCity,
    args.billToState,
    args.billToZip,
    args.billToCountry,
    args.shipToCompany,
    args.shipToAddress,
    if args.shipToAddress2 != "" {args.shipToAddress2} else {"SHIP TO ADDRESS 2".to_string()},
    args.shipToCity,
    args.shipToState,
    args.shipToZip,
    args.shipToContact,
    args.shipToCountry,
    args.accountNum,
    args.paymentType,
    args.createdBy,
    args.soldBy,
    args.handwrittenId,
    args.date,
    args.contact,
    args.poNum,
    args.shipVia,
    args.invoiceNotes,
    args.shippingNotes,
    args.handwrittenTotal,
    if args.taxable {"True"} else {"False"},
    if args.blind {"True"} else {"False"},
    if args.npi {"True"} else {"False"},
    if args.collect {"True"} else {"False"},
    if args.thirdParty {"True"} else {"False"},
    if args.setup {"True"} else {"False"},
    json_data.replace("\"", "").replace("\\", ""),
    printer
  );

  let vbs_path = "C:\\MWD\\scripts\\generate_core_invoice.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update content");
  Ok(())
}

#[tauri::command]
fn print_ci(args: CIArgs) -> Result<(), String> {
  let printer = "Brother MFC-L3770CDW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = True
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\COMINVtemplate.docm")

    Sub ReplaceAndSetColor(sheet, findText, replaceText)
      With sheet.Content.Find
        .Text = findText
        .Replacement.Text = replaceText
        .Wrap = 1
        .MatchWholeWord = True
        .Execute , , , , , , , , , , 2
      End With
    End Sub

    Call ReplaceAndSetColor(sheet1, "<SHIP_TO_COMPANY>", "{}")
    Call ReplaceAndSetColor(sheet1, "<SHIP_TO_ADDRESS_2>", "{}")
    Call ReplaceAndSetColor(sheet1, "<SHIP_TO_ADDRESS>", "{}")
    Call ReplaceAndSetColor(sheet1, "<CITY_STATE_ZIP>", "{}")
    Call ReplaceAndSetColor(sheet1, "<DATE>", "{}")
    Call ReplaceAndSetColor(sheet1, "<PO>", "{}")

    doc.ActivePrinter = "{}"
    "#,
    args.company,
    args.address2,
    args.address,
    args.cityStateZip,
    args.date,
    args.po,
    printer
  );

  let vbs_path = "C:\\MWD\\scripts\\generate_ci_template.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  Ok(())
}

#[tauri::command]
fn print_coo() -> Result<(), String> {
  let printer = "Brother MFC-L3770CDW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\CERTOOtemplate.docm")
    doc.ActivePrinter = "{}"
    "#,
    printer,
  );

  let vbs_path = "C:\\MWD\\scripts\\generate_coo_template.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  Ok(())
}

#[tauri::command]
fn _print_part_tag(args: PartTagArgs) -> Result<(), String> {
  let printer = "ZDesigner GC420d (EPL)";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\part_tag_template.rtf")

    Sub ReplaceAndSetColor(sheet, findText, replaceText)
      With sheet.Content.Find
        .Text = findText
        .Replacement.Text = replaceText
        .Wrap = 1
        .MatchWholeWord = True
        .Execute , , , , , , , , , , 2
      End With
    End Sub

    Sub ReplaceTextInShapes(sheet, findText, replaceText)
      Dim shape
      For Each shape In sheet.Shapes
        If Not shape.TextFrame Is Nothing Then
          If shape.TextFrame.HasText Then
            With shape.TextFrame.TextRange.Find
              .Text = findText
              .Replacement.Text = replaceText
              .Wrap = 1
              .MatchWholeWord = True
              .Execute , , , , , , , , , , 2
            End With
          End If
        If InStr(shape.TextFrame.TextRange.Text, replaceText) > 0 Then
          If findText = "<STOCK_NUM>" Then
            shape.TextFrame.TextRange.Font.Name = "IDAutomationHC39M Free Version"
          End If
        End If
        End If
      Next
    End Sub

    Sub ReplaceTextAndFont(sheet, findText, replaceText, fontName)
      With sheet.Content.Find
        .Text = findText
        .Replacement.Text = replaceText
        .Replacement.Font.Name = fontName
        .Wrap = 1
        .MatchWholeWord = True
        .Execute , , , , , , , , , , 2
      End With

      Dim shape
      For Each shape In sheet.Shapes
        If Not shape.TextFrame Is Nothing Then
          If shape.TextFrame.HasText Then
            With shape.TextFrame.TextRange.Find
              .Text = findText
              .Replacement.Text = replaceText
              .Replacement.Font.Name = fontName
              .Wrap = 1
              .MatchWholeWord = True
              .Execute , , , , , , , , , , 2
            End With
          End If
        End If
      Next
    End Sub

Sub HideAllImages(sheet, hasPictures)
    Dim shape
    ' Hide all Shapes (if the image is a Shape)
    For Each shape In sheet.Shapes
        If shape.Type = msoPicture Then
            shape.Visible = Not hasPictures
        End If
    Next

    Dim inlineShape
    ' Hide all InlineShapes (if the image is an InlineShape)
    For Each inlineShape In sheet.InlineShapes
        inlineShape.Range.Font.Hidden = hasPictures
    Next
End Sub

    Call ReplaceAndSetColor(sheet1, "<STOCK_NUM>", "{}")
    Call ReplaceTextAndFont(sheet1, "<BARCODE>", "*{}*", "IDAutomationHC39M Free Version")
    Call ReplaceTextInShapes(sheet1, "<MODEL>", "{}")
    Call ReplaceTextInShapes(sheet1, "<SERIAL_NUM>", "{}")
    Call ReplaceTextInShapes(sheet1, "<HP>", "{}")
    Call ReplaceTextInShapes(sheet1, "<LOCATION>", "{}")
    Call ReplaceTextInShapes(sheet1, "<REMARKS>", "{}")
    Call ReplaceAndSetColor(sheet1, "<DATE>", "{}")
    Call ReplaceAndSetColor(sheet1, "<PART_NUM>", "{}")
    Call ReplaceAndSetColor(sheet1, "<RATING>", "{}")
    Call HideAllImages(sheet1, {})

    doc.ActivePrinter = "{}"
    sheet1.PrintOut , , , , , , , {}
    sheet1.Close False
    doc.Quit
    "#,
    args.stockNum,
    args.stockNum,
    args.model,
    args.serialNum,
    args.hp,
    args.location,
    args.remarks,
    args.date,
    args.partNum,
    args.rating,
    if args.hasPictures { "True" } else { "False" },
    printer,
    args.copies
  );

  let vbs_path = "C:\\MWD\\scripts\\print_part_tag.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  Ok(())
}

#[tauri::command]
fn print_return(args: PrintReturnArgs) -> Result<(), String> {
  let printer = "Brother MFC-L3770CDW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\returnTemplate.rtf")

    Sub ReplaceTextAndColor(sheet, findText, replaceText)
      With sheet.Content.Find
        .Text = findText
        .Replacement.Text = replaceText
        .Wrap = 1
        .MatchWholeWord = True
        .Execute , , , , , , , , , , 2
      End With
    End Sub

    Sub ReplaceTextInShapes(sheet, findText, replaceText)
      Dim shape
      For Each shape In sheet.Shapes
        If Not shape.TextFrame Is Nothing Then
          If shape.TextFrame.HasText Then
            With shape.TextFrame.TextRange.Find
              .Text = findText
              .Replacement.Text = replaceText
              .Wrap = 1
              .MatchWholeWord = True
              .Execute , , , , , , , , , , 2
            End With
          End If
        End If
      Next
    End Sub

    Call ReplaceTextAndColor(sheet1, "<CREATED_BY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<DATE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<PO_NUM>", "{}")
    Call ReplaceTextAndColor(sheet1, "<ID>", "{}")
    Call ReplaceTextAndColor(sheet1, "<INVOICE_DATE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_COMPANY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_COMPANY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_ADDRESS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_CITY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_STATE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_ZIP>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_PHONE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<DATE_CALLED>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SALESMAN>", "{}")
    Call ReplaceTextInShapes(sheet1, "<RETURN_REASON>", "{}")
    Call ReplaceTextInShapes(sheet1, "<RETURN_NOTES>", "{}")
    Call ReplaceTextInShapes(sheet1, "<RETURN_PAYMENT_TERMS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<PAYMENT>", "{}")
    Call ReplaceTextAndColor(sheet1, "<RESTOCK_FEE>", "{}")

    Dim jsonData, item, table, row, i
    jsonData = {:?}

    If Len(jsonData) > 2 Then
      Dim items
      items = Split(jsonData, "}},")
      Set table = sheet1.Tables(1)

      For i = LBound(items) To UBound(items)
        Dim fields, keyValue, j
        If i > 0 Or table.Rows.Count = 1 Then
          table.Rows.Add
        End If

        Set row = table.Rows(table.Rows.Count)
        fields = Split(items(i), ",")

        For j = LBound(fields) To UBound(fields)
          keyValue = Split(fields(j), ":")
          keyValue(0) = Replace(keyValue(0), "[{{", "")
          keyValue(0) = Replace(keyValue(0), "{{", "")
          If UBound(keyValue) >= 1 Then
            keyValue(1) = Replace(keyValue(1), "}}]", "")
          End If

          Select Case keyValue(0)
            Case "cost"
              Dim cost
              cost = keyValue(1)
              cost = Replace(cost, "|", ",")
              row.Cells(1).Range.Text = cost
              row.Cells(1).Range.Font.Bold = False
            Case "stockNum"
              row.Cells(2).Range.Text = keyValue(1)
            Case "qty"
              row.Cells(3).Range.Text = keyValue(1)
            Case "partNum"
              row.Cells(4).Range.Text = keyValue(1)
            Case "desc"
              row.Cells(5).Range.Text = keyValue(1)
            Case "unitPrice"
              Dim unitPrice
              unitPrice = keyValue(1)
              unitPrice = Replace(unitPrice, "|", ",")
              row.Cells(6).Range.Text = unitPrice
            Case "total"
              Dim total
              total = keyValue(1)
              total = Replace(total, "|", ",")
              row.Cells(7).Range.Text = total
          End Select
        Next
      Next
    End If

    doc.ActivePrinter = "{}"
    sheet1.PrintOut , , , , , , , {}
    sheet1.Close False
    doc.Quit
    "#,
    args.createdBy,
    args.date,
    args.poNum,
    args.id,
    args.invoiceDate,
    args.billToCompany,
    args.shipToCompany,
    args.billToAddress,
    args.billToCity,
    args.billToState,
    args.billToZip,
    args.billToPhone,
    args.dateCalled,
    args.salesman,
    args.returnReason,
    args.returnNotes,
    args.returnPaymentTerms,
    args.payment,
    args.restockFee,
    args.items.replace("\"", "").replace("\\", ""),
    printer,
    1
  );

  let vbs_path = "C:\\MWD\\scripts\\print_return.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  Ok(())
}

#[tauri::command]
fn print_warranty(args: PrintWarrantyArgs) -> Result<(), String> {
  let printer = "Brother MFC-L3770CDW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\warrantyTemplate.docx")

    Sub ReplaceTextAndColor(sheet, findText, replaceText)
      If InStr(replaceText, "Claim Completed") > 0 Then
        With sheet.Content.Find
          .Text = findText
          .Replacement.Text = replaceText
          .Replacement.Font.Color = RGB(214, 0, 0)
          .Wrap = 1
          .MatchWholeWord = True
          .Execute , , , , , , , , , , 2
        End With
      Else
        With sheet.Content.Find
          .Text = findText
          .Replacement.Text = replaceText
          .Wrap = 1
          .MatchWholeWord = True
          .Execute , , , , , , , , , , 2
        End With
      End If
    End Sub

    Sub ReplaceTextInShapes(sheet, findText, replaceText)
      Dim footer
      Set footer = sheet.Sections(1).Footers(1)
      Dim shape
      Dim parts
      Dim part
      Dim i
      parts = Split(replaceText, "|||")

      For Each shape In footer.Range.ShapeRange
        If Not shape.TextFrame Is Nothing Then
          If shape.TextFrame.HasText Then
            For i = 0 To UBound(parts)
              part = Trim(parts(i))
              If i < UBound(parts) Then
                part = part & Chr(11) & findText
              End If

              With shape.TextFrame.TextRange.Find
                .Text = findText
                .Replacement.Text = part
                .Wrap = 1
                .MatchWholeWord = True
                .Execute , , , , , , , , , , 2
              End With
            Next
          End If
        End If
      Next
    End Sub

    Call ReplaceTextAndColor(sheet1, "<VENDOR>", "{}")
    Call ReplaceTextAndColor(sheet1, "<CREATED_DATE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<ID>", "{}")
    Call ReplaceTextAndColor(sheet1, "<VENDOR_WARRANTY_ID>", "{}")
    Call ReplaceTextAndColor(sheet1, "Claim Completed: <DATE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_ADDRESS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_ADDRESS>", "{}")
    Call ReplaceTextInShapes(sheet1, "<REASON>", Replace("{}", "…", ""))
    Call ReplaceTextInShapes(sheet1, "<PAYMENT_TERMS>", "{}")
    Call ReplaceTextInShapes(sheet1, "<RESTOCK_FEE>", "{}")
    Call ReplaceTextInShapes(sheet1, "<VENDOR_REPORT>", Replace("{}", "…", ""))

    Dim jsonData, item, table, row, i
    jsonData = {:?}

    If Len(jsonData) > 2 Then
      Dim items
      items = Split(jsonData, "}},")
      Set table = sheet1.Tables(1)

      For i = LBound(items) To UBound(items)
        Dim fields, keyValue, j
        If i > 0 Or table.Rows.Count = 1 Then
          table.Rows.Add
        End If

        Set row = table.Rows(table.Rows.Count)
        fields = Split(items(i), ",")

        For j = LBound(fields) To UBound(fields)
          keyValue = Split(fields(j), ":")
          keyValue(0) = Replace(keyValue(0), "[{{", "")
          keyValue(0) = Replace(keyValue(0), "{{", "")
          If UBound(keyValue) >= 1 Then
            keyValue(1) = Replace(keyValue(1), "}}]", "")
          End If

          Select Case keyValue(0)
            Case "qty"
              row.Cells(1).Range.Text = keyValue(1)
              row.Cells(1).Range.Font.Bold = False
            Case "partNum"
              row.Cells(2).Range.Text = keyValue(1)
            Case "desc"
              row.Cells(3).Range.Text = keyValue(1)
            Case "stockNum"
              row.Cells(4).Range.Text = keyValue(1)
            Case "cost"
              Dim cost
              cost = keyValue(1)
              cost = Replace(cost, "|", ",")
              row.Cells(5).Range.Text = cost
            Case "price"
              Dim price
              price = keyValue(1)
              price = Replace(price, "|", ",")
              row.Cells(6).Range.Text = price
            Case "hasVendorReplacedPart"
              If LCase(Trim(keyValue(1))) = "true" Then
                row.Cells(7).Range.Text = ChrW(&H2705)
              Else
                row.Cells(7).Range.Text = ChrW(&H274C)
              End If
            Case "isCustomerCredited"
              If LCase(Trim(keyValue(1))) = "true" Then
                row.Cells(8).Range.Text = ChrW(&H2705)
              Else
                row.Cells(8).Range.Text = ChrW(&H274C)
              End If
            Case "vendorCredit"
              Dim vendorCredit
              vendorCredit = keyValue(1)
              vendorCredit = Replace(vendorCredit, "|", ",")
              row.Cells(9).Range.Text = vendorCredit
          End Select
        Next
      Next
    End If

    doc.ActivePrinter = "{}"
    sheet1.PrintOut , , , , , , , {}
    sheet1.Close False
    doc.Quit
    "#,
    args.vendor,
    args.createdDate,
    args.id,
    args.vendorWarrantyId,
    args.completed,
    args.billToAddress,
    args.shipToAddress,
    args.claimReason,
    args.paymentTerms,
    args.restockFee,
    args.vendorReport,
    args.items.replace("\"", "").replace("\\", ""),
    printer,
    1
  );

  let vbs_path = "C:\\MWD\\scripts\\print_warranty.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  Ok(())
}

#[tauri::command]
fn print_packing_slip(args: PrintPackingSlipArgs) -> Result<(), String> {
  let printer = "Brother MFC-L3770CDW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\packingSlipTemplate.docx")

    Sub ReplaceTextAndColor(sheet, findText, replaceText)
      With sheet.Content.Find
        .Text = findText
        .Replacement.Text = replaceText
        .Wrap = 1
        .MatchWholeWord = True
        .Execute , , , , , , , , , , 2
      End With
    End Sub

    Call ReplaceTextAndColor(sheet1, "<INVOICE_DATE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<PO_NUM>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_COMPANY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_ADDRESS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_ADDRESS_2>", {})
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_CITY_STATE_ZIP>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_COMPANY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_CONTACT>", {})
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_ADDRESS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_ADDRESS_2>", {})
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_CITY_STATE_ZIP>", "{}")

    Dim jsonData, item, table, row, i
    jsonData = {:?}

    If Len(jsonData) > 2 Then
      Dim items
      items = Split(jsonData, "}},")
      Set table = sheet1.Tables(1)

      For i = LBound(items) To UBound(items)
        Dim fields, keyValue, j
        If i > 0 Or table.Rows.Count = 1 Then
          table.Rows.Add
        End If

        Set row = table.Rows(table.Rows.Count)
        fields = Split(items(i), ",")

        For j = LBound(fields) To UBound(fields)
          keyValue = Split(fields(j), ":")
          keyValue(0) = Replace(keyValue(0), "[{{", "")
          keyValue(0) = Replace(keyValue(0), "{{", "")
          If UBound(keyValue) >= 1 Then
            keyValue(1) = Replace(keyValue(1), "}}]", "")
          End If

          Select Case keyValue(0)
            Case "qty"
              row.Cells(1).Range.Text = keyValue(1)
              row.Cells(1).Range.Font.Bold = False
            Case "partNum"
              row.Cells(2).Range.Text = keyValue(1)
            Case "desc"
              row.Cells(3).Range.Text = keyValue(1)
            Case "price"
              If keyValue(1) = "-9999" Then
                If row.Parent.Columns.Count >= 4 Then row.Parent.Columns(4).Delete
              Else
                row.Cells(4).Range.Text = Replace(keyValue(1), "|", ",")
              End If
            Case "total"
              If keyValue(1) = "-9999" Then
                If row.Parent.Columns.Count >= 5 Then row.Parent.Columns(5).Delete
              Else
                row.Cells(5).Range.Text = Replace(keyValue(1), "|", ",")
              End If
          End Select
        Next
      Next
    End If

    doc.ActivePrinter = "{}"
    sheet1.PrintOut , , , , , , , {}
    sheet1.Close False
    doc.Quit
    "#,
    args.invoiceDate,
    args.poNum,
    args.billToCompany,
    args.billToAddress,
    args.billToAddress2,
    args.billToCityStateZip,
    args.shipToCompany,
    args.shipToContact,
    args.shipToAddress,
    args.shipToAddress2,
    args.shipToCityStateZip,
    args.items.replace("\"", "").replace("\\", ""),
    printer,
    1
  );

  let vbs_path = "C:\\MWD\\scripts\\print_packing_slip.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  Ok(())
}

#[tauri::command]
fn print_packing_slip_blind(args: PrintPackingSlipBlindArgs) -> Result<(), String> {
  let printer = "Brother MFC-L3770CDW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\packingSlipBlindTemplate.docx")

    Sub ReplaceTextAndColor(sheet, findText, replaceText)
      With sheet.Content.Find
        .Text = findText
        .Replacement.Text = replaceText
        .Wrap = 1
        .MatchWholeWord = True
        .Execute , , , , , , , , , , 2
      End With
    End Sub

    Call ReplaceTextAndColor(sheet1, "<INVOICE_DATE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_COMPANY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_ADDRESS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_ADDRESS_2>", {})
    Call ReplaceTextAndColor(sheet1, "<BILL_TO_CITY_STATE_ZIP>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_COMPANY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_CONTACT>", {})
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_ADDRESS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_ADDRESS_2>", {})
    Call ReplaceTextAndColor(sheet1, "<SHIP_TO_CITY_STATE_ZIP>", "{}")

    Dim jsonData, item, table, row, i
    jsonData = {:?}

    If Len(jsonData) > 2 Then
      Dim items
      items = Split(jsonData, "}},")
      Set table = sheet1.Tables(1)

      For i = LBound(items) To UBound(items)
        Dim fields, keyValue, j
        If i > 0 Or table.Rows.Count = 1 Then
          table.Rows.Add
        End If

        Set row = table.Rows(table.Rows.Count)
        fields = Split(items(i), ",")

        For j = LBound(fields) To UBound(fields)
          keyValue = Split(fields(j), ":")
          keyValue(0) = Replace(keyValue(0), "[{{", "")
          keyValue(0) = Replace(keyValue(0), "{{", "")
          If UBound(keyValue) >= 1 Then
            keyValue(1) = Replace(keyValue(1), "}}]", "")
          End If

          Select Case keyValue(0)
            Case "qty"
              row.Cells(1).Range.Text = keyValue(1)
              row.Cells(1).Range.Font.Bold = False
            Case "partNum"
              row.Cells(2).Range.Text = keyValue(1)
            Case "desc"
              row.Cells(3).Range.Text = keyValue(1)
          End Select
        Next
      Next
    End If

    doc.ActivePrinter = "{}"
    sheet1.PrintOut , , , , , , , {}
    sheet1.Close False
    doc.Quit
    "#,
    args.invoiceDate,
    args.billToCompany,
    args.billToAddress,
    args.billToAddress2,
    args.billToCityStateZip,
    args.shipToCompany,
    args.shipToContact,
    args.shipToAddress,
    args.shipToAddress2,
    args.shipToCityStateZip,
    args.items.replace("\"", "").replace("\\", ""),
    printer,
    1
  );

  let vbs_path = "C:\\MWD\\scripts\\print_packing_slip_blind.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  Ok(())
}

#[tauri::command]
fn print_po(args: PrintPOArgs) -> Result<(), String> {
  let printer = "Brother MFC-L3770CDW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = False
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\poTemplate.docx")

    Sub ReplaceTextAndColor(sheet, findText, replaceText)
      With sheet.Content.Find
        .Text = findText
        .Replacement.Text = replaceText
        .Wrap = 1
        .MatchWholeWord = True
        .Execute , , , , , , , , , , 2
      End With
    End Sub

    Call ReplaceTextAndColor(sheet1, "<ID>", "{}")
    Call ReplaceTextAndColor(sheet1, "<VENDOR>", "{}")
    Call ReplaceTextAndColor(sheet1, "<ADDRESS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<CITY>", "{}")
    Call ReplaceTextAndColor(sheet1, "<STATE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<ZIP>", "{}")
    Call ReplaceTextAndColor(sheet1, "<PHONE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<FAX>", "{}")
    Call ReplaceTextAndColor(sheet1, "<PAYMENT_TERMS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<PURCHASED_FOR>", "{}")
    Call ReplaceTextAndColor(sheet1, "<SPECIAL_INSTRUCTIONS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<COMMENTS>", "{}")
    Call ReplaceTextAndColor(sheet1, "<DATE>", "{}")
    Call ReplaceTextAndColor(sheet1, "<ORDERED_BY>", "{}")

    Dim jsonData, item, table, row, i
    jsonData = {:?}

    If Len(jsonData) > 2 Then
      Dim items
      items = Split(jsonData, "}},")
      Set table = sheet1.Tables(1)

      For i = LBound(items) To UBound(items)
        Dim fields, keyValue, j
        If i > 0 Or table.Rows.Count = 1 Then
          table.Rows.Add
        End If

        Set row = table.Rows(table.Rows.Count)
        fields = Split(items(i), ",")

        For j = LBound(fields) To UBound(fields)
          keyValue = Split(fields(j), ":")
          keyValue(0) = Replace(keyValue(0), "[{{", "")
          keyValue(0) = Replace(keyValue(0), "{{", "")
          If UBound(keyValue) >= 1 Then
            keyValue(1) = Replace(keyValue(1), "}}]", "")
          End If

          Select Case keyValue(0)
            Case "qty"
              row.Cells(1).Range.Text = keyValue(1)
              row.Cells(1).Range.Font.Bold = False
            Case "desc"
              row.Cells(2).Range.Text = keyValue(1)
            Case "price"
              Dim price
              price = keyValue(1)
              price = Replace(price, "|", ",")
              row.Cells(3).Range.Text = price
            Case "total"
              Dim total
              total = keyValue(1)
              total = Replace(total, "|", ",")
              row.Cells(4).Range.Text = total
          End Select
        Next
      Next
    End If

    doc.ActivePrinter = "{}"
    sheet1.PrintOut , , , , , , , {}
    sheet1.Close False
    doc.Quit
    "#,
    args.id,
    args.vendor,
    args.address,
    args.city,
    args.state,
    args.zip,
    args.phone,
    args.fax,
    args.paymentTerms,
    args.purchasedFor,
    args.specialInstructions,
    args.comments,
    args.date,
    args.orderedBy,
    args.items.replace("\"", "").replace("\\", ""),
    printer,
    1
  );

  let vbs_path = "C:\\MWD\\scripts\\print_po.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  Ok(())
}

#[tauri::command]
fn email_end_of_day(args: EmailEndOfDayArgs) {
  let body = format!(
    "\"<h2>{}</h2>\" & vbCrLf & _\n\
    \"<strong>Invoice Date: </strong> {}<br />\" & vbCrLf & _\n\
    {}\
    {}\
    \"<br /><br />\" & vbCrLf & _\n\
    \"www.midwestdiesel.com<br />\" & vbCrLf & _\n\
    \"<strong>Phone:</strong> (888) 866-3406<br />\" & vbCrLf & _\n\
    \"<strong>Fax:</strong> (763) 450-2197\"",
    args.company.replace("\"", "\"\""),
    args.date,
    if !args.shipVia.is_empty() {
      format!("\"<strong>Ship Via: </strong> {}<br />\" & vbCrLf & _\n", args.shipVia.replace("\"", "\"\""))
    } else {
      "".to_string()
    },
    if !args.trackingNumbers.is_empty() {
      if args.trackingNumbers.len() > 1 {
        format!(
          "\"<strong>Tracking Numbers:</strong><ul>{}</ul>\" & vbCrLf & _\n",
          args.trackingNumbers.join("").replace("\"", "\"\"")
        )
      } else {
        format!(
          "\"<strong>Tracking Number:</strong><ul>{}</ul>\" & vbCrLf & _\n",
          args.trackingNumbers[0].replace("\"", "\"\"")
        )
      }
    } else {
      "".to_string()
    }
  );

  let vbs_script = format!(
    r#"
    Dim OutlookApp
    Set OutlookApp = CreateObject("Outlook.Application")
    Dim MailItem
    Set MailItem = OutlookApp.CreateItem(0)
    MailItem.Subject = "Midwest Diesel Invoice - {}"
    MailItem.HTMLBody = {}
    MailItem.To = "{}"
    
    Dim attachmentPath
    attachmentPath = Trim("{}")
    If attachmentPath <> "" Then
      MailItem.Attachments.Add attachmentPath
    End If

    MailItem.Display
    "#,
    args.date,
    body,
    args.email,
    format!("\\\\MWD1-SERVER\\Server\\InvoiceScans\\Archives\\{}\\{}\\{}\\{}.pdf", args.year, args.month, args.day, args.id)
  );

  let temp_vbs_path = "C:/mwd/scripts/email_end_of_day.vbs";
  write(&temp_vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(temp_vbs_path);
  cmd.output().expect("Failed to create new draft");
}

#[tauri::command]
fn print_part_tag(imageData: String) -> Result<(), String> {
  let data = decode(imageData.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
  let file_path = "C:\\MWD\\scripts\\part_tag.png";
  let printer = "ZDesigner GC420d (EPL)";

  let img = ImageReader::new(Cursor::new(&data))
    .with_guessed_format()
    .map_err(|e| e.to_string())?
    .decode()
    .map_err(|e| e.to_string())?;

  let rotated_img: DynamicImage = image::DynamicImage::ImageRgba8(rotate90(&img)).resize(3248, 1624, FilterType::Lanczos3);

  {
    let mut file = File::create(file_path).map_err(|e| e.to_string())?;
    rotated_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
  }

  Command::new("mspaint")
  .args([file_path, "/pt", printer])
  .output()
  .map_err(|e| e.to_string())?;

  Ok(())
}
