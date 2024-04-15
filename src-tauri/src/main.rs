// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::{NaiveDate, Utc};
use serde::Serialize;
use std::{
    collections::HashMap,
    ffi::OsStr,
    fs::{self, Metadata},
    io,
    time::{SystemTime, UNIX_EPOCH},
};
use walkdir::{DirEntry, WalkDir};

use anyhow::Context;

const VIDEO_EXTENSIONS: &[&str] = &["mp4", "mov"];
const PHOTO_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png"];

#[derive(Serialize, Default)]
struct EventQuantitativeData {
    photos_number: usize,
    videos_number: usize,
}

#[tauri::command]
fn get_events(path: &str) -> Result<HashMap<NaiveDate, EventQuantitativeData>, String> {
    _get_events(path).map_err(|err| format!("{err:#}"))
}

fn _get_events(path: &str) -> anyhow::Result<HashMap<NaiveDate, EventQuantitativeData>> {
    is_dir(path)?;

    let dir: WalkDir = WalkDir::new(path);
    let mut events_map: HashMap<NaiveDate, EventQuantitativeData> = HashMap::new();

    for entry in dir {
        if let Err(err) = process_entry(entry, &mut events_map) {
            log::error!("Ошибка при итерации по директории: {err:#}");
        }
    }

    Ok(events_map)
}

fn is_dir(path: &str) -> anyhow::Result<()> {
    match fs::metadata(path) {
        Ok(metadata) if metadata.is_dir() => Ok(()),
        Ok(_) => {
            anyhow::bail!("По указанному пути находится не директория")
        }
        Err(err) if err.kind() == io::ErrorKind::NotFound => {
            anyhow::bail!("По указанному пути директория не найдена")
        }
        Err(err) => {
            log::error!("Ошибка чтения директории по пути {path}: {err:#}");
            anyhow::bail!("Неизвестная ошибка чтения директории")
        }
    }
}

fn process_entry(
    entry: walkdir::Result<DirEntry>,
    events_map: &mut HashMap<NaiveDate, EventQuantitativeData>,
) -> anyhow::Result<()> {
    let entry: DirEntry = entry.context("access entry")?;
    let entry_metadata: Metadata = entry.metadata().context("get metadata")?;
    let created_system_time: SystemTime = entry_metadata.created().context("get created time")?;
    let created_time_as_secs: u64 = created_system_time
        .duration_since(UNIX_EPOCH)
        .context("calculate UNIX time")?
        .as_secs();

    let Some(created_utc_datetime) =
        chrono::DateTime::<Utc>::from_timestamp(created_time_as_secs as _, 0)
    else {
        anyhow::bail!("{created_time_as_secs} is not timestamp convertible")
    };

    let created_naive_date: NaiveDate = created_utc_datetime.naive_local().date();

    if !is_video(&entry) && !is_photo(&entry) {
        return Ok(());
    }

    let event_data: &mut EventQuantitativeData = events_map.entry(created_naive_date).or_default();

    if is_video(&entry) {
        event_data.videos_number += 1;
    } else if is_photo(&entry) {
        event_data.photos_number += 1;
    }

    Ok(())
}

fn is_video(entry: &DirEntry) -> bool {
    entry
        .path()
        .extension()
        .and_then(OsStr::to_str)
        .map(|ext| VIDEO_EXTENSIONS.contains(&ext.to_ascii_lowercase().as_str()))
        .unwrap_or(false)
}

fn is_photo(entry: &DirEntry) -> bool {
    entry
        .path()
        .extension()
        .and_then(OsStr::to_str)
        .map(|ext| PHOTO_EXTENSIONS.contains(&ext.to_ascii_lowercase().as_str()))
        .unwrap_or(false)
}

fn main() -> anyhow::Result<()> {
    simple_logger::init()?;

    start_tauri()?;
    Ok(())
}

fn start_tauri() -> anyhow::Result<()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_events])
        .run(tauri::generate_context!())
        .context("run tauri application")
}
