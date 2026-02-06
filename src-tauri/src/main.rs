/*  
==================================================================
Printer and computer names are hard coded, you will have to change
them when replacing a printer.
==================================================================
*/

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

const PART_TAG_COMPUTER: &str = "DESKTOP-NR6SQFE";
const FRONT_DESK_COMPUTER: &str = "FRONT-DESK";
const SHOP_COMPUTER: &str = "JIM-PC";

const OFFICE_PRINTER: &str = "Brother MFC-L3770CDW";
const FRONT_DESK_PRINTER: &str = "Brother HL-L5200DW";
const FRONT_DESK_CC_PRINTER: &str = "ZDesigner GC420d";
const SHIPPING_LABEL_PRINTER: &str = "Zebra  ZP 450-200 dpi";
const SHOP_PRINTER: &str = "HP LaserJet Pro M402-M403 n-dne PCL 6";
const PART_TAG_PRINTER: &str = "D550 Printer";

use image::{io::Reader as ImageReader, ImageOutputFormat, DynamicImage, imageops::{rotate90, FilterType}};
use serde::{Deserialize, Serialize};
use tauri::{Manager, api::shell, AppHandle};
use std::env;
use std::fs::{write, File, remove_file, create_dir_all, remove_dir_all};
use std::io::{self, Cursor, Write, copy};
use std::process::{Command};
use file_operation::{copy_dir_files};
use reqwest::Client;
use std::path::{Path};
use zip::read::ZipArchive;
use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine};
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
  list_path: String,
  has_pics: bool,
  is_blind: bool
}

#[derive(Deserialize, Serialize)]
struct FileArgs {
  file: Vec<u8>,
  dir: String,
  name: String
}

#[derive(Deserialize, Serialize)]
struct BOLArgs {
  ship_to_company: String,
  ship_to_address: String,
  ship_to_address_2: String,
  ship_to_city_state_zip: String,
  ship_from_company: String,
  ship_from_address: String,
  ship_from_address_2: String,
  ship_from_city_state_zip: String,
  ship_via: String,
  prepaid: bool,
  collect: bool,
  third_party: bool
}

#[derive(Deserialize, Serialize)]
struct CIArgs {
  company: String,
  address: String,
  address_2: String,
  city_state_zip: String,
  date: String,
  po: String
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
  ship_via: String,
  tracking_numbers: Vec<String>
}

#[derive(Deserialize, Serialize)]
struct EmailPOReceivedArgs {
  po_num: String,
  purchased_from: String,
  items: Vec<String>,
  email: String
}


#[tokio::main]
async fn main() {
  dotenv::from_filename(".env.development").ok();
  let _ = tauri::Builder::default()
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
      print_accounting_handwritten,
      print_shipping_handwritten,
      print_core_handwritten,
      print_ci,
      print_coo,
      print_part_tag,
      print_inj_part_tag,
      print_engine_tag,
      print_engine_checklist,
      print_return,
      print_warranty,
      print_packing_slip,
      print_po,
      email_po,
      email_end_of_day,
      email_karmak_invoice,
      view_file,
      save_pdf,
      email_po_received
    ])
    .run(tauri::generate_context!());
}

fn create_directories() {
  let directories = vec!["scripts", "scripts/screenshots", "updates"];
  for dir_name in directories {
    if std::fs::read_dir(format!("C:/MWD/{}", dir_name)).is_err() {
      let _ = std::fs::create_dir(format!("C:/MWD/{}", dir_name));
    }
  }

  write("C:/mwd/scripts/launch_test.vbs", "test").unwrap();
}

