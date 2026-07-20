//! Quick check of the OpenAI cleanup path.
//! Usage: OPENAI_API_KEY=... cargo run -p whimpr-cleanup --example clean

use whimpr_cleanup::OpenAiProvider;
use whimpr_core::{CleanupContext, CleanupLevel, CleanupProvider};

fn main() -> anyhow::Result<()> {
    let key = std::env::var("OPENAI_API_KEY")?;
    let provider = OpenAiProvider::new(key, "gpt-4o-mini");

    let samples = [
        "um so i think we should uh meet at 2 actually 3 tomorrow you know to talk about the the project",
        "can you send the deck over when you get a chance thanks",
    ];
    let ctx = CleanupContext {
        level: CleanupLevel::Light,
        ..Default::default()
    };
    for raw in samples {
        println!("RAW:     {raw}");
        match provider.cleanup(raw, &ctx) {
            Ok(cleaned) => println!("CLEANED: {cleaned}\n"),
            Err(e) => {
                println!("ERROR:   {e}\n");
                std::process::exit(1);
            }
        }
    }
    Ok(())
}
