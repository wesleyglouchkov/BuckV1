import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  const publicRoutes = [
    "",
    "/explore",
    "/login",
    "/signup",
    "/privacy",
    "/terms",
    "/help",
    "/forgot-password",
    "/reset-password"
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));
}