fn get_available_printers() -> Vec<String> {
  let output = match std::process::Command::new("powershell")
    .args([
        "-Command",
        "Get-Printer | Select-Object -ExpandProperty Name"
    ])
    .output()
  {
    Ok(out) => out,
    Err(_) => return vec![],
  };

  String::from_utf8_lossy(&output.stdout)
    .lines()
    .map(|line| line.trim().to_string())
    .filter(|line| !line.is_empty())
    .collect()
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
      let exe_name = env::current_exe()
        .unwrap()
        .file_name()
        .unwrap()
        .to_string_lossy()
        .to_string();

      let product_name = if exe_name.contains("Staging") {"Inventory-Staging"} else {"Inventory"};
      let install_dir = if product_name.contains("Staging") {r"C:\MWD\staging"} else {r"C:\MWD"};
      let batch_script = format!(r#"
      @echo off
      echo Installing update...
      timeout /T 1 /NOBREAK > NUL
      echo Examining reactor core...
      timeout /T 1 /NOBREAK > NUL
      echo Training AI...
      timeout /T 1 /NOBREAK > NUL
      taskkill /F /IM {product_name}.exe > NUL 2>&1
      start "" "{install_dir}\{product_name}.exe"
      del "%~f0" & exit
      "#);

      let script_path = "C:\\MWD\\updates\\restart_app.bat";
      std::fs::write(script_path, batch_script).unwrap();

      let _ = Command::new("cmd.exe")
        .args(["/C", script_path])
        .spawn();

      std::process::exit(0);
    }
  });
  let _ = std::fs::remove_dir_all("C:/MWD/updates");
  let _ = std::fs::create_dir("C:/MWD/updates");
}

