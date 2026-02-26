import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/login", "/signup", "/forgot-password", "/tasks", "/keywords", "/history", "/lists", "/profile", "/settings", "/subscription"],
            },
        ],
        sitemap: "https://leadspotter.in/sitemap.xml",
    };
}
