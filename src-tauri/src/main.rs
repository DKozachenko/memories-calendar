// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod utils;

use anyhow::Context;
use commands::{get_event_filenames_command, get_events_command};

fn main() -> anyhow::Result<()> {
    simple_logger::init()?;

    start_tauri()?;
    Ok(())
}

fn start_tauri() -> anyhow::Result<()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_events_command,
            get_event_filenames_command
        ])
        .run(tauri::generate_context!())
        .context("run tauri application")
}
