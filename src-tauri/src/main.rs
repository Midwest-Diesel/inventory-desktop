#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::process::Command;
use url::form_urlencoded;


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![new_email_draft])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
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
  let mut cmd = Command::new("C:/Program Files (x86)/Microsoft Office/root/Office16/OUTLOOK.EXE");
  let recipients = email_args.recipients.join("; ");
  let subject = form_urlencoded::byte_serialize(email_args.subject.as_bytes()).collect::<String>();
  let body = form_urlencoded::byte_serialize(email_args.body.as_bytes()).collect::<String>();
  
  let email_address = format!("{}?subject={}&body={}", recipients, subject, body);
  cmd.args(&["/m", &email_address]);

  if let Some(attachments) = email_args.attachments {
    for attachment in attachments {
      cmd.args(&["/a", &attachment]);
    }
  }
  cmd.output().expect("Failed to create new draft");
}
