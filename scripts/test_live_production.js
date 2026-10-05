const urls = [
  'https://cosmetiqly.com',
  'https://cosmetiqly.com/directory',
  'https://cosmetiqly.com/brands/c',
  'https://cosmetiqly.com/brand/cerave',
  'https://cosmetiqly.com/check/is-cerave-hydrating-facial-cleanser-fungal-acne-safe',
  'https://cosmetiqly.com/check/is-anastasia-beverly-hills-adapalene-gel-0-1-vol-1015-alcohol-free-safe',
  'https://cosmetiqly.com/check/is-the-ordinary-daily-moisturizing-lotion-pregnancy-safe',
  'https://cosmetiqly.com/check/is-nonexistent-fake-slug-safe',
  'https://cosmetiqly.com/sitemap.xml',
  'https://cosmetiqly.com/robots.txt'
];

async function testAll() {
  console.log('🌐 Testing Live Production Endpoints on Cosmetiqly.com:\n');
  for (const u of urls) {
    try {
      const res = await fetch(u, { redirect: 'manual' });
      const body = await res.text();
      console.log(`[HTTP ${res.status}] ${u} (${body.length.toLocaleString()} bytes)`);
    } catch (e) {
      console.log(`[ERR] ${u}: ${e.message}`);
    }
  }
}

testAll();
