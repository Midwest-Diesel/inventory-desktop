use image::{io::Reader as ImageReader, ImageOutputFormat, DynamicImage, imageops::{rotate90, FilterType}};
use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine};
use serde::{Deserialize, Serialize};
use std::{env, ffi::OsStr, io::Cursor, iter::once, os::windows::ffi::OsStrExt, ptr::{null, null_mut}, fs::{File, write}};
use std::process::{Command};
use uuid::Uuid;
use windows_sys::Win32::{Graphics::{Gdi::RGBQUAD, Printing::PRINTER_HANDLE}};
use windows_sys::Win32::Graphics::Gdi::{
  CreateDCW,
  DeleteDC,
  GetDeviceCaps,
  StretchDIBits,
  BITMAPINFO,
  BITMAPINFOHEADER,
  BI_RGB,
  DIB_RGB_COLORS,
  HORZRES,
  SRCCOPY,
  VERTRES
};
use windows_sys::Win32::Storage::Xps::{
  EndDoc,
  EndPage,
  StartDocW,
  StartPage,
  DOCINFOW
};
use windows_sys::Win32::Graphics::Printing::{
  ClosePrinter,
  OpenPrinterW
};

#[derive(Deserialize, Serialize)]
pub struct BOLArgs {
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
  third_party: bool,
  third_party_address: String,
  account_number: String
}

#[derive(Deserialize, Serialize)]
pub struct CIArgs {
  company: String,
  address: String,
  address_2: String,
  city_state_zip: String,
  date: String,
  po: String,
  ship_via: String,
  account_number: String,
  prepaid: bool,
  collect: bool
}


const PART_TAG_COMPUTER: &str = "DESKTOP-NR6SQFE";
const FRONT_DESK_COMPUTER: &str = "FRONT-DESK";
const SHOP_COMPUTER: &str = "JIM-PC";

const OFFICE_PRINTER: &str = "Brother MFC-L3770CDW";
const FRONT_DESK_PRINTER: &str = "Brother HL-L5200DW";
const FRONT_DESK_CC_PRINTER: &str = "ZDesigner GC420d";
const SHIPPING_LABEL_PRINTER: &str = "Zebra  ZP 450-200 dpi";
const SHOP_PRINTER: &str = "HP LaserJet Pro M402-M403 n-dne PCL 6";
const PART_TAG_PRINTER: &str = "D550 Printer";


fn to_wide(s: &str) -> Vec<u16> {
  OsStr::new(s)
    .encode_wide()
    .chain(once(0))
    .collect()
}

