import { useState } from "react";
import { HashRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { ChangelogDialog } from "@/components/changelog-dialog.tsx";
import { SupportPopup } from "@/components/support-popup.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@/config";
import { HomePage } from "@/pages/home";
import { SettingsPage } from "@/pages/settings";
import { cn } from "@/lib/utils";

export const App = () => {
  const [isSupportPopupVisible, setIsSupportPopupVisible] = useState(false);

  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <TooltipProvider>
        <ChangelogDialog />
        <SupportPopup onVisibleChange={setIsSupportPopupVisible} />
        {/* Reserves room below the page content so the fixed, bottom-right SupportPopup card doesn't cover it. */}
        <div className={cn(isSupportPopupVisible && "pb-16")}>
          <HashRouter>
            <Routes>
              <Route index element={<HomePage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            </Routes>
          </HashRouter>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
};
