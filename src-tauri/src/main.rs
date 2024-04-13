// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn greet(name: &str) -> String {
    let var = std::env::var("DIR").unwrap();
    log::info!("{}", var);

    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    simple_logger::init().unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
