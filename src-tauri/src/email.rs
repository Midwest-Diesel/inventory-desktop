use serde::{Deserialize, Serialize};
use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine};
use std::{io::BufWriter};
use std::fs::{write, File};
use std::io::{Write};
use std::process::{Command};
use crate::reset_end_of_day_queue;

#[derive(Deserialize, Serialize)]
pub struct FilesArgs {
  name: String,
  files: Vec<FileUpload>,
  is_multifile: bool
}

#[derive(Deserialize, Serialize)]
pub struct FileUpload {
  name: String,
  data: String
}

#[derive(Deserialize, Serialize)]
pub struct EmailArgs {
  subject: String,
  body: String,
  recipients: Vec<String>,
  cc_recipients: Option<Vec<String>>,
  bcc_recipients: Option<Vec<String>>,
  attachments: Option<Vec<String>>
}

#[derive(Deserialize, Serialize)]
pub struct SendEmailArgs {
  body: String,
  subject: String,

  #[serde(default)]
  recipients: Vec<String>,

  #[serde(default)]
  cc: Vec<String>,
  
  #[serde(default)]
  attachments: Vec<String>
}

#[derive(Deserialize, Serialize)]
pub struct EmailEndOfDayArgs {
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
pub struct EmailPOReceivedArgs {
  po_num: String,
  purchased_from: String,
  items: Vec<String>,
  email: String
}

#[derive(Deserialize, Serialize)]
pub struct FastTrackItem {
  part_num: String,
  manufacturer: String,
  qty: String,
  desc: String,
  condition: String,
  alt_parts: String
}

#[derive(Deserialize, Serialize)]
pub struct NetcomItem {
  part_num: String,
  manufacturer: String,
  desc: String,
  qty: String,
  condition: String,
  alt_parts: String
}


fn send_email(data: SendEmailArgs) {
  let recipients = data.recipients.join(";");
  let cc_list = data.cc.join(";");
  let attachments_vbs = data
    .attachments
    .iter()
    .map(|path| format!("MailItem.Attachments.Add \"{}\"", path.replace("\"", "\"\"")))
    .collect::<Vec<_>>()
    .join("\n");

  let vbs_script = format!(
    r#"
    Dim OutlookApp
    Set OutlookApp = CreateObject("Outlook.Application")
    Dim MailItem
    Set MailItem = OutlookApp.CreateItem(0)
    MailItem.Subject = "{}"
    MailItem.HTMLBody = "{}"
    MailItem.To = "{}"
    MailItem.CC = "{}"

    {}
    MailItem.Send
    "#,
    data.subject,
    data.body.replace("\"", "\"\""),
    recipients,
    cc_list,
    attachments_vbs
  );

  let vbs_path = "C:/mwd/scripts/send_email.vbs";
  write(&vbs_path, vbs_script).expect("Failed to write VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().expect("Failed to run VBS script");
}

#[tauri::command]
pub async fn upload_email_stuff_files(file_upload: FilesArgs) -> Result<(), String> {
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
pub fn new_email_draft(email_args: EmailArgs) {
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
pub fn attach_to_existing_email(attachments: String) {
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
pub async fn email_proforma(path: String, contact: String, created_by: String) -> Result<(), String> {
  let body = format!("Hi {},<br />Attached to this email is your Proforma invoice.<br /><br />Thanks,<br />{}<br />Midwest Diesel<br />(888) 866-3406",
    contact,
    created_by
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
    
    MailItem.Subject = "Midwest Diesel - Proforma Invoice"
    MailItem.HTMLBody = {}
    MailItem.Attachments.Add "{}"
    MailItem.Display
    "#,
    vb_body,
    path
  );

  let vbs_path = "C:/mwd/scripts/email_proforma.vbs";
  write(&vbs_path, vbs_script).unwrap();

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(vbs_path);
  cmd.output().unwrap();
  Ok(())
}

#[tauri::command]
pub fn email_po(po_num: String, path: String) {
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
pub fn email_po_received(args: EmailPOReceivedArgs) {
  if cfg!(debug_assertions) { return; }

  let body = args
    .items
    .iter()
    .map(|item| format!("<br />     * {}", item))
    .collect::<String>();

  send_email(SendEmailArgs {
    body: format!("PO# {} purchased from {} has received the following items:<br />{}", args.po_num, args.purchased_from, body.replace("\"", "\"\"")),
    recipients: vec![args.email],
    cc: vec![],
    attachments: vec![],
    subject: format!("PO #{} has been received!", args.po_num)
  });
}

#[tauri::command]
pub fn email_end_of_day(args: EmailEndOfDayArgs) {
  reset_end_of_day_queue(args.day, args.month, args.year);

  let queue_dir = if cfg!(debug_assertions) {
    "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Testing\\Queue"
  } else {
    "\\\\MWD1-SERVER\\Server\\InvoiceScans\\Queue"
  };

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
}


#[tauri::command]
pub fn email_karmak_invoice(args: EmailEndOfDayArgs) {
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
pub async fn email_fast_track_inventory(inventory: Vec<FastTrackItem>) -> Result<(), String> {
  let file_path = "\\\\MWD1-SERVER\\Server\\FastTrack\\Parts C514.csv";
  let file = File::create(file_path).map_err(|e| e.to_string())?;
  let mut writer = BufWriter::new(file);

  writeln!(
    writer,
    "PartNumber,Manufacturer,Quantity,Description,Condition,Price,Other,City,State,Country,AlternateParts"
  )
  .map_err(|e| e.to_string())?;

  for item in &inventory {
    writeln!(
      writer,
      "\"=\"\"{}\"\"\",\"{}\",\"{}\",\"{}\",\"{}\",\"\",\"\",\"Blaine\",\"MN\",\"USA\",\"=\"\"{}\"\"\"",
      item.part_num, item.manufacturer, item.qty, item.desc, item.condition, item.alt_parts
    )
    .map_err(|e| e.to_string())?;
  }

  writer.flush().map_err(|e| e.to_string())?;
  drop(writer);

  if cfg!(debug_assertions) {
    return Ok(());
  }
  
  send_email(SendEmailArgs {
    body: "<div></div>".to_string(),
    recipients: vec!["imports@sandhills.com".to_string()],
    cc: vec!["matt@midwestdiesel.com".to_string()],
    attachments: vec![file_path.to_string()],
    subject: "partsc514".to_string()
  });

  Ok(())
}

#[tauri::command]
pub async fn email_netcom_inventory(inventory: Vec<NetcomItem>) -> Result<(), String> {
  let file_path = "\\\\MWD1-SERVER\\Server\\netcom_inventory\\PartM514.csv";
  let file = File::create(file_path).map_err(|e| e.to_string())?;
  let mut writer = BufWriter::new(file);

  writeln!(
    writer,
    "PartNumber,Manufacturer_,Description,Quantity_,Condition,AlternateParts"
  )
  .map_err(|e| e.to_string())?;

  for item in &inventory {
    writeln!(
      writer,
      "\"=\"\"{}\"\"\",\"{}\",\"{}\",\"{}\",\"{}\",\"=\"\"{}\"\"\"",
      item.part_num, item.manufacturer, item.desc, item.qty, item.condition, item.alt_parts
    )
    .map_err(|e| e.to_string())?;
  }

  writer.flush().map_err(|e| e.to_string())?;
  drop(writer);

  if cfg!(debug_assertions) {
    return Ok(());
  }

  send_email(SendEmailArgs {
    body: "<div></div>".to_string(),
    recipients: vec!["thepartfinder@yahoo.com".to_string()],
    cc: vec!["matt@midwestdiesel.com".to_string()],
    attachments: vec![file_path.to_string()],
    subject: "PartM514.csv".to_string()
  });

  Ok(())
}
