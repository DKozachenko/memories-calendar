use std::{ffi::OsStr, fs, io};
use walkdir::DirEntry;

const VIDEO_EXTENSIONS: &[&str] = &["mp4", "mov"];
const PHOTO_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png"];

pub fn is_video(entry: &DirEntry) -> bool {
    entry
        .path()
        .extension()
        .and_then(OsStr::to_str)
        .map(|ext| VIDEO_EXTENSIONS.contains(&ext.to_ascii_lowercase().as_str()))
        .unwrap_or(false)
}

pub fn is_photo(entry: &DirEntry) -> bool {
    entry
        .path()
        .extension()
        .and_then(OsStr::to_str)
        .map(|ext| PHOTO_EXTENSIONS.contains(&ext.to_ascii_lowercase().as_str()))
        .unwrap_or(false)
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
