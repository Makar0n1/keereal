import type { MetadataRoute } from "next";

// Web app manifest — makes the site installable as a PWA (required for iOS
// home-screen Web Push). start_url points at the admin chat since the install
// is primarily the owner's "console".
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KEEREAL — админка",
    short_name: "KEEREAL",
    description: "Управление сайтом и лайв-чат",
    start_url: "/admin/chat",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
