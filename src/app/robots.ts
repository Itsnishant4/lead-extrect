import { MetadataRoute } from "next";
import { generateSitemaps } from "./sitemap";

export default async function robots(): Promise<MetadataRoute.Robots> {
    const sitemaps = await generateSitemaps();
    const sitemapUrls = sitemaps.map(s => `https://leadspotter.in/sitemap/${s.id}.xml`);

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/login", "/signup", "/forgot-password", "/tasks", "/keywords", "/history", "/lists", "/profile", "/settings", "/subscription"],
            },
        ],
        sitemap: sitemapUrls,
    };
}
