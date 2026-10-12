const urls = [
  'https://18768a08.cosmetiqly.pages.dev/',
  'https://cosmetiqly.pages.dev/',
  'https://cosmetiqly.com/',
  'https://cosmetiqly.com/directory',
  'https://cosmetiqly.com/brand/cerave',
  'https://cosmetiqly.com/brands/c',
  'https://cosmetiqly.com/about',
  'https://cosmetiqly.com/check/is-cerave-hydrating-facial-cleanser-fungal-acne-safe',
  'https://cosmetiqly.com/check/is-nonexistent-fake-slug-safe',
  'https://cosmetiqly.com/brand/nonexistent-brand-12345',
  'https://cosmetiqly.com/some-legacy-404-page',
  'https://cosmetiqly.com/sitemap.xml',
  'https://cosmetiqly.com/sitemaps/sitemap-main.xml',
  'https://cosmetiqly.com/robots.txt'
];

async function testAll() {
  console.log('🌐 Testing Live Production Canonicals & Health on Cosmetiqly.com:\n');
  for (const u of urls) {
    try {
      const res = await fetch(u, { redirect: 'manual' });
      const body = await res.text();
      const canonicalMatch = body.match(/<link rel=["']canonical["']\s+href=["']([^"']+)["']/i);
      const robotsMatch = body.match(/<meta name=["']robots["']\s+content=["']([^"']+)["']/i);
      const canonical = canonicalMatch ? canonicalMatch[1] : 'NONE';
      const robots = robotsMatch ? robotsMatch[1] : 'NONE';
      
      console.log(`[HTTP ${res.status}] ${u}`);
      console.log(`  -> Canonical: ${canonical}`);
      console.log(`  -> Robots:    ${robots}`);
    } catch (e) {
      console.log(`[ERR] ${u}: ${e.message}`);
    }
  }
}

testAll();
