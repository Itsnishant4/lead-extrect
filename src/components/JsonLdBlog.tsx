import { BlogPosting, WithContext } from "schema-dts";

export default function JsonLdBlog({ article }: { article: any }) {
  const blogJsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": article.author || "LeadSpotter Team",
    },
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at || article.published_at || article.created_at,
    "image": article.image_url || "https://leadspotter.in/og-image.png",
    "publisher": {
      "@type": "Organization",
      "name": "LeadSpotter",
      "logo": {
        "@type": "ImageObject",
        "url": "https://leadspotter.in/logo.png",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://leadspotter.in/blog/${article.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
    />
  );
}
