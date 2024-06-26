use once_cell::sync::Lazy;
use regex::Regex;
use serde::Serialize;
use std::{ffi::OsStr, fs, io};
use ts_rs::TS;
use walkdir::DirEntry;

pub static SUITABLE_FILE_PATH_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(
        r"(?<year>20\d{2})[/\\](?<day>\d+)\.(?<month>\d{2})[/\\][A-ZА-Яa-zа-я0-9()_ \.,-]+\.\w+$",
    )
    .unwrap()
});

const VIDEO_EXTENSIONS: &[&str] = &["mp4", "mov"];
const PHOTO_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png"];

#[derive(Serialize, TS)]
#[ts(export, export_to = "file-type.type.ts")]
pub enum FileType {
    Video,
    Photo,
}

pub fn get_file_type(entry: &DirEntry) -> Option<FileType> {
    entry
        .path()
        .extension()
        .and_then(OsStr::to_str)
        .and_then(|ext| {
            if PHOTO_EXTENSIONS.contains(&ext.to_ascii_lowercase().as_str()) {
                return Some(FileType::Photo);
            }
            if VIDEO_EXTENSIONS.contains(&ext.to_ascii_lowercase().as_str()) {
                return Some(FileType::Video);
            }
            None
        })
}

pub fn is_dir(path: &str) -> anyhow::Result<()> {
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
