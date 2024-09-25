#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![new_email_draft])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn new_email_draft(file_path: Option<String>) {
  let mut cmd = Command::new("C:/Program Files (x86)/Microsoft Office/root/Office16/OUTLOOK.EXE");

  if let Some(path) = file_path {
    cmd.args(&["/a", &path]);
  }
  
  cmd.output().expect("Failed to create new draft");
}