unsafe fn print_image(printer_name: &str, img: &DynamicImage) -> Result<(), String> {
  let mut printer_handle = PRINTER_HANDLE { Value: null_mut() };
  let printer_wide = to_wide(printer_name);

  if OpenPrinterW(printer_wide.as_ptr() as _, &mut printer_handle, null_mut()) == 0
  {
    return Err("OpenPrinterW failed".into());
  }

  let hdc = CreateDCW(null(), printer_wide.as_ptr(), null(), null());
  if hdc == null_mut() {
    ClosePrinter(printer_handle);
    return Err("CreateDCW failed".into());
  }

  let doc_name = to_wide("Document");
  let doc_info = DOCINFOW {
    cbSize: std::mem::size_of::<DOCINFOW>() as i32,
    lpszDocName: doc_name.as_ptr(),
    lpszOutput: null(),
    lpszDatatype: null(),
    fwType: 0
  };

  if StartDocW(hdc, &doc_info) <= 0 {
    DeleteDC(hdc);
    ClosePrinter(printer_handle);
    return Err("StartDocW failed".into());
  }

  if StartPage(hdc) <= 0 {
    EndDoc(hdc);
    DeleteDC(hdc);
    ClosePrinter(printer_handle);
    return Err("StartPage failed".into());
  }

  let mut rgba = img.to_rgba8();
  let width = rgba.width() as i32;
  let height = rgba.height() as i32;

  for pixel in rgba.pixels_mut() {
    let gray =
      (0.299 * pixel[0] as f32 +
      0.587 * pixel[1] as f32 +
      0.114 * pixel[2] as f32) as u8;

    pixel[0] = gray;
    pixel[1] = gray;
    pixel[2] = gray;
  }

  let mut bmi = BITMAPINFO {
    bmiHeader: BITMAPINFOHEADER {
      biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
      biWidth: width,
      biHeight: -height,
      biPlanes: 1,
      biBitCount: 32,
      biCompression: BI_RGB,
      ..Default::default()
    },
    bmiColors: [RGBQUAD {
      rgbBlue: 0,
      rgbGreen: 0,
      rgbRed: 0,
      rgbReserved: 0
    }]
  };

  let printer_width = GetDeviceCaps(hdc, HORZRES.try_into().unwrap());
  let printer_height = GetDeviceCaps(hdc, VERTRES.try_into().unwrap());

  StretchDIBits(
    hdc,
    0,
    0,
    printer_width,
    printer_height,
    0,
    0,
    width,
    height,
    rgba.as_ptr() as _,
    &mut bmi,
    DIB_RGB_COLORS,
    SRCCOPY
  );

  EndPage(hdc);
  EndDoc(hdc);
  DeleteDC(hdc);
  ClosePrinter(printer_handle);

  Ok(())
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
pub async fn print_shipping_label(image_data: String) -> Result<(), String> {
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
pub async fn print_cc_label(image_data: String) -> Result<(), String> {
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
pub fn print_bol(args: BOLArgs) -> Result<(), String> {
  let printers = get_available_printers();
  let printer = printers.iter().find(|&p| p.contains(&FRONT_DESK_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());
  let temp_file = format!(
    "C:/Users/Public/BOL_{}.docm",
    Uuid::new_v4()
  );

  let vbs_script = format!(
    r#"
    Dim fso, src, dest, doc, sheet1
    Set fso = CreateObject("Scripting.FileSystemObject")

    src = "\\MWD1-SERVER\Server\BOLtemplate.docm"
    dest = "{}"

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
    With sheet1.Content.Find
      .Text = "<THIRD_PARTY_ADDRESS>"
      .Replacement.Text = "{}"
      .Wrap = 1
      .Execute , , , , , , , , , , 2
    End With
    With sheet1.Content.Find
      .Text = "<THIRD_PARTY_ACCOUNT_NUM>"
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
      ElseIf cc.Tag = "thirdParty" Then
        cc.Checked = {}
      End If
    Next

    doc.ActivePrinter = "{}"
    "#,
    temp_file,
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
    args.third_party_address,
    args.account_number,
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
pub async fn print_accounting_handwritten(image_data: String, file_name: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = &format!("C:/mwd/scripts/screenshots/{}", file_name);
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

    unsafe {
      print_image(&printer, &DynamicImage::ImageRgba8(upscaled_img))?;
    }

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
pub async fn print_shipping_handwritten(image_data: String, file_name: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = &format!("C:/mwd/scripts/screenshots/{}", file_name);
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
pub async fn print_core_handwritten(image_data: String, file_name: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = &format!("C:/mwd/scripts/screenshots/{}", file_name);
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
pub fn print_ci(args: CIArgs) -> Result<(), String> {
  let printers = get_available_printers();
  let printer = printers.iter().find(|&p| p.contains(&OFFICE_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());
  let temp_file = format!(
    "C:/Users/Public/CI_{}.docm",
    Uuid::new_v4()
  );

  let vbs_script = format!(
    r#"
    Dim fso, src, dest, doc, sheet1
    Set fso = CreateObject("Scripting.FileSystemObject")

    src = "\\MWD1-SERVER\Server\COMINVtemplate.docm"
    dest = "{}"

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
    Call ReplaceAndSetColor(sheet1, "<SHIP_VIA>", "{}")
    Call ReplaceAndSetColor(sheet1, "<ACCT_NUM>", "{}")

    Dim cc
    For Each cc In sheet1.ContentControls
      If cc.Tag = "prepaid" Then
        cc.Checked = {}
      ElseIf cc.Tag = "collect" Then
        cc.Checked = {}
      End If
    Next

    doc.ActivePrinter = "{}"
    "#,
    temp_file,
    args.company,
    args.address_2,
    args.address,
    args.city_state_zip,
    args.date,
    args.po,
    args.ship_via,
    if args.account_number.is_empty() {"".to_string()} else {format!("Acct# {}", args.account_number)},
    if args.prepaid {"True"} else {"False"},
    if args.collect {"True"} else {"False"},
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
pub fn print_coo() -> Result<(), String> {
  let printers = get_available_printers();
  let printer = printers.iter().find(|&p| p.contains(&OFFICE_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());
  let temp_file = format!(
    "C:/Users/Public/COO_{}.docm",
    Uuid::new_v4()
  );

  let vbs_script = format!(
    r#"
    Dim fso, src, dest, doc, sheet1
    Set fso = CreateObject("Scripting.FileSystemObject")

    src = "\\MWD1-SERVER\Server\CERTOOtemplate.docm"
    dest = "{}"

    fso.CopyFile src, dest, True

    Set doc = CreateObject("Word.Application")
    doc.Visible = True
    Set sheet1 = doc.Documents.Open(dest, False)
    doc.ActivePrinter = "{}"
    "#,
    temp_file,
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
pub async fn print_return(image_data: String) -> Result<(), String> {
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

    unsafe {
      print_image(&printer, &DynamicImage::ImageRgba8(upscaled_img))?;
    }

    Ok(())
  }).await;
  res.unwrap()
}

#[tauri::command]
pub async fn print_warranty(image_data: String) -> Result<(), String> {
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
pub async fn print_packing_slip(image_data: String, file_name: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = &format!("C:/mwd/scripts/screenshots/{}", file_name);
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
pub async fn print_po(image_data: String) -> Result<(), String> {
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
pub async fn print_proforma(image_data: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = "C:/mwd/scripts/screenshots/proforma.png";
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
pub async fn print_part_tag(image_data: String) -> Result<(), String> {
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
pub async fn print_inj_part_tag(image_data: String) -> Result<(), String> {
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
pub async fn print_engine_tag(image_data: String) -> Result<(), String> {
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
pub async fn print_engine_checklist(image_data: String) -> Result<(), String> {
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

    let rotated_img = image::DynamicImage::ImageRgba8(rotate90(&img));
    let upscaled_img = image::imageops::resize(
      &rotated_img,
      rotated_img.width() * 2,
      rotated_img.height() * 2,
      FilterType::Lanczos3
    );

    {
      let mut file = File::create(file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    unsafe {
      print_image(&printer, &DynamicImage::ImageRgba8(upscaled_img))?;
    }

    Ok(())
  }).await;
  res.unwrap()
}


#[tauri::command]
pub async fn print_quotes_list(image_data: String, file_name: String) -> Result<(), String> {
  let res = tauri::async_runtime::spawn_blocking(move || {
    let data = BASE64_STANDARD.decode(image_data.split(',').nth(1).unwrap()).map_err(|e| e.to_string())?;
    let file_path = format!("C:/mwd/scripts/screenshots/{}", file_name);
    let printers = get_available_printers();
    let printer = printers.iter().find(|&p| p.contains(&OFFICE_PRINTER.to_string())).cloned().unwrap_or_else(|| "".to_string());

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
      let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
      upscaled_img.write_to(&mut file, ImageOutputFormat::Png).map_err(|e| e.to_string())?;
    }

    if let Ok(val) = env::var("DISABLE_PRINTING") {
      if val == "TRUE" { return Ok(()) }
    }

    Command::new("mspaint")
      .current_dir("C:/mwd/scripts/screenshots")
      .args([&file_path, "/pt", &printer])
      .output()
      .map_err(|e| e.to_string())?;

    Ok(())
  }).await;
  res.unwrap()
}
