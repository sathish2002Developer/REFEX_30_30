import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallAuth } from "../context/WallAuthContext";
import { useSiteChrome } from "../context/SiteChromeContext";
import UserAvatar from "@/pages/wall/components/UserAvatar";

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, openLogin, logout } = useWallAuth();
  const { site } = useSiteChrome();
  const { navbar: nb } = site;
  const navLinks = nb.nav_links.length ? nb.nav_links : [{ to: "/", label: "Home" }];
  const isActive = (path: string) => location.pathname === path;
  const logoSrc = nb.logo_resolved_url || nb.logo_url;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 transition-all duration-300">
      <div className="w-full px-6 md:px-10 py-5 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center shrink-0">
          <img src={logoSrc} alt={nb.logo_alt} className="h-14 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={`${link.to}-${link.label}`}
              to={link.to}
              className={`px-4 py-2 text-base font-bold font-sans tracking-wide rounded-full transition-colors ${
                isActive(link.to)
                  ? "text-refex-gold bg-amber-50/50 border-b-2 border-refex-gold"
                  : "text-refex-text-muted hover:text-refex-text"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {!loading &&
            (user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right min-w-0 max-w-[200px]">
                  <p className="text-sm font-sans font-semibold text-gray-900 truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[11px] font-sans text-gray-500 truncate leading-tight">
                    {user.email}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 text-xs font-semibold shrink-0"
                  title={user.role}
                >
                  <UserAvatar avatarUrl={user} initials={user.initials} className="w-10 h-10" />
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-sans text-gray-500 hover:text-amber-700 whitespace-nowrap cursor-pointer"
                >
                  {nb.sign_out_label}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openLogin()}
                className="px-4 py-2 text-sm font-sans font-semibold text-amber-700 border border-amber-200 rounded-full hover:bg-amber-50 transition-colors cursor-pointer"
              >
                {nb.sign_in_label}
              </button>
            ))}

          <Link
            to={nb.commitment_cta_href || "/wall"}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E5E4E2] text-gray-800 text-base font-sans font-bold tracking-wide rounded-full hover:bg-gray-300 transition-colors whitespace-nowrap"
          >
            {nb.commitment_cta_label}
            <span>{nb.commitment_cta_arrow}</span>
          </Link>
        </div>

        <button
          className="md:hidden text-refex-text p-2 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <i
            className={`ri-${menuOpen ? "close" : "menu"}-line text-xl transition-transform duration-300`}
          ></i>
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-white/95 backdrop-blur-md border-b border-black/5 ${
          menuOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-2">
          {!loading && user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-amber-50 rounded-xl border border-amber-100">
              <div className="w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-700 text-xs font-semibold shrink-0">
                {user.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-sans font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs font-sans text-gray-500 truncate">{user.email}</p>
                <p className="text-[10px] font-sans text-gray-400 truncate mt-0.5">{user.role}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="text-xs font-sans text-amber-700 shrink-0 cursor-pointer"
              >
                {nb.sign_out_label}
              </button>
            </div>
          )}

          {!loading && !user && (
            <button
              type="button"
              onClick={() => {
                openLogin();
                setMenuOpen(false);
              }}
              className="px-4 py-3 text-base font-bold font-sans text-amber-700 bg-amber-50 rounded-full cursor-pointer"
            >
              {nb.mobile_sign_in_label}
            </button>
          )}

          {navLinks.map((link) => (
            <Link
              key={`m-${link.to}-${link.label}`}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 text-base font-bold font-sans tracking-wide rounded-full transition-colors ${
                isActive(link.to)
                  ? "text-amber-600 bg-amber-50"
                  : "text-refex-text-muted hover:text-refex-text hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            to={nb.commitment_cta_href || "/wall"}
            onClick={() => setMenuOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#E5E4E2] text-gray-800 text-base font-sans font-bold tracking-wide rounded-full hover:bg-gray-300 transition-colors"
          >
            {nb.commitment_cta_label}
            <span>{nb.commitment_cta_arrow}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
