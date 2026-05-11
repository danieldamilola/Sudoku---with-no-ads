// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri_plugin_shell::init()
        .build()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
