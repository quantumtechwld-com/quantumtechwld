import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = "https://quantumtechwld.com";
  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/es`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/solutions/websites-landing-pages`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/solutions/websites-landing-pages`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/solutions/websites-landing-pages`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/solutions/sistemas-sob-medida`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/solutions/sistemas-sob-medida`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/solutions/sistemas-sob-medida`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/solutions/ia-automacao`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/solutions/ia-automacao`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/es/solutions/ia-automacao`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/obrigado`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
