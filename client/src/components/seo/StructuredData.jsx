import { siteConfig } from "../../config/site";
import { profile } from "../../data/profile";

/**
 * Site-wide JSON-LD structured data (Person + WebSite), rendered once at
 * the app shell. Only verified fields are emitted — no invented awards,
 * ratings, employers, or job-seeking claims. React 19 renders a plain
 * <script> in the body; search engines read JSON-LD wherever it appears,
 * so no portal into <head> is needed.
 */
export function StructuredData() {
  const personId = `${siteConfig.url}/#person`;

  const graph = [
    {
      "@type": "Person",
      "@id": personId,
      name: profile.name,
      url: siteConfig.url,
      jobTitle: siteConfig.jobTitle,
      email: `mailto:${profile.email}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sylhet",
        addressCountry: "BD",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: profile.education.university,
      },
      sameAs: siteConfig.sameAs,
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.title,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: { "@id": personId },
    },
  ];

  const json = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inject here — it is derived solely
      // from our own verified data, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
