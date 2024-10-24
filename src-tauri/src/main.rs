#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::process::Command;
use std::fs::{write};
use std::{fs::File, io::copy};
use reqwest::Client;
use std::path::Path;
use zip::read::ZipArchive;

#[derive(Deserialize, Debug)]
struct LatestVersionInfo {
  version: String
}


#[tokio::main]
async fn main() {
  tauri::Builder::default()
    .setup(|_| {
      create_directories();
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![new_email_draft, install_update, open_window])
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

#[derive(Deserialize, Serialize)]
struct WindowArgs {
  title: String,
  url: String
}

#[tauri::command]
async fn open_window(app: tauri::AppHandle, window_args: WindowArgs) {
  let title = window_args.title;
  let url = if cfg!(debug_assertions) {
    window_args.url.clone()
  } else {
    format!("index.html#{}", window_args.url)
  };

  tauri::WindowBuilder::new(
    &app,
    title.clone(),
    tauri::WindowUrl::App(url.into())
  )
    .title(title)
    .inner_size(1500.0, 800.0)
    .build()
    .unwrap();
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


#[derive(Deserialize, Serialize)]
struct EmailArgs {
  subject: String,
  body: String,
  recipients: Vec<String>,
  cc_recipients: Option<Vec<String>>,
  bcc_recipients: Option<Vec<String>>,
  attachments: Option<Vec<String>>
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
