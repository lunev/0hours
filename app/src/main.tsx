import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { ROUTES } from "@/config";
import { HomePage } from "@/pages/home";
import { SettingsPage } from "@/pages/settings";
import "@/assets/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="vite-ui-theme">
      <HashRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
);
