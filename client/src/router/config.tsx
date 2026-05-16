import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Vision from "../pages/vision/page";
import Wall from "../pages/wall/page";
import AdminLayout from "../pages/admin/AdminLayout";
import CmsHeroPage from "../pages/admin/CmsHeroPage";
import VisionCmsPage from "../pages/admin/VisionCmsPage";
import SiteChromeCmsPage from "../pages/admin/SiteChromeCmsPage";
import WallCmsPage from "../pages/admin/WallCmsPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/vision",
    element: <Vision />,
  },
  {
    path: "/wall",
    element: <Wall />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="cms/home-hero" replace /> },
      { path: "cms/home-hero", element: <CmsHeroPage /> },
      { path: "cms/vision", element: <VisionCmsPage /> },
      { path: "cms/site-chrome", element: <SiteChromeCmsPage /> },
      { path: "cms/wall", element: <WallCmsPage /> },
    ],
  },
  {
    path: "/admin/cms/hero",
    element: <Navigate to="/admin/cms/home-hero" replace />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;