#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use serde_json::to_string;
use tauri::Manager;
use std::process::Command;
use std::fs::{write};
use std::{fs::File, io::copy};
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
  company: String,
  address: String,
  address2: String,
  cityStateZip: String,
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
struct CIArgs {
  company: String,
  address: String,
  address2: String,
  cityStateZip: String,
  date: String,
  po: String
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
      get_all_pictures,
      attach_to_existing_email,
      convert_img_to_base64,
      upload_email_stuff_files,
      add_to_shipping_list,
      upload_file,
      print_shipping_label,
      print_cc_label,
      print_bol,
      print_shipping_invoice,
      print_ci,
      print_coo
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
  let title = window_args.title;
  let base_url = if window_args.is_prod {
    "https://tauri.localhost"
  } else {
    "http://localhost:3000"
  };
  let url = Url::parse(&base_url).expect("Invalid URL");

  let new_window = tauri::WindowBuilder::new(
    &app,
    title.clone(),
    tauri::WindowUrl::External(url.into())
  )
    .title(title)
    .inner_size(1500.0, 800.0)
    .build()
    .unwrap();

  new_window.clone().on_window_event(move |event| {
    if let tauri::WindowEvent::Focused(_) = event {
      app.emit_to("Handwritten", "change-page", window_args.url.to_string()).unwrap();
    }
  });
}

#[tauri::command]
fn install_update() {
  println!("Update detected");
  tokio::spawn(async move {
    if let Err(e) = download_update().await {
      println!("Error downloading the update: {}", e);
    } else {
      println!("Update successful, restarting app...");
      let batch_script = r#"
      @echo off
      echo Installing update...
      "%SystemRoot%\\System32\\timeout.exe" /T 5 /NOBREAK > NUL
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
    Err(e) => Err(format!("Error accessing directory {}: {}", target_dir, e)),
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
    Err(e) => Err(format!("Error accessing directory {}: {}", target_dir, e)),
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
  let _ = std::fs::remove_file(temp_vbs_path);
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
  let _ = std::fs::remove_file(temp_vbs_path);
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
  let _ = std::fs::remove_file(temp_vbs_path);
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
  let printer = "Brother HL-L5200DW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = True
    Set sheet1 = doc.Documents.Open("\\MWD1-SERVER\Server\Shipping Label.docx")

    With sheet1.Content.Find
      .Text = "PAI INDUSTRIES"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "630 OLD PEACHTREE RD"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "BUILDING C"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "SUWANEE, GA 30024"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With

    doc.ActivePrinter = "{}"
    ' sheet1.PrintOut Copies:={}
    ' doc.Quit
    "#,
    args.company,
    args.address,
    args.address2,
    args.cityStateZip,
    printer,
    args.copies
  );

  let vbs_path = "C:\\MWD\\scripts\\generate_shipping_label.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update shipping list");
  let _ = std::fs::remove_file(vbs_path);
  Ok(())
}

#[tauri::command]
fn print_cc_label(args: CCLabelArgs) -> Result<(), String> {
  let printer = "Brother HL-L5200DW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = True
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
    ' sheet1.PrintOut
    ' doc.Quit
    "#,
    args.cardNum,
    args.expDate,
    args.cvv,
    args.cardZip,
    args.cardName,
    args.cardAddress,
    printer
  );

  let vbs_path = "C:\\MWD\\scripts\\generate_cc_label.vbs";
  write(&vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to update ccLabel");
  let _ = std::fs::remove_file(vbs_path);
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
  let _ = std::fs::remove_file(vbs_path);
  Ok(())
}

#[tauri::command]
fn print_shipping_invoice(args: ShippingInvoiceArgs) -> Result<(), String> {
  let printer = "Brother MFC-L3770CDW series";
  let json_data = to_string(&args.items).unwrap();
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = True
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
              row.Cells(1).Range.Text = keyValue(1)
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
              row.Cells(7).Range.Text = keyValue(1)
            Case "total"
              row.Cells(8).Range.Text = keyValue(1)
          End Select
        Next
      Next
    End If

    doc.ActivePrinter = "{}"
    ' sheet1.PrintOut
    ' doc.Close
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
  let _ = std::fs::remove_file(vbs_path);
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
  let _ = std::fs::remove_file(vbs_path);
  Ok(())
}

#[tauri::command]
fn print_coo() -> Result<(), String> {
  let printer = "Brother MFC-L3770CDW series";
  let vbs_script = format!(
    r#"
    Dim doc, sheet1
    Set doc = CreateObject("Word.Application")
    doc.Visible = True
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
  let _ = std::fs::remove_file(vbs_path);
  Ok(())
}
