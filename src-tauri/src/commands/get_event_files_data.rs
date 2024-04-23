use anyhow::Context;
use chrono::NaiveDate;

use serde::Serialize;
use std::path::Path;
use ts_rs::TS;
use walkdir::{DirEntry, WalkDir};

use crate::utils::{get_file_type, is_dir, FileType, SUITABLE_FILE_PATH_REGEX};

#[derive(Serialize, TS)]
#[ts(export, export_to = "file-data.type.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct FileData {
    date_time: NaiveDate,
    name: String,
    kind: FileType,
    local_url: String,
}

#[tauri::command]
pub fn get_event_files_data_command(path: &str, date: NaiveDate) -> Result<Vec<FileData>, String> {
    get_event_files_data(path, date).map_err(|err| format!("{err:#}"))
}

fn get_event_files_data(path: &str, date: NaiveDate) -> anyhow::Result<Vec<FileData>> {
    is_dir(path)?;

    let dir: WalkDir = WalkDir::new(path);
    let mut files_data: Vec<FileData> = Vec::new();

    for entry in dir {
        if let Err(err) = process_entry(entry, date, &mut files_data) {
            log::error!("Ошибка при итерации по директории: {err:#}");
        }
    }

    files_data.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(files_data)
}

fn process_entry(
    entry: walkdir::Result<DirEntry>,
    date: NaiveDate,
    files_data: &mut Vec<FileData>,
) -> anyhow::Result<()> {
    let entry: walkdir::DirEntry = entry.context("access entry")?;
    let entry_path: &Path = entry.path();

    let Some(entry_path_str) = entry_path.to_str() else {
        return Ok(());
    };

    let Some(groups) = SUITABLE_FILE_PATH_REGEX.captures(entry_path_str) else {
        return Ok(());
    };

    let year: i32 = groups["year"].parse().context("parse year to usize")?;
    let month: u32 = groups["month"].parse().context("parse month to usize")?;
    let day: u32 = groups["day"].parse().context("parse day to usize")?;

    let Some(naive_date) = NaiveDate::from_ymd_opt(year, month, day) else {
        return Ok(());
    };

    let Some(entry_file_type) = get_file_type(&entry) else {
        return Ok(());
    };

    if naive_date != date {
        return Ok(());
    }

    files_data.push(FileData {
        date_time: naive_date,
        name: entry.file_name().to_string_lossy().to_string(),
        local_url: entry.path().display().to_string(),
        kind: entry_file_type,
    });

    Ok(())
}
