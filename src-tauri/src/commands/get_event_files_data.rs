use std::{
    ffi::OsStr,
    fs::Metadata,
    time::{SystemTime, UNIX_EPOCH},
};

use anyhow::Context;
use chrono::{NaiveDate, NaiveDateTime, Utc};
use serde::Serialize;
use walkdir::{DirEntry, WalkDir};

use crate::utils::{get_file_type, is_dir, FileType};

// TODO автогенерация типов??
#[derive(Serialize)]
pub struct FileData {
    date_time: NaiveDateTime,
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

    let mut files_data: Vec<FileData> = Vec::new();
    let dir: WalkDir = WalkDir::new(path);

    for entry in dir {
        if let Err(err) = process_entry(entry, date, &mut files_data) {
            log::error!("Ошибка при итерации по директории: {err:#}");
        }
    }

    files_data.sort_by(|a, b| a.date_time.cmp(&b.date_time));

    Ok(files_data)
}

fn process_entry(
    entry: walkdir::Result<DirEntry>,
    date: NaiveDate,
    files_data: &mut Vec<FileData>,
) -> anyhow::Result<()> {
    let entry: DirEntry = entry.context("access entry")?;
    let entry_name: &OsStr = entry.file_name();
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

    let created_naive_datetime: NaiveDateTime = created_utc_datetime.naive_local();
    let created_naive_date: NaiveDate = created_naive_datetime.date();
    let Some(entry_file_type) = get_file_type(&entry) else {
        return Ok(());
    };

    if created_naive_date != date {
        return Ok(());
    }

    files_data.push(FileData {
        date_time: created_naive_datetime,
        name: entry_name.to_string_lossy().to_string(),
        local_url: entry.path().display().to_string(),
        kind: entry_file_type,
    });

    Ok(())
}
