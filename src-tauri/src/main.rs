#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::process::Command;
use std::fs::write;
use std::env;


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![new_email_draft, email_quote])
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
    MailItem.Body = "{}"
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
    body,
    recipients,
    if !cc_recipients.is_empty() {
      format!("MailItem.CC = \"{}\"", cc_recipients)
    } else {
      "".to_string()
    },
    if !bcc_recipients.is_empty() {
      format!("MailItem.BCC = \"{}\"", bcc_recipients)
    } else {
      "".to_string()
    },
    if !attachments_joined.is_empty() {
      format!("Dim attachments: attachments = \"{}\"", attachments_joined)
    } else {
      "".to_string()
    }
  );

  let temp_vbs_path = env::temp_dir().join("CreateEmailDraft.vbs");
  write(&temp_vbs_path, vbs_script).expect("Failed to create VBS script");

  let mut cmd = Command::new("wscript.exe");
  cmd.arg(temp_vbs_path.clone());
  cmd.output().expect("Failed to create new draft");
  let _ = std::fs::remove_file(temp_vbs_path);
}


#[derive(Deserialize, Serialize)]
struct QuoteArgs {
  quote_id: i128,
  date: String,
  customer: String,
  contact: Option<String>,
  qty: i16,
  part_num: String,
  desc: String,
  unit_price: i16
}

#[tauri::command]
fn email_quote(quote_args: QuoteArgs) {
    let ext_price = quote_args.qty * quote_args.unit_price;
    let quote_form = "\\\\MWD1-SERVER\\Server\\myquotetemplate.docm";

    let vbs_script = format!(
        r#"
        Dim WordApp
        Dim QuoteDoc
        Set WordApp = CreateObject("Word.Application")
        WordApp.Visible = True
        Set QuoteDoc = WordApp.Documents.Open("{}")

        QuoteDoc.Bookmarks("QuoteID").Range.Text = "{}"
        QuoteDoc.Bookmarks("Date").Range.Text = "{}"
        QuoteDoc.Bookmarks("Customer").Range.Text = "{}"
        QuoteDoc.Bookmarks("Contact").Range.Text = "{}"

        Dim tbl
        Set tbl = QuoteDoc.Tables(1)
        tbl.Cell(1, 1).Range.Text = "{}" ' Qty
        tbl.Cell(1, 2).Range.Text = "{}" ' PartNum
        tbl.Cell(1, 3).Range.Text = "{}" ' Desc
        tbl.Cell(1, 4).Range.Text = "{}" ' UnitPrice
        tbl.Cell(1, 5).Range.Text = "{}" ' Ext. Price

        WordApp.Visible = True
        "#,
        quote_form,
        quote_args.quote_id,
        quote_args.date,
        quote_args.customer,
        if let Some(contact) = quote_args.contact {
          contact
        } else {
          "".to_string()
        },
        quote_args.qty,
        quote_args.part_num,
        quote_args.desc,
        quote_args.unit_price,
        ext_price
    );

    let temp_vbs_path = env::temp_dir().join("EmailQuote.vbs");
    std::fs::write(&temp_vbs_path, vbs_script).expect("Failed to create VBS script");

    let mut cmd = std::process::Command::new("wscript.exe");
    cmd.arg(temp_vbs_path.clone());
    cmd.output().expect("Failed to open quote template");
    let _ = std::fs::remove_file(temp_vbs_path);
}
