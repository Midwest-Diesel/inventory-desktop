#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use serde::{Deserialize, Serialize};


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![new_email_draft])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[derive(Deserialize, Serialize)]
struct EmailArgs {
  attachments: Option<Vec<String>>
}

#[tauri::command]
fn new_email_draft(email_args: EmailArgs) {
  let mut cmd = Command::new("C:/Program Files (x86)/Microsoft Office/root/Office16/OUTLOOK.EXE");
  if let Some(attachments) = email_args.attachments {
    for attachment in attachments {
      cmd.args(&["/a", &attachment]);
    }
  }
  cmd.output().expect("Failed to create new draft");
}
