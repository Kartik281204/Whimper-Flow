// Prevent a second console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    whimpr_tauri_lib::run();
}
