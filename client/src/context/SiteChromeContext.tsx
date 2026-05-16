import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchSiteChrome } from "../services/cmsApi";
import {
  DEFAULT_SITE_CHROME,
  mergeSiteChromeFromApi,
  type SiteChromeCms,
} from "../types/siteChromeCms";

type SiteChromeContextValue = {
  site: SiteChromeCms;
  loading: boolean;
  reload: () => Promise<void>;
};

const SiteChromeContext = createContext<SiteChromeContextValue | null>(null);

export function SiteChromeProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteChromeCms>(DEFAULT_SITE_CHROME);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const data = await fetchSiteChrome();
    setSite(mergeSiteChromeFromApi(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(
    () => ({
      site,
      loading,
      reload,
    }),
    [site, loading, reload]
  );

  return <SiteChromeContext.Provider value={value}>{children}</SiteChromeContext.Provider>;
}

export function useSiteChrome(): SiteChromeContextValue {
  const ctx = useContext(SiteChromeContext);
  if (!ctx) {
    throw new Error("useSiteChrome must be used within SiteChromeProvider");
  }
  return ctx;
}
