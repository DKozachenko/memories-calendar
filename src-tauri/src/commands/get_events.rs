use std::{collections::HashMap, path::Path};
use ts_rs::TS;

use anyhow::Context;
use chrono::NaiveDate;
use serde::Serialize;
use walkdir::{DirEntry, WalkDir};

use crate::utils::{get_file_type, is_dir, FileType, SUITABLE_FILE_PATH_REGEX};
#[derive(Serialize, Default, TS)]
#[ts(
    export,
    export_to = "date-quantitative-data.type.ts",
    rename_all = "camelCase"
)]
#[serde(rename_all = "camelCase")]
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

    let event_data: &mut DateQuantitativeData = events_map.entry(naive_date).or_default();

    match entry_file_type {
        FileType::Video => event_data.videos_number += 1,
        FileType::Photo => event_data.photos_number += 1,
    };

    Ok(())
}
