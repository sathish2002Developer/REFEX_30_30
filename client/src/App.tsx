import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import ScrollToTop from "./components/ScrollToTop";
import AutoScrollToTop from "./components/AutoScrollToTop";
import { WallAuthProvider } from "./context/WallAuthContext";
import { SiteChromeProvider } from "./context/SiteChromeContext";
import WallLoginModal from "./pages/wall/components/WallLoginModal";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <WallAuthProvider>
        <BrowserRouter basename={__BASE_PATH__}>
          <SiteChromeProvider>
            <AutoScrollToTop />
            <AppRoutes />
            <ScrollToTop />
            <WallLoginModal />
          </SiteChromeProvider>
        </BrowserRouter>
      </WallAuthProvider>
    </I18nextProvider>
  );
}

export default App;