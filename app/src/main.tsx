import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Home, NotFound, Settings } from "@/pages";
import { ROUTES } from "@/config";
import "@/assets/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="vite-ui-theme">
      <HashRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
);
