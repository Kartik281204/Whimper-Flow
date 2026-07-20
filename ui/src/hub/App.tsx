import { useEffect, useState } from "react";
import { font } from "../tokens/values";
import { theme } from "./theme";
import { Onboarding } from "./Onboarding";
import { Sidebar, type Page } from "./Sidebar";
import { Home } from "./Home";
import { Insights } from "./Insights";
import { DictionaryPane } from "./DictionaryPane";
import { SettingsPane } from "./SettingsPane";
import { Help } from "./Help";
import { ComingSoon } from "./ComingSoon";
import type { IconName } from "./icons";
import {
  getSettings,
  setSettings,
  getStatus,
  type Settings,
  type Status,
  DEFAULT_SETTINGS,
} from "./api";

// Placeholder screens that are routed but not yet built.
const SOON: Partial<Record<Page, { icon: IconName; title: string; desc: string }>> = {
  snippets: {
    icon: "snippets",
    title: "Snippets",
    desc: "Save reusable phrases and expand them by voice — signatures, addresses, boilerplate.",
  },
  style: {
    icon: "style",
    title: "Style",
    desc: "Tune WhimprFlow's tone and formatting so cleaned-up text always sounds like you.",
  },
  transforms: {
    icon: "transforms",
    title: "Transforms",
    desc: "Turn a quick spoken thought into an email, a summary, or a to-do with one command.",
  },
  scratchpad: {
    icon: "scratchpad",
    title: "Scratchpad",
    desc: "A quiet place to dictate long-form and shape it before it lands anywhere else.",
  },
};

export function App() {
  const [page, setPage] = useState<Page>("home");
  const [settings, setLocalSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [entered, setEntered] = useState(false);
  const [status, setStatus] = useState<Status>({
    accessibility: false,
    microphone: false,
    input_monitoring: false,
    has_openai_key: false,
    has_anthropic_key: false,
  });

  const refresh = () => getStatus().then(setStatus);

  useEffect(() => {
    getSettings().then(setLocalSettings);
    refresh();
  }, []);

  const update = (s: Settings) => {
    setLocalSettings(s);
    void setSettings(s);
  };

  // Gate the app behind the setup wizard until the required permissions are granted.
  if (!(status.accessibility && status.microphone) && !entered) {
    return <Onboarding status={status} refresh={refresh} onEnter={() => setEntered(true)} />;
  }

  const soon = SOON[page];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: font.ui,
        color: theme.textBody,
        background: theme.pageBg,
      }}
    >
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <div style={{ padding: "36px 44px", margin: "0 auto", maxWidth: 1120 }}>
          {page === "home" && <Home />}
          {page === "insights" && <Insights />}
          {page === "dictionary" && <DictionaryPane />}
          {page === "settings" && (
            <SettingsPane settings={settings} onChange={update} status={status} refresh={refresh} />
          )}
          {page === "help" && <Help />}
          {soon && <ComingSoon icon={soon.icon} title={soon.title} desc={soon.desc} />}
        </div>
      </main>
    </div>
  );
}
