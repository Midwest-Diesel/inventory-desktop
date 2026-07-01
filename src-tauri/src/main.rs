/*  
==================================================================
Printer and computer names are hard coded, you will have to change
them when replacing a printer.
==================================================================
*/

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod printing;
mod email;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine};
use tauri::{Manager, api::shell, AppHandle};
use std::{env};
use std::fs::{self, write, File, remove_file, create_dir_all};
use std::io::{self, Write, copy};
use std::process::{Command};
use reqwest::Client;
use std::path::{Path};
use zip::read::ZipArchive;
use url::Url;
use crate::printing::{
  print_accounting_handwritten,
  print_bol,
  print_cc_label,
  print_ci,
  print_coo,
  print_core_handwritten,
  print_part_tag,
  print_shipping_handwritten,
  print_shipping_label,
  print_inj_part_tag,
  print_engine_tag,
  print_engine_checklist,
  print_return,
  print_warranty,
  print_packing_slip,
  print_po,
  print_proforma,
  print_quotes_list
};
use crate::email::{
  attach_to_existing_email,
  email_end_of_day,
  email_fast_track_inventory,
  email_karmak_invoice,
  email_netcom_inventory,
  email_po,
  email_po_received,
  email_proforma,
  new_email_draft,
  upload_email_stuff_files
};

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
struct Base64Picture {
  data: String,
  path: String
}

