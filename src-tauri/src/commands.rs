use std::{
    collections::HashMap,
    fs::Metadata,
    time::{SystemTime, UNIX_EPOCH},
};

use anyhow::Context;
use chrono::{NaiveDate, Utc};
use serde::Serialize;
use walkdir::{DirEntry, WalkDir};

use crate::utils::{is_dir, is_photo, is_video};

#[derive(Serialize, Default)]
pub struct DateQuantitativeData {
    photos_number: usize,
    videos_number: usize,
}

#[tauri::command]
pub fn get_events_command(path: &str) -> Result<HashMap<NaiveDate, DateQuantitativeData>, String> {
    get_events(path).map_err(|err| format!("{err:#}"))
}

fn get_events(path: &str) -> anyhow::Result<HashMap<NaiveDate, DateQuantitativeData>> {
    is_dir(path)?;

    let dir: WalkDir = WalkDir::new(path);
    let mut events_map: HashMap<NaiveDate, DateQuantitativeData> = HashMap::new();

    for entry in dir {
        if let Err(err) = process_entry(entry, &mut events_map) {
            log::error!("Ошибка при итерации по директории: {err:#}");
        }
    }

    Ok(events_map)
}

fn process_entry(
    entry: walkdir::Result<DirEntry>,
    events_map: &mut HashMap<NaiveDate, DateQuantitativeData>,
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

    let event_data: &mut DateQuantitativeData = events_map.entry(created_naive_date).or_default();

    if is_video(&entry) {
        event_data.videos_number += 1;
    } else if is_photo(&entry) {
        event_data.photos_number += 1;
    }

    Ok(())
}
