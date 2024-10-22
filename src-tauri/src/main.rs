#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::process::Command;
use std::fs::{write};
use std::{fs::File, io::copy};
use tauri::{Manager};
use reqwest::Client;
use std::path::Path;
use zip::read::ZipArchive;

#[tokio::main]
async fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let handle = app.handle();
      let version = app.package_info().version.to_string();
      handle.listen_global("tauri://update", move |_| {
        println!("Update detected");
        let version = version.clone();
        tokio::spawn(async move {
          if let Err(e) = download_update(version).await {
            println!("Error downloading the update: {}", e);
          }
        });
      });
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![new_email_draft])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

async fn download_update(version: String) -> Result<(), Box<dyn std::error::Error>> {
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

  // Extract the ZIP file
  let mut archive = ZipArchive::new(File::open(&zip_path)?)?;
  for i in 0..archive.len() {
      let mut file = archive.by_index(i)?;
      let outpath = Path::new("C:/MWD/updates").join(file.sanitized_name());
      
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

  // Run the installer
  let installer_path = "C:/MWD/updates/your_installer_name.exe"; // Replace with the actual installer name
  let _ = Command::new(installer_path)
      .arg("/S") // Add any required arguments for silent installation
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