#[derive(Deserialize, Serialize)]
struct FileArgs {
  file: Vec<u8>,
  dir: String,
  name: String
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

#[derive(Deserialize)]
enum ShippingListAction {
  BoldRow
}

#[derive(Deserialize)]
struct EditShippingListRowRequest {
  path: String,
  handwritten_id: i32,
  action: ShippingListAction
}

#[derive(Deserialize, Serialize)]
struct DateArgs {
  year: String,
  month: String,
  day: String
}


#[tokio::main]
async fn main() {
  dotenv::from_filename(".env.development").ok();
  let _ = tauri::Builder::default()
    .setup(|_| {
      create_directories();
      cleanup_temp_files();
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
      edit_shipping_list_row,
      upload_file,
      print_shipping_label,
      print_cc_label,
      print_bol,
      print_accounting_handwritten,
      print_shipping_handwritten,
      print_core_handwritten,
      print_ci,
      print_coo,
      print_bol,
      print_part_tag,
      print_inj_part_tag,
      print_engine_tag,
      print_engine_checklist,
      print_return,
      print_warranty,
      print_packing_slip,
      print_po,
      print_proforma,
      email_proforma,
      email_po,
      email_end_of_day,
      move_queue_to_archives,
      email_karmak_invoice,
      view_file,
      save_pdf,
      email_po_received,
      email_fast_track_inventory,
      email_netcom_inventory,
      print_quotes_list,
      get_json_file,
      read_file_bytes,
      delete_file,
      create_folder
    ])
    .run(tauri::generate_context!());
}

fn create_directories() {
  let directories = vec!["scripts", "scripts/screenshots", "scripts/attachments", "updates"];
  for dir_name in directories {
    if std::fs::read_dir(format!("C:/MWD/{}", dir_name)).is_err() {
      let _ = std::fs::create_dir(format!("C:/MWD/{}", dir_name));
    }
  }

  write("C:/mwd/scripts/launch_test.vbs", "test").unwrap();
}

fn cleanup_temp_files() {
  let temp_dir = "C:/Users/Public";
  let prefixes = ["BOL_", "CERTOO_", "COMINV_"];

  if let Ok(entries) = std::fs::read_dir(&temp_dir) {
    for entry in entries.flatten() {
      let path = entry.path();

      if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
        if prefixes.iter().any(|p| file_name.starts_with(p)) && file_name.ends_with(".docm") {
          let _ = std::fs::remove_file(path);
        }
      }
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
      echo Downloading RAM...
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
fn add_to_shipping_list(new_shipping_list_row: ShippingListRow) {
  let vbs_script = format!(
    r#"
    Dim ExcelApp, Workbook, ExcelSheet
    Set ExcelApp = CreateObject("Excel.Application")
    ExcelApp.Visible = False
    ExcelApp.DisplayAlerts = False

    Set Workbook = ExcelApp.Workbooks.Open("{}")
    Set ExcelSheet = Workbook.Sheets({})

    Dim SectionHeader, StartRow, LastRow, NextSectionRow
    SectionHeader = "{}"
    Set FoundCell = ExcelSheet.Cells.Find(SectionHeader)
    StartRow = FoundCell.Row + 1

    LastRow = StartRow
    Do While ExcelSheet.Cells(LastRow, 1).Value <> ""
      LastRow = LastRow + 1
    Loop

    ExcelSheet.Rows(LastRow).Insert
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
      ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Interior.Color = RGB(200, 255, 200)
      ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Font.Color = RGB(0, 100, 0)
    End If
    If {} Then
      ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Interior.Color = RGB(255, 213, 171)
      ExcelSheet.Range("A" & LastRow & ":U" & LastRow).Font.Color = RGB(192, 0, 0)
    End If

    If InStr(1, ExcelSheet.Range("B" & LastRow).Text, "ups red", vbTextCompare) > 0 Then
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
    if new_shipping_list_row.has_pics {"False"} else {"True"},
    if new_shipping_list_row.is_blind {"True"} else {"False"},
  );

  let temp_vbs_path = "C:/mwd/scripts/UpdateShippingList.vbs";
  write(&temp_vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(temp_vbs_path);
  cmd.output().unwrap();
}

#[tauri::command]
fn edit_shipping_list_row(args: EditShippingListRowRequest) {
  let vbs_script = format!(
    r#"
    Dim ExcelApp, Workbook, ExcelSheet
    Dim r, targetRow, foundSheet, sheetIndex

    Set ExcelApp = CreateObject("Excel.Application")
    ExcelApp.Visible = False
    ExcelApp.DisplayAlerts = False
    Set Workbook = ExcelApp.Workbooks.Open("{}")

    targetRow = 0
    Set foundSheet = Nothing

    For sheetIndex = 1 To Workbook.Sheets.Count
      Set ExcelSheet = Workbook.Sheets(sheetIndex)
      Dim LastRow
      LastRow = ExcelSheet.Cells(ExcelSheet.Rows.Count, 1).End(-4162).Row ' xlUp

      For r = 1 To LastRow
        If ExcelSheet.Cells(r, 20).Value = {} Then
          targetRow = r
          Set foundSheet = ExcelSheet
          Exit For
        End If
      Next
      If targetRow <> 0 Then Exit For
    Next

    If targetRow <> 0 Then
      Select Case "{}"
        Case "BoldRow"
          ExcelSheet.Rows(targetRow).Font.Bold = True
      End Select
    End If

    Workbook.Save
    Workbook.Close
    ExcelApp.Quit
    "#,
    args.path,
    args.handwritten_id,
    match args.action {
      ShippingListAction::BoldRow => "BoldRow",
    }
  );

  let temp_vbs_path = "C:/mwd/scripts/EditShippingList.vbs";
  std::fs::write(&temp_vbs_path, vbs_script).unwrap();
  std::process::Command::new("wscript.exe")
    .arg(temp_vbs_path)
    .output()
    .unwrap();
}

#[tauri::command]
fn move_queue_to_archives(args: DateArgs) -> Result<(), String> {
  let queue_dir = Path::new(if cfg!(debug_assertions) {
    "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Testing\\Queue"
  } else {
    "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Queue"
  });

  let archive_base = if cfg!(debug_assertions) {
    "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Testing\\Archives"
  } else {
    "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Archives"
  };
  let archive_path = format!("{}\\{}\\{}\\{}", archive_base, args.year, args.month, args.day);
  let archive_dir = Path::new(&archive_path);

  copy_dir_contents(queue_dir, archive_dir)
    .map_err(|e| format!("Copy failed: {}", e))?;

  for entry in fs::read_dir(queue_dir).map_err(|e| e.to_string())? {
    let entry = entry.map_err(|e| e.to_string())?;
    let path = entry.path();
    if path.is_file() {
      fs::remove_file(path).map_err(|e| e.to_string())?;
    }
  }

  Ok(())
}

fn reset_end_of_day_queue(day: String, month: String, year: String) {
  let queue_dir = Path::new(if cfg!(debug_assertions) {
    "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Testing\\Queue"
  } else {
    "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Queue"
  });

  let archive_base = if cfg!(debug_assertions) {
    "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Testing\\Archives"
  } else {
    "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Archives"
  };

  let archive_path = format!("{}\\{}\\{}\\{}", archive_base, year, month, day);
  let archive_dir = Path::new(&archive_path);
  if !archive_dir.exists() { return; }

  if let Err(e) = copy_dir_contents(archive_dir, queue_dir) {
    eprintln!("Failed to restore queue from archives: {}", e);
    return;
  }

  if let Err(e) = fs::remove_dir_all(archive_dir) {
    eprintln!("Failed to delete archive folder: {}", e);
  }
}

fn copy_dir_contents(src: &Path, dst: &Path) -> io::Result<()> {
  if !src.is_dir() {
    return Err(io::Error::new(
      io::ErrorKind::InvalidInput,
      format!("Source is not a directory: {}", src.display()),
    ));
  }

  create_dir_all(dst)?;

  for entry in fs::read_dir(src)? {
    let entry = entry?;
    let file_type = entry.file_type()?;
    let src_path = entry.path();
    let dst_path = dst.join(entry.file_name());

    if file_type.is_dir() {
      copy_dir_contents(&src_path, &dst_path)?;
    } else {
      fs::copy(&src_path, &dst_path)?;
    }
  }

  Ok(())
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

#[tauri::command]
fn get_json_file(path: String) -> Result<Option<Value>, String> {
  match fs::read_to_string(&path) {
    Ok(content) => match serde_json::from_str(&content) {
      Ok(json) => Ok(Some(json)),
      Err(e) => Err(e.to_string())
    },
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
    Err(e) => Err(e.to_string())
  }
}

#[tauri::command]
fn read_file_bytes(path: String) -> Result<Vec<u8>, String> {
  std::fs::read(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_file(path: String) -> Result<(), String> {
  let path = Path::new(&path);
  if !path.exists() {
    return Err("File does not exist".into());
  }
  if !path.is_file() {
    return Err("Path is not a file".into());
  }

  fs::remove_file(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_folder(path: String) -> Result<(), String> {
  let path = Path::new(&path);
  fs::create_dir_all(path).map_err(|e| e.to_string())
}