async fn download_update() -> Result<(), Box<dyn std::error::Error>> {
  let exe_name = env::current_exe()
    .unwrap()
    .file_name()
    .unwrap()
    .to_string_lossy()
    .to_string();

  let (product_name, update_json_url, install_dir) = if exe_name.contains("Staging") {
    ("Inventory-Staging",
      "https://raw.githubusercontent.com/Midwest-Diesel/inventory-desktop/refs/heads/main/latest.staging.json",
      r"C:\MWD\staging")
  } else {
    ("Inventory",
      "https://raw.githubusercontent.com/Midwest-Diesel/inventory-desktop/refs/heads/main/latest.json",
      r"C:\MWD")
  };

  remove_file("C:/mwd/scripts/launch_test.vbs").unwrap();
  let client = Client::new();
  let res = client
    .get(update_json_url)
    .send()
    .await?
    .json::<LatestVersionInfo>()
    .await?;

  let version_tag = res.version.trim_start_matches('v');
  let version_file = version_tag.replace("-staging", "");
  let url = format!(
      "https://github.com/Midwest-Diesel/inventory-desktop/releases/download/v{}/{}_{}_x64-setup.nsis.zip",
      version_tag, product_name, version_file
  );
  let response = client.get(url).send().await?;
  let zip_path = format!("C:/MWD/updates/{}_{}_x64-setup.nsis.zip", product_name, version_file);
  let mut dest = File::create(&zip_path)?;
  copy(&mut response.bytes().await?.as_ref(), &mut dest)?;
  println!("Update downloaded successfully.");

  let mut archive = ZipArchive::new(File::open(&zip_path)?)?;
  for i in 0..archive.len() {
    let mut file = archive.by_index(i)?;
    let outpath = Path::new("C:/MWD/updates").join(file.name());
    
    if file.name().ends_with('/') {
      create_dir_all(&outpath)?;
    } else {
      if let Some(p) = outpath.parent() {
        create_dir_all(p)?;
      }
      let mut out_file = File::create(&outpath)?;
      copy(&mut file, &mut out_file)?;
    }
  }
  println!("Update extracted successfully.");

  let installer_path = format!("C:/MWD/updates/{}_{}_x64-setup.exe", product_name, version_file);
  let _ = Command::new(installer_path)
    .args(["/S", &format!("/D={}", install_dir)])
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
    Err(_) => Ok(vec![]),
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
    Err(_) => Ok(vec![]),
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
    Err(_) => Ok(vec![]),
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
    if !cc_recipients.is_empty() { format!("MailItem.CC = \"{}\"", cc_recipients.replace("\"", "\"\"")) } else { "".to_string() },
    if !bcc_recipients.is_empty() { format!("MailItem.BCC = \"{}\"", bcc_recipients.replace("\"", "\"\"")) } else { "".to_string() },
    if !attachments_joined.is_empty() { format!("Dim attachments: attachments = \"{}\"", attachments_joined.replace("\"", "\"\"")) } else { "".to_string() }
  );

  let temp_vbs_path = "C:/mwd/scripts/CreateEmailDraft.vbs";
  write(&temp_vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(temp_vbs_path);
  cmd.output().unwrap();
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
  write(&temp_vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(temp_vbs_path);
  cmd.output().unwrap();
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
    ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Font.Color = RGB(0, 0, 0)
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

    If {} Then
      ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Interior.Color = RGB(255, 213, 171)
      ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Font.Color = RGB(192, 0, 0)
    End If
    If {} Then
      ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Interior.Color = RGB(200, 255, 200)
      ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Font.Color = RGB(0, 100, 0)
    End If

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
    new_shipping_list_row.handwritten_id,
    if new_shipping_list_row.is_blind {"True"} else {"False"},
    if new_shipping_list_row.has_pics {"False"} else {"True"},
  );

  let temp_vbs_path = "C:/mwd/scripts/UpdateShippingList.vbs";
  write(&temp_vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(temp_vbs_path);
  cmd.output().unwrap();
}

#[tauri::command]
fn upload_file(file_args: FileArgs) -> Result<(), String> {
  if !std::path::Path::new(&file_args.dir).exists() {
    if let Err(e) = create_dir_all(&file_args.dir) {
        return Err(format!("Error creating directory: {}", e));
    }
  }
  let file_path = format!("{}/{}", file_args.dir, file_args.name);
  let _ = std::fs::write(file_path, &file_args.file).map_err(|e| e.to_string());
  Ok(())
}

#[tauri::command]
async fn print_shipping_label(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/shipping_label.png";
    let printers = get_available_printers();
    let printer = if printers.contains(&SHIPPING_LABEL_PRINTER.to_string()) {
      SHIPPING_LABEL_PRINTER.to_string()
    } else {
      format!("\\\\{}\\{}", FRONT_DESK_COMPUTER, SHIPPING_LABEL_PRINTER)
    };

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let rotated_img: DynamicImage = image::DynamicImage::ImageRgba8(rotate90(&img));
    let upscaled_img = image::imageops::resize(
      &rotated_img,
      rotated_img.width() * 2,
      rotated_img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
async fn print_cc_label(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/cc_label.png";
    /* 
      PRINTER DIMENSION SETTNGS (windows printer settings > printer > printer preferences):
      width: 3 in
      height: 1 in
    */
    let printers = get_available_printers();
    let printer = if printers.contains(&FRONT_DESK_CC_PRINTER.to_string()) {
      FRONT_DESK_CC_PRINTER.to_string()
    } else {
      format!("\\\\{}\\{}", FRONT_DESK_COMPUTER, FRONT_DESK_CC_PRINTER)
    };

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let upscaled_img = image::imageops::resize(
      &img,
      img.width() * 2,
      img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
fn print_bol(args: BOLArgs) -> Result<(), String> {
  let printers = get_available_printers();
  let printer = printers.iter().find(|&p| p.contains(&FRONT_DESK_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());
  let vbs_script = format!(
    r#"
    Dim fso, src, dest, doc, sheet1
    Set fso = CreateObject("Scripting.FileSystemObject")

    src = "\\MWD1-SERVER\Server\BOLtemplate.docm"
    dest = "C:\Users\Public\BOLtemplate.docm"

    If fso.FileExists(dest) Then
      fso.DeleteFile dest, True
    End If

    fso.CopyFile src, dest, True

    Set doc = CreateObject("Word.Application")
    doc.Visible = True
    Set sheet1 = doc.Documents.Open(dest, False)

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
    args.ship_to_company,
    args.ship_to_address,
    if args.ship_to_address_2 == "" {"True"} else {"False"},
    args.ship_to_address_2,
    args.ship_to_city_state_zip,
    args.ship_from_company,
    args.ship_from_address,
    if args.ship_from_address_2 == "" {"True"} else {"False"},
    args.ship_from_address_2,
    args.ship_from_city_state_zip,
    args.ship_via,
    if args.prepaid {"True"} else {"False"},
    if args.collect {"True"} else {"False"},
    if args.third_party {"True"} else {"False"},
    printer
  );

  let vbs_path = "C:/mwd/scripts/generate_bol.vbs";
  write(&vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().unwrap();
  Ok(())
}

#[tauri::command]
async fn print_accounting_handwritten(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/accounting_handwritten.png";
    let printers = get_available_printers();
    let printer = printers.iter().find(|&p| p.contains(&FRONT_DESK_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let rotated_img: DynamicImage = image::DynamicImage::ImageRgba8(rotate90(&img));
    let upscaled_img = image::imageops::resize(
      &rotated_img,
      rotated_img.width() * 2,
      rotated_img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
async fn print_shipping_handwritten(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/shipping_handwritten.png";
    let printers = get_available_printers();
    let printer = if printers.contains(&SHOP_PRINTER.to_string()) {
      SHOP_PRINTER.to_string()
    } else {
      format!("\\\\{}\\{}", SHOP_COMPUTER, SHOP_PRINTER)
    };

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let rotated_img: DynamicImage = image::DynamicImage::ImageRgba8(rotate90(&img));
    let upscaled_img = image::imageops::resize(
      &rotated_img,
      rotated_img.width() * 2,
      rotated_img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
async fn print_core_handwritten(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/core_handwritten.png";
    let printers = get_available_printers();
    let printer = printers.iter().find(|&p| p.contains(&FRONT_DESK_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let rotated_img: DynamicImage = image::DynamicImage::ImageRgba8(rotate90(&img));
    let upscaled_img = image::imageops::resize(
      &rotated_img,
      rotated_img.width() * 2,
      rotated_img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
fn print_ci(args: CIArgs) -> Result<(), String> {
  let printers = get_available_printers();
  let printer = printers.iter().find(|&p| p.contains(&OFFICE_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());
  let vbs_script = format!(
    r#"
    Dim fso, src, dest, doc, sheet1
    Set fso = CreateObject("Scripting.FileSystemObject")

    src = "\\MWD1-SERVER\Server\COMINVtemplate.docm"
    dest = "C:\Users\Public\COMINVtemplate.docm"

    If fso.FileExists(dest) Then
      fso.DeleteFile dest, True
    End If

    fso.CopyFile src, dest, True

    Set doc = CreateObject("Word.Application")
    doc.Visible = True
    Set sheet1 = doc.Documents.Open(dest, False)

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
    args.address_2,
    args.address,
    args.city_state_zip,
    args.date,
    args.po,
    printer
  );

  let vbs_path = "C:/mwd/scripts/generate_ci_template.vbs";
  write(&vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().unwrap();
  Ok(())
}

#[tauri::command]
fn print_coo() -> Result<(), String> {
  let printers = get_available_printers();
  let printer = printers.iter().find(|&p| p.contains(&OFFICE_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());
  let vbs_script = format!(
    r#"
    Dim fso, src, dest, doc, sheet1
    Set fso = CreateObject("Scripting.FileSystemObject")

    src = "\\MWD1-SERVER\Server\CERTOOtemplate.docm"
    dest = "C:\Users\Public\CERTOOtemplate.docm"

    If fso.FileExists(dest) Then
      fso.DeleteFile dest, True
    End If

    fso.CopyFile src, dest, True

    Set doc = CreateObject("Word.Application")
    doc.Visible = True
    Set sheet1 = doc.Documents.Open(dest, False)
    doc.ActivePrinter = "{}"
    "#,
    printer,
  );

  let vbs_path = "C:/mwd/scripts/generate_coo_template.vbs";
  write(&vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().unwrap();
  Ok(())
}

#[tauri::command]
async fn print_return(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/return.png";
    let printers = get_available_printers();
    let printer = printers.iter().find(|&p| p.contains(&OFFICE_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let upscaled_img = image::imageops::resize(
      &img,
      img.width() * 2,
      img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
async fn print_warranty(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/warranty.png";
    let printers = get_available_printers();
    let printer = printers.iter().find(|&p| p.contains(&OFFICE_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let upscaled_img = image::imageops::resize(
      &img,
      img.width() * 2,
      img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
async fn print_packing_slip(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/packing_slip.png";
    let printers = get_available_printers();
    let printer = printers.iter().find(|&p| p.contains(&OFFICE_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let upscaled_img = image::imageops::resize(
      &img,
      img.width() * 2,
      img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
async fn print_po(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/po.png";
    let printers = get_available_printers();
    let printer = printers.iter().find(|&p| p.contains(&OFFICE_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let upscaled_img = image::imageops::resize(
      &img,
      img.width() * 2,
      img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
fn email_po(po_num: String, path: String) {
  let body = format!("Hi,<br />Attached to this email is our PO #{}<br /><br />Thanks,<br />Midwest Diesel<br />(888) 866-3406",
    po_num
  );
  let vb_body = body.replace("\"", "\"\"")
    .lines()
    .map(|line| format!("\"{}\"", line))
    .collect::<Vec<_>>()
    .join(" & _\n");

  let vbs_script = format!(
    r#"
    Dim OutlookApp
    Set OutlookApp = CreateObject("Outlook.Application")
    Dim MailItem
    Set MailItem = OutlookApp.CreateItem(0)
    
    MailItem.Subject = "Midwest Diesel | PO #{}"
    MailItem.HTMLBody = {}
    MailItem.Attachments.Add "{}"
    MailItem.Display
    "#,
    po_num,
    vb_body,
    path
  );

  let vbs_path = "C:/mwd/scripts/email_po.vbs";
  write(&vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().unwrap();
}

#[tauri::command]
fn email_po_received(args: EmailPOReceivedArgs) {
  let body = args
      .items
      .iter()
      .map(|item| format!("<br />     * {}", item))
      .collect::<String>();

  let vbs_script = format!(
    r#"
    Dim OutlookApp
    Set OutlookApp = CreateObject("Outlook.Application")
    Dim MailItem
    Set MailItem = OutlookApp.CreateItem(0)

    MailItem.To = "{}"
    MailItem.Subject = "PO #{} has been received!"
    MailItem.HTMLBody = "PO# {} purchased from {} has received the following items:<br />{}"
    MailItem.Display
    "#,
    args.email,
    args.po_num,
    args.po_num,
    args.purchased_from,
    body.replace("\"", "\"\"")
  );

  let vbs_path = "C:/mwd/scripts/email_po_received.vbs";
  write(vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().unwrap();
}

#[tauri::command]
fn email_end_of_day(args: EmailEndOfDayArgs) {
  let queue_dir = "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Queue";
  let archive_dir = format!("\\\\MWD1-SERVER\\Server\\InvoiceScans\\Archives\\{}\\{}\\{}", args.year, args.month, args.day);

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
    if !args.ship_via.is_empty() {
      format!("\"<strong>Ship Via: </strong> {}<br />\" & vbCrLf & _\n", args.ship_via.replace("\"", "\"\""))
    } else {
      "".to_string()
    },
    if !args.tracking_numbers.is_empty() {
      if args.tracking_numbers.len() > 1 {
        format!(
          "\"<strong>Tracking Numbers:</strong><ul>{}</ul>\" & vbCrLf & _\n",
          args.tracking_numbers.join("").replace("\"", "\"\"")
        )
      } else {
        format!(
          "\"<strong>Tracking Number:</strong><ul>{}</ul>\" & vbCrLf & _\n",
          args.tracking_numbers[0].replace("\"", "\"\"")
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
    format!("{}\\{}.pdf", queue_dir, args.id)
  );

  let vbs_path = "C:/mwd/scripts/email_end_of_day.vbs";
  write(&vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().unwrap();

  if let Ok(val) = env::var("VITE_NODE_ENV") {
    if val == "development" { return }
  }

  // Move the invoices from the Queue to the Archives
  create_dir_all(&archive_dir).unwrap();
  copy_dir_files(&queue_dir, &archive_dir).unwrap();
  remove_dir_all(&queue_dir).unwrap();
  create_dir_all(&queue_dir).unwrap();
}

#[tauri::command]
fn email_karmak_invoice(args: EmailEndOfDayArgs) {
  let archive_dir = format!("\\\\MWD1-SERVER\\Server\\InvoiceScans\\Archives\\{}\\{}\\{}", args.year, args.month, args.day);

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
    if !args.ship_via.is_empty() {
      format!("\"<strong>Ship Via: </strong> {}<br />\" & vbCrLf & _\n", args.ship_via.replace("\"", "\"\""))
    } else {
      "".to_string()
    },
    if !args.tracking_numbers.is_empty() {
      if args.tracking_numbers.len() > 1 {
        format!(
          "\"<strong>Tracking Numbers:</strong><ul>{}</ul>\" & vbCrLf & _\n",
          args.tracking_numbers.join("").replace("\"", "\"\"")
        )
      } else {
        format!(
          "\"<strong>Tracking Number:</strong><ul>{}</ul>\" & vbCrLf & _\n",
          args.tracking_numbers[0].replace("\"", "\"\"")
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
    format!("{}\\{}.pdf", archive_dir, args.id)
  );

  let vbs_path = "C:/mwd/scripts/email_karmak_invoice.vbs";
  write(&vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().unwrap();
}

#[tauri::command]
async fn print_part_tag(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/part_tag.png";
    let printers = get_available_printers();
    let printer = if printers.contains(&PART_TAG_PRINTER.to_string()) {
      PART_TAG_PRINTER.to_string()
    } else {
      format!("\\\\{}\\{}", PART_TAG_COMPUTER, PART_TAG_PRINTER)
    };

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let rotated_img: DynamicImage = image::DynamicImage::ImageRgba8(rotate90(&img));
    let upscaled_img = image::imageops::resize(
      &rotated_img,
      rotated_img.width() * 2,
      rotated_img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
async fn print_inj_part_tag(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/part_tag.png";
    let printers = get_available_printers();
    let printer = if printers.contains(&PART_TAG_PRINTER.to_string()) {
      PART_TAG_PRINTER.to_string()
    } else {
      format!("\\\\{}\\{}", PART_TAG_COMPUTER, PART_TAG_PRINTER)
    };

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
async fn print_engine_tag(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/engine_tag.png";
    let printers = get_available_printers();
    let printer = if printers.contains(&PART_TAG_PRINTER.to_string()) {
      PART_TAG_PRINTER.to_string()
    } else {
      format!("\\\\{}\\{}", PART_TAG_COMPUTER, PART_TAG_PRINTER)
    };

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let upscaled_img = image::imageops::resize(
      &img,
      img.width() * 2,
      img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
async fn print_engine_checklist(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/engine_checklist.png";
    let printers = get_available_printers();
    let printer = if printers.contains(&PART_TAG_PRINTER.to_string()) {
      PART_TAG_PRINTER.to_string()
    } else {
      format!("\\\\{}\\{}", PART_TAG_COMPUTER, PART_TAG_PRINTER)
    };

    let img = ImageReader::new(Cursor::new(&data))
      .with_guessed_format()
      .map_err(|e| e.to_string())?
      .decode()
      .map_err(|e| e.to_string())?;

    let rotated_img: DynamicImage = image::DynamicImage::ImageRgba8(rotate90(&img));
    let upscaled_img = image::imageops::resize(
      &rotated_img,
      rotated_img.width() * 2,
      rotated_img.height() * 2,
      FilterType::Lanczos3,
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
fn view_file(app_handle: AppHandle, filepath: String) -> Result<(), String> {
  shell::open(&app_handle.shell_scope(), filepath, None)
    .map_err(|e| format!("Failed to open: {}", e))
}

#[tauri::command]
fn save_pdf(bytes: Vec<u8>, path: String) -> Result<(), String> {
  std::fs::write(path, bytes).map_err(|e| e.to_string())
}
