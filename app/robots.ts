import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/explore"],
      disallow: ["/admin/", "/creator/", "/profile/", "/my-creators/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
