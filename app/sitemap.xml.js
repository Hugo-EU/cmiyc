export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const staticPaths = [
    "/",
    "/store",
    "/forum",
    "/songs",
    "/events",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPaths
      .map((path) => {
        return `
          <url>
            <loc>${baseUrl}${path}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <priority>0.8</priority>
          </url>
        `;
      })
      .join("")}
  </urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
