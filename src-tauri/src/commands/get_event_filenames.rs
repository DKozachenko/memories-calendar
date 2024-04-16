use std::{
    fs::Metadata,
    time::{SystemTime, UNIX_EPOCH},
};

use anyhow::Context;
use chrono::{NaiveDate, Utc};
use walkdir::{DirEntry, WalkDir};

use crate::utils::{is_dir, is_photo, is_video};

#[tauri::command]
pub fn get_event_filenames_command(path: &str, date: NaiveDate) -> Result<Vec<String>, String> {
    get_event_filenames(path, date).map_err(|err| format!("{err:#}"))
}

fn get_event_filenames(path: &str, date: NaiveDate) -> anyhow::Result<Vec<String>> {
    is_dir(path)?;

    let mut result: Vec<String> = Vec::new();
    let dir: WalkDir = WalkDir::new(path);

    for entry in dir {
        if let Err(err) = process_entry(entry, date, &mut result) {
            log::error!("Ошибка при итерации по директории: {err:#}");
        }
    }

    Ok(result)
}

fn process_entry(
    entry: walkdir::Result<DirEntry>,
    date: NaiveDate,
    filenames: &mut Vec<String>,
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

    if created_naive_date != date {
        return Ok(());
    }

    filenames.push(entry.path().display().to_string());

    Ok(())
}
