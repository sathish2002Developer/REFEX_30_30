import { useSiteChrome } from "../context/SiteChromeContext";

export default function Footer() {
  const { site } = useSiteChrome();
  const { footer: ft } = site;
  const logoSrc = ft.logo_resolved_url || ft.logo_url;

  return (
    <footer className="w-full bg-refex-darker border-t border-black/5 py-10 px-6 md:px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <img src={logoSrc} alt={ft.logo_alt} className="h-8 w-auto" />
        <div className="text-sm font-sans text-refex-text-dim tracking-wide text-center md:text-left">
          {ft.line_left}
        </div>
        <div className="text-sm font-sans text-refex-text-muted tracking-wide text-center md:text-right">
          {ft.line_right}
        </div>
      </div>
    </footer>
  );
}
